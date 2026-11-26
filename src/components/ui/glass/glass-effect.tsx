"use client";

import React, { forwardRef } from "react";

export interface GlassEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  target?: string;
  rel?: string;
  blur?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  intensity?: "light" | "medium" | "heavy";
  children?: React.ReactNode;
}

export const GlassEffect = forwardRef<
  HTMLDivElement | HTMLAnchorElement,
  GlassEffectProps
>(
  (
    {
      href,
      target,
      rel,
      blur = "xl",
      rounded = "2xl",
      intensity = "medium",
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
      xl: "backdrop-blur-xl",
      "2xl": "backdrop-blur-2xl",
      "3xl": "backdrop-blur-3xl",
    }[blur];

    const roundedClasses = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full",
    }[rounded];

    const intensityStyles = {
      light: {
        bg: "bg-white/[0.05] hover:bg-white/[0.08]",
        border: "border-white/15 hover:border-white/25",
        shadow: "rgba(0, 0, 0, 0.12)",
      },
      medium: {
        bg: "bg-white/[0.08] hover:bg-white/[0.12]",
        border: "border-white/25 hover:border-white/40",
        shadow: "rgba(0, 0, 0, 0.2)",
      },
      heavy: {
        bg: "bg-white/[0.14] hover:bg-white/[0.18]",
        border: "border-white/35 hover:border-white/50",
        shadow: "rgba(0, 0, 0, 0.28)",
      },
    }[intensity];

    const baseClasses = `
      relative border select-none transition-all duration-300
      overflow-hidden ${blurClasses} ${roundedClasses}
      ${intensityStyles.bg} ${intensityStyles.border}
      ${className}
    `.trim();

    const inlineStyles: React.CSSProperties = {
      boxShadow: `
        inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.35),
        inset 0 -1.5px 1px 0 rgba(0, 0, 0, 0.25),
        0 12px 36px -4px ${intensityStyles.shadow}
      `,
      ...style,
    };

    const content = (
      <>
        {/* Specular glass top reflection */}
        <span className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Ambient inner soft sheen */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />

        <div className="relative z-10">{children}</div>
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={baseClasses}
          style={inlineStyles}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={baseClasses}
        style={inlineStyles}
        {...props}
      >
        {content}
      </div>
    );
  }
);

GlassEffect.displayName = "GlassEffect";

export default GlassEffect;
