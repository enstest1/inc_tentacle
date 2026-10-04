/** @type {import('next').NextConfig} */
// CSP is locked to first-party assets plus the public Ink RPCs (spec §34).
// NEXT_PUBLIC RPC URLs are public by definition; V1 uses Ink's public endpoints.
const csp = [
  "default-src 'self'",
  // Next.js App Router still inlines hydration scripts. Remove 'unsafe-inline' only
  // after a nonce-based CSP is wired; do not widen to *.
  // Next.js webpack runtime needs eval in development; production still emits some
  // eval helpers. Do not widen to *. Recorded in docs/AUDIT_SCOPE.md.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  [
    "connect-src 'self'",
    "https://rpc-gel.inkonchain.com",
    "https://rpc-qnd.inkonchain.com",
    "https://rpc-gel-sepolia.inkonchain.com",
    "https://rpc-qnd-sepolia.inkonchain.com",
    // Local Anvil for NEXT_PUBLIC_ENABLE_ANVIL / next dev only.
    ...(process.env.NEXT_PUBLIC_ENABLE_ANVIL === "true" || process.env.NODE_ENV !== "production"
      ? ["http://127.0.0.1:8545", "http://localhost:8545"]
      : []),
  ].join(" "),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
