"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sun, Moon } from "lucide-react";

export function SearchNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // First, hit openalex autocomplete to get the institution ID
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="font-semibold text-sm md:text-base tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              R
            </div>
            ResearchProfile
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full max-w-[200px] md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              placeholder="Search global institutions..."
              className="flex h-9 w-full rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 px-3 py-1 text-xs md:text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus:bg-white dark:focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 pl-9 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </form>
          
          <button
            onClick={toggleTheme}
            className="p-1.5 md:p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Toggle Theme"
            type="button"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
