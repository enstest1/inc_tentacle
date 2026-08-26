import localFont from "next/font/local";

/**
 * Commit Mono v1.143 variable, self-hosted. The VF does not bake customizer
 * alternates — those live in CSS `--font-features` (docs/fonts/custom-settings.json).
 */
export const commitMono = localFont({
  src: [
    {
      path: "../../public/fonts/CommitMono-Tentacle.woff2",
      // Actual axis is 200–700; the spec's "100 700" range is not in this cut.
      weight: "200 700",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  preload: true,
});
