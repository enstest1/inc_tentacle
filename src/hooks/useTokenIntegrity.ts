import { useEffect, useState } from "react";
import type { Address, PublicClient } from "viem";
import { verifyToken, type TokenCheck } from "@/lib/deployments";

export function useTokenIntegrity(
  client: PublicClient | undefined,
  token: Address | undefined,
  expectedDecimals: number,
  expectedSymbol: string,
  enabled: boolean,
) {
  const [result, setResult] = useState<TokenCheck | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setResult({ ok: true, symbol: expectedSymbol, decimals: expectedDecimals, symbolMatchesExpected: true });
      return;
    }
    if (!client || !token) {
      setResult({ ok: false, reason: "RPC_ERROR" });
      return;
    }
    let cancelled = false;
    verifyToken(client, token, expectedDecimals, expectedSymbol).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [client, token, expectedDecimals, expectedSymbol, enabled]);

  return result;
}
