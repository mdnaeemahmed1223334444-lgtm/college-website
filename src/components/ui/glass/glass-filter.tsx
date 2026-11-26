"use client";

import React from "react";

export interface GlassFilterProps {
  id?: string;
}

/**
 * GlassFilter: SVG filter pipeline providing realistic liquid refraction and specular light.
 * Rendered once globally or in the layout/showcase.
 */
export const GlassFilter: React.FC<GlassFilterProps> = ({
  id = "glass-distortion-filter",
}) => {
  return (
    <svg
      className="pointer-events-none fixed -top-[9999px] -left-[9999px] w-0 h-0 opacity-0 overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          {/* Fractal turbulence generating subtle organic glass distortion */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.035"
            numOctaves="3"
            seed="2"
            result="turbulence"
          />

          {/* Component transfer modifying noise intensity curve */}
          <feComponentTransfer in="turbulence" result="adjustedNoise">
            <feFuncR type="linear" slope="0.7" intercept="0.15" />
            <feFuncG type="linear" slope="0.7" intercept="0.15" />
            <feFuncB type="linear" slope="0.7" intercept="0.15" />
          </feComponentTransfer>

          {/* Gaussian blur smoothing out sharp noise */}
          <feGaussianBlur in="adjustedNoise" stdDeviation="1.5" result="blurredNoise" />

          {/* Specular lighting generating glass reflection highlight */}
          <feSpecularLighting
            in="blurredNoise"
            surfaceScale="4"
            specularConstant="1.2"
            specularExponent="24"
            lightingColor="#ffffff"
            result="specularLight"
          >
            <fePointLight x="-120" y="-120" z="220" />
          </feSpecularLighting>

          {/* Composite specular light with source graphic */}
          <feComposite
            in="specularLight"
            in2="SourceGraphic"
            operator="in"
            result="specularComposite"
          />

          {/* Displacement map distorting background graphic */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacedGraphic"
          />

          {/* Merge displaced graphic with specular highlights */}
          <feMerge>
            <feMergeNode in="displacedGraphic" />
            <feMergeNode in="specularComposite" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export default GlassFilter;
