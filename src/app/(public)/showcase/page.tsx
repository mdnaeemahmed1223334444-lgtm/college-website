"use client";

import React, { useState } from "react";
import Link from "next/link";
import LiquidGlassButton from "@/components/ui/buttons/liquid-glass-button";
import MetalButton, { MetalVariant } from "@/components/ui/buttons/metal-button";
import CoolButton, { CoolVariant } from "@/components/ui/buttons/cool-button";
import SpinShutter from "@/components/ui/animations/spin-shutter";
import GlassFilter from "@/components/ui/glass/glass-filter";
import GlassEffect from "@/components/ui/glass/glass-effect";
import GlassDock from "@/components/ui/glass/glass-dock";
import GlassButton from "@/components/ui/glass/glass-button";

export default function ComponentShowcasePage() {
  const [clickCount, setClickCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>("None");
  const [selectedMetal, setSelectedMetal] = useState<MetalVariant>("gold");
  const [selectedCool, setSelectedCool] = useState<CoolVariant>("primary");

  const metalVariants: MetalVariant[] = [
    "default",
    "primary",
    "gold",
    "bronze",
    "success",
    "error",
  ];

  const coolVariants: CoolVariant[] = ["default", "primary", "gold", "dark"];

  const handleAction = (label: string) => {
    setClickCount((prev) => prev + 1);
    setLastAction(label);
  };

  return (
    <div className="min-h-screen bg-[#101f32] text-white py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* SVG Glass Distortion Filter (Rendered once) */}
      <GlassFilter />

      {/* ─── PAGE HEADER ─── */}
      <div className="max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c5a46d]/40 bg-[#c5a46d]/10 text-xs text-[#dfc89f] font-semibold uppercase tracking-wider">
          ✦ Premium Design System
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal text-white">
          Component &amp; Animation Showcase
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Interactive preview and testing environment for our premium button styles, 3D Spin Shutter,
          and glassmorphic dock components.
        </p>

        {/* Live Interaction Counter Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs text-gray-300">
          <span>
            Total Interactions: <strong className="text-[#dfc89f] text-sm">{clickCount}</strong>
          </span>
          <span className="text-gray-500">|</span>
          <span>
            Last Triggered: <strong className="text-white">{lastAction}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* ══════════════════════════════════════════════════════════════════
            SECTION A: BUTTON COLLECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">
              Section A: Button Collection
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Three distinct modern button architectures: Liquid Glass, 3D Metal, and Cool Gradient.
            </p>
          </div>

          {/* 1. Liquid Glass Button */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>1. Liquid Glass Button</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Transparent &amp; Refractive
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features transparent glass refraction, dynamic radial light tracking, and dual specular bevels.
                </p>
              </div>
            </div>

            {/* Variants Preview */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Variants (Hover &amp; Move cursor across buttons)
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <LiquidGlassButton
                  variant="default"
                  onClick={() => handleAction("Liquid Glass (Default)")}
                >
                  Default Glass
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="primary"
                  onClick={() => handleAction("Liquid Glass (Primary)")}
                >
                  Primary Glass
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="gold"
                  onClick={() => handleAction("Liquid Glass (Gold)")}
                >
                  Ivy Gold Glass
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="subtle"
                  onClick={() => handleAction("Liquid Glass (Subtle)")}
                >
                  Subtle Dark Glass
                </LiquidGlassButton>
              </div>
            </div>

            {/* Sizes Preview */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Sizes &amp; Icons
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <LiquidGlassButton
                  size="sm"
                  variant="gold"
                  icon="✦"
                  onClick={() => handleAction("Liquid Glass (Small)")}
                >
                  Small
                </LiquidGlassButton>

                <LiquidGlassButton
                  size="default"
                  variant="gold"
                  icon="✦"
                  onClick={() => handleAction("Liquid Glass (Default)")}
                >
                  Default Size
                </LiquidGlassButton>

                <LiquidGlassButton
                  size="lg"
                  variant="gold"
                  icon="✦"
                  onClick={() => handleAction("Liquid Glass (Large)")}
                >
                  Large Button
                </LiquidGlassButton>

                <LiquidGlassButton
                  size="icon"
                  variant="gold"
                  aria-label="Liquid Glass Icon Button"
                  onClick={() => handleAction("Liquid Glass (Icon)")}
                >
                  ⚡
                </LiquidGlassButton>
              </div>
            </div>
          </div>

          {/* 2. Metal Button */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>2. Metal Button</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Tactile 3D Metallic
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features realistic metallic gradient, diagonal shine sweep, hover brightness, and physical press-down depression.
                </p>
              </div>
            </div>

            {/* Color Variants */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                All 6 Supported Color Variants
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {metalVariants.map((v) => (
                  <MetalButton
                    key={v}
                    variant={v}
                    onClick={() => {
                      setSelectedMetal(v);
                      handleAction(`Metal (${v})`);
                    }}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)} Metal
                  </MetalButton>
                ))}
              </div>
            </div>

            {/* Sizes & Icons */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Sizes &amp; Tactile Feedback (Active Color: {selectedMetal.toUpperCase()})
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <MetalButton
                  size="sm"
                  variant={selectedMetal}
                  icon="🛡️"
                  onClick={() => handleAction(`Metal ${selectedMetal} (Small)`)}
                >
                  Small
                </MetalButton>

                <MetalButton
                  size="default"
                  variant={selectedMetal}
                  icon="🛡️"
                  onClick={() => handleAction(`Metal ${selectedMetal} (Default)`)}
                >
                  Default Size
                </MetalButton>

                <MetalButton
                  size="lg"
                  variant={selectedMetal}
                  icon="🛡️"
                  onClick={() => handleAction(`Metal ${selectedMetal} (Large)`)}
                >
                  Large 3D Metal
                </MetalButton>

                <MetalButton
                  size="icon"
                  variant={selectedMetal}
                  aria-label="Metal Icon Button"
                  onClick={() => handleAction(`Metal ${selectedMetal} (Icon)`)}
                >
                  ⚔️
                </MetalButton>
              </div>
            </div>
          </div>

          {/* 3. Cool Button */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>3. Cool Button</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Modern Gradient &amp; Inset Shadow
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Features 3D inset shadow, top highlight bevel, ambient radial glow bloom, and smooth scale transitions.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Supported Variants
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {coolVariants.map((v) => (
                  <CoolButton
                    key={v}
                    variant={v}
                    onClick={() => {
                      setSelectedCool(v);
                      handleAction(`Cool Button (${v})`);
                    }}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)} Gradient
                  </CoolButton>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Sizes &amp; Icons (Active Color: {selectedCool.toUpperCase()})
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <CoolButton
                  size="sm"
                  variant={selectedCool}
                  icon="🚀"
                  onClick={() => handleAction(`Cool ${selectedCool} (Small)`)}
                >
                  Small
                </CoolButton>

                <CoolButton
                  size="default"
                  variant={selectedCool}
                  icon="🚀"
                  onClick={() => handleAction(`Cool ${selectedCool} (Default)`)}
                >
                  Default Size
                </CoolButton>

                <CoolButton
                  size="lg"
                  variant={selectedCool}
                  icon="🚀"
                  onClick={() => handleAction(`Cool ${selectedCool} (Large)`)}
                >
                  Large Cool Button
                </CoolButton>

                <CoolButton
                  size="icon"
                  variant={selectedCool}
                  aria-label="Cool Icon Button"
                  onClick={() => handleAction(`Cool ${selectedCool} (Icon)`)}
                >
                  🔥
                </CoolButton>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION B: SPIN SHUTTER
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">
              Section B: Spin Shutter
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Interactive 3D-styled revolving orbit carousel of photos with camera tilt, continuous rotation, and hover magnification.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-8">
            <SpinShutter />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION C: GLASS UI COLLECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">
              Section C: Glass UI Collection
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Layered glass container architecture, fluid magnifying application dock, and glass CTA buttons.
            </p>
          </div>

          {/* 1. GlassEffect Container Showcase */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              1. GlassEffect Container (Configurable Blur &amp; Intensity)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassEffect intensity="light" className="p-6 space-y-3">
                <span className="text-xs font-bold text-[#dfc89f] uppercase tracking-wider block">
                  Light Glass
                </span>
                <h4 className="text-base font-bold text-white">Academic Excellence</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Subtle transparency designed for content cards, light overlays, and clean typographic backgrounds.
                </p>
              </GlassEffect>

              <GlassEffect intensity="medium" className="p-6 space-y-3">
                <span className="text-xs font-bold text-[#dfc89f] uppercase tracking-wider block">
                  Medium Glass (Default)
                </span>
                <h4 className="text-base font-bold text-white">Student Leadership</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Balanced specular reflection with deep backdrop blur and crisp borders for interactive cards.
                </p>
              </GlassEffect>

              <GlassEffect intensity="heavy" className="p-6 space-y-3">
                <span className="text-xs font-bold text-[#dfc89f] uppercase tracking-wider block">
                  Heavy Glass
                </span>
                <h4 className="text-base font-bold text-white">Campus Community</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  High-contrast frosted glass with intense reflections, perfect for prominent modals, floating bars, and docks.
                </p>
              </GlassEffect>
            </div>
          </div>

          {/* 2. GlassDock Showcase */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                2. GlassDock Component (macOS-Style Magnifying Fluid Dock)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Hover over the application icons below. Each icon smoothly scales up with proximity-based physics and tooltips.
              </p>
            </div>

            <div className="py-4 flex justify-center">
              <GlassDock
                items={[
                  {
                    id: "home",
                    title: "Home Campus",
                    icon: "🏛️",
                    onClick: () => handleAction("Dock: Home"),
                  },
                  {
                    id: "courses",
                    title: "Curriculum",
                    icon: "📚",
                    onClick: () => handleAction("Dock: Curriculum"),
                  },
                  {
                    id: "apply",
                    title: "Online Admission",
                    icon: "🎓",
                    badge: "Open",
                    onClick: () => handleAction("Dock: Admission"),
                  },
                  {
                    id: "notices",
                    title: "Latest Notices",
                    icon: "📋",
                    badge: 3,
                    onClick: () => handleAction("Dock: Notices"),
                  },
                  {
                    id: "gallery",
                    title: "Photo Gallery",
                    icon: "🖼️",
                    onClick: () => handleAction("Dock: Gallery"),
                  },
                  {
                    id: "portal",
                    title: "Secure Portal",
                    icon: "🔐",
                    onClick: () => handleAction("Dock: Portal"),
                  },
                ]}
              />
            </div>
          </div>

          {/* 3. GlassButton Showcase */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                3. GlassButton CTA (Smooth Hover Expansion)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Transparent glass surface with subtle radial glow and expansion on hover.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <GlassButton
                size="sm"
                icon="✦"
                onClick={() => handleAction("GlassButton (Small)")}
              >
                Explore Campus
              </GlassButton>

              <GlassButton
                size="default"
                icon="✨"
                onClick={() => handleAction("GlassButton (Default)")}
              >
                Apply Online ↗
              </GlassButton>

              <GlassButton
                size="lg"
                icon="🎓"
                onClick={() => handleAction("GlassButton (Large)")}
              >
                Discover Academic Excellence
              </GlassButton>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION D: INTERACTION TESTING & COMPARISON
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">
              Section D: Interaction Testing
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Side-by-side comparison of active press animations, hover states, and disabled states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liquid Glass Test */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
              <span className="text-xs font-bold text-[#dfc89f] uppercase tracking-wider block">
                Liquid Glass Interactive
              </span>
              <div className="space-y-3">
                <LiquidGlassButton
                  className="w-full justify-center"
                  variant="gold"
                  onClick={() => handleAction("Liquid Glass Interactive")}
                >
                  Click Me (Scale Effect)
                </LiquidGlassButton>
                <LiquidGlassButton
                  className="w-full justify-center"
                  variant="default"
                  disabled
                >
                  Disabled State
                </LiquidGlassButton>
              </div>
            </div>

            {/* Metal Button Test */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Metal 3D Press Down
              </span>
              <div className="space-y-3">
                <MetalButton
                  className="w-full justify-center"
                  variant="gold"
                  onClick={() => handleAction("Metal 3D Press Down")}
                >
                  Press Down &amp; Hold
                </MetalButton>
                <MetalButton
                  className="w-full justify-center"
                  variant="default"
                  disabled
                >
                  Disabled State
                </MetalButton>
              </div>
            </div>

            {/* Cool Button Test */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                Cool Button Inset Depth
              </span>
              <div className="space-y-3">
                <CoolButton
                  className="w-full justify-center"
                  variant="primary"
                  onClick={() => handleAction("Cool Button Inset Depth")}
                >
                  Modern Inset Depth
                </CoolButton>
                <CoolButton
                  className="w-full justify-center"
                  variant="default"
                  disabled
                >
                  Disabled State
                </CoolButton>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER LINK ─── */}
        <div className="text-center pt-8 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#dfc89f] hover:text-white transition-colors"
          >
            ← Return to College Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
