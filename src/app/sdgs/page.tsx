import { SearchNav } from "@/components/dashboard/SearchNav";
import { OPENALEX_API_BASE } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, Unlock, ArrowLeft } from "lucide-react";

const INST_ID = "I347237974";

const ALL_SDGS = [
  { id: 1, name: "No Poverty" },
  { id: 2, name: "Zero Hunger" },
  { id: 3, name: "Good Health & Well-Being" },
  { id: 4, name: "Quality Education" },
  { id: 5, name: "Gender Equality" },
  { id: 6, name: "Clean Water & Sanitation" },
  { id: 7, name: "Affordable & Clean Energy" },
  { id: 8, name: "Decent Work & Economic Growth" },
  { id: 9, name: "Industry, Innovation & Infrastructure" },
  { id: 10, name: "Reduced Inequalities" },
  { id: 11, name: "Sustainable Cities & Communities" },
  { id: 12, name: "Responsible Consumption & Production" },
  { id: 13, name: "Climate Action" },
  { id: 14, name: "Life Below Water" },
  { id: 15, name: "Life on Land" },
  { id: 16, name: "Peace, Justice & Strong Institutions" },
  { id: 17, name: "Partnerships for the Goals" },
];

async function getSdgCounts(instId = INST_ID) {
  // Fetch works with SDG data to get aggregate counts
  const res = await fetch(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${instId}&sort=cited_by_count:desc&per-page=200&select=sustainable_development_goals&mailto=test@example.com`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return {};
  const data = await res.json();

  const counts: Record<number, number> = {};
  data.results?.forEach((w: any) => {
    w.sustainable_development_goals?.forEach((sdg: any) => {
      const id = parseInt(sdg.id?.split("/").pop() || "0");
      if (id > 0) counts[id] = (counts[id] || 0) + 1;
    });
  });
  return counts;
}

async function getSdgWorks(sdgId: number, instId = INST_ID) {
  const res = await fetch(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${instId},sustainable_development_goals.id:${sdgId}&sort=cited_by_count:desc&per-page=12&mailto=test@example.com`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export default async function SDGsPage({
  searchParams,
}: {
  searchParams: Promise<{ sdg?: string; id?: string }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : INST_ID;
  const selectedSdg = params.sdg ? parseInt(params.sdg) : null;

  const [sdgCounts, selectedWorks] = await Promise.all([
    getSdgCounts(id),
    selectedSdg ? getSdgWorks(selectedSdg, id) : Promise.resolve([]),
  ]);

  const fNum = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n || 0);
  const maxCount = Math.max(...Object.values(sdgCounts), 1);
  const selectedSdgData = selectedSdg ? ALL_SDGS.find(s => s.id === selectedSdg) : null;

  const getOABadge = (work: any) => {
    if (!work.open_access?.is_oa) return null;
    const s = work.open_access.oa_status?.toLowerCase();
    const cls: Record<string, string> = {
      gold: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      hybrid: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${cls[s] || "bg-slate-100 text-slate-600 border-slate-200"}`}><Unlock className="size-2.5" /> {s}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SearchNav />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href={id === INST_ID ? "/" : `/?id=${id}`} className="hover:text-primary transition-colors">Institution</Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-600 font-medium">SDGs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Source Serif 4', serif" }}>UN Sustainable Development Goals</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            At the heart of the UN Agenda for Sustainable Development are the 17 SDGs. Click on a goal below to explore how Ashoka researchers are helping achieve it.
          </p>
        </div>

        {/* ── Sub Navigation Tabs ── */}
        <section className="border-b border-slate-200/80 mb-6">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { label: "Analytics Overview", href: id === INST_ID ? "/" : `/?id=${id}`, active: false },
              { label: "Research Insights", href: id === INST_ID ? "/publications" : `/publications?id=${id}`, active: false },
              { label: "Partnerships", href: id === INST_ID ? "/sdgs" : `/sdgs?id=${id}`, active: true },
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

        {/* SDG Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {ALL_SDGS.map((sdg) => {
            const count = sdgCounts[sdg.id] || 0;
            const pct = Math.round((count / maxCount) * 100);
            const isSelected = selectedSdg === sdg.id;

            return (
              <Link
                key={sdg.id}
                href={
                  isSelected
                    ? `/sdgs${id !== INST_ID ? `?id=${id}` : ""}`
                    : `/sdgs?sdg=${sdg.id}${id !== INST_ID ? `&id=${id}` : ""}`
                }
                className={`relative bg-white border rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col ${
                  isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-slate-200 hover:border-primary/40"
                }`}
              >
                {/* SDG image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/sdgs/sdg-${sdg.id}.png`}
                  alt={`SDG ${sdg.id}: ${sdg.name}`}
                  className="w-full aspect-square object-cover"
                />

                {/* Count bar */}
                <div className="px-2.5 pt-2 pb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-600 tabular-nums">{count} works</span>
                    {isSelected && <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Selected</span>}
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Selected SDG Works */}
        {selectedSdg && selectedSdgData && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/sdgs" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                <ArrowLeft className="size-3.5" /> Clear
              </Link>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/sdgs/sdg-${selectedSdg}.png`} alt="" className="size-10 rounded shadow-sm" />
                <div>
                  <h2 className="text-sm font-bold text-primary">SDG {selectedSdg}: {selectedSdgData.name}</h2>
                  <p className="text-xs text-slate-500">Showing top publications by citation impact</p>
                </div>
              </div>
            </div>

            {selectedWorks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-slate-400 text-sm">
                No publications found for this SDG.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {selectedWorks.map((work: any) => {
                  const workId = work.id?.split("/").pop();
                  const authors = work.authorships?.slice(0, 2).map((a: any) => a.author?.display_name).join(", ");
                  return (
                    <div key={work.id} className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 hover:border-primary/30 transition-all">
                      <Link href={`/works/${workId}`} className="text-sm font-semibold text-slate-800 hover:text-primary hover:underline line-clamp-2 transition-colors block leading-snug">
                        {work.title}
                      </Link>
                      {authors && (
                        <p className="text-xs text-slate-500 mt-1.5">{authors}{work.authorships?.length > 2 ? " et al." : ""}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-600">{work.publication_year}</span>
                        <span className="text-primary font-bold tabular-nums">{fNum(work.cited_by_count)} cit.</span>
                        {getOABadge(work)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!selectedSdg && (
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 text-center text-sm text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Select an SDG above</p>
            <p>Click on any goal tile to explore aligned research outputs from Ashoka University.</p>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 py-4 text-center text-[10px] text-slate-400">
        Data from <a href="https://openalex.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenAlex</a> · CC0 Open Data
      </footer>
    </div>
  );
}
