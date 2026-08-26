import { useEffect, useState } from "react";
import type { Address, PublicClient } from "viem";
import { verifyDeployment, type IntegrityResult } from "@/lib/deployments";

export function useDeploymentIntegrity(
  client: PublicClient | undefined,
  tentacle: Address | undefined,
  expected: { runtimeBytecodeHash: `0x${string}`; token: Address } | undefined,
) {
  const [result, setResult] = useState<IntegrityResult | undefined>(undefined);

  useEffect(() => {
    if (!client || !tentacle || !expected) {
      setResult({ ok: false, reason: "NOT_CONFIGURED" });
      return;
    }
    let cancelled = false;
    verifyDeployment(client, tentacle, expected).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
    // expected is represented by hash + token so the check re-runs when the deployment record changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, tentacle, expected?.runtimeBytecodeHash, expected?.token]);

  return result;
}
