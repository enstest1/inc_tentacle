import type { Address } from "viem";
import type { IntegrityResult, TokenCheck } from "@/lib/deployments";
import type { CostEstimate } from "@/lib/gas";
import type { SimulationState } from "@/lib/intent";
import { findDuplicateIndexes } from "@/lib/recipients";
import { findLookalikePairs, type RecipientKind } from "@/lib/addresses";

export type SafeSendRow = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn" | "pending";
  detail?: string;
  blocking: boolean;
};

export type PreflightInput = {
  chainOk: boolean;
  chainId?: number;
  integrity?: IntegrityResult;
  tokenCheck?: TokenCheck;
  recipients: Address[];
  amounts: bigint[];
  kinds: RecipientKind[];
  ethBalance: bigint;
  tokenBalance: bigint;
  allowance: bigint;
  requiredEth: bigint;
  requiredToken: bigint;
  needsToken: boolean;
  cost?: CostEstimate;
  simulation: SimulationState;
  firstTime?: boolean;
};

/**
 * Builds the SafeSend checklist. Mandatory failures block Send.
 * Advisory warnings (contracts, lookalikes, symbol mismatch) do not.
 */
export function buildPreflight(input: PreflightInput): SafeSendRow[] {
  const rows: SafeSendRow[] = [];

  rows.push({
    id: "network",
    label: input.chainId ? `Ink network (${input.chainId})` : "Ink network",
    status: input.chainOk ? "pass" : "fail",
    blocking: true,
  });

  if (!input.integrity) {
    rows.push({
      id: "integrity",
      label: "Contract matches expected deployment",
      status: "pending",
      blocking: true,
    });
  } else if (input.integrity.ok) {
    rows.push({
      id: "integrity",
      label: "Contract matches expected deployment",
      status: "pass",
      blocking: true,
    });
  } else {
    rows.push({
      id: "integrity",
      label: "Tentacle contract configuration could not be verified.",
      status: "fail",
      detail: input.integrity.reason,
      blocking: true,
    });
  }

  if (input.needsToken) {
    if (!input.tokenCheck) {
      rows.push({
        id: "token",
        label: "Token contract matches configuration (6 decimals)",
        status: "pending",
        blocking: true,
      });
    } else if (!input.tokenCheck.ok) {
      rows.push({
        id: "token",
        label: "Token contract matches configuration (6 decimals)",
        status: "fail",
        detail: input.tokenCheck.reason,
        blocking: true,
      });
    } else {
      rows.push({
        id: "token",
        label: "Token contract matches configuration (6 decimals)",
        status: input.tokenCheck.symbolMatchesExpected ? "pass" : "warn",
        detail: input.tokenCheck.symbolMatchesExpected
          ? undefined
          : `On-chain symbol is "${input.tokenCheck.symbol}".`,
        blocking: !input.tokenCheck.symbolMatchesExpected ? false : true,
      });
      // decimals already gated by ok:true
      rows[rows.length - 1].blocking = true;
      if (!input.tokenCheck.symbolMatchesExpected) {
        rows[rows.length - 1].status = "pass";
        rows.push({
          id: "symbol",
          label: `Token symbol is "${input.tokenCheck.symbol}" (advisory)`,
          status: "warn",
          blocking: false,
        });
      }
    }
  }

  const valid = input.recipients.length > 0 && input.recipients.length === input.amounts.length;
  rows.push({
    id: "recipients",
    label: `${input.recipients.length} valid recipients`,
    status: valid ? "pass" : "fail",
    blocking: true,
  });

  const dups = findDuplicateIndexes(input.recipients);
  rows.push({
    id: "dups",
    label: dups.size === 0 ? "No duplicate recipients" : "Duplicate recipients found",
    status: dups.size === 0 ? "pass" : "fail",
    blocking: true,
  });

  const lookalikes = findLookalikePairs(input.recipients);
  rows.push({
    id: "lookalikes",
    label:
      lookalikes.length === 0
        ? "No lookalike addresses detected"
        : `Similar to recipient #${lookalikes[0][0] + 1}`,
    status: lookalikes.length === 0 ? "pass" : "warn",
    blocking: false,
  });

  const zeroAmt = input.amounts.some((a) => a === 0n);
  rows.push({
    id: "zeros",
    label: zeroAmt ? "Zero-value payments present" : "No zero-value payments",
    status: zeroAmt ? "fail" : "pass",
    blocking: true,
  });

  const ethOk = input.ethBalance >= input.requiredEth;
  rows.push({
    id: "balance",
    label: ethOk
      ? "Wallet balance sufficient (incl. L1 data fee)"
      : "Wallet balance insufficient (incl. L1 data fee)",
    status: ethOk ? "pass" : "fail",
    blocking: true,
  });

  if (input.needsToken) {
    const tokOk = input.tokenBalance >= input.requiredToken;
    rows.push({
      id: "tokenBal",
      label: tokOk ? "Token balance sufficient" : "Token balance insufficient",
      status: tokOk ? "pass" : "fail",
      blocking: true,
    });
    const allw = input.allowance >= input.requiredToken;
    rows.push({
      id: "allowance",
      label: allw ? "Required allowance available" : "Approval required for exact batch total",
      status: allw ? "pass" : "fail",
      blocking: true,
    });
  } else {
    rows.push({
      id: "allowance",
      label: "Required allowance available",
      status: "pass",
      blocking: true,
    });
  }

  rows.push({
    id: "gas",
    label: input.cost ? "Gas estimate successful" : "Gas estimate pending",
    status: input.cost ? "pass" : "pending",
    blocking: true,
  });

  const simOk = input.simulation.status === "passed";
  rows.push({
    id: "sim",
    label:
      input.simulation.status === "failed"
        ? "Transaction simulation failed"
        : input.simulation.status === "passed"
          ? "Transaction simulation passed"
          : "Transaction simulation pending",
    status: simOk ? "pass" : input.simulation.status === "failed" ? "fail" : "pending",
    blocking: true,
  });

  input.kinds.forEach((kind, i) => {
    if (kind === "CONTRACT") {
      rows.push({
        id: `contract-${i}`,
        label: `Recipient #${i + 1} is a smart contract`,
        status: "warn",
        detail:
          "Whether it can receive ETH depends on its own code. Simulation will tell us if this specific batch would succeed.",
        blocking: false,
      });
    }
  });

  return rows;
}

export function sendBlocked(rows: SafeSendRow[]): boolean {
  return rows.some((r) => r.blocking && r.status !== "pass");
}
