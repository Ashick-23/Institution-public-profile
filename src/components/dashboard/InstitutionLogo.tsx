"use client";

import { useState, useEffect } from "react";

interface InstitutionLogoProps {
  src: string | null;
  alt: string;
  domain?: string | null;
  fallback: React.ReactNode;
}

export function InstitutionLogo({ src, alt, domain, fallback }: InstitutionLogoProps) {
  // Build a prioritized array of valid image sources
  const sources: string[] = [];

  if (src) {
    sources.push(src);
  }
  if (domain) {
    // Unavatar aggregates multiple avatar/logo APIs under one unified endpoint
    sources.push(`https://unavatar.io/${domain}`);
    // DuckDuckGo's favicon service is highly reliable and fast
    sources.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    // Google's favicon service as a solid backup
    sources.push(`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=256`);
  }

  const [sourceIndex, setSourceIndex] = useState(0);

  // Reset index when target institution (src or domain) changes
  useEffect(() => {
    setSourceIndex(0);
  }, [src, domain]);

  // If we have tried all sources and all failed, render the SVG crest fallback
  if (sourceIndex >= sources.length) {
    return <>{fallback}</>;
  }

  const currentSrc = sources[sourceIndex];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className="max-h-full max-w-full object-contain"
      onError={() => {
        setSourceIndex(prev => prev + 1);
      }}
    />
  );
}
