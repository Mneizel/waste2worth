import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };
}

export const UploadCloud = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 16V7" />
    <path d="m8 11 4-4 4 4" />
    <path d="M20 16.5A3.5 3.5 0 0 0 18 10a5.5 5.5 0 0 0-10.7-1.3A4 4 0 0 0 6 16.5" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const Cross = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Bottle = (p: IconProps) => (
  <svg {...base(p)} viewBox="0 0 24 40">
    <path d="M9 2h6v4l3 5v25a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11l3-5z" />
  </svg>
);

export const Scissors = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.1 8.1 20 20M8.1 15.9 20 4" />
  </svg>
);

export const StringIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12c4-6 12-6 16 0-4 6-12 6-16 0Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const Marker = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 21l4-1L20 7l-3-3L4 17l-1 4Z" />
  </svg>
);

export const Tape = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 20h8v-4" />
  </svg>
);

export const Nail = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 3h8l-2 4h-4z" />
    <path d="M11 7 12 21l1-14" />
  </svg>
);

export const Wrench = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 6a3.5 3.5 0 0 0-4.6 4.6L3 17v4h4l6.4-6.4A3.5 3.5 0 0 0 18 10l-2.5.5L14 8z" />
  </svg>
);

export const Cube = (p: IconProps) => (
  <svg {...base(p)} viewBox="0 0 46 46">
    <path d="M23 6 39 15v16L23 40 7 31V15z" />
    <path d="M23 6v34M7 15l16 9 16-9" />
  </svg>
);

export const Rotate = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 1 3 6.7" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const Ruler = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 15 15 4l5 5L9 20z" />
    <path d="M8 8l2 2M11 5l2 2M5 11l2 2" />
  </svg>
);

export const ArrowNext = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const Leaf = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16Z" />
    <path d="M4 20c2-4 5-7 10-9" />
  </svg>
);

export const Lightbulb = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
  </svg>
);

export const Warning = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 9v5" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const Speaker = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M17 9a4 4 0 0 1 0 6" />
    <path d="M19.5 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const SpeakerStop = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <rect x="16" y="9" width="5" height="6" rx="1.2" />
  </svg>
);

const iconByToolName: Array<[RegExp, (p: IconProps) => JSX.Element]> = [
  [/scissor|knife|مقص|سكين|قصّ|قص\b/i, Scissors],
  [/string|lace|rope|cord|خيط|حبل|دوبارة|رباط|فتيل/i, StringIcon],
  [/marker|pen|قلم|sharpie/i, Marker],
  [/tape|شريط|لاصق|لزق/i, Tape],
  [/nail|pin|مسمار|دبّوس|دبوس/i, Nail],
  [
    /soil|seed|plant|paint|sand|water|تربة|تراب|بذور|شتل|عشب|نبت|دهان|صنفرة|رمل|ماء|مي\b/i,
    Leaf,
  ],
];

export function toolIcon(name: string): (p: IconProps) => JSX.Element {
  for (const [re, comp] of iconByToolName) {
    if (re.test(name)) return comp;
  }
  return Wrench;
}
