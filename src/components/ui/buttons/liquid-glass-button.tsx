"use client";

import React, { forwardRef, useState } from "react";

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "gold" | "subtle";
  size?: "sm" | "default" | "lg" | "icon";
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const LiquidGlassButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  LiquidGlassButtonProps
>(
  (
    {
      variant = "default",
      size = "default",
      href,
      target,
      rel,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    // Size mappings
    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-full min-h-[34px]",
      default: "px-5 py-2.5 text-sm gap-2 rounded-full min-h-[42px]",
      lg: "px-7 py-3 text-base gap-2.5 rounded-full min-h-[50px]",
      icon: "w-10 h-10 p-0 rounded-full flex items-center justify-center",
    }[size];

    // Variant style mappings
    const variantStyles = {
      default: {
        border: "border-white/30 hover:border-white/50",
        bg: "bg-white/[0.08] hover:bg-white/[0.14]",
        text: "text-white",
        glow: "rgba(255, 255, 255, 0.2)",
      },
      primary: {
        border: "border-[#dfc89f]/40 hover:border-[#dfc89f]/70",
        bg: "bg-[#101f32]/60 hover:bg-[#101f32]/80",
        text: "text-white",
        glow: "rgba(197, 164, 109, 0.25)",
      },
      gold: {
        border: "border-[#c5a46d]/50 hover:border-[#dfc89f]",
        bg: "bg-[#c5a46d]/20 hover:bg-[#c5a46d]/30",
        text: "text-[#dfc89f] hover:text-white",
        glow: "rgba(197, 164, 109, 0.35)",
      },
      subtle: {
        border: "border-white/20 hover:border-white/35",
        bg: "bg-black/20 hover:bg-black/35",
        text: "text-gray-200 hover:text-white",
        glow: "rgba(255, 255, 255, 0.15)",
      },
    }[variant];

    const baseClasses = `
      relative inline-flex items-center justify-center font-medium
      backdrop-blur-xl border select-none transition-all duration-300
      overflow-hidden cursor-pointer group outline-none
      focus-visible:ring-2 focus-visible:ring-[#c5a46d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101f32]
      active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
      ${sizeClasses}
      ${variantStyles.border}
      ${variantStyles.bg}
      ${variantStyles.text}
      ${className}
    `.trim();

    const inlineStyles: React.CSSProperties = {
      boxShadow: `
        inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1.5px 1px 0 rgba(0, 0, 0, 0.25),
        0 8px 24px -4px ${variantStyles.glow}
      `,
    };

    const content = (
      <>
        {/* SVG Liquid Distortion Filter embedded per button instance or globally */}
        <span
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-75"
          style={{
            background: `radial-gradient(circle 80px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.35), transparent 70%)`,
          }}
        />

        {/* Specular top light rim */}
        <span className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        {/* Inner shadow bottom bevel */}
        <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/30 to-transparent" />

        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>}
          {children}
        </span>
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
          onMouseMove={handleMouseMove}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type || "button"}
        disabled={disabled}
        className={baseClasses}
        style={inlineStyles}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {content}
      </button>
    );
  }
);

LiquidGlassButton.displayName = "LiquidGlassButton";

export default LiquidGlassButton;
