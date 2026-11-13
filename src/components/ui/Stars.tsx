// Zvezdice iz Figme („Stars“): crne pune, sive prazne. Prosek se zaokružuje na pola zvezdice.
const PATH = "M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L.8 6.1l5-.7z";

export function Stars({ value, size = 14, gap = 2, className = "" }: { value: number; size?: number; gap?: number; className?: string }) {
  const v = Math.round(value * 2) / 2;
  return (
    <span role="img" aria-label={`Ocena ${value.toFixed(1).replace(".0", "")} od 5`} className={`inline-flex ${className}`} style={{ gap }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = v >= i + 1 ? 1 : v >= i + 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 16 16" aria-hidden>
            <defs>
              <clipPath id={`zv-${i}-${fill}`}>
                <rect x="0" y="0" width={16 * fill} height="16" />
              </clipPath>
            </defs>
            <path d={PATH} fill="#dbdee1" />
            {fill > 0 && <path d={PATH} fill="#000" clipPath={`url(#zv-${i}-${fill})`} />}
          </svg>
        );
      })}
    </span>
  );
}
