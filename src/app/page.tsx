import { getInstitutionData } from "@/lib/api";
import { SearchNav } from "@/components/dashboard/SearchNav";
import { GrowthChart, TopicsBarChart, WorksTypeChart } from "@/components/dashboard/Charts";
import {
  Building2, BookOpen, Quote, Users, MapPin, ExternalLink,
  Calendar, TrendingUp, Globe, Unlock, Award, FileText,
  BarChart2, Link2, FlaskConical
} from "lucide-react";
import { InstitutionLogo } from "@/components/dashboard/InstitutionLogo";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const id = typeof params?.id === 'string' ? params.id : "I347237974"; // Default: Ashoka University

  const data = await getInstitutionData(id);
  const { openAlexData, worksGrowth, topResearchers, recentWorks, topSources, worksByType, collaboratingCountries, oaBreakdown, rorData, wikidata } = data;

  // --- Helpers ---
  const getCountryName = (code: string | undefined) => {
    if (!code) return "Unknown";
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
  };
  const fNum = (num: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num || 0);

  // --- Growth data ---
  const growthData = worksGrowth?.group_by?.map((g: any) => ({ year: g.key, count: g.count }))
    .sort((a: any, b: any) => a.year.localeCompare(b.year))
    .filter((g: any) => parseInt(g.year) >= 2000) || [];

  // --- Topics data ---
  const topicsData = openAlexData?.topics?.slice(0, 7).map((c: any) => ({ name: c.display_name, value: c.count })) || [];

  // --- Works by type ---
  const worksTypeData = worksByType?.group_by?.map((g: any) => ({ name: g.key_display_name, value: g.count }))
    .sort((a: any, b: any) => b.value - a.value) || [];

  // --- Top sources/journals ---
  const topSourcesList = topSources?.group_by?.slice(0, 8).map((s: any) => ({ name: s.key_display_name, count: s.count })) || [];

  // --- Collaborating countries ---
  // OpenAlex: c.key = full URL "https://openalex.org/countries/IN"
  //            c.key_display_name = human name e.g. "India"
  const hostCountry = openAlexData.geo?.country_code?.toUpperCase();
  const partnerCountries = collaboratingCountries?.group_by
    ?.map((c: any) => {
      const code = (c.key || '').split('/').pop()?.toUpperCase() || '';
      const name = c.key_display_name || getCountryName(code);
      return { code, name, count: c.count };
    })
    .filter((c: any) => c.code !== hostCountry && c.code !== '')
    .slice(0, 10) || [];

  // --- OA breakdown ---
  const oaData = oaBreakdown?.group_by?.map((g: any) => ({ status: g.key_display_name, count: g.count })) || [];

  // --- Logo ---
  // 1. Wikidata P154 (official logo)
  // 2. Clearbit Logo API (based on homepage domain)
  // 3. Fallback to SVG Crest
  let logo = wikidata?.claims?.P154?.[0]?.mainsnak?.datavalue?.value
    ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(wikidata.claims.P154[0].mainsnak.datavalue.value)}&width=300`
    : null;

  let domain = null;
  if (openAlexData.homepage_url) {
    try {
      domain = new URL(openAlexData.homepage_url).hostname;
      if (!logo) logo = `https://logo.clearbit.com/${domain}`;
    } catch (e) {
      // ignore invalid URLs
    }
  }

  const institutionName = rorData?.name || openAlexData.display_name;
  const description = wikidata?.descriptions?.en?.value ||
    (openAlexData.type
      ? `${openAlexData.display_name} is a ${openAlexData.type} research institution located in ${openAlexData.geo?.city ? openAlexData.geo.city + ', ' : ''}${getCountryName(openAlexData.geo?.country_code)}.`
      : `${openAlexData.display_name} is a research institution with an active scholarly research program.`);
  const foundingYear = rorData?.established || openAlexData.summary_stats?.established_year;

  // --- Key metrics ---
  const worksCount = openAlexData.works_count ?? 0;
  const citedCount = openAlexData.cited_by_count ?? 0;
  const hIndex = openAlexData.summary_stats?.h_index ?? 0;
  const i10Index = openAlexData.summary_stats?.i10_index ?? 0;
  const twoYrMeanCitedness = openAlexData.summary_stats?.["2yr_mean_citedness"];

  // --- Growth insight ---
  const lastYr = growthData.length >= 2 ? growthData[growthData.length - 2].count : 0;
  const currYr = growthData.length >= 1 ? growthData[growthData.length - 1].count : 0;
  const growthRate = lastYr > 0 ? (((currYr - lastYr) / lastYr) * 100).toFixed(1) : null;

  // --- OA ratio ---
  const totalOA = oaData.reduce((s: number, d: any) => s + d.count, 0);
  const goldOA = oaData.find((d: any) => d.status === 'gold')?.count || 0;
  const openOA = oaData.filter((d: any) => ['gold', 'green', 'hybrid', 'bronze'].includes(d.status?.toLowerCase())).reduce((s: number, d: any) => s + d.count, 0);
  const oaRatio = totalOA > 0 ? Math.round((openOA / totalOA) * 100) : 0;

  // --- SDGs ---
  const sdgAgg: { [key: string]: { count: number; name: string } } = {};
  recentWorks?.results?.forEach((w: any) => {
    w.sustainable_development_goals?.forEach((sdg: any) => {
      const goalId = sdg.id.split("/").pop();
      if (goalId) {
        const name = sdg.display_name.replace(/^Goal \d+:\s*/, "");
        if (!sdgAgg[goalId]) sdgAgg[goalId] = { count: 0, name };
        sdgAgg[goalId].count += 1;
      }
    });
  });
  const sdgs = Object.entries(sdgAgg)
    .map(([id, val]) => ({ id: parseInt(id), count: val.count, name: val.name }))
    .sort((a, b) => b.count - a.count || a.id - b.id)
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SearchNav />

      {/* Page */}
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl space-y-8">

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
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  {institutionName}
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">{description}</p>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  <MapPin className="size-3 text-slate-400" />
                  {openAlexData.geo?.city && `${openAlexData.geo.city}, `}
                  {openAlexData.geo?.region && `${openAlexData.geo.region}, `}
                  {getCountryName(openAlexData.geo?.country_code)}
                </span>
                {foundingYear && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    <Calendar className="size-3 text-slate-400" /> Est. {foundingYear}
                  </span>
                )}
                {openAlexData.type && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                    <Building2 className="size-3 text-slate-400" /> {openAlexData.type}
                  </span>
                )}
              </div>

              {/* External links */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {openAlexData.homepage_url && (
                  <a href={openAlexData.homepage_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
                    <Globe className="size-3" /> Official Website
                  </a>
                )}
                {openAlexData.ids?.ror && (
                  <a href={openAlexData.ids.ror} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
                    <Link2 className="size-3" /> ROR Registry
                  </a>
                )}
                {openAlexData.ids?.wikipedia && (
                  <a href={openAlexData.ids.wikipedia} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Publications", value: fNum(worksCount), icon: BookOpen, sub: "total indexed works" },
              { label: "Citations", value: fNum(citedCount), icon: Quote, sub: "total times cited" },
              { label: "h-Index", value: hIndex, icon: TrendingUp, sub: "Hirsch index" },
              { label: "i10-Index", value: fNum(i10Index), icon: Award, sub: "≥10 citations" },
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

        {/* ── Research Insight Banner ── */}
        {growthRate && (
          <div className="bg-slate-800 text-white rounded-sm px-5 py-3.5 flex items-start gap-4">
            <BarChart2 className="size-4 mt-0.5 shrink-0 text-slate-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200">Research Trajectory · </span>
              <span className="text-xs text-slate-300">
                Publication output {Number(growthRate) > 0 ? `grew by ${growthRate}%` : `declined by ${Math.abs(Number(growthRate))}%`} compared to the previous year.
                {topicsData[0] && <> Primary research concentration in <strong className="text-white">{topicsData[0].name}</strong>.</>}
                {twoYrMeanCitedness && <> 2-year mean citedness: <strong className="text-white">{twoYrMeanCitedness.toFixed(2)}</strong> citations/work.</>}
              </span>
            </div>
          </div>
        )}

        {/* ── Charts Row ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Output Analysis</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GrowthChart data={growthData} />
            <TopicsBarChart data={topicsData} />
          </div>
        </section>

        {/* ── Works Type + OA Breakdown ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Publication Profile</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Works by type */}
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

        {/* ── Top Sources (Journals/Repositories) ── */}
        {topSourcesList.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
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
                          <div className="h-full rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
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

        {/* ── Data Lists ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">People & Publications</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Top Researchers */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col" style={{ maxHeight: '420px' }}>
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Most-Cited Authors</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Researchers currently or recently affiliated</p>
                </div>
                <Users className="size-4 text-slate-300" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {topResearchers?.results?.map((author: any, i: number) => (
                  <div key={author.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] text-slate-400 w-4 tabular-nums font-medium">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <a href={`https://openalex.org/${author.id.split('/').pop()}`} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline transition-colors">
                        {author.display_name}
                      </a>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {author.x_concepts?.[0]?.display_name || author.topics?.[0]?.display_name || 'Research'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-700 tabular-nums">{fNum(author.cited_by_count)}</div>
                      <div className="text-[10px] text-slate-400">h={author.summary_stats?.h_index}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Impact Works */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col" style={{ maxHeight: '420px' }}>
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight">High-Impact Works</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Most-cited publications from this institution</p>
                </div>
                <FileText className="size-4 text-slate-300" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {recentWorks?.results?.map((work: any) => (
                  <div key={work.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <a href={work.doi || `https://openalex.org/${work.id.split('/').pop()}`} target="_blank" rel="noreferrer"
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline leading-snug line-clamp-2 transition-colors">
                      {work.title}
                    </a>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="tabular-nums">{work.publication_year}</span>
                      <span>·</span>
                      <span className="truncate flex-1 font-medium">{work.primary_location?.source?.display_name || "—"}</span>
                      <span className="shrink-0 tabular-nums font-semibold text-slate-600">{fNum(work.cited_by_count)} cit.</span>
                    </div>
                    {work.open_access?.is_oa && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <Unlock className="size-2.5" /> Open Access
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── International Collaborations ── */}
        {partnerCountries.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
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
                      <span className="text-xs font-medium text-slate-700 w-36 shrink-0 truncate group-hover:text-slate-900 transition-colors">
                        {country.name}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-600 transition-all duration-300"
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
        {sdgs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">UN Sustainable Development Goals</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400">Based on recent publications</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sdgs.map((sdg) => (
                <div key={sdg.id} className="bg-white border border-slate-200 rounded-sm shadow-sm flex items-start gap-4 p-4 hover:border-slate-300 transition-colors">
                  <div className="size-9 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {sdg.id}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-700 line-clamp-1">{sdg.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5"><strong className="text-slate-700">{sdg.count}</strong> aligned publications</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Associated Institutions ── */}
        {openAlexData.associated_institutions?.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
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

        {/* ── Footer ── */}
        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            <span className="font-semibold text-slate-500">Research Intelligence Platform</span>
            {' · '}Data sourced from{' '}
            <a href="https://openalex.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenAlex</a>,{' '}
            <a href="https://ror.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">ROR</a>,{' '}
            <a href="https://www.wikidata.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">Wikidata</a>
          </div>
          <span>CC0 · Open Data</span>
        </footer>

      </main>
    </div>
  );
}
