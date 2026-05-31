import { SearchNav } from "@/components/dashboard/SearchNav";
import { OPENALEX_API_BASE } from "@/lib/api";
import Link from "next/link";
import { Users, ChevronRight, TrendingUp, Quote, Award, ExternalLink } from "lucide-react";

const INST_ID = "I347237974";

async function getFacultyList(page = 1) {
  const res = await fetch(
    `${OPENALEX_API_BASE}/authors?filter=last_known_institutions.id:${INST_ID}&sort=cited_by_count:desc&per-page=50&page=${page}&mailto=test@example.com`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return { results: [], meta: { count: 0 } };
  return res.json();
}

export default async function FacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const data = await getFacultyList(page);

  const fNum = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n || 0);
  const totalPages = Math.ceil((data.meta?.count || 0) / 50);

  const buildUrl = (p: number) => `/faculty?page=${p}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SearchNav />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Institution</Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-600 font-medium">Faculty</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Faculty Scholars</h1>
          <p className="text-sm text-slate-500 mt-1">
            <strong className="text-slate-700">{(data.meta?.count || 0).toLocaleString()}</strong> researchers currently or recently affiliated with Ashoka University, ranked by citation impact.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results?.map((author: any, i: number) => {
            const authorId = author.id?.split("/").pop();
            const orcid = author.ids?.orcid;
            const hIndex = author.summary_stats?.h_index ?? 0;
            const i10 = author.summary_stats?.i10_index ?? 0;
            const initials = author.display_name
              ?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "?";
            const topTopics = author.topics?.slice(0, 3) || [];
            const affiliation = author.last_known_institutions?.[0];

            return (
              <Link
                key={author.id}
                href={`/faculty/${authorId}`}
                className="bg-white border border-slate-200 rounded-sm shadow-sm hover:border-primary/40 hover:shadow-md transition-all group block"
              >
                <div className="p-5">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="size-11 rounded-sm flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: "#0d3862" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {author.display_name}
                      </p>
                      {affiliation && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{affiliation.display_name}</p>
                      )}
                    </div>
                  </div>

                  {/* KPI mini strip */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Works", value: fNum(author.works_count) },
                      { label: "Citations", value: fNum(author.cited_by_count) },
                      { label: "h-index", value: hIndex },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-50 rounded px-2 py-1.5 text-center">
                        <div className="text-xs font-bold text-primary tabular-nums">{stat.value}</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Topics */}
                  {topTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topTopics.map((t: any) => (
                        <span
                          key={t.id}
                          className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/8 text-primary/80 border border-primary/15 truncate max-w-[120px]"
                          title={t.display_name}
                          style={{ backgroundColor: "rgba(13,56,98,0.06)", color: "rgba(13,56,98,0.75)", borderColor: "rgba(13,56,98,0.15)" }}
                        >
                          {t.display_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-sm">
                  <span className="text-[10px] text-slate-400 font-medium">View Profile →</span>
                  {orcid && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(166,206,57,0.15)", color: "#5b7f1b" }}>
                      ORCID
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {page > 1 && (
              <Link href={buildUrl(page - 1)} className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:border-primary/50 hover:text-primary transition-colors">
                ← Previous
              </Link>
            )}
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={buildUrl(page + 1)} className="px-4 py-2 text-xs font-semibold border border-primary/30 rounded bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                Next →
              </Link>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 py-4 text-center text-[10px] text-slate-400">
        Data from <a href="https://openalex.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenAlex</a> · CC0 Open Data
      </footer>
    </div>
  );
}
