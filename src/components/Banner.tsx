import Image from "next/image";

/**
 * Decorative hero artwork. The full source is shown without browser-side
 * upscaling so the fine agent/network detail stays crisp on wide screens.
 */
export function Banner() {
  return (
    <div className="relative h-56 w-full overflow-hidden bg-ink-bg md:h-72">
      <Image
        src="/images/tentacle-agent-plume.webp"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="pointer-events-none object-contain object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-bg" />
    </div>
  );
}
