import { SearchNav } from "@/components/dashboard/SearchNav";
import { OPENALEX_API_BASE } from "@/lib/api";
import Link from "next/link";
import { FileText, Unlock, ChevronRight, BookOpen, ArrowUpDown } from "lucide-react";

const INST_ID = "I347237974"; // Ashoka University

async function getPublications(page = 1, type = "", oa = "", instId = INST_ID) {
  const filters = [`institutions.id:${instId}`];
  if (type) filters.push(`type:${type}`);
  if (oa === "true") filters.push("open_access.is_oa:true");

  const url = `${OPENALEX_API_BASE}/works?filter=${filters.join(",")}&sort=cited_by_count:desc&per-page=25&page=${page}&mailto=test@example.com`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return { results: [], meta: { count: 0 } };
  return res.json();
}

async function getWorkTypes(instId = INST_ID) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${instId}&group_by=type&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.group_by || [];
}

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; oa?: string; id?: string }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : INST_ID;
  const page = Math.max(1, parseInt(params.page || "1"));
  const type = params.type || "";
  const oa = params.oa || "";

  const [data, rawTypes] = await Promise.all([
    getPublications(page, type, oa, id),
    getWorkTypes(id),
  ]);

  const types = rawTypes.map((t: any) => ({
    ...t,
    key: t.key.split("/").pop() || t.key,
  }));

  const totalPages = Math.ceil((data.meta?.count || 0) / 25);
  const fNum = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n || 0);

  const constructAbstract = (idx: any) => {
    if (!idx) return null;
    try {
      const arr: string[] = [];
      Object.keys(idx).forEach(w => idx[w].forEach((p: number) => { arr[p] = w; }));
      return arr.join(" ");
    } catch { return null; }
  };

  const getOABadge = (work: any) => {
    if (!work.open_access?.is_oa) return null;
    const s = work.open_access.oa_status?.toLowerCase();
    const styles: Record<string, string> = {
      gold: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      hybrid: "bg-blue-50 text-blue-700 border-blue-200",
      bronze: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles[s] || "bg-slate-100 text-slate-600 border-slate-200"}`}><Unlock className="size-2.5" /> {s}</span>;
  };

  const buildUrl = (overrides: Record<string, string>) => {
    const p = { page: "1", type, oa, ...(id !== INST_ID ? { id } : {}), ...overrides };
    const q = new URLSearchParams(p);
    if (!q.get("type")) q.delete("type");
    if (!q.get("oa")) q.delete("oa");
    return `/publications?${q.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SearchNav />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Link href={id === INST_ID ? "/" : `/?id=${id}`} className="hover:text-primary transition-colors">Institution</Link>
              <ChevronRight className="size-3" />
              <span className="text-slate-600 font-medium">Publications</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Discover Research Outputs</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browsing <strong className="text-slate-700">{(data.meta?.count || 0).toLocaleString()}</strong> scholarly works from Ashoka University, sorted by citation impact.
            </p>
          </div>
        </div>

        {/* ── Sub Navigation Tabs ── */}
        <section className="border-b border-slate-200/80">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { label: "Analytics Overview", href: id === INST_ID ? "/" : `/?id=${id}`, active: false },
              { label: "Research Insights", href: id === INST_ID ? "/publications" : `/publications?id=${id}`, active: true },
              { label: "Partnerships", href: id === INST_ID ? "/sdgs" : `/sdgs?id=${id}`, active: false },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`pb-3 text-sm font-bold tracking-tight transition-all duration-200 relative -mb-px border-b-2 ${
                  tab.active
                    ? "text-slate-900 border-primary"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6 pt-2">

          {/* ── Filters Sidebar ── */}
          <aside className="w-full lg:w-56 shrink-0 space-y-5">

            {/* Document Type */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Type</h3>
              </div>
              <div className="divide-y divide-slate-100">
                <Link href={buildUrl({ type: "" })} className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 ${!type ? "text-primary font-semibold" : "text-slate-600"}`}>
                  <span>All Types</span>
                  {!type && <div className="size-1.5 rounded-full bg-primary" />}
                </Link>
                {types.slice(0, 8).map((t: any) => (
                  <Link key={t.key} href={buildUrl({ type: t.key })} className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 ${type === t.key ? "text-primary font-semibold" : "text-slate-600"}`}>
                    <span className="capitalize">{t.key_display_name || t.key}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">{fNum(t.count)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Open Access */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Open Access</h3>
              </div>
              <div className="divide-y divide-slate-100">
                <Link href={buildUrl({ oa: "" })} className={`flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors ${!oa ? "text-primary font-semibold" : "text-slate-600"}`}>
                  <span>All</span>
                  {!oa && <div className="size-1.5 rounded-full bg-primary" />}
                </Link>
                <Link href={buildUrl({ oa: "true" })} className={`flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors ${oa === "true" ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
                  <Unlock className="size-3 text-emerald-600" /> Open Access Only
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Active filter pills */}
            {(type || oa) && (
              <div className="flex flex-wrap gap-2">
                {type && (
                  <Link href={buildUrl({ type: "" })} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                    {type} <span className="text-primary/60">×</span>
                  </Link>
                )}
                {oa && (
                  <Link href={buildUrl({ oa: "" })} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors">
                    Open Access only <span className="opacity-60">×</span>
                  </Link>
                )}
              </div>
            )}

            {/* Work cards */}
            <div className="space-y-3">
              {data.results?.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-sm p-10 text-center">
                  <FileText className="size-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">No results found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing the filters or selecting a different document type.</p>
                  <Link href="/publications" className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">Clear all filters →</Link>
                </div>
              )}
              {data.results?.map((work: any, i: number) => {
                const workId = work.id?.split("/").pop();
                const abstract = constructAbstract(work.abstract_inverted_index);
                const authors = work.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).join(", ");
                const hasMore = (work.authorships?.length || 0) > 3;

                return (
                  <div key={work.id} className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <span className="text-[11px] text-slate-300 tabular-nums font-bold shrink-0 mt-0.5 w-6 text-right">
                        {(page - 1) * 25 + i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/works/${workId}`} className="text-sm font-bold text-slate-800 hover:text-primary hover:underline leading-snug line-clamp-2 transition-colors block">
                          {work.title}
                        </Link>

                        {authors && (
                          <p className="text-xs text-slate-500 mt-1.5 font-medium">
                            {authors}{hasMore ? " et al." : ""}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-600">{work.publication_year}</span>
                          {work.primary_location?.source?.display_name && (
                            <>
                              <span>·</span>
                              <span className="font-medium text-slate-500 max-w-[220px] truncate" title={work.primary_location.source.display_name}>
                                {work.primary_location.source.display_name}
                              </span>
                            </>
                          )}
                          {work.type && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{work.type.replace(/-/g, " ")}</span>
                            </>
                          )}
                          {work.language && work.language !== "en" && (
                            <>
                              <span>·</span>
                              <span className="uppercase font-bold bg-slate-100 px-1 py-0.5 rounded">{work.language}</span>
                            </>
                          )}
                        </div>

                        {abstract && (
                          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{abstract}</p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          {getOABadge(work)}
                        </div>
                      </div>

                      {/* Citation count */}
                      <div className="shrink-0 flex flex-col items-center bg-slate-50 border border-slate-200 rounded px-2.5 py-2 min-w-[52px] text-center">
                        <span className="text-sm font-bold text-primary tabular-nums leading-none">{fNum(work.cited_by_count)}</span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">cit.</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-400">
                  Page {page} of {totalPages.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:border-primary/50 hover:text-primary transition-colors">
                      ← Previous
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 text-xs font-semibold border border-primary/30 rounded bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 py-4 text-center text-[10px] text-slate-400">
        Data from <a href="https://openalex.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenAlex</a> · CC0 Open Data
      </footer>
    </div>
  );
}
