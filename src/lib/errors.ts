import {
  decodeErrorResult,
  BaseError,
  ContractFunctionRevertedError,
} from "viem";
import { tentacleAbi } from "./contracts";

export type FriendlyError = { title: string; body: string; recipientIndex?: number };

const DEFAULT_FRIENDLY: FriendlyError = {
  title: "This batch is predicted to fail",
  body: "No transaction has been submitted. Review the highlighted recipient or amount.",
};

/**
 * Maps every TentacleBatcher custom error to human copy. A unit test asserts
 * that no ABI error falls through to the default message.
 */
export function toFriendlyError(err: unknown, ctx: { addresses: string[] }): FriendlyError {
  if (err instanceof BaseError) {
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError && reverted.data) {
      const { errorName, args } = reverted.data as {
        errorName?: string;
        args?: readonly unknown[];
      };
      if (errorName) {
        const mapped = mapNamedError(errorName, args, ctx);
        if (mapped) return mapped;
      }
    }
  }

  if (err && typeof err === "object" && "data" in err) {
    try {
      const decoded = decodeErrorResult({
        abi: tentacleAbi,
        data: (err as { data: `0x${string}` }).data,
      });
      const mapped = mapNamedError(decoded.errorName, decoded.args as readonly unknown[], ctx);
      if (mapped) return mapped;
    } catch {
      // Fall through to default.
    }
  }

  if (err && typeof err === "object" && "errorName" in err) {
    const mapped = mapNamedError(
      String((err as { errorName: string }).errorName),
      ((err as { args?: readonly unknown[] }).args ?? []) as readonly unknown[],
      ctx,
    );
    if (mapped) return mapped;
  }

  return DEFAULT_FRIENDLY;
}

export function mapNamedError(
  errorName: string,
  args: readonly unknown[] | undefined,
  ctx: { addresses: string[] },
): FriendlyError | undefined {
  void ctx;
  switch (errorName) {
    case "InvalidTokenAddress":
      return {
        title: "Invalid token",
        body: "This Tentacle deployment was constructed with a zero token address.",
      };
    case "TokenNotAContract":
      return {
        title: "Token is not a contract",
        body: "The configured token address has no code. Check the deployment record.",
      };
    case "EmptyRecipients":
      return { title: "No recipients", body: "Add at least one recipient to continue." };
    case "TooManyRecipients":
      return {
        title: "Too many recipients",
        body: "A single batch supports 50 recipients. Tentacle can split this list.",
      };
    case "ArrayLengthMismatch":
      return {
        title: "List mismatch",
        body: "The recipient list and amount list are different lengths. Refresh and try again.",
      };
    case "ZeroRecipient":
      return {
        title: "Zero address",
        body: `Recipient #${Number(args?.[0] ?? 0) + 1} is the zero address. Remove or replace it.`,
        recipientIndex: Number(args?.[0] ?? 0),
      };
    case "SelfRecipient":
      return {
        title: "Cannot pay Tentacle",
        body: `Recipient #${Number(args?.[0] ?? 0) + 1} is the Tentacle contract itself.`,
        recipientIndex: Number(args?.[0] ?? 0),
      };
    case "TokenRecipient":
      return {
        title: "Cannot pay the token contract",
        body: `Recipient #${Number(args?.[0] ?? 0) + 1} is the token contract. That would burn the funds.`,
        recipientIndex: Number(args?.[0] ?? 0),
      };
    case "ZeroAmount":
      return {
        title: "Zero amount",
        body: `Recipient #${Number(args?.[0] ?? 0) + 1} has a zero amount.`,
        recipientIndex: Number(args?.[0] ?? 0),
      };
    case "DuplicateRecipient":
      return {
        title: "Duplicate recipient",
        body: `This wallet appears in rows ${Number(args![0]) + 1} and ${Number(args![1]) + 1}. Combine them into a single payment to continue.`,
        recipientIndex: Number(args![1]),
      };
    case "IncorrectNativeValue":
      return {
        title: "Amount mismatch",
        body: "The ETH attached does not match the batch total. Refresh and re-simulate.",
      };
    case "NativeTransferFailed":
      return {
        title: "A recipient cannot receive ETH",
        body: `Recipient #${Number(args![0]) + 1} rejected the transfer. It is likely a contract that does not accept ETH. Remove or replace it.`,
        recipientIndex: Number(args![0]),
      };
    case "InsufficientTokenBalance":
      return { title: "Not enough tokens", body: "Reduce the batch or top up your balance." };
    case "InsufficientAllowance":
      return { title: "Approval too small", body: "Approve the exact batch total and try again." };
    case "ZeroGasTopUp":
      return {
        title: "Gas top-up is zero",
        body: "Enter a gas top-up greater than zero, or turn the option off.",
      };
    case "DirectNativeTransferDisabled":
      return {
        title: "Direct transfers disabled",
        body: "Tentacle does not accept deposits. Send only through the batch functions.",
      };
    default:
      return undefined;
  }
}

export function isDefaultFriendlyError(err: FriendlyError): boolean {
  return err.title === DEFAULT_FRIENDLY.title && err.body === DEFAULT_FRIENDLY.body;
}
