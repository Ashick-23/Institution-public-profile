"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function SearchNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`https://api.openalex.org/autocomplete/institutions?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const id = data.results[0].id.split('/').pop();
        router.push(`/?id=${id}`);
      } else {
        alert("Institution not found. Please try another name.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-13 items-center px-4 md:px-8 gap-6" style={{ height: '52px' }}>
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">Research</span>
            <span className="text-sm font-bold tracking-tight text-slate-800" style={{ fontFamily: "'Source Serif 4', serif" }}>Intelligence</span>
          </div>
        </div>
      </div>
    </header>
  );
}
