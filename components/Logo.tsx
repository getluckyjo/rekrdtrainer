/**
 * The REKRD wordmark, from the supplied artwork.
 *
 * Inline rather than an <img> so it inherits colour: every fill is
 * currentColor, which lets it sit on cream, on ink, or on a print card without
 * a second asset. The source file painted a flat #000d1b.
 *
 * The viewBox is tightened to the ink. The supplied file declares
 * `0 0 579.69 219.35`, but the mark only occupies 36% of that height — the
 * rest is empty margin — so `height={17}` drew letters under 6px tall and read
 * as a mistake. Cropping to the real bounds makes `height` mean the height of
 * the letters, which is the only intuitive contract for a caller.
 *
 * True ratio is 4.98:1, not the 2.64:1 the padded box implied.
 *
 * The clipPath in the original was a rect identical to the viewBox — a no-op —
 * so it is dropped along with the <defs> it needed.
 */
const BOX = { x: 93.72, y: 67.44, w: 396.58, h: 79.68 };
const RATIO = BOX.w / BOX.h;
export default function Logo({
  height = 18,
  className,
  title = "REKRD",
}: {
  height?: number;
  className?: string;
  /** Pass null inside a link that already names itself, to avoid a double label. */
  title?: string | null;
}) {
  return (
    <svg
      viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`}
      height={height}
      width={Math.round(height * RATIO)}
      className={className}
      fill="currentColor"
      role={title ? "img" : "presentation"}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* the TM */}
      <polygon points="469.33 69.09 472.8 69.09 472.8 76.3 474.79 76.3 474.79 69.09 478.26 69.09 478.26 67.44 469.33 67.44 469.33 69.09" />
      <polygon points="481.34 76.3 481.34 70.31 484.16 76.3 485.69 76.3 488.52 70.26 488.52 76.3 490.37 76.3 490.37 67.44 488.11 67.44 484.97 74.17 481.82 67.44 479.52 67.44 479.52 76.3 481.34 76.3" />
      {/* the wordmark */}
      <path d="M470.86,80.29c-8.08-6.4-20.12-9.59-36.12-9.59h-37.52v17.47c-3.62-11.66-15.24-17.49-34.9-17.49h-40.63v.05h-29.15l-3.45,3.85-7.73,8.63-10.21,11.4,6.3-23.88h-28.46l-14.13,56.87h-38.87v-8.9h38.22l4.83-19.57h-43.05v-9.05h45.16l5.13-19.57h-76.87v17.92c.38,1.28.66,2.61.86,4.02-.19-1.41-.48-2.75-.86-4.02-3.51-11.86-15.15-17.81-34.98-17.81h-40.63v76.54h25.73v-23.37h13.19l14.26,23.37h83.02,0s28.69,0,28.69,0l6.25-23.05,2.98,3.16,18.7,19.89h35.06v.05h25.73v-23.37h13.18l14.26,23.37h22.35v.03h37.3c10.36,0,19.17-1.52,26.43-4.56,7.25-3.04,12.74-7.41,16.45-13.13,3.71-5.72,5.57-12.58,5.57-20.58,0-12.72-4.04-22.28-12.11-28.68M141.84,102.89c-1.72,1.14-4.72,1.71-9,1.71h-13.66v-14.79h13.87c4.14,0,7.07.55,8.79,1.66,1.71,1.11,2.57,2.99,2.57,5.63s-.86,4.65-2.57,5.79M169.42,118.7v17.81l-11.71-17.97c4.5-2.21,7.77-5.07,9.81-8.58.81-1.4,1.42-2.97,1.9-4.63v13.37ZM321.69,138.85l-31.43-29.78,31.43-29.83v59.61ZM332.33,108.92v-.09l.05.05-.05.05ZM369.72,102.94c-1.72,1.14-4.72,1.71-9,1.71h-13.66v-14.79h13.87c4.14,0,7.08.55,8.79,1.66,1.71,1.11,2.57,2.99,2.57,5.63s-.86,4.65-2.57,5.79M397.21,136.44l-11.63-17.85c4.5-2.21,7.77-5.07,9.81-8.58.77-1.32,1.35-2.81,1.82-4.38v30.8ZM451.92,121.51c-3.25,2.79-8.24,4.18-14.95,4.18h-12.52v-33.45h12.85c6.57,0,11.47,1.36,14.69,4.07,3.22,2.72,4.82,6.86,4.82,12.44s-1.63,9.97-4.88,12.76" />
    </svg>
  );
}
