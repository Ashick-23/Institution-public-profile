"use client";

import { FileText, Unlock, BookOpen } from "lucide-react";

export function PublicationsTable({ works }: { works: any[] }) {
  if (!works || works.length === 0) return null;

  const getOABadge = (work: any) => {
    if (!work.open_access?.is_oa) return null;
    const status = work.open_access.oa_status?.toLowerCase();
    
    let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
    if (status === "gold") colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    else if (status === "green") colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    else if (status === "hybrid") colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    else if (status === "bronze") colorClass = "bg-orange-50 text-orange-700 border-orange-200";

    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border ${colorClass}`}>
        <Unlock className="size-2.5" /> {status} OA
      </span>
    );
  };

  const constructAbstract = (indexObj: any) => {
    if (!indexObj) return null;
    try {
      const abstractArr: string[] = [];
      Object.keys(indexObj).forEach(word => {
        indexObj[word].forEach((pos: number) => {
          abstractArr[pos] = word;
        });
      });
      return abstractArr.join(" ");
    } catch {
      return null;
    }
  };

  const fNum = (num: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(num || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">High-Impact Research Output</h3>
          <p className="text-xs text-slate-500 mt-0.5">Most-cited recent publications</p>
        </div>
        <FileText className="size-4 text-slate-400" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {works.map((work: any) => {
          const authors = work.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).join(", ");
          const hasMoreAuthors = work.authorships?.length > 3;
          const authorStr = authors + (hasMoreAuthors ? " et al." : "");
          const abstractStr = constructAbstract(work.abstract_inverted_index);

          return (
            <div key={work.id} className="px-5 py-4 hover:bg-slate-50/80 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a 
                    href={work.doi || `https://openalex.org/${work.id.split('/').pop()}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-semibold text-slate-800 hover:text-blue-700 hover:underline leading-snug transition-colors line-clamp-2"
                  >
                    {work.title}
                  </a>
                  
                  {authorStr && (
                    <div className="mt-1 text-[11px] text-slate-600 font-medium">
                      {authorStr}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{work.publication_year}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="truncate max-w-[200px] font-medium" title={work.primary_location?.source?.display_name}>
                      {work.primary_location?.source?.display_name || "Unknown Venue"}
                    </span>
                    
                    {work.type && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="capitalize">{work.type.replace("-", " ")}</span>
                      </>
                    )}
                    
                    {work.language && work.language !== "en" && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="uppercase text-[9px] font-bold bg-slate-100 px-1 py-0.5 rounded">{work.language}</span>
                      </>
                    )}
                  </div>

                  {abstractStr && (
                    <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {abstractStr}
                    </p>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2">
                    {getOABadge(work)}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[50px]">
                    <div className="text-sm font-bold text-slate-700 tabular-nums leading-none">{fNum(work.cited_by_count)}</div>
                    <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Citations</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
