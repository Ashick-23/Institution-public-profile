"use client";

import { useMemo } from "react";

// Official UN SDG Colors
const SDG_COLORS: Record<number, string> = {
  1: "#e5243b",
  2: "#dda63a",
  3: "#4c9f38",
  4: "#c5192d",
  5: "#ff3a21",
  6: "#26bde2",
  7: "#fcc30b",
  8: "#a21942",
  9: "#fd6925",
  10: "#dd1367",
  11: "#fd9d24",
  12: "#bf8b2e",
  13: "#3f7e44",
  14: "#0a97d9",
  15: "#56c02b",
  16: "#00689d",
  17: "#19486a"
};

export function SDGGrid({ sdgs }: { sdgs: { id: number; name: string; count: number }[] }) {
  if (!sdgs || sdgs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">UN Sustainable Development Goals</h2>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400">Based on recent publications</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sdgs.map((sdg) => (
          <div key={sdg.id} className="bg-white border border-slate-200 rounded-sm shadow-sm flex items-start gap-4 p-4 hover:border-slate-300 transition-colors">
            <div 
              className="size-10 rounded text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
              style={{ backgroundColor: SDG_COLORS[sdg.id] || '#64748b' }}
            >
              {sdg.id}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-700 leading-tight mb-1">{sdg.name}</h4>
              <p className="text-[10px] text-slate-500"><strong className="text-slate-800">{sdg.count}</strong> aligned works</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
