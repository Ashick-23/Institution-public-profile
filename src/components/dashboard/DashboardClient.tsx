"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, BookOpen, Quote, Users, MapPin, ExternalLink,
  Calendar, TrendingUp, Globe, Unlock, Award, FileText,
  BarChart2, Link2, Loader2, ArrowUpDown, ChevronRight
} from "lucide-react";
import { TopicsBarChart, WorksTypeChart } from "@/components/dashboard/Charts";
import { CountsYearChart } from "@/components/dashboard/CountsYearChart";
import { PublicationsTable } from "@/components/dashboard/PublicationsTable";
import { SDGGrid } from "@/components/dashboard/SDGGrid";
import { InstitutionLogo } from "@/components/dashboard/InstitutionLogo";

interface DashboardClientProps {
  id: string;
  openAlexData: any;
  growthRate: string | null;
  countsByYearData: any[];
  topicsData: any[];
  worksTypeData: any[];
  topSourcesList: any[];
  topResearchers: any;
  recentWorks: any;
  partnerCountries: any[];
  sdgs: any[];
  logo: string | null;
  domain: string | null;
  institutionName: string;
  description: string;
  foundingYear: number | null;
  worksCount: number;
  citedCount: number;
  hIndex: number;
  i10Index: number;
  twoYrMeanCitedness: number | undefined;
  oaRatio: number;
  oaData: any[];
  totalOA: number;
}

export function DashboardClient({
  id,
  openAlexData,
  growthRate,
  countsByYearData,
  topicsData,
  worksTypeData,
  topSourcesList,
  topResearchers,
  recentWorks,
  partnerCountries,
  sdgs,
  logo,
  domain,
  institutionName,
  description,
  foundingYear,
  worksCount,
  citedCount,
  hIndex,
  i10Index,
  twoYrMeanCitedness,
  oaRatio,
  oaData,
  totalOA,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "insights" | "partnerships" | "faculty" | "publications">("analytics");
  const [insightsView, setInsightsView] = useState<"overview" | "faculty" | "publications">("overview");

  // --- Faculty list client-side state ---
  const [facultyData, setFacultyData] = useState<any>(null);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyPage, setFacultyPage] = useState(1);

  // --- Publications list client-side state ---
  const [publicationsData, setPublicationsData] = useState<any>(null);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [publicationsPage, setPublicationsPage] = useState(1);
  const [pubType, setPubType] = useState("");
  const [pubOA, setPubOA] = useState("");
  const [workTypes, setWorkTypes] = useState<any[]>([]);

  const getCountryName = (code: string | undefined) => {
    if (!code) return "Unknown";
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
  };
  const fNum = (num: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num || 0);

  // Fetch Faculty List
  useEffect(() => {
    if (activeTab !== "insights" || insightsView !== "faculty") return;

    async function fetchFaculty() {
      setFacultyLoading(true);
      try {
        const res = await fetch(
          `https://api.openalex.org/authors?filter=last_known_institutions.id:${id}&sort=cited_by_count:desc&per-page=32&page=${facultyPage}&mailto=test@example.com`
        );
        if (res.ok) {
          const data = await res.json();
          setFacultyData(data);
        }
      } catch (err) {
        console.error("Failed to fetch faculty:", err);
      } finally {
        setFacultyLoading(false);
      }
    }

    fetchFaculty();
  }, [activeTab, insightsView, facultyPage, id]);

  // Fetch Publications List
  useEffect(() => {
    if (activeTab !== "insights" || insightsView !== "publications") return;

    async function fetchPublications() {
      setPublicationsLoading(true);
      try {
        const filters = [`institutions.id:${id}`];
        if (pubType) filters.push(`type:${pubType}`);
        if (pubOA === "true") filters.push("open_access.is_oa:true");

        const url = `https://api.openalex.org/works?filter=${filters.join(",")}&sort=cited_by_count:desc&per-page=20&page=${publicationsPage}&mailto=test@example.com`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPublicationsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch publications:", err);
      } finally {
        setPublicationsLoading(false);
      }
    }

    fetchPublications();
  }, [activeTab, insightsView, publicationsPage, pubType, pubOA, id]);

  // Fetch Work Types for filter dropdown once
  useEffect(() => {
    if (activeTab !== "insights" || insightsView !== "publications" || workTypes.length > 0) return;

    async function fetchWorkTypes() {
      try {
        const res = await fetch(`https://api.openalex.org/works?filter=institutions.id:${id}&group_by=type&mailto=test@example.com`);
        if (res.ok) {
          const data = await res.json();
          setWorkTypes(data.group_by || []);
        }
      } catch (err) {
        console.error("Failed to fetch work types:", err);
      }
    }

    fetchWorkTypes();
  }, [activeTab, insightsView, id, workTypes.length]);

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

  return (
    <div className="space-y-8">
      {/* ── Premium Institution Header ── */}
      <section className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo or SVG Crest Fallback */}
          <div className="size-20 md:size-24 flex-shrink-0 bg-white border border-slate-200 rounded shadow-sm p-2.5 flex items-center justify-center">
            <InstitutionLogo
              src={logo}
              domain={domain}
              alt={institutionName}
              fallback={
                <svg viewBox="0 0 100 100" className="size-12 text-slate-300" style={{ display: 'block', height: '100%' }}>
                  <path d="M50,10 C70,10 85,20 85,45 C85,70 65,85 50,90 C35,85 15,70 15,45 C15,20 30,10 50,10 Z" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  <path d="M50,15 L50,85 M20,45 L80,45" stroke="currentColor" strokeWidth="2" opacity="0.3"></path>
                  <polygon points="50,25 60,40 40,40" fill="currentColor"></polygon>
                  <circle cx="50" cy="65" r="10" fill="none" stroke="currentColor" strokeWidth="3"></circle>
                </svg>
              }
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">Institution Research Profile</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                {institutionName}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">{description}</p>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border-slate-200">
                <MapPin className="size-3 text-slate-400" />
                {openAlexData.geo?.city && `${openAlexData.geo.city}, `}
                {openAlexData.geo?.region && `${openAlexData.geo.region}, `}
                {getCountryName(openAlexData.geo?.country_code)}
              </span>
              {foundingYear && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border-slate-200">
                  <Calendar className="size-3 text-slate-400" /> Est. {foundingYear}
                </span>
              )}
              {openAlexData.type && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border-slate-200 capitalize">
                  <Building2 className="size-3 text-slate-400" /> {openAlexData.type}
                </span>
              )}
            </div>

            {/* External links */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {openAlexData.homepage_url && (
                <a href={openAlexData.homepage_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
                  <Globe className="size-3" /> Official Website
                </a>
              )}
              {openAlexData.ids?.ror && (
                <a href={openAlexData.ids.ror} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
                  <Link2 className="size-3" /> ROR Registry
                </a>
              )}
              {openAlexData.ids?.wikipedia && (
                <a href={openAlexData.ids.wikipedia} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
                  <ExternalLink className="size-3" /> Wikipedia
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Metrics ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Core Research Metrics</h2>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Publications", value: fNum(worksCount), icon: BookOpen, sub: "total indexed works" },
            { label: "Citations", value: fNum(citedCount), icon: Quote, sub: "total times cited" },
            { label: "h-Index", value: hIndex, icon: TrendingUp, sub: "Hirsch index" },
            { label: "i10-Index", value: fNum(i10Index), icon: Award, sub: "≥10 citations" },
            { label: "2yr Citedness", value: twoYrMeanCitedness?.toFixed(1) || "0", icon: BarChart2, sub: "mean citations" },
            { label: "Open Access", value: `${oaRatio}%`, icon: Unlock, sub: "of recent works" },
            { label: "Int'l Partners", value: partnerCountries.length, icon: Globe, sub: "collaborating countries" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">{stat.label}</span>
                <stat.icon className="size-3.5 text-slate-300" />
              </div>
              <div className="text-2xl font-bold text-slate-800 stat-number">{stat.value}</div>
              <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sub Navigation Tabs ── */}
      <section className="border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pb-0.5">
          {[
            { id: "analytics", label: "Analytics Overview" },
            { id: "insights", label: "Research Insights" },
            { id: "partnerships", label: "Partnerships" },
          ].map((tab) => (
            <div key={tab.id} className="flex items-center gap-3.5 pb-3 -mb-px">
              <button
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "insights") {
                    setInsightsView("overview");
                  }
                }}
                className={`text-sm font-bold tracking-tight transition-all duration-200 border-b-2 cursor-pointer pb-0.5 -mb-[14px] ${
                  (tab.id === "insights" && activeTab === "insights" && insightsView === "overview") ||
                  (tab.id === "analytics" && activeTab === "analytics") ||
                  (tab.id === "partnerships" && activeTab === "partnerships")
                    ? "text-slate-900 border-primary"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>

              {tab.id === "insights" && (
                <div className="flex items-center gap-3 pl-3.5 border-l border-slate-200 text-xs translate-y-[2px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("insights");
                      setInsightsView("faculty");
                      setFacultyPage(1);
                    }}
                    className={`text-sm font-bold tracking-tight transition-all duration-200 border-b-2 cursor-pointer pb-0.5 -mb-[14px] ${
                      activeTab === "insights" && insightsView === "faculty"
                        ? "text-slate-900 border-primary"
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    All Faculty
                  </button>
                  <span className="text-slate-300 font-light">•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("insights");
                      setInsightsView("publications");
                      setPublicationsPage(1);
                      setPubType("");
                      setPubOA("");
                    }}
                    className={`text-sm font-bold tracking-tight transition-all duration-200 border-b-2 cursor-pointer pb-0.5 -mb-[14px] ${
                      activeTab === "insights" && insightsView === "publications"
                        ? "text-slate-900 border-primary"
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    All Publications
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Dynamic Tab Content ── */}
      <div className="space-y-8">
        {activeTab === "analytics" && (
          <>
            {/* ── Output Analysis ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Output Analysis</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <CountsYearChart data={countsByYearData} />
                <TopicsBarChart data={topicsData} />
              </div>
            </section>

            {/* ── Annual Stats Table ── */}
            {countsByYearData.length > 0 && (
              <section className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Annual Output Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-2.5 font-semibold">Year</th>
                          <th className="px-5 py-2.5 font-semibold text-right">Publications</th>
                          <th className="px-5 py-2.5 font-semibold text-right">Citations</th>
                          <th className="px-5 py-2.5 font-semibold text-right">OA Works</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...countsByYearData].reverse().slice(0, 10).map((row: any) => (
                          <tr key={row.year} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-2 font-medium text-slate-800">{row.year}</td>
                            <td className="px-5 py-2 text-right tabular-nums">{row.works_count.toLocaleString()}</td>
                            <td className="px-5 py-2 text-right tabular-nums">{row.cited_by_count.toLocaleString()}</td>
                            <td className="px-5 py-2 text-right tabular-nums">{row.oa_works_count.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* ── Works Type + OA Breakdown ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Publication Profile</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <WorksTypeChart data={worksTypeData} />

                {/* Open Access breakdown */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                  <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Open Access Status</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Distribution of OA categories across all works</p>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {oaData.length > 0 ? oaData.slice(0, 6).map((item: any, i: number) => {
                      const pct = totalOA > 0 ? Math.round((item.count / totalOA) * 100) : 0;
                      const oaColors: Record<string, string> = {
                        gold: '#d97706', green: '#15803d', hybrid: '#1d4ed8', bronze: '#92400e',
                        closed: '#64748b', diamond: '#7c3aed'
                      };
                      const col = oaColors[item.status?.toLowerCase()] || '#64748b';
                      return (
                        <div key={item.status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs capitalize text-slate-600 font-medium flex items-center gap-2">
                              <span className="size-2 rounded-full inline-block" style={{ backgroundColor: col }} />
                              {item.status || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-500 tabular-nums">{item.count.toLocaleString()} <span className="text-slate-400">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: col }} />
                          </div>
                        </div>
                      );
                    }) : <p className="text-xs text-slate-400 py-4 text-center">No open access data available.</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Top Publication Venues ── */}
            {topSourcesList.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Top Publication Venues</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400">Source: OpenAlex</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                  <div className="px-5 pt-4 pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Journals, repositories, and venues with the most works from this institution</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {topSourcesList.map((source: any, i: number) => {
                      const maxCount = topSourcesList[0]?.count || 1;
                      const pct = Math.round((source.count / maxCount) * 100);
                      return (
                        <div key={source.name} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                          <span className="text-[10px] text-slate-400 w-4 tabular-nums font-medium">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{source.name}</p>
                            <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden w-full max-w-[240px]">
                              <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums shrink-0">{source.count.toLocaleString()} works</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === "insights" && (
          <>
            {/* ── SUB-VIEW OVERVIEW ── */}
            {insightsView === "overview" && (
              <>
                {/* ── People & Publications ── */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">People & Publications</h2>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top Researchers */}
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
                      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Most-Cited Authors</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Top 15 by citations</p>
                        </div>
                        <Users className="size-4 text-slate-400" />
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                        {topResearchers?.results?.map((author: any, i: number) => {
                          const authorId = author.id?.split('/').pop();
                          return (
                            <div key={author.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/80 transition-colors">
                              <span className="text-xs text-slate-400 w-4 tabular-nums font-semibold shrink-0 mt-0.5">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <Link href={`/faculty/${authorId}${id !== "I347237974" ? `?id=${id}` : ""}`}
                                  className="text-sm font-semibold text-slate-800 hover:text-primary hover:underline transition-colors">
                                  {author.display_name}
                                </Link>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {author.topics?.slice(0, 3).map((t: any) => (
                                    <span key={t.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 truncate max-w-[140px]" title={t.display_name}>
                                      {t.display_name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-center min-w-[50px]">
                                  <div className="text-sm font-bold text-slate-700 tabular-nums leading-none">{fNum(author.cited_by_count)}</div>
                                  <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Cit.</div>
                                </div>
                                <div className="text-[9px] font-semibold text-slate-500">h-index: <span className="text-slate-700">{author.summary_stats?.h_index}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* High-Impact Works */}
                    <PublicationsTable works={recentWorks?.results || []} />
                  </div>
                </section>

                {/* ── Associated Institutions ── */}
                {openAlexData.associated_institutions?.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Associated Institutions</h2>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-100">
                      {openAlexData.associated_institutions
                        .filter((inst: any) => inst.relationship === 'child' || inst.relationship === 'related')
                        .map((inst: any) => (
                          <div key={inst.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                            <div className="size-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Building2 className="size-3.5 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{inst.display_name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{inst.type} · {inst.relationship} · {getCountryName(inst.country_code)}</p>
                            </div>
                            {inst.ror && (
                              <a href={inst.ror} target="_blank" rel="noreferrer"
                                className="shrink-0 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                <ExternalLink className="size-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── SUB-VIEW DYNAMIC FACULTY GRID ── */}
            {insightsView === "faculty" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Faculty Scholars</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {facultyData?.meta?.count ? (
                      <>Currently showing <strong className="text-slate-700">{facultyData.meta.count.toLocaleString()}</strong> researchers affiliated with the institution, ranked by citation impact.</>
                    ) : (
                      <>Affiliated researchers ranked by scholarly citation impact.</>
                    )}
                  </p>
                </div>

                {facultyLoading ? (
                  <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded shadow-sm">
                    <Loader2 className="size-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {facultyData?.results?.map((author: any) => {
                        const authorId = author.id?.split("/").pop();
                        const orcid = author.ids?.orcid;
                        const authorHIndex = author.summary_stats?.h_index ?? 0;
                        const initials = author.display_name
                          ?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "?";
                        const topTopics = author.topics?.slice(0, 3) || [];
                        const affiliation = author.last_known_institutions?.[0];

                        return (
                          <div
                            key={author.id}
                            className="bg-white border border-slate-200 rounded-sm shadow-sm hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
                          >
                            <div className="p-5">
                              {/* Avatar + name */}
                              <div className="flex items-start gap-3 mb-4">
                                <div
                                  className="size-10 rounded-sm flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
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
                                  { label: "h-index", value: authorHIndex },
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
                              <Link
                                href={`/faculty/${authorId}`}
                                className="text-[10px] text-slate-400 hover:text-primary font-semibold transition-colors"
                              >
                                View Profile →
                              </Link>
                              {orcid && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(166,206,57,0.15)", color: "#5b7f1b" }}>
                                  ORCID
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {facultyData?.meta && Math.ceil(facultyData.meta.count / 32) > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-6">
                        {facultyPage > 1 && (
                          <button
                            onClick={() => setFacultyPage(prev => Math.max(1, prev - 1))}
                            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
                          >
                            ← Previous
                          </button>
                        )}
                        <span className="text-xs text-slate-400">
                          Page {facultyPage} of {Math.ceil(facultyData.meta.count / 32)}
                        </span>
                        {facultyPage < Math.ceil(facultyData.meta.count / 32) && (
                          <button
                            onClick={() => setFacultyPage(prev => prev + 1)}
                            className="px-4 py-2 text-xs font-semibold border border-primary/30 rounded bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* ── SUB-VIEW DYNAMIC PUBLICATIONS DISCOVER SCREEN ── */}
            {insightsView === "publications" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Discover Publications</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {publicationsData?.meta?.count ? (
                      <>Currently showing <strong className="text-slate-700">{publicationsData.meta.count.toLocaleString()}</strong> scholarly works from this institution, sorted by citation impact.</>
                    ) : (
                      <>Scholarly outputs indexed and sorted by global impact.</>
                    )}
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Filters Sidebar */}
                  <aside className="w-full lg:w-56 shrink-0 space-y-5">
                    {/* Document Type */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Type</h3>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                          onClick={() => { setPubType(""); setPublicationsPage(1); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition-colors hover:bg-slate-50 ${!pubType ? "text-primary font-bold" : "text-slate-600"}`}
                        >
                          <span>All Types</span>
                          {!pubType && <div className="size-1.5 rounded-full bg-primary" />}
                        </button>
                        {workTypes.map((t: any) => {
                          const key = t.key.split("/").pop() || t.key;
                          return (
                            <button
                              key={key}
                              onClick={() => { setPubType(key); setPublicationsPage(1); }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition-colors hover:bg-slate-50 ${pubType === key ? "text-primary font-bold" : "text-slate-600"}`}
                            >
                              <span className="capitalize">{t.key_display_name || key}</span>
                              <span className="text-[10px] text-slate-400 tabular-nums">{fNum(t.count)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Open Access filter */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Open Access</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <button
                          onClick={() => { setPubOA(""); setPublicationsPage(1); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer hover:bg-slate-50 transition-colors ${!pubOA ? "text-primary font-bold" : "text-slate-600"}`}
                        >
                          <span>All Works</span>
                          {!pubOA && <div className="size-1.5 rounded-full bg-primary" />}
                        </button>
                        <button
                          onClick={() => { setPubOA("true"); setPublicationsPage(1); }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left cursor-pointer hover:bg-slate-50 transition-colors ${pubOA === "true" ? "text-emerald-700 font-bold" : "text-slate-600"}`}
                        >
                          <Unlock className="size-3 text-emerald-600" /> Open Access Only
                        </button>
                      </div>
                    </div>
                  </aside>

                  {/* Publications Grid */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {publicationsLoading ? (
                      <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded shadow-sm">
                        <Loader2 className="size-8 text-primary animate-spin" />
                      </div>
                    ) : (
                      <>
                        {publicationsData?.results?.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded p-10 text-center">
                            <FileText className="size-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-600">No results found</p>
                            <p className="text-xs text-slate-400 mt-1">Try resetting filters to discover more works.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {publicationsData?.results?.map((work: any, i: number) => {
                              const workId = work.id?.split("/").pop();
                              const abstract = constructAbstract(work.abstract_inverted_index);
                              const authors = work.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).join(", ");
                              const hasMore = (work.authorships?.length || 0) > 3;

                              return (
                                <div key={work.id} className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all">
                                  <div className="flex items-start gap-4">
                                    <span className="text-[11px] text-slate-300 tabular-nums font-bold shrink-0 mt-0.5 w-6 text-right">
                                      {(publicationsPage - 1) * 20 + i + 1}
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
                        )}

                        {/* Pagination */}
                        {publicationsData?.meta && Math.ceil(publicationsData.meta.count / 20) > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <span className="text-xs text-slate-400">
                              Page {publicationsPage} of {Math.ceil(publicationsData.meta.count / 20).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              {publicationsPage > 1 && (
                                <button
                                  onClick={() => setPublicationsPage(prev => Math.max(1, prev - 1))}
                                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
                                >
                                  ← Previous
                                </button>
                              )}
                              {publicationsPage < Math.ceil(publicationsData.meta.count / 20) && (
                                <button
                                  onClick={() => setPublicationsPage(prev => prev + 1)}
                                  className="px-3 py-1.5 text-xs font-semibold border border-primary/30 rounded bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                                >
                                  Next →
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === "partnerships" && (
          <>
            {/* ── International Collaborations ── */}
            {partnerCountries.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">International Collaborations</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400">Source: OpenAlex co-authorships</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                  <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Countries with co-authored publications, ranked by volume</p>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{partnerCountries.length} countries</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {partnerCountries.map((country: any, i: number) => {
                      const maxCount = partnerCountries[0]?.count || 1;
                      const pct = Math.round((country.count / maxCount) * 100);
                      return (
                        <div key={country.code} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors group">
                          <span className="text-[10px] text-slate-400 w-5 tabular-nums font-medium shrink-0">{i + 1}</span>
                          <span className="text-xs font-medium text-slate-700 w-36 shrink-0 truncate group-hover:text-slate-900 transition-colors flex items-center gap-2">
                            <span className="text-sm leading-none">{country.code && country.code.length === 2 ? String.fromCodePoint(...[...country.code.toUpperCase()].map(c => 127397 + c.charCodeAt(0))) : ''}</span>
                            {country.name}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 tabular-nums font-semibold shrink-0 w-16 text-right">
                            {country.count.toLocaleString()}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">works</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ── SDG Impact ── */}
            <SDGGrid sdgs={sdgs} />
          </>
        )}
      </div>
    </div>
  );
}
