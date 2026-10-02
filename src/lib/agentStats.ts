import { formatUnits, zeroAddress, type Address } from "viem";
import { makePublicClient } from "./client";
import { tentacleAbi } from "./contracts";
import { loadDeployments } from "./deployments";
import { aggregateBatchEvents, configuredTokenTotals, type BatchEventLike } from "./stats";

const LOG_BLOCK_SPAN = 9_999n;
const ZERO = zeroAddress.toLowerCase();

function txHash(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

export async function getAgentStats(chainId: number) {
  const deployments = loadDeployments(chainId).deployments;
  const client = makePublicClient(chainId);
  const allEvents: BatchEventLike[] = [];
  const deploymentStats = [];

  for (const deployment of deployments) {
    if (deployment.tentacle.toLowerCase() === ZERO || !txHash(deployment.deploymentTx)) {
      deploymentStats.push({ label: deployment.label, deployed: false });
      continue;
    }

    const receipt = await client.getTransactionReceipt({ hash: deployment.deploymentTx });
    const latest = await client.getBlockNumber();
    const events: BatchEventLike[] = [];
    for (let fromBlock = receipt.blockNumber; fromBlock <= latest; fromBlock += LOG_BLOCK_SPAN + 1n) {
      const toBlock = fromBlock + LOG_BLOCK_SPAN > latest ? latest : fromBlock + LOG_BLOCK_SPAN;
      const logs = await client.getContractEvents({
        address: deployment.tentacle as Address,
        abi: tentacleAbi,
        eventName: "BatchExecuted",
        fromBlock,
        toBlock,
      });
      for (const log of logs) {
        const args = log.args;
        if (!args.sender || !args.asset || args.totalAssetAmount === undefined || args.recipientCount === undefined) continue;
        events.push({
          sender: args.sender,
          asset: args.asset,
          totalAssetAmount: args.totalAssetAmount,
          totalNativeTopUp: args.totalNativeTopUp ?? 0n,
          recipientCount: args.recipientCount,
        });
      }
    }

    allEvents.push(...events);
    const stats = aggregateBatchEvents(events);
    deploymentStats.push({
      label: deployment.label,
      deployed: true,
      contract: deployment.tentacle,
      batches: stats.batches,
      recipients: stats.recipients,
      uniqueSenders: stats.uniqueSenders,
      ethDistributed: formatUnits(stats.ethDistributedWei, 18),
    });
  }

  const stats = aggregateBatchEvents(allEvents);
  const tokens = configuredTokenTotals(deployments, stats.tokenTotals).map((token) => ({
    symbol: token.symbol,
    address: token.address,
    distributed: formatUnits(token.total, token.decimals),
  }));

  return {
    chainId,
    batches: stats.batches,
    recipients: stats.recipients,
    uniqueSenders: stats.uniqueSenders,
    ethDistributed: formatUnits(stats.ethDistributedWei, 18),
    tokens,
    deployments: deploymentStats,
    note:
      chainId === 763373
        ? "Ink Sepolia technical evidence only; not users or traction."
        : "Mainnet onchain activity only.",
  };
}
