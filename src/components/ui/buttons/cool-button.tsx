"use client";

import React, { forwardRef } from "react";

export type CoolVariant = "default" | "primary" | "gold" | "dark";

export interface CoolButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CoolVariant;
  size?: "sm" | "default" | "lg" | "icon";
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const CoolButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  CoolButtonProps
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
    // Size styles
    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-lg min-h-[34px]",
      default: "px-5 py-2.5 text-sm gap-2 rounded-xl min-h-[42px]",
      lg: "px-7 py-3.5 text-base gap-2.5 rounded-xl min-h-[50px]",
      icon: "w-10 h-10 p-0 rounded-xl flex items-center justify-center",
    }[size];

    const variantStyles: Record<
      CoolVariant,
      {
        bg: string;
        border: string;
        text: string;
        shadow: string;
        glow: string;
      }
    > = {
      default: {
        bg: "bg-gradient-to-b from-[#1c3048] via-[#152538] to-[#0c1624]",
        border: "border-white/15 hover:border-white/30",
        text: "text-white",
        shadow: "rgba(0, 0, 0, 0.4)",
        glow: "rgba(28, 48, 72, 0.35)",
      },
      primary: {
        bg: "bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e40af]",
        border: "border-blue-400/30 hover:border-blue-300/50",
        text: "text-white",
        shadow: "rgba(30, 64, 175, 0.45)",
        glow: "rgba(37, 99, 235, 0.4)",
      },
      gold: {
        bg: "bg-gradient-to-b from-[#d8ba82] via-[#c5a46d] to-[#9b7b43]",
        border: "border-amber-200/40 hover:border-amber-100/70",
        text: "text-[#101f32] font-semibold",
        shadow: "rgba(155, 123, 67, 0.45)",
        glow: "rgba(197, 164, 109, 0.45)",
      },
      dark: {
        bg: "bg-gradient-to-b from-[#27272a] via-[#18181b] to-[#09090b]",
        border: "border-white/10 hover:border-white/25",
        text: "text-gray-100",
        shadow: "rgba(0, 0, 0, 0.6)",
        glow: "rgba(255, 255, 255, 0.1)",
      },
    };

    const cfg = variantStyles[variant];

    const baseClasses = `
      relative inline-flex items-center justify-center font-medium
      select-none cursor-pointer group outline-none overflow-hidden
      border transition-all duration-200 transform-gpu
      hover:scale-[1.02] active:scale-[0.98]
      focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c5a46d]
      disabled:opacity-50 disabled:pointer-events-none disabled:scale-100
      ${sizeClasses}
      ${cfg.bg}
      ${cfg.border}
      ${cfg.text}
      ${className}
    `.trim();

    const inlineStyles: React.CSSProperties = {
      boxShadow: `
        inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.35),
        0 4px 14px 0 ${cfg.shadow},
        0 1px 3px 0 rgba(0, 0, 0, 0.2)
      `,
    };

    const content = (
      <>
        {/* Top subtle highlight rim */}
        <span className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Ambient glow bloom on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${cfg.glow}, transparent 70%)`,
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
              {icon}
            </span>
          )}
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
        {...props}
      >
        {content}
      </button>
    );
  }
);

CoolButton.displayName = "CoolButton";

export default CoolButton;
