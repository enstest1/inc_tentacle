import Image from "next/image";

/**
 * Full-bleed Lichtenberg/tentacle banner. Decorative — alt is empty so
 * screen readers skip it; the wordmark in Header is the accessible name.
 */
export function Banner() {
  return (
    <div className="relative h-56 w-full overflow-hidden bg-ink-bg md:h-72">
      <Image
        src="/images/tentacle-banner.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-top"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-bg" />
    </div>
  );
}
