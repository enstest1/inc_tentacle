import { keccak256, toHex, type Address } from "viem";

export type BatchIntent = {
  chainId: number;
  sender: Address;
  tentacle: Address;
  functionName: "batchNative" | "batchToken" | "batchTokenWithGas";
  asset: Address; // 0x0 for native
  tokenDecimals: number;
  recipients: readonly Address[];
  amounts: readonly bigint[]; // order matters
  value: bigint;
  nativePerRecipient: bigint; // 0 unless batchTokenWithGas
};

/** Deterministic serialisation. Order is significant and preserved. */
export function fingerprint(i: BatchIntent): `0x${string}` {
  const canonical = JSON.stringify({
    c: i.chainId,
    s: i.sender.toLowerCase(),
    t: i.tentacle.toLowerCase(),
    f: i.functionName,
    a: i.asset.toLowerCase(),
    d: i.tokenDecimals,
    r: i.recipients.map((r) => r.toLowerCase()),
    m: i.amounts.map((v) => v.toString()), // NEVER JSON.stringify a bigint
    v: i.value.toString(),
    g: i.nativePerRecipient.toString(),
  });
  return keccak256(toHex(canonical));
}

export type SimulationState =
  | { status: "none" }
  | { status: "running"; forIntent: `0x${string}` }
  | { status: "passed"; forIntent: `0x${string}`; request: unknown; at: number }
  | { status: "failed"; forIntent: `0x${string}`; error: unknown };

export const SIMULATION_STALE_MS = 60_000;

export function isSimulationValid(state: SimulationState, current: BatchIntent): boolean {
  return state.status === "passed" && state.forIntent === fingerprint(current);
}

export function isSimulationFresh(state: SimulationState, now = Date.now()): boolean {
  return state.status === "passed" && now - state.at < SIMULATION_STALE_MS;
}
