import { describe, expect, it } from "vitest";
import { getPublicOrigin } from "./publicOrigin";

describe("getPublicOrigin", () => {
  it("uses the direct request origin without proxy headers", () => {
    const request = new Request("http://localhost:3000/api/agent/manifest");
    expect(getPublicOrigin(request)).toBe("http://localhost:3000");
  });

  it("prefers reverse-proxy host and protocol headers", () => {
    const request = new Request("http://localhost:8080/api/agent/manifest", {
      headers: {
        "x-forwarded-host": "tentacle.example.com",
        "x-forwarded-proto": "https",
      },
    });
    expect(getPublicOrigin(request)).toBe("https://tentacle.example.com");
  });

  it("uses the first forwarded value", () => {
    const request = new Request("http://localhost:8080", {
      headers: { "x-forwarded-host": "public.example, proxy.internal", "x-forwarded-proto": "https, http" },
    });
    expect(getPublicOrigin(request)).toBe("https://public.example");
  });
});
