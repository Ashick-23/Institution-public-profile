"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Menu } from "lucide-react";
import Link from "next/link";

export function SearchNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.openalex.org/autocomplete/institutions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results?.length > 0) {
        const id = data.results[0].id.split("/").pop();
        router.push(`/?id=${id}`);
      } else {
        alert("Institution not found. Please try another name.");
      }
    } catch { }
    finally { setIsLoading(false); }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      {/* Ashoka brand bar */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #0d3862 60%, #c4122f 100%)" }} />

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="size-7 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: "#0d3862" }}>
              AU
            </div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0d3862" }}>Research</span>
              <span className="text-sm font-bold tracking-tight text-slate-800" style={{ fontFamily: "Georgia, serif" }}>Intelligence</span>
            </div>
          </Link>

          {/* Mobile menu button for search */}
          <button
            className="md:hidden p-1.5 rounded text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle search"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile search form */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3">
            <form onSubmit={handleSearch} className="flex gap-2 px-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search institution..."
                className="flex-1 pl-3 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" disabled={isLoading} className="px-3 py-2 text-xs font-semibold text-white rounded" style={{ backgroundColor: "#0d3862" }}>
                {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : "Go"}
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

