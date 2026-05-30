"use client";

import { useState, useEffect } from "react";

interface InstitutionLogoProps {
  src: string | null;
  alt: string;
  domain?: string | null;
  fallback: React.ReactNode;
}

export function InstitutionLogo({ src, alt, domain, fallback }: InstitutionLogoProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sources: string[] = [];
    
    // Add primary source if provided
    if (src) sources.push(src);
    
    // Add high-quality fallbacks based on domain
    if (domain) {
      sources.push(`https://logo.clearbit.com/${domain}`);
      sources.push(`https://unavatar.io/${domain}`);
      sources.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      sources.push(`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=256`);
    }

    // Deduplicate any repeated sources
    const uniqueSources = Array.from(new Set(sources));
    
    if (uniqueSources.length === 0) {
      setFailed(true);
      return;
    }

    let isMounted = true;
    let currentIndex = 0;

    const tryNext = () => {
      if (!isMounted) return;
      if (currentIndex >= uniqueSources.length) {
        setFailed(true);
        setCurrentSrc(null);
        return;
      }
      
      const imgUrl = uniqueSources[currentIndex];
      const img = new Image();
      
      img.onload = () => {
        if (!isMounted) return;
        // Verify it's not a broken or 1x1 tracking pixel
        if (img.width > 1) {
          setCurrentSrc(imgUrl);
        } else {
          currentIndex++;
          tryNext();
        }
      };
      
      img.onerror = () => {
        currentIndex++;
        tryNext();
      };
      
      img.src = imgUrl;
    };

    setFailed(false);
    setCurrentSrc(null);
    tryNext();

    return () => {
      isMounted = false;
    };
  }, [src, domain]);

  if (failed) {
    return <>{fallback}</>;
  }

  if (!currentSrc) {
    // Show a subtle pulse animation while looking for a valid image
    return <div className="animate-pulse bg-slate-100 size-full rounded-sm"></div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className="max-h-full max-w-full object-contain animate-in fade-in duration-500"
    />
  );
}
