"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import type { Address, Hash } from "viem";
import { parseAmount, AmountError, sumAmounts, formatAmount } from "@/lib/amounts";
import { parseAddress, classifyCode, type RecipientKind } from "@/lib/addresses";
import { parsePaste } from "@/lib/recipients";
import { fingerprint, isSimulationFresh, isSimulationValid, type SimulationState } from "@/lib/intent";
import { simulateBatch } from "@/lib/simulation";
import { estimateBatchCost, type CostEstimate } from "@/lib/gas";
import { planBatches, type PlannedBatch } from "@/lib/batchPlan";
import { waitForReceiptWithReplacement } from "@/lib/txWatch";
import { erc20Abi } from "@/lib/contracts";
import { buildReceipt, saveDeviceHistoryItem, type ReceiptRecord } from "@/lib/receipt";
import { toFriendlyError } from "@/lib/errors";
import { planApproval } from "@/hooks/useAllowance";
import { runApproval } from "@/hooks/useBatchTransaction";
import { useTentacleContract } from "@/hooks/useTentacleContract";
import { useDeploymentIntegrity } from "@/hooks/useDeploymentIntegrity";
import { useTokenIntegrity } from "@/hooks/useTokenIntegrity";
import { buildPreflight, sendBlocked } from "@/hooks/usePreflight";
import { ink, inkSepolia, anvil, chainById, isAnvilEnabled, isSupportedChain } from "@/lib/chains";
import {
  assetDecimals,
  assetSymbol,
  ZERO_ADDRESS,
  type AssetId,
  type DistributionMode,
  type RecipientRow,
  type TxState,
} from "@/types/tentacle";

export type BatchContextValue = ReturnType<typeof useBatchState>;

const BatchContext = createContext<BatchContextValue | null>(null);

let rowSeq = 0;
function newRow(): RecipientRow {
  rowSeq += 1;
  return { id: `row-${rowSeq}`, raw: "", amountRaw: "" };
}

function useBatchState() {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const defaultChain = Number(
    process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? (isAnvilEnabled() ? anvil.id : inkSepolia.id),
  );
  const targetChainId = isSupportedChain(walletChainId) ? walletChainId : defaultChain;

  const [asset, setAsset] = useState<AssetId>("ETH");
  const [mode, setMode] = useState<DistributionMode>("equal");
  const [equalAmountRaw, setEqualAmountRaw] = useState(isAnvilEnabled() ? "0.01" : "0.5");
  const [gasTopUpEnabled, setGasTopUpEnabled] = useState(false);
  const [gasTopUpRaw, setGasTopUpRaw] = useState("0.0002");
  const [rows, setRows] = useState<RecipientRow[]>(() =>
    isAnvilEnabled()
      ? [
          // Anvil accounts #1 and #2 — sender is account #0 so these are distinct EOA recipients.
          { id: newRow().id, raw: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", amountRaw: "" },
          { id: newRow().id, raw: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", amountRaw: "" },
        ]
      : [newRow(), newRow()],
  );
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showFullAddresses, setShowFullAddresses] = useState(false);
  const [txState, setTxState] = useState<TxState>("EDITING");
  const [txHash, setTxHash] = useState<Hash | undefined>();
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [errorTitle, setErrorTitle] = useState<string | undefined>();
  const [errorBody, setErrorBody] = useState<string | undefined>();
  const [simulation, setSimulation] = useState<SimulationState>({ status: "none" });
  const [cost, setCost] = useState<CostEstimate | undefined>();
  const [kinds, setKinds] = useState<RecipientKind[]>([]);
  const [batchPlan, setBatchPlan] = useState<PlannedBatch[]>([]);

  const decimals = assetDecimals(asset);
  const { tentacle, token, record } = useTentacleContract(targetChainId, asset);
  const integrity = useDeploymentIntegrity(
    publicClient,
    tentacle,
    record
      ? { runtimeBytecodeHash: record.runtimeBytecodeHash, token: record.token }
      : undefined,
  );
  const tokenCheck = useTokenIntegrity(
    publicClient,
    token,
    6,
    record?.tokenSymbol ?? "USDC",
    asset !== "ETH",
  );

  const maxRecipients = integrity?.ok ? integrity.maxRecipients : 50;

  const parsedRecipients = useMemo(() => {
    return rows.map((row) => parseAddress(row.raw));
  }, [rows]);

  const parsedAmounts = useMemo(() => {
    return rows.map((row) => {
      const raw = mode === "equal" ? equalAmountRaw : row.amountRaw;
      if (!raw.trim()) return { ok: false as const, error: "EMPTY" };
      try {
        return { ok: true as const, value: parseAmount(raw, decimals) };
      } catch (e) {
        return { ok: false as const, error: e instanceof AmountError ? e.code : "NOT_A_NUMBER" };
      }
    });
  }, [rows, mode, equalAmountRaw, decimals]);

  const validPairs = useMemo(() => {
    const recipients: Address[] = [];
    const amounts: bigint[] = [];
    rows.forEach((_, i) => {
      const addr = parsedRecipients[i];
      const amt = parsedAmounts[i];
      if (addr?.ok && amt?.ok) {
        recipients.push(addr.address);
        amounts.push(amt.value);
      }
    });
    return { recipients, amounts };
  }, [rows, parsedRecipients, parsedAmounts]);

  const nativePerRecipient = useMemo(() => {
    if (asset === "ETH" || !gasTopUpEnabled) return 0n;
    try {
      return parseAmount(gasTopUpRaw, 18);
    } catch {
      return 0n;
    }
  }, [asset, gasTopUpEnabled, gasTopUpRaw]);

  const totalAsset = useMemo(() => sumAmounts(validPairs.amounts), [validPairs.amounts]);
  const functionName =
    asset === "ETH" ? "batchNative" : nativePerRecipient > 0n ? "batchTokenWithGas" : "batchToken";
  const value =
    asset === "ETH" ? totalAsset : nativePerRecipient * BigInt(validPairs.recipients.length);

  const intent = useMemo(() => {
    if (!address || !tentacle || validPairs.recipients.length === 0) return undefined;
    return {
      chainId: targetChainId,
      sender: address,
      tentacle,
      functionName: functionName as "batchNative" | "batchToken" | "batchTokenWithGas",
      asset: asset === "ETH" ? ZERO_ADDRESS : token,
      tokenDecimals: decimals,
      recipients: validPairs.recipients,
      amounts: validPairs.amounts,
      value,
      nativePerRecipient,
    };
  }, [
    address,
    tentacle,
    targetChainId,
    functionName,
    asset,
    token,
    decimals,
    validPairs,
    value,
    nativePerRecipient,
  ]);

  const { data: ethBalance } = useBalance({ address, chainId: targetChainId });
  const { data: tokenBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && asset !== "ETH" && token !== ZERO_ADDRESS) },
  });
  const { data: allowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && tentacle ? [address, tentacle] : undefined,
    query: { enabled: Boolean(address && tentacle && asset !== "ETH") },
  });

  const approvalPlan = planApproval(allowance ?? 0n, asset === "ETH" ? 0n : totalAsset);

  const requiredEth = (cost?.totalFee ?? 0n) + value + (approvalPlan.kind === "approve" ? cost?.totalFee ?? 0n : 0n);

  const chainOk =
    isConnected && walletChainId === targetChainId && isSupportedChain(walletChainId);

  const preflight = useMemo(
    () =>
      buildPreflight({
        chainOk,
        chainId: walletChainId,
        integrity,
        tokenCheck,
        recipients: validPairs.recipients,
        amounts: validPairs.amounts,
        kinds,
        ethBalance: ethBalance?.value ?? 0n,
        tokenBalance: tokenBalance ?? 0n,
        allowance: allowance ?? 0n,
        requiredEth,
        requiredToken: totalAsset,
        needsToken: asset !== "ETH",
        cost,
        simulation,
      }),
    [
      chainOk,
      walletChainId,
      integrity,
      tokenCheck,
      validPairs,
      kinds,
      ethBalance,
      tokenBalance,
      allowance,
      requiredEth,
      totalAsset,
      asset,
      cost,
      simulation,
    ],
  );

  const blocked = sendBlocked(preflight);
  const needsSplit = validPairs.recipients.length > maxRecipients;

  useEffect(() => {
    setBatchPlan(
      needsSplit
        ? planBatches(validPairs.recipients, validPairs.amounts, maxRecipients)
        : [],
    );
  }, [needsSplit, validPairs.recipients, validPairs.amounts, maxRecipients]);

  // Classify recipient code (EIP-7702 aware).
  useEffect(() => {
    if (!publicClient || validPairs.recipients.length === 0) {
      setKinds([]);
      return;
    }
    let cancelled = false;
    Promise.all(validPairs.recipients.map((a) => publicClient.getCode({ address: a })))
      .then((codes) => {
        if (!cancelled) setKinds(codes.map((c) => classifyCode(c)));
      })
      .catch(() => {
        if (!cancelled) setKinds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [publicClient, validPairs.recipients]);

  // Invalidate simulation whenever intent changes.
  useEffect(() => {
    if (!intent) {
      setSimulation({ status: "none" });
      setCost(undefined);
      return;
    }
    if (!isSimulationValid(simulation, intent) || !isSimulationFresh(simulation)) {
      if (simulation.status === "passed") setSimulation({ status: "none" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only intent fingerprint should retrigger
  }, [intent ? fingerprint(intent) : "none"]);

  useEffect(() => {
    if (!intent || !publicClient || !chainOk || validPairs.recipients.length === 0) return;
    if (needsSplit) return;
    const fp = fingerprint(intent);
    let cancelled = false;
    const handle = setTimeout(async () => {
      setSimulation({ status: "running", forIntent: fp });
      try {
        const sim = await simulateBatch(publicClient, intent);
        const est = await estimateBatchCost(publicClient, {
          account: intent.sender,
          tentacle: intent.tentacle,
          functionName: intent.functionName,
          args:
            intent.functionName === "batchTokenWithGas"
              ? [intent.recipients, intent.amounts, intent.nativePerRecipient]
              : [intent.recipients, intent.amounts],
          value: intent.value,
        });
        if (cancelled) return;
        setCost(est);
        setSimulation({ status: "passed", forIntent: fp, request: sim.request, at: Date.now() });
      } catch (err) {
        if (cancelled) return;
        const friendly = toFriendlyError(err, { addresses: intent.recipients });
        setErrorTitle(friendly.title);
        setErrorBody(friendly.body);
        setSimulation({ status: "failed", forIntent: fp, error: err });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // Fingerprint is the security boundary: any intent field change retimes this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent ? fingerprint(intent) : "none", publicClient, chainOk, needsSplit]);

  const addRow = useCallback(() => setRows((r) => [...r, newRow()]), []);
  const removeRow = useCallback((id: string) => setRows((r) => r.filter((x) => x.id !== id)), []);
  const updateRow = useCallback((id: string, patch: Partial<RecipientRow>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const applyPaste = useCallback((text: string) => {
    const parsed = parsePaste(text);
    setRows(
      parsed.map((p) => ({
        id: newRow().id,
        raw: p.address ?? p.raw,
        amountRaw: "",
      })),
    );
  }, []);

  const applyCsv = useCallback(
    (entries: { address: Address; amount?: bigint }[]) => {
      setRows(
        entries.map((e) => ({
          id: newRow().id,
          raw: e.address,
          amountRaw: e.amount !== undefined ? formatAmount(e.amount, decimals) : "",
        })),
      );
    },
    [decimals],
  );

  async function switchToInk() {
    const dest = isAnvilEnabled()
      ? anvil.id
      : defaultChain === ink.id
        ? ink.id
        : inkSepolia.id;
    await switchChainAsync({ chainId: dest });
    // Post-switch re-read is automatic via useChainId.
  }

  async function execute() {
    if (!intent || !walletClient || !publicClient || !address || !tentacle) return;
    setErrorTitle(undefined);
    setErrorBody(undefined);

    try {
      const walletChain = walletClient.chain?.id ?? walletChainId;
      if (walletChain !== intent.chainId || publicClient.chain?.id !== intent.chainId) {
        setTxState("FAILED");
        setErrorTitle("Wrong network");
        setErrorBody("Wallet, client, and configuration disagree on chain id. Send is disabled.");
        return;
      }

      const batches =
        batchPlan.length > 0
          ? batchPlan
          : planBatches(intent.recipients, intent.amounts, maxRecipients);

      if (asset !== "ETH" && approvalPlan.kind === "approve") {
        setTxState("APPROVING");
        await runApproval(
          walletClient,
          publicClient,
          token,
          tentacle,
          address,
          approvalPlan,
          (h) => setTxHash(h),
        );
        setTxState("APPROVAL_PENDING");
      }

      const collected: ReceiptRecord[] = [];
      for (const batch of batches) {
        const batchIntent = {
          ...intent,
          recipients: batch.recipients,
          amounts: batch.amounts,
          value:
            asset === "ETH"
              ? batch.total
              : nativePerRecipient * BigInt(batch.recipients.length),
        };
        setTxState("SIMULATING");
        const sim = await simulateBatch(publicClient, batchIntent);
        setTxState("AWAITING_SIGNATURE");
        let hash: Hash;
        try {
          hash = await walletClient.writeContract(sim.request);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (/rejected|denied|user rejected/i.test(msg)) {
            setTxState("CANCELLED");
            setErrorTitle("Transaction cancelled");
            setErrorBody("Nothing was submitted to Ink.");
            return;
          }
          throw err;
        }
        setTxHash(hash);
        setTxState("TRANSACTION_PENDING");
        saveDeviceHistoryItem({ hash, chainId: intent.chainId, status: "PENDING", timestamp: Date.now() });

        const watch = await waitForReceiptWithReplacement(publicClient, hash, (h) => setTxHash(h));
        if (watch.kind === "cancelled") {
          setTxState("CANCELLED");
          setErrorTitle("Transaction cancelled");
          setErrorBody("Nothing was submitted to Ink.");
          return;
        }
        if (watch.kind === "reverted") {
          setTxState("FAILED");
          setErrorTitle("BATCH FAILED");
          setErrorBody("No payment was completed — the transaction reverted atomically. Your recipient list is still here.");
          saveDeviceHistoryItem({
            hash: watch.finalHash,
            chainId: intent.chainId,
            status: "FAILED",
            timestamp: Date.now(),
          });
          return;
        }

        const tx = await publicClient.getTransaction({ hash: watch.finalHash });
        if (tx.to?.toLowerCase() !== tentacle.toLowerCase()) {
          throw new Error("Receipt `to` does not match Tentacle");
        }
        const rec = buildReceipt({
          chainId: intent.chainId,
          network: chainById(intent.chainId)?.name ?? "Ink",
          tentacle,
          hash: watch.finalHash,
          blockNumber: watch.receipt.blockNumber,
          sender: address,
          assetSymbol: assetSymbol(asset),
          assetAddress: intent.asset,
          decimals,
          total: batch.total,
          nativePerRecipient,
          recipients: batch.recipients,
          amounts: batch.amounts,
        });
        collected.push(rec);
        saveDeviceHistoryItem({
          hash: watch.finalHash,
          chainId: intent.chainId,
          status: "CONFIRMED",
          timestamp: Date.now(),
        });
      }
      setReceipts(collected);
      setTxState("SUCCESS");
    } catch (err) {
      const friendly = toFriendlyError(err, { addresses: intent.recipients });
      setTxState("FAILED");
      setErrorTitle(friendly.title);
      setErrorBody(friendly.body);
    }
  }

  function reset() {
    setReviewOpen(false);
    setConfirmed(false);
    setTxState("EDITING");
    setTxHash(undefined);
    setReceipts([]);
    setErrorTitle(undefined);
    setErrorBody(undefined);
    setSimulation({ status: "none" });
  }

  return {
    asset,
    setAsset,
    mode,
    setMode,
    equalAmountRaw,
    setEqualAmountRaw,
    gasTopUpEnabled,
    setGasTopUpEnabled,
    gasTopUpRaw,
    setGasTopUpRaw,
    rows,
    addRow,
    removeRow,
    updateRow,
    applyPaste,
    applyCsv,
    parsedRecipients,
    parsedAmounts,
    validPairs,
    totalAsset,
    nativePerRecipient,
    decimals,
    isConnected,
    address,
    walletChainId,
    targetChainId,
    chainOk,
    switchToInk,
    tentacle,
    token,
    record,
    integrity,
    tokenCheck,
    maxRecipients,
    ethBalance: ethBalance?.value ?? 0n,
    tokenBalance: tokenBalance ?? 0n,
    allowance: allowance ?? 0n,
    approvalPlan,
    cost,
    simulation,
    preflight,
    blocked,
    needsSplit,
    batchPlan,
    reviewOpen,
    setReviewOpen,
    confirmed,
    setConfirmed,
    showFullAddresses,
    setShowFullAddresses,
    txState,
    txHash,
    receipts,
    errorTitle,
    errorBody,
    kinds,
    execute,
    reset,
    intent,
  };
}

export function BatchProvider({ children }: { children: ReactNode }) {
  const value = useBatchState();
  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
}

export function useBatch() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error("useBatch must be used within BatchProvider");
  return ctx;
}
