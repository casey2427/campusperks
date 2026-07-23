type IconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const paths: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  bag: <><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  percent: <><path d="m8 16 8-8" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="16" r="1.5" /></>,
  tag: <><path d="M20 13 13 20l-9-9V4h7l9 9Z" /><circle cx="8.5" cy="8.5" r="1.2" /></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  check: <><path d="m6 12 4 4 8-8" /><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /></>,
  "arrow-right": <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  navigation: <><path d="m3 11 18-8-8 18-2-8-8-2Z" /></>,
  utensils: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 6 0 9" /></>,
  fitness: <><path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" /></>,
  ticket: <><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 0 0-4V4H3v4Z" /><path d="M13 7v2M13 13v2" /></>,
  laptop: <><rect x="4" y="4" width="16" height="12" rx="1" /><path d="M2 20h20" /></>,
  plane: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M11 13 22 2" /></>,
  sparkles: <><path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  "thumb-up": <><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Z" /><path d="M7 19h9.3a2 2 0 0 0 1.9-1.4l2-6A2 2 0 0 0 18.3 9H14l.7-3.1A2.4 2.4 0 0 0 12.3 3L7 10Z" /></>,
  "thumb-down": <><path d="M17 14V4h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3Z" /><path d="M17 5H7.7a2 2 0 0 0-1.9 1.4l-2 6A2 2 0 0 0 5.7 15H10l-.7 3.1a2.4 2.4 0 0 0 2.4 2.9l5.3-7Z" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 5h11l-1 4 1 4H5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.9,
  className,
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name] ?? paths.tag}
    </svg>
  );
}
