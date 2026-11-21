/** A slow typographic ticker. Decorative: hidden from assistive tech. */
export default function Marquee() {
  const line = (
    <span className="pr-10">
      Show up. <span className="text-signal">Check in.</span> Keep the streak.
    </span>
  );

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden bg-ink text-paper"
    >
      <div className="anim-marquee flex whitespace-nowrap py-5 text-[clamp(28px,4vw,40px)] font-black tracking-[-0.03em]">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    </div>
  );
}
