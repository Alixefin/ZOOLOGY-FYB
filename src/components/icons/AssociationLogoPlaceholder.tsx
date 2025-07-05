import type { SVGProps } from 'react';

export function AssociationLogoPlaceholder(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-label="Association Logo Placeholder"
      {...props}
    >
      <rect width="100" height="100" rx="10" fill="hsl(var(--muted))" />
      <text
        x="50"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
      >
        NACOS Logo
      </text>
    </svg>
  );
}
