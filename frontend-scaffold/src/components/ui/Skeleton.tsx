import React from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

function toCssSize(value?: string | number) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Visual-only skeleton block with shimmer.
 * Accessibility (role/status/aria-busy) should be applied by the skeleton wrapper component.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  width,
  height,
  className = "",
  style,
}) => {
  const radius =
    variant === "circle" ? "9999px" : variant === "text" ? "8px" : "12px";

  const shouldReduceMotion = useReducedMotion();
  const animationStyle = shouldReduceMotion ? 'none' : 'st_shimmer 1.2s ease-in-out infinite';

  return (
    <>
      <style>
        {`
          @keyframes st_shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .st-skeleton {
            background: linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%);
            background-size: 200% 100%;
          }
          @media (prefers-reduced-motion: reduce) {
            .st-skeleton { animation: none; }
          }
        `}
      </style>
      <div
        data-testid={`skeleton-${variant}`}
        className={`st-skeleton ${className}`}
        style={{
          width: toCssSize(width),
          height: toCssSize(height),
          borderRadius: radius,
          animation: animationStyle,
          ...style,
        }}
      />
    </>
  );
};

export default Skeleton;
