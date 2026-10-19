import type { CSSProperties } from "react";

const paths = {
  language: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c4 4 4 14 0 18-4-4-4-14 0-18Z",
  plane: "m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  target: "M21 12a9 9 0 1 1-9-9m9-2-9 9m4-9h5v5M16 12a4 4 0 1 1-4-4",
  edit: "m16 3 5 5M4 20l4-1L21 6l-4-4L4 15v5Z",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm0 5v5m0 3h.01",
  info: "M12 8h.01M12 11v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  check: "m5 12 4 4L19 6",
  chevron: "m9 5 7 7-7 7",
  wallet: "M20 8V5H5a2 2 0 0 1 0-4h14M3 3v16a2 2 0 0 0 2 2h16V8H5m16 5h-5v4h5",
  route: "M6 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7",
  swap: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
  reset: "M3 10a9 9 0 1 1 1 8M3 4v6h6",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
} as const;

export function Icon({ name, size = 20, className, style }: { name: keyof typeof paths; size?: number; className?: string; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}><path d={paths[name]} /></svg>;
}
