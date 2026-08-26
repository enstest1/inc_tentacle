/**
 * Full-bleed Lichtenberg/tentacle banner. Decorative — alt is empty so
 * screen readers skip it; the wordmark in Header is the accessible name.
 */
export function Banner() {
  return (
    <div className="relative w-full overflow-hidden bg-ink-bg">
      <img
        src="/images/tentacle-banner.jpg"
        alt=""
        className="pointer-events-none h-56 w-full object-cover object-top md:h-72"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-bg" />
    </div>
  );
}
