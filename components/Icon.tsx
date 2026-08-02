/**
 * Hand-drawn icon set, not a library.
 *
 * The design system is hairlines, square-ish corners and a 900-weight display
 * face — a rounded, friendly icon pack would fight it. These are all 24×24,
 * 1.5px stroke, butt caps, no rounded joins, and inherit currentColor.
 */

export type IconName =
  | "sachet"
  | "drop"
  | "no-sugar"
  | "no-caffeine"
  | "flask"
  | "rand"
  | "repeat"
  | "calendar"
  | "truck"
  | "check"
  | "cross"
  | "alert"
  | "people"
  | "tag"
  | "qr"
  | "clock"
  | "flavours";

const PATHS: Record<IconName, React.ReactNode> = {
  sachet: (
    <>
      <path d="M7 3h10v18H7z" />
      <path d="M7 6h10M7 18h10" />
    </>
  ),
  drop: <path d="M12 3l5.5 7.5A6.5 6.5 0 1 1 6.5 10.5z" />,
  "no-sugar": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 18L18 6" />
    </>
  ),
  "no-caffeine": (
    <>
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M3 21h16" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M8 3h8M7.2 14h9.6" />
    </>
  ),
  rand: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 17V7h3.5a2.75 2.75 0 0 1 0 5.5H9M12.5 12.5L15.5 17" />
    </>
  ),
  repeat: (
    <>
      <path d="M3 11V9a4 4 0 0 1 4-4h13" />
      <path d="M17 2l3 3-3 3" />
      <path d="M21 13v2a4 4 0 0 1-4 4H4" />
      <path d="M7 22l-3-3 3-3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h11v11H2zM13 9h4.5l3.5 3.5V17h-8" />
      <circle cx="6.5" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </>
  ),
  check: <path d="M4 12.5l5.5 5.5L20 6" />,
  cross: <path d="M5 5l14 14M19 5L5 19" />,
  alert: (
    <>
      <path d="M12 3L1.5 21h21z" />
      <path d="M12 10v5M12 17.6v.4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.2A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  tag: (
    <>
      <path d="M3 11.5V3h8.5L21 12.5 12.5 21z" />
      <circle cx="7.5" cy="7.5" r="1.6" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3h-3zM21 14v3M18 21h3M14 21h1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5V12l4 2.5" />
    </>
  ),
  flavours: (
    <>
      <path d="M3 20h18" />
      <path d="M5 20V9M9.5 20V5M14 20v-8M18.5 20V7" />
    </>
  ),
};

export default function Icon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
