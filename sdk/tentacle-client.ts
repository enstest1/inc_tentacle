export type TentacleAsset = "ETH" | "USDC" | "USDCE";

export type TentaclePrepareInput = {
  chainId: 57073 | 763373;
  asset: TentacleAsset;
  recipients: string[];
  amounts: string[];
  nativePerRecipient?: string;
};

export class TentacleClient {
  constructor(readonly baseUrl: string) {}

  async manifest() {
    return this.get("/api/agent/manifest");
  }

  async prepareBatch(input: TentaclePrepareInput) {
    const response = await fetch(`${this.baseUrl}/api/agent/prepare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error ?? `Tentacle returned ${response.status}`);
    return body;
  }

  async x402Discovery() {
    return this.get("/api/x402/discovery");
  }

  private async get(path: string) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: "application/json" },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`Tentacle returned ${response.status}`);
    return body;
  }
}
