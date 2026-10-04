# Tentacle Agent SDK

Minimal fetch-based client for Tentacle's public agent API.

```ts
import { TentacleClient } from "./tentacle-client";

const tentacle = new TentacleClient("https://tentacle.my");
const tx = await tentacle.prepareBatch({
  chainId: 763373,
  asset: "ETH",
  recipients: ["0x1111111111111111111111111111111111111111"],
  amounts: ["0.000001"],
});

// tx.transaction is unsigned. Hand it to the user's wallet/smart account.
console.log(tx.transaction);
```

For MCP clients, connect directly to `https://tentacle.my/api/mcp` using Streamable HTTP.
For x402/Bazaar-style discovery metadata, read `/api/x402/discovery`.

Tentacle never receives or stores an agent's private key.
