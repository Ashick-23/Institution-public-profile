"use client";

import { useState } from "react";

export function InstitutionLogo({ src, alt, domain, fallback }: { src: string | null; alt: string; domain?: string | null; fallback: React.ReactNode }) {
  const [errorLevel, setErrorLevel] = useState(0); // 0: try src, 1: try google favicon, 2: fallback

  if (errorLevel >= 2 || (!src && !domain)) {
    return <>{fallback}</>;
  }

  const currentSrc = errorLevel === 0 ? src : `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=256`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc || ''}
      alt={alt}
      className="max-h-full max-w-full object-contain"
      onError={() => setErrorLevel(prev => prev + 1)}
    />
  );
}
