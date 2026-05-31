import { getAuthorData } from "@/lib/api";
import { SearchNav } from "@/components/dashboard/SearchNav";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Quote, TrendingUp, Award, Globe,
  ExternalLink, BarChart2, Unlock, User, Calendar, Building2
} from "lucide-react";
import { CountsYearChart } from "@/components/dashboard/CountsYearChart";

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { author, works } = await getAuthorData(id);

  if (!author) notFound();

  // --- Helpers ---
  const fNum = (num: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num || 0);

  const getCountryName = (code: string | undefined) => {
    if (!code) return null;
    try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch { return code; }
  };

  const getOABadgeClass = (status: string) => {
    const map: Record<string, string> = {
      gold: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      hybrid: "bg-blue-50 text-blue-700 border-blue-200",
      bronze: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return map[status?.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const constructAbstract = (indexObj: any) => {
    if (!indexObj) return null;
    try {
      const arr: string[] = [];
      Object.keys(indexObj).forEach((word) => {
        indexObj[word].forEach((pos: number) => { arr[pos] = word; });
      });
      return arr.join(" ");
    } catch { return null; }
  };

  // --- Derived data ---
  const hIndex = author.summary_stats?.h_index ?? 0;
  const i10Index = author.summary_stats?.i10_index ?? 0;
  const twoYrCitedness = author.summary_stats?.["2yr_mean_citedness"];
  const orcid = author.ids?.orcid;
  const countsByYear = author.counts_by_year
    ?.filter((y: any) => y.year >= 2005)
    .sort((a: any, b: any) => a.year - b.year) || [];

  // Topic distribution
  const topTopics = author.topics?.slice(0, 8) || [];
  const maxTopicCount = topTopics[0]?.count || 1;

  // Affiliations (reverse chronological)
  const affiliations = author.affiliations
    ?.sort((a: any, b: any) => (b.years?.[0] || 0) - (a.years?.[0] || 0))
    .slice(0, 5) || [];

  const currentAffiliation = author.last_known_institutions?.[0];

  // Initials avatar
  const initials = author.display_name
    ?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "?";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SearchNav />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-6xl space-y-8">

        {/* ── Back navigation ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Institution Profile
        </Link>

        {/* ── Author Header ── */}
        <section className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          {/* Ashoka-blue top bar */}
          <div className="h-1.5 bg-primary w-full" />
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">

              {/* Avatar */}
              <div className="size-20 md:size-24 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm">
                {initials}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary/70 mb-1">
                    Faculty Research Profile
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                    {author.display_name}
                  </h1>
                  {currentAffiliation && (
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-slate-400 shrink-0" />
                      {currentAffiliation.display_name}
                      {currentAffiliation.country_code && (
                        <span className="text-slate-400">· {getCountryName(currentAffiliation.country_code)}</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {orcid && (
                    <a
                      href={orcid}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#a6ce39]/10 text-[#5b7f1b] border border-[#a6ce39]/40 hover:bg-[#a6ce39]/20 transition-colors"
                    >
                      <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947-.947-.431-.947-.947.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.925-1.822 3.925-3.722 0-1.9-1.566-3.722-3.925-3.722h-2.297z" /></svg>
                      ORCID
                    </a>
                  )}
                  {author.ids?.wikipedia && (
                    <a
                      href={author.ids.wikipedia}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      <Globe className="size-3" /> Wikipedia
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── KPI Cards ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Research Impact Metrics</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Publications", value: fNum(author.works_count), icon: BookOpen, sub: "indexed works" },
              { label: "Citations", value: fNum(author.cited_by_count), icon: Quote, sub: "total times cited" },
              { label: "h-Index", value: hIndex, icon: TrendingUp, sub: "Hirsch index" },
              { label: "i10-Index", value: fNum(i10Index), icon: Award, sub: "≥10 citations" },
              { label: "2yr Citedness", value: twoYrCitedness?.toFixed(2) || "—", icon: BarChart2, sub: "mean citations/work" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">{stat.label}</span>
                  <stat.icon className="size-3.5 text-slate-300" />
                </div>
                <div className="text-2xl font-bold text-primary stat-number">{stat.value}</div>
                <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Citation Trend Chart ── */}
        {countsByYear.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Output & Impact Trend</h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <CountsYearChart data={countsByYear} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Research Themes ── */}
          {topTopics.length > 0 && (
            <section className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Research Themes</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 space-y-4">
                {topTopics.map((topic: any, i: number) => {
                  const pct = Math.round((topic.count / maxTopicCount) * 100);
                  return (
                    <div key={topic.id}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-700 leading-snug" title={topic.display_name}>
                          {topic.display_name}
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{topic.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%`, opacity: 0.6 + (i === 0 ? 0.4 : 0) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Affiliations ── */}
          {affiliations.length > 0 && (
            <section className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Affiliations</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-100">
                {affiliations.map((aff: any, i: number) => (
                  <div key={aff.institution?.id || i} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors">
                    <div className="size-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="size-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{aff.institution?.display_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">
                        {aff.institution?.type || "Institution"}
                        {aff.institution?.country_code && ` · ${getCountryName(aff.institution.country_code)}`}
                      </p>
                    </div>
                    {aff.years?.length > 0 && (
                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-slate-700 tabular-nums">
                          {Math.min(...aff.years)} – {Math.max(...aff.years)}
                        </div>
                        <div className="text-[10px] text-slate-400">{aff.years.length} year{aff.years.length !== 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Publications ── */}
        {works?.results?.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Publications</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400">{works.meta?.count?.toLocaleString()} total · showing top {works.results.length} by citations</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-100">
              {works.results.map((work: any) => {
                const abstract = constructAbstract(work.abstract_inverted_index);
                const openAlexId = work.id?.split('/').pop();
                const oaStatus = work.open_access?.oa_status;
                return (
                  <div key={work.id} className="px-5 py-4 hover:bg-slate-50/80 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/works/${openAlexId}`}
                          className="text-sm font-semibold text-slate-800 hover:text-primary hover:underline leading-snug line-clamp-2 transition-colors"
                        >
                          {work.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700">{work.publication_year}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="truncate max-w-[200px] font-medium" title={work.primary_location?.source?.display_name}>
                            {work.primary_location?.source?.display_name || "Unknown Venue"}
                          </span>
                          {work.type && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="capitalize">{work.type.replace("-", " ")}</span>
                            </>
                          )}
                        </div>
                        {abstract && (
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">{abstract}</p>
                        )}
                        {oaStatus && work.open_access?.is_oa && (
                          <span className={`mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border ${getOABadgeClass(oaStatus)}`}>
                            <Unlock className="size-2.5" /> {oaStatus} OA
                          </span>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[52px]">
                          <div className="text-sm font-bold text-primary tabular-nums leading-none">{fNum(work.cited_by_count)}</div>
                          <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Cited</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
