"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

import {
  Slot,
  type WithAsChild,
} from "@/components/animate-ui/primitives/animate/slot";

type Size = "default" | "sm" | "lg" | "icon";

type LiquidButtonProps = WithAsChild<
  HTMLMotionProps<"button"> & {
    delay?: string;
    fillHeight?: string;
    hoverScale?: number;
    tapScale?: number;
    size?: Size;
  }
>;

function LiquidButton({
  delay = "0.3s",
  fillHeight = "3px",
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  size = "default",
  className,
  ...props
}: LiquidButtonProps) {
  const Component = asChild ? Slot : motion.button;
  // Map `size` prop to utility classes (can be adjusted to your design tokens)
  const sizeClasses: Record<Size, string> = {
    default: "px-4 py-2 text-sm",
    sm: "px-2 py-1 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  // Default visual classes: primary background and white text
  const baseClasses = "bg-primary text-white";

  return (
    <Component
      whileTap={{ scale: tapScale }}
      whileHover={{
        scale: hoverScale,
        color: "#000", // black text on hover
        backgroundColor: "#fff", // white background on hover
        "--liquid-button-fill-width": "100%",
        "--liquid-button-fill-height": "100%",
        "--liquid-button-delay": delay,
        transition: {
          "--liquid-button-fill-width": { duration: 0 },
          "--liquid-button-fill-height": { duration: 0 },
          "--liquid-button-delay": { duration: 0 },
        },
      }}
      className={[sizeClasses[size], baseClasses, className]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--liquid-button-fill-width": "-1%",
          "--liquid-button-fill-height": fillHeight,
          "--liquid-button-delay": "0s",
          background:
            "linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)",
          transition: `background ${delay} var(--liquid-button-delay, 0s), color ${delay} ${delay}, background-position ${delay} calc(${delay} - var(--liquid-button-delay, 0s))`,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { LiquidButton, type LiquidButtonProps };
