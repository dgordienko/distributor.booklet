import type { SVGProps } from "react";

// Единый "linear" стиль иконок (тонкая обводка, без заливки) для всей админки.
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);

export const ArrowDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Icon>
);

export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.6 12.1a2 2 0 0 1-2 1.9H9.6a2 2 0 0 1-2-1.9L7 7" />
  </Icon>
);

export const StarIcon = ({
  filled,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <Icon fill={filled ? "currentColor" : "none"} {...props}>
    <path d="m12 3 2.6 5.6 6 .7-4.5 4.2 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7L12 3Z" />
  </Icon>
);

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const UploadIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Icon>
);

export const PhotoIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon width="28" height="28" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.75" />
    <path d="m4 17 5-5 3.5 3.5L16.5 11 20 15" />
  </Icon>
);

export const BulletListIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="18" r="1.25" fill="currentColor" stroke="none" />
  </Icon>
);

export const OrderedListIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <text x="1.5" y="8" fontSize="7" fill="currentColor" stroke="none">
      1
    </text>
    <text x="1.5" y="14" fontSize="7" fill="currentColor" stroke="none">
      2
    </text>
    <text x="1.5" y="20" fontSize="7" fill="currentColor" stroke="none">
      3
    </text>
  </Icon>
);

export const AlignLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 6h16M4 12h10M4 18h13" />
  </Icon>
);

export const AlignCenterIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 6h16M7 12h10M5.5 18h13" />
  </Icon>
);

export const AlignRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 6h16M10 12h10M7 18h13" />
  </Icon>
);

export const AlignJustifyIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
