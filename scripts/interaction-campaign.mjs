#!/usr/bin/env node
/**
 * Local / Ink Sepolia-only BatchExecuted evidence campaign.
 * This script has no mainnet option and never reads or displays private-key values.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  getAddress,
  http,
  isAddress,
  keccak256,
  stringToHex,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const batchExecutedTopic = keccak256(
  stringToHex("BatchExecuted(address,address,uint256,uint256,uint256,bytes32)"),
);

const batchNativeAbi = [{
  type: "function",
  name: "batchNative",
  inputs: [
    { name: "recipients", type: "address[]" },
    { name: "amounts", type: "uint256[]" },
  ],
  outputs: [],
  stateMutability: "payable",
}];

const networks = {
  anvil: { chainId: 31337, status: "local", deployment: "anvil.json", defaultRpc: "http://127.0.0.1:8545" },
  sepolia: { chainId: 763373, status: "testnet", deployment: "ink-sepolia.json", defaultRpc: "https://rpc-gel-sepolia.inkonchain.com" },
};

export function parseCampaignArguments(argv) {
  const options = { network: "anvil", count: 30, rpcUrl: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--help" || flag === "-h") return { help: true };
    if (!["--network", "--count", "--rpc-url"].includes(flag)) {
      throw new Error(`Unknown argument: ${flag}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}`);
    index += 1;
    if (flag === "--network") options.network = value;
    if (flag === "--rpc-url") options.rpcUrl = value;
    if (flag === "--count") {
      if (!/^\d+$/.test(value)) throw new Error("--count must be a whole number.");
      options.count = Number(value);
    }
  }
  if (!Object.hasOwn(networks, options.network)) {
    throw new Error("--network must be anvil or sepolia. Mainnet is intentionally unsupported.");
  }
  if (!Number.isSafeInteger(options.count) || options.count < 20 || options.count > 50) {
    throw new Error("--count must be between 20 and 50.");
  }
  if (options.rpcUrl && !/^https?:\/\//.test(options.rpcUrl)) {
    throw new Error("--rpc-url must be an http(s) URL.");
  }
  return options;
}

export function buildNativeBatch(network, batchIndex, blockedAddresses = []) {
  const recipientCount = 2 + (batchIndex % 5);
  const blocked = new Set(blockedAddresses.map((address) => address.toLowerCase()));
  const recipients = [];
  let nonce = 0;
  while (recipients.length < recipientCount) {
    const hash = keccak256(stringToHex(`tentacle-campaign-${network}-${batchIndex}-${nonce}`));
    const recipient = getAddress(`0x${hash.slice(-40)}`);
    nonce += 1;
    if (!blocked.has(recipient.toLowerCase())) {
      blocked.add(recipient.toLowerCase());
      recipients.push(recipient);
    }
  }
  const amounts = recipients.map((_, recipientIndex) =>
    1_000_000_000_000n * BigInt(1 + ((batchIndex + recipientIndex) % 3)),
  );
  return { recipients, amounts, totalWei: amounts.reduce((sum, amount) => sum + amount, 0n) };
}function readDeployment(network) {
  const file = path.join(root, "deployments", networks[network].deployment);
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const deployment = parsed.deployments?.[0];
  if (!deployment || !isAddress(deployment.tentacle) || deployment.tentacle.toLowerCase() === zeroAddress) {
    throw new Error(`No ${network} Tentacle deployment is configured in ${file}. Deploy and record it before running a campaign.`);
  }
  return deployment;
}

function evidenceFile(network) {
  const directory = path.join(root, "evidence");
  mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(directory, `interaction-campaign-${network}-${stamp}.json`);
}

function writeEvidence(file, evidence) {
  writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`, { encoding: "utf8", flag: "w" });
}

async function assertTarget(client, config, deployment) {
  const chainId = await client.getChainId();
  if (chainId !== config.chainId || chainId === 57073) {
    throw new Error(`Refusing to run: RPC chain ID ${chainId} is not the selected safe test chain.`);
  }
  const code = await client.getCode({ address: deployment.tentacle });
  if (!code || code === "0x") {
    throw new Error(`No contract code exists at configured ${config.status} address ${deployment.tentacle}.`);
  }
}

function usage() {
  return [
    "Usage: npm run campaign:anvil -- [--count 30] [--rpc-url http://127.0.0.1:8545]",
    "       npm run campaign:sepolia -- [--count 30] [--rpc-url https://…]",
    "Count defaults to 30 and must be 20–50. Mainnet is intentionally unsupported.",
  ].join("\n");
}

async function run(options) {
  const config = networks[options.network];
  const rpcUrl = options.rpcUrl ?? config.defaultRpc;
  const deployment = readDeployment(options.network);
  const client = createPublicClient({ transport: http(rpcUrl) });
  try {
    await assertTarget(client, config, deployment);
  } catch (error) {
    if (options.network === "anvil") {
      throw new Error(
        "Could not reach the expected Anvil deployment. Start Anvil and run the existing local Foundry deployment first.",
      );
    }
    throw error;
  }

  let sender;
  let submit;
  if (options.network === "anvil") {
    const accounts = await client.request({ method: "eth_accounts" });
    sender = accounts[0];
    if (!sender || !isAddress(sender)) {
      throw new Error("Anvil returned no unlocked account. Start Anvil, then run the existing local deployment.");
    }
    submit = async (data, value) => client.request({
      method: "eth_sendTransaction",
      params: [{ from: sender, to: deployment.tentacle, data, value: `0x${value.toString(16)}` }],
    });
  } else {
    // This reads only the environment variable at runtime; its value is never logged or persisted.
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY is required for Ink Sepolia only.");
    const account = privateKeyToAccount(privateKey);
    sender = account.address;
    const wallet = createWalletClient({ account, transport: http(rpcUrl) });
    submit = async (data, value) => wallet.sendTransaction({ to: deployment.tentacle, data, value });
  }

  const file = evidenceFile(options.network);
  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    network: options.network === "anvil" ? "Anvil" : "Ink Sepolia",
    chainId: config.chainId,
    status: config.status,
    isLocal: options.network === "anvil",
    isTestnet: options.network === "sepolia",
    isMainnet: false,
    isUserTraction: false,
    note: "Automated local/testnet contract evidence only. Do not present as mainnet users or traction.",
    contract: deployment.tentacle,
    sender,
    interactions: [],
  };
  writeEvidence(file, evidence);
  try {
    for (let index = 0; index < options.count; index += 1) {
      const batch = buildNativeBatch(options.network, index, [sender, deployment.tentacle]);
      const data = encodeFunctionData({
        abi: batchNativeAbi,
        functionName: "batchNative",
        args: [batch.recipients, batch.amounts],
      });
      const hash = await submit(data, batch.totalWei);
      const receipt = await client.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error(`Transaction reverted: ${hash}`);
      const emittedBatchExecuted = receipt.logs.some(
        (log) =>
          log.address.toLowerCase() === deployment.tentacle.toLowerCase() &&
          log.topics[0]?.toLowerCase() === batchExecutedTopic.toLowerCase(),
      );
      if (!emittedBatchExecuted) throw new Error(`Missing BatchExecuted log: ${hash}`);
      evidence.interactions.push({
        index: index + 1,
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString(),
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        recipientCount: batch.recipients.length,
        ethWei: batch.totalWei.toString(),
        recipients: batch.recipients,
      });
      writeEvidence(file, evidence);
      process.stdout.write(`Recorded ${index + 1}/${options.count}: ${hash}\n`);
    }
  } catch (error) {
    evidence.failure = error instanceof Error ? error.message : "Unknown campaign failure";
    writeEvidence(file, evidence);
    throw error;
  }

  process.stdout.write(
    `Completed ${evidence.interactions.length} ${config.status} interactions. Evidence: ${file}\n` +
    "This is local/testnet evidence, not mainnet traction.\n",
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let options;
  try {
    options = parseCampaignArguments(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(`${usage()}\n`);
    } else {
      await run(options);
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
