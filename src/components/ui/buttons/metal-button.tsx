"use client";

import React, { forwardRef } from "react";

export type MetalVariant =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "gold"
  | "bronze";

export interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MetalVariant;
  size?: "sm" | "default" | "lg" | "icon";
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const MetalButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  MetalButtonProps
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
      lg: "px-7 py-3 text-base gap-2.5 rounded-xl min-h-[50px]",
      icon: "w-10 h-10 p-0 rounded-xl flex items-center justify-center",
    }[size];

    // Metallic color theme definitions
    const variantConfig: Record<
      MetalVariant,
      {
        bg: string;
        border: string;
        text: string;
        highlight: string;
        shadow: string;
      }
    > = {
      default: {
        bg: "linear-gradient(180deg, #374151 0%, #1f2937 50%, #111827 100%)",
        border: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(156,163,175,0.3) 50%, rgba(31,41,55,0.6) 100%)",
        text: "text-gray-100",
        highlight: "rgba(255, 255, 255, 0.45)",
        shadow: "rgba(0, 0, 0, 0.45)",
      },
      primary: {
        bg: "linear-gradient(180deg, #1e3a5f 0%, #101f32 50%, #0a1420 100%)",
        border: "linear-gradient(180deg, rgba(147,197,253,0.5) 0%, rgba(59,130,246,0.3) 50%, rgba(16,31,50,0.8) 100%)",
        text: "text-white",
        highlight: "rgba(147, 197, 253, 0.5)",
        shadow: "rgba(10, 20, 32, 0.55)",
      },
      gold: {
        bg: "linear-gradient(180deg, #c5a46d 0%, #a6844d 50%, #7d6132 100%)",
        border: "linear-gradient(180deg, #f3e5c8 0%, #dfc89f 50%, #5e4620 100%)",
        text: "text-gray-900 font-semibold",
        highlight: "rgba(255, 248, 220, 0.6)",
        shadow: "rgba(125, 97, 50, 0.45)",
      },
      bronze: {
        bg: "linear-gradient(180deg, #9a5b32 0%, #7c4422 50%, #572d14 100%)",
        border: "linear-gradient(180deg, #dfa57e 0%, #b86e42 50%, #3e1e0a 100%)",
        text: "text-[#fde8dc] font-semibold",
        highlight: "rgba(253, 232, 220, 0.5)",
        shadow: "rgba(62, 30, 10, 0.5)",
      },
      success: {
        bg: "linear-gradient(180deg, #059669 0%, #047857 50%, #064e3b 100%)",
        border: "linear-gradient(180deg, rgba(167,243,208,0.5) 0%, rgba(52,211,153,0.3) 50%, rgba(6,78,59,0.8) 100%)",
        text: "text-white",
        highlight: "rgba(167, 243, 208, 0.5)",
        shadow: "rgba(6, 78, 59, 0.5)",
      },
      error: {
        bg: "linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
        border: "linear-gradient(180deg, rgba(254,202,202,0.5) 0%, rgba(248,113,113,0.3) 50%, rgba(127,29,29,0.8) 100%)",
        text: "text-white",
        highlight: "rgba(254, 202, 202, 0.5)",
        shadow: "rgba(127, 29, 29, 0.5)",
      },
    };

    const cfg = variantConfig[variant];

    const baseClasses = `
      relative inline-flex items-center justify-center font-medium
      select-none cursor-pointer group outline-none overflow-hidden
      transition-all duration-200 transform-gpu
      hover:brightness-110 active:brightness-95 active:translate-y-[1.5px]
      focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c5a46d]
      disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0
      ${sizeClasses}
      ${cfg.text}
      ${className}
    `.trim();

    const inlineStyles: React.CSSProperties = {
      background: cfg.bg,
      boxShadow: `
        0 4px 14px -2px ${cfg.shadow},
        inset 0 1px 1px 0 ${cfg.highlight},
        inset 0 -2px 3px 0 rgba(0, 0, 0, 0.45)
      `,
    };

    const content = (
      <>
        {/* Layered metallic border gradient */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] -z-10"
          style={{
            background: cfg.border,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Diagonal metallic shine sweep on hover */}
        <span
          className="pointer-events-none absolute -inset-full w-[250%] h-[250%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -rotate-45 translate-x-[-120%] group-hover:translate-x-[120%] duration-1000 ease-in-out"
          style={{
            background:
              "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
          }}
        />

        {/* Top 3D bevel reflection */}
        <span
          className="pointer-events-none absolute inset-x-2 top-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${cfg.highlight}, transparent)`,
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
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

MetalButton.displayName = "MetalButton";

export default MetalButton;
