"use client";

import React, { forwardRef, useState } from "react";

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  target?: string;
  rel?: string;
  size?: "sm" | "default" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const GlassButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  GlassButtonProps
>(
  (
    {
      href,
      target,
      rel,
      size = "default",
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
      sm: "px-4 py-1.5 text-xs gap-1.5 min-h-[36px]",
      default: "px-6 py-2.5 text-sm gap-2 min-h-[44px]",
      lg: "px-8 py-3.5 text-base gap-2.5 min-h-[52px]",
    }[size];

    const baseClasses = `
      relative inline-flex items-center justify-center font-medium
      rounded-full border border-white/30 backdrop-blur-xl
      bg-white/[0.08] hover:bg-white/[0.16] text-white
      select-none cursor-pointer group outline-none overflow-hidden
      transition-all duration-300 transform-gpu
      hover:scale-105 hover:border-white/50 active:scale-95
      focus-visible:ring-2 focus-visible:ring-[#c5a46d] focus-visible:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100
      ${sizeClasses}
      ${className}
    `.trim();

    const inlineStyles: React.CSSProperties = {
      boxShadow: isHovered
        ? "inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 1px 0 rgba(0, 0, 0, 0.3), 0 12px 30px -4px rgba(255, 255, 255, 0.25)"
        : "inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), 0 6px 20px -2px rgba(0, 0, 0, 0.2)",
    };

    const content = (
      <>
        {/* Specular top rim */}
        <span className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        {/* Hover expanding light ripple */}
        <span className="pointer-events-none absolute -inset-full w-[300%] h-[300%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial from-white/20 via-transparent to-transparent -translate-x-1/2 -translate-y-1/2" />

        {/* Inner bottom shadow */}
        <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/30 to-transparent" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && (
            <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {content}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
