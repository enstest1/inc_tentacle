import { useMemo } from "react";
import { findDeployment } from "@/lib/deployments";
import { ZERO_ADDRESS, type AssetId } from "@/types/tentacle";
import type { Address } from "viem";

/**
 * Resolves the Tentacle instance for the selected chain + asset.
 * ETH and USDC share the USDC/MOCK deployment; USDC.e has its own.
 */
export function useTentacleContract(chainId: number | undefined, asset: AssetId) {
  return useMemo(() => {
    if (!chainId) {
      return { tentacle: undefined as Address | undefined, token: ZERO_ADDRESS, record: undefined };
    }
    const record = findDeployment(chainId, asset);
    return {
      tentacle: record?.tentacle,
      token: (record?.token ?? ZERO_ADDRESS) as Address,
      record,
    };
  }, [chainId, asset]);
}
