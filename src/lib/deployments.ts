import { keccak256, type Address, type PublicClient } from "viem";
import { tentacleAbi } from "./contracts";
import { anvil, ink, inkSepolia } from "./chains";
import inkMainnet from "../../deployments/ink-mainnet.json";
import inkSepoliaDeploy from "../../deployments/ink-sepolia.json";
import anvilDeploy from "../../deployments/anvil.json";

export type DeploymentRecord = {
  label: string;
  tentacle: Address;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenIsProxy: boolean;
  tokenImplementation: string;
  tokenBlacklistable: boolean;
  tokenPausable: boolean;
  tokenSupportsPermit: boolean;
  runtimeBytecodeHash: `0x${string}`;
  deploymentTx: string;
  deployer: string;
  compiler: string;
  evmVersion: string;
  optimizer: boolean;
  optimizerRuns: number;
  viaIr: boolean;
  gitCommit: string;
  deployedAt: string;
  verifiedUrl?: string;
};

export type ChainDeployments = {
  chainId: number;
  deployments: DeploymentRecord[];
};

export type IntegrityResult =
  | { ok: true; maxRecipients: number }
  | { ok: false; reason: "NO_CODE" | "HASH_MISMATCH" | "TOKEN_MISMATCH" | "RPC_ERROR" | "NOT_CONFIGURED" };

export type TokenCheck =
  | { ok: true; symbol: string; decimals: number; symbolMatchesExpected: boolean }
  | { ok: false; reason: "BAD_DECIMALS" | "NO_CODE" | "RPC_ERROR" };

const ZERO = "0x0000000000000000000000000000000000000000";

function isConfigured(addr: string | undefined): addr is Address {
  return !!addr && addr.startsWith("0x") && addr.length === 42 && addr.toLowerCase() !== ZERO;
}

export function loadDeployments(chainId: number): ChainDeployments {
  const file =
    chainId === ink.id
      ? (inkMainnet as ChainDeployments)
      : chainId === anvil.id
        ? (anvilDeploy as ChainDeployments)
        : (inkSepoliaDeploy as ChainDeployments);
  return applyEnvOverrides(file, chainId);
}

function applyEnvOverrides(file: ChainDeployments, chainId: number): ChainDeployments {
  const deployments = file.deployments.map((d) => ({ ...d }));
  if (chainId === ink.id) {
    const usdc = process.env.NEXT_PUBLIC_TENTACLE_MAINNET_USDC_ADDRESS;
    const usdce = process.env.NEXT_PUBLIC_TENTACLE_MAINNET_USDCE_ADDRESS;
    for (const d of deployments) {
      if (d.label === "USDC" && isConfigured(usdc)) d.tentacle = usdc;
      if (d.label === "USDC.e" && isConfigured(usdce)) d.tentacle = usdce;
    }
  } else if (chainId === inkSepolia.id) {
    const mock = process.env.NEXT_PUBLIC_TENTACLE_SEPOLIA_MOCK_ADDRESS;
    if (isConfigured(mock) && deployments[0]) deployments[0].tentacle = mock;
  }
  return { ...file, deployments };
}

export function findDeployment(
  chainId: number,
  asset: "ETH" | "USDC" | "USDCE",
): DeploymentRecord | undefined {
  const { deployments } = loadDeployments(chainId);
  if (asset === "ETH") {
    // Native ETH uses the USDC (or MOCK) instance — TOKEN is unused for batchNative
    // but constructor still requires a token. Prefer the primary deployment.
    return deployments.find((d) => d.label === "USDC" || d.label === "MOCK") ?? deployments[0];
  }
  if (asset === "USDC") {
    return deployments.find((d) => d.label === "USDC" || d.label === "MOCK");
  }
  return deployments.find((d) => d.label === "USDC.e");
}

/**
 * Verifies on-chain runtime bytecode against the hash recorded at deploy time.
 * Do not hash the compiler artifact — immutables make it never match (spec §17.1).
 */
export async function verifyDeployment(
  client: PublicClient,
  tentacle: Address,
  expected: { runtimeBytecodeHash: `0x${string}`; token: Address },
): Promise<IntegrityResult> {
  if (!isConfigured(tentacle) || expected.runtimeBytecodeHash === "0x") {
    return { ok: false, reason: "NOT_CONFIGURED" };
  }
  try {
    const code = await client.getCode({ address: tentacle });
    if (!code || code === "0x") return { ok: false, reason: "NO_CODE" };

    if (keccak256(code) !== expected.runtimeBytecodeHash) {
      return { ok: false, reason: "HASH_MISMATCH" };
    }

    const [onchainToken, maxRecipients] = await Promise.all([
      client.readContract({ address: tentacle, abi: tentacleAbi, functionName: "TOKEN" }),
      client.readContract({
        address: tentacle,
        abi: tentacleAbi,
        functionName: "MAX_RECIPIENTS",
      }),
    ]);

    if ((onchainToken as Address).toLowerCase() !== expected.token.toLowerCase()) {
      return { ok: false, reason: "TOKEN_MISMATCH" };
    }

    return { ok: true, maxRecipients: Number(maxRecipients as bigint) };
  } catch {
    return { ok: false, reason: "RPC_ERROR" };
  }
}

export async function verifyToken(
  client: PublicClient,
  token: Address,
  expectedDecimals: number,
  expectedSymbol: string,
): Promise<TokenCheck> {
  try {
    const code = await client.getCode({ address: token });
    if (!code || code === "0x") return { ok: false, reason: "NO_CODE" };
    const [decimals, symbol] = await Promise.all([
      client.readContract({
        address: token,
        abi: [
          {
            type: "function",
            name: "decimals",
            inputs: [],
            outputs: [{ type: "uint8" }],
            stateMutability: "view",
          },
        ],
        functionName: "decimals",
      }),
      client.readContract({
        address: token,
        abi: [
          {
            type: "function",
            name: "symbol",
            inputs: [],
            outputs: [{ type: "string" }],
            stateMutability: "view",
          },
        ],
        functionName: "symbol",
      }),
    ]);
    if (Number(decimals) !== expectedDecimals) return { ok: false, reason: "BAD_DECIMALS" };
    return {
      ok: true,
      symbol: String(symbol),
      decimals: Number(decimals),
      symbolMatchesExpected: String(symbol) === expectedSymbol,
    };
  } catch {
    return { ok: false, reason: "RPC_ERROR" };
  }
}
