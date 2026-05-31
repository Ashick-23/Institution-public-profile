import { getInstitutionData } from "@/lib/api";
import { SearchNav } from "@/components/dashboard/SearchNav";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

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

  // --- Growth data ---
  const growthData = worksGrowth?.group_by?.map((g: any) => ({ year: g.key, count: g.count }))
    .sort((a: any, b: any) => a.year.localeCompare(b.year))
    .filter((g: any) => parseInt(g.year) >= 2000) || [];

  // --- Counts by year (Publications & Citations) ---
  const countsByYearData = openAlexData.counts_by_year
    ?.filter((y: any) => y.year >= 2000)
    .sort((a: any, b: any) => a.year - b.year) || [];

  // --- Topics data ---
  const topicsData = openAlexData?.topics?.slice(0, 7).map((c: any) => ({ name: c.display_name, value: c.count })) || [];

  // --- Works by type ---
  const worksTypeData = worksByType?.group_by?.map((g: any) => ({ name: g.key_display_name, value: g.count }))
    .sort((a: any, b: any) => b.value - a.value) || [];

  // --- Top sources/journals ---
  const topSourcesList = topSources?.group_by?.slice(0, 8).map((s: any) => ({ name: s.key_display_name, count: s.count })) || [];

  // --- Collaborating countries ---
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
  let logo = wikidata?.claims?.P154?.[0]?.mainsnak?.datavalue?.value
    ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(wikidata.claims.P154[0].mainsnak.datavalue.value)}&width=300`
    : null;

  let domain = null;
  if (openAlexData.homepage_url) {
    try {
      domain = new URL(openAlexData.homepage_url).hostname;
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
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <DashboardClient
          id={id}
          openAlexData={openAlexData}
          growthRate={growthRate}
          countsByYearData={countsByYearData}
          topicsData={topicsData}
          worksTypeData={worksTypeData}
          topSourcesList={topSourcesList}
          topResearchers={topResearchers}
          recentWorks={recentWorks}
          partnerCountries={partnerCountries}
          sdgs={sdgs}
          logo={logo}
          domain={domain}
          institutionName={institutionName}
          description={description}
          foundingYear={foundingYear}
          worksCount={worksCount}
          citedCount={citedCount}
          hIndex={hIndex}
          i10Index={i10Index}
          twoYrMeanCitedness={twoYrMeanCitedness}
          oaRatio={oaRatio}
          oaData={oaData}
          totalOA={totalOA}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center text-[10px] text-slate-400 bg-white">
        <span>CC0 · Open Data</span>
      </footer>
    </div>
  );
}
