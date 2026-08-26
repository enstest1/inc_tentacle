/**
 * TentacleBatcher ABI. Hand-maintained to match contracts/src/TentacleBatcher.sol.
 * Adding a `from`/`payer`/`relayer` argument here is forbidden (spec §11.1).
 */
export const tentacleAbi = [
  {
    type: "constructor",
    inputs: [{ name: "token_", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "MAX_RECIPIENTS",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TOKEN",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "batchNative",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "batchToken",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchTokenWithGas",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "nativePerRecipient", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "BatchExecuted",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "asset", type: "address", indexed: true },
      { name: "totalAssetAmount", type: "uint256", indexed: false },
      { name: "totalNativeTopUp", type: "uint256", indexed: false },
      { name: "recipientCount", type: "uint256", indexed: false },
      { name: "payloadHash", type: "bytes32", indexed: false },
    ],
  },
  { type: "error", name: "InvalidTokenAddress", inputs: [] },
  { type: "error", name: "TokenNotAContract", inputs: [] },
  { type: "error", name: "EmptyRecipients", inputs: [] },
  {
    type: "error",
    name: "TooManyRecipients",
    inputs: [
      { name: "provided", type: "uint256" },
      { name: "maximum", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ArrayLengthMismatch",
    inputs: [
      { name: "recipientsLength", type: "uint256" },
      { name: "amountsLength", type: "uint256" },
    ],
  },
  { type: "error", name: "ZeroRecipient", inputs: [{ name: "index", type: "uint256" }] },
  { type: "error", name: "SelfRecipient", inputs: [{ name: "index", type: "uint256" }] },
  { type: "error", name: "TokenRecipient", inputs: [{ name: "index", type: "uint256" }] },
  { type: "error", name: "ZeroAmount", inputs: [{ name: "index", type: "uint256" }] },
  {
    type: "error",
    name: "DuplicateRecipient",
    inputs: [
      { name: "firstIndex", type: "uint256" },
      { name: "secondIndex", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
  },
  {
    type: "error",
    name: "IncorrectNativeValue",
    inputs: [
      { name: "expected", type: "uint256" },
      { name: "actual", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "NativeTransferFailed",
    inputs: [
      { name: "index", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "InsufficientTokenBalance",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "available", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "InsufficientAllowance",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "available", type: "uint256" },
    ],
  },
  { type: "error", name: "ZeroGasTopUp", inputs: [] },
  { type: "error", name: "DirectNativeTransferDisabled", inputs: [] },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
