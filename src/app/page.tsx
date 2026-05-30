import { getInstitutionData } from "@/lib/api";
import { SearchNav } from "@/components/dashboard/SearchNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GrowthChart, TopicsChart } from "@/components/dashboard/Charts";
import { Building2, BookOpen, Quote, Users, MapPin, ExternalLink, Calendar, TrendingUp, Globe, Unlock, Award } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const id = typeof params?.id === 'string' ? params.id : "I24676775"; // Default IIT Madras

  const data = await getInstitutionData(id);
  const { openAlexData, worksGrowth, topResearchers, recentWorks, rorData, wikidata } = data;

  // Country code to name formatting
  const getCountryName = (code: string | undefined) => {
    if (!code) return "Unknown";
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    } catch (e) {
      return code;
    }
  };

  // Formatting numbers
  const fNum = (num: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num || 0);

  // Parse Growth Data
  const growthData = worksGrowth?.group_by?.map((g: any) => ({
    year: g.key,
    count: g.count
  })).sort((a: any, b: any) => a.year.localeCompare(b.year))
    .filter((g: any) => parseInt(g.year) >= 2000) || [];

  // Parse Topics Data (Top 7)
  const topicsData = openAlexData?.topics?.slice(0, 7).map((c: any) => ({
    name: c.display_name,
    value: c.count
  })) || [];

  // Determine Logo with multiple fallback layers
  const logo = wikidata?.claims?.P154?.[0]?.mainsnak?.datavalue?.value
    ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(wikidata.claims.P154[0].mainsnak.datavalue.value)}&width=300`
    : (openAlexData.image_url || openAlexData.image_thumbnail_url || null);

  const institutionName = rorData?.name || openAlexData.display_name;
  
  // Dynamic description summary if wikidata is missing/null
  const description = wikidata?.descriptions?.en?.value || 
    (openAlexData.type 
      ? `${openAlexData.display_name} is a leading ${openAlexData.type} research institution located in ${openAlexData.geo?.city ? openAlexData.geo.city + ', ' : ''}${getCountryName(openAlexData.geo?.country_code)} with a prominent scientific research index.`
      : `${openAlexData.display_name} is a prominent global research organization with strong academic output.`);
      
  const foundingYear = rorData?.established || openAlexData.summary_stats?.established_year || "Unknown";

  // Safeguard publications and citations metrics
  const worksCount = openAlexData.works_count ?? openAlexData.summary_stats?.works_count ?? 0;
  const citedCount = openAlexData.cited_by_count ?? openAlexData.summary_stats?.cited_by_count ?? 0;

  // Calculate insight
  const lastYear = growthData.length >= 2 ? growthData[growthData.length - 2].count : 0;
  const currentYear = growthData.length >= 1 ? growthData[growthData.length - 1].count : 0;
  const growthRate = lastYear > 0 ? (((currentYear - lastYear) / lastYear) * 100).toFixed(1) : 0;

  // 1. Calculate Open Access Ratio from recent works
  const oaWorks = recentWorks?.results?.filter((w: any) => w.open_access?.is_oa) || [];
  const oaRatio = recentWorks?.results?.length
    ? Math.round((oaWorks.length / recentWorks.results.length) * 100)
    : 0;

  // 2. Calculate unique Collaborating Partner Countries
  const uniqueCountries = new Set<string>();
  const hostCountryCode = openAlexData.geo?.country_code;
  recentWorks?.results?.forEach((w: any) => {
    w.authorships?.forEach((a: any) => {
      a.countries?.forEach((c: string) => {
        if (c && c !== hostCountryCode) {
          uniqueCountries.add(c);
        }
      });
    });
  });
  const partnerCountriesCount = uniqueCountries.size;

  // 3. Aggregate UN Sustainable Development Goals (SDGs)
  const sdgAgg: { [key: string]: { count: number, name: string } } = {};
  recentWorks?.results?.forEach((w: any) => {
    w.sustainable_development_goals?.forEach((sdg: any) => {
      const goalId = sdg.id.split("/").pop();
      if (goalId) {
        const name = sdg.display_name.replace(/^Goal \d+:\s*/, "");
        if (!sdgAgg[goalId]) {
          sdgAgg[goalId] = { count: 0, name };
        }
        sdgAgg[goalId].count += 1;
      }
    });
  });
  const sdgs = Object.entries(sdgAgg)
    .map(([id, val]) => ({ id: parseInt(id), count: val.count, name: val.name }))
    .sort((a, b) => b.count - a.count || a.id - b.id)
    .slice(0, 4);

  // SDG Color mappings
  const getSdgColor = (id: number) => {
    const colors: { [key: number]: { bg: string, border: string, text: string, darkBg: string, darkBorder: string, darkText: string } } = {
      1: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", darkBg: "dark:bg-red-500/10", darkBorder: "dark:border-red-500/20", darkText: "dark:text-red-400" },
      2: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", darkBg: "dark:bg-amber-500/10", darkBorder: "dark:border-amber-500/20", darkText: "dark:text-amber-400" },
      3: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", darkBg: "dark:bg-emerald-500/10", darkBorder: "dark:border-emerald-500/20", darkText: "dark:text-emerald-400" },
      4: { bg: "bg-red-50", border: "border-red-150", text: "text-red-800", darkBg: "dark:bg-red-600/10", darkBorder: "dark:border-red-600/20", darkText: "dark:text-red-300" },
      5: { bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700", darkBg: "dark:bg-orange-500/10", darkBorder: "dark:border-orange-500/20", darkText: "dark:text-orange-450" },
      6: { bg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", darkBg: "dark:bg-cyan-500/10", darkBorder: "dark:border-cyan-500/20", darkText: "dark:text-cyan-400" },
      7: { bg: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-700", darkBg: "dark:bg-yellow-500/10", darkBorder: "dark:border-yellow-500/20", darkText: "dark:text-yellow-400" },
      8: { bg: "bg-red-100", border: "border-red-200", text: "text-red-900", darkBg: "dark:bg-red-950/10", darkBorder: "dark:border-red-500/20", darkText: "dark:text-red-400" },
      9: { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-900", darkBg: "dark:bg-orange-950/10", darkBorder: "dark:border-orange-500/20", darkText: "dark:text-orange-450" },
      10: { bg: "bg-pink-50", border: "border-pink-100", text: "text-pink-700", darkBg: "dark:bg-pink-500/10", darkBorder: "dark:border-pink-500/20", darkText: "dark:text-pink-400" },
      11: { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-900", darkBg: "dark:bg-amber-950/10", darkBorder: "dark:border-amber-500/20", darkText: "dark:text-amber-400" },
      12: { bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-900", darkBg: "dark:bg-yellow-950/10", darkBorder: "dark:border-yellow-500/20", darkText: "dark:text-yellow-400" },
      13: { bg: "bg-teal-50", border: "border-teal-100", text: "text-teal-700", darkBg: "dark:bg-teal-500/10", darkBorder: "dark:border-teal-500/20", darkText: "dark:text-teal-400" },
      14: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-500/10", darkBorder: "dark:border-blue-500/20", darkText: "dark:text-blue-400" },
      15: { bg: "bg-green-50", border: "border-green-100", text: "text-green-750", darkBg: "dark:bg-green-500/10", darkBorder: "dark:border-green-500/20", darkText: "dark:text-green-400" },
      16: { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-900", darkBg: "dark:bg-blue-950/10", darkBorder: "dark:border-blue-500/20", darkText: "dark:text-blue-400" },
      17: { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", darkBg: "dark:bg-indigo-500/10", darkBorder: "dark:border-indigo-500/20", darkText: "dark:text-indigo-400" },
    };
    return colors[id] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", darkBg: "dark:bg-slate-500/10", darkBorder: "dark:border-slate-500/20", darkText: "dark:text-slate-400" };
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 selection:bg-indigo-500/30">
      <SearchNav />

      <main className="flex-1 container mx-auto px-4 md:px-6 pt-6 space-y-8 max-w-7xl">

        {/* 1. Institution Overview */}
        <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-slate-200/80 dark:border-white/10 relative">
          <div className="absolute top-0 left-10 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>

          {logo ? (
            <div className="size-20 md:size-24 flex-shrink-0 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/20 backdrop-blur-md shadow-md dark:shadow-2xl rounded-2xl p-3 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={institutionName} className="max-h-full max-w-full object-contain relative z-10" />
            </div>
          ) : (
            <div className="size-20 md:size-24 flex-shrink-0 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-md dark:shadow-2xl rounded-2xl flex items-center justify-center">
              <Building2 className="size-10 text-slate-400 dark:text-slate-500" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">{institutionName}</h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-light">{description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-400"><MapPin className="size-3.5 text-indigo-500 dark:text-indigo-400" /> {openAlexData.geo?.city && `${openAlexData.geo.city}, `}{openAlexData.geo?.region && `${openAlexData.geo.region}, `}{getCountryName(openAlexData.geo?.country_code)}</div>
              {foundingYear !== "Unknown" && <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-white/5 text-emerald-700 dark:text-emerald-400"><Calendar className="size-3.5 text-emerald-500 dark:text-emerald-400" /> Est. {foundingYear}</div>}
              {openAlexData.type && <div className="flex items-center gap-1.5 capitalize bg-blue-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-blue-100 dark:border-white/5 text-blue-700 dark:text-blue-400"><Building2 className="size-3.5 text-blue-500 dark:text-blue-400" /> {openAlexData.type}</div>}

              {openAlexData.homepage_url && (
                <a href={openAlexData.homepage_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-500/20">
                  <ExternalLink className="size-3.5" /> Website
                </a>
              )}
              {openAlexData.ids?.ror && (
                <a href={openAlexData.ids.ror} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-500/20">
                  <ExternalLink className="size-3.5" /> ROR
                </a>
              )}
              {openAlexData.ids?.wikipedia && (
                <a href={openAlexData.ids.wikipedia} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  <ExternalLink className="size-3.5" /> Wikipedia
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Insight Banner */}
        {growthData.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm dark:shadow-lg backdrop-blur-sm">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-300"><TrendingUp className="size-5" /></div>
            <div>
              <p className="text-xs md:text-sm font-semibold text-indigo-950 dark:text-indigo-100 tracking-wide">Research Insights</p>
              <p className="text-[11px] md:text-xs text-indigo-900/80 dark:text-indigo-200/80 mt-0.5">
                {Number(growthRate) > 0 ? `Research output increased by ${growthRate}%` : `Consistent research output`} compared to the previous recorded year. The institution maintains a strong focus on <strong className="text-indigo-950 dark:text-indigo-100 font-semibold">{topicsData[0]?.name}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* 2. Executive Research Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Publications */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 dark:from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Publications</CardTitle>
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400"><BookOpen className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{fNum(worksCount)}</div>
            </CardContent>
          </Card>

          {/* Citations */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Citations</CardTitle>
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400"><Quote className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{fNum(citedCount)}</div>
            </CardContent>
          </Card>

          {/* Open Access Ratio */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 dark:from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Access</CardTitle>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-455"><Unlock className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{oaRatio}%</div>
            </CardContent>
          </Card>

          {/* H-Index */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">H-Index</CardTitle>
              <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400"><TrendingUp className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{openAlexData.summary_stats?.h_index || 0}</div>
            </CardContent>
          </Card>

          {/* i10-Index */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 dark:from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">i10-Index</CardTitle>
              <div className="p-1.5 bg-pink-50 dark:bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400"><TrendingUp className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{fNum(openAlexData.summary_stats?.i10_index || 0)}</div>
            </CardContent>
          </Card>

          {/* Collaborations Countries */}
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-md dark:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 dark:from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Collaborations</CardTitle>
              <div className="p-1.5 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400"><Globe className="size-3.5" /></div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 relative z-10">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{partnerCountriesCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GrowthChart data={growthData} />
          <TopicsChart data={topicsData} />
        </div>

        {/* Data Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Researchers */}
          <Card className="flex flex-col h-[420px] bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-3 pt-4 px-5">
              <CardTitle className="text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight">Top Researchers</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Most cited authors currently affiliated</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-3 px-4 pr-2 custom-scrollbar">
              <div className="space-y-1">
                {topResearchers?.results?.map((author: any) => (
                  <div key={author.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group">
                    <div>
                      <a href={`https://openalex.org/${author.id.split('/').pop()}`} target="_blank" rel="noreferrer" className="font-semibold text-xs text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {author.display_name}
                      </a>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[180px] md:max-w-[240px] truncate">
                        {author.x_concepts?.[0]?.display_name || 'General Research'}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-slate-200/55 dark:border-white/5">
                        {fNum(author.cited_by_count)} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">citations</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">h-index: <span className="text-slate-700 dark:text-slate-300 font-semibold">{author.summary_stats?.h_index}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Publications */}
          <Card className="flex flex-col h-[420px] bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-3 pt-4 px-5">
              <CardTitle className="text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight">Recent & High Impact</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Latest authoritative works</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-3 px-4 pr-2 custom-scrollbar">
              <div className="space-y-1">
                {recentWorks?.results?.map((work: any) => (
                  <div key={work.id} className="flex flex-col p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group">
                    <a href={`https://openalex.org/${work.id.split('/').pop()}`} target="_blank" rel="noreferrer" className="font-medium text-xs leading-snug text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {work.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-white/5">{work.publication_year}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px] font-medium text-slate-505 dark:text-slate-400">{work.primary_location?.source?.display_name || "Unknown Journal"}</span>
                    </div>
                    <div className="text-[10px] mt-1.5 flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Quote className="size-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{fNum(work.cited_by_count)}</span> <span className="text-slate-400 dark:text-slate-500">citations</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* UN Sustainable Development Goals (SDG) Tracker */}
        <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-white/10">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="size-5 text-indigo-500 dark:text-indigo-400" />
              UN Sustainable Development Goals (SDG) Impact
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
              Tracking academic alignment and contribution to the global sustainability agenda based on recent publications.
            </p>
          </div>

          {sdgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sdgs.map((sdg) => {
                const color = getSdgColor(sdg.id);
                return (
                  <div
                    key={sdg.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${color.bg} ${color.border} ${color.darkBg} ${color.darkBorder} transition-all hover:scale-[1.01]`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${color.text} ${color.darkText} bg-white/20 dark:bg-white/5`}>
                      {sdg.id}
                    </div>
                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold ${color.text} ${color.darkText} line-clamp-1`}>
                        {sdg.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <strong className="text-slate-700 dark:text-slate-200">{sdg.count}</strong> aligned publications
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 text-center shadow-sm backdrop-blur-xl">
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Actively analyzing publication pathways for UN SDG alignment. Recent works show general interdisciplinary focus.
              </p>
            </div>
          )}
        </div>

        {/* Associated Institutions */}
        {openAlexData.associated_institutions?.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Associated Institutions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Child and related institutions in the network</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {openAlexData.associated_institutions
                .filter((inst: any) => inst.relationship === 'child' || inst.relationship === 'related')
                .map((inst: any) => {
                  const isChild = inst.relationship === 'child';
                  return (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-md hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 relative overflow-hidden pl-4 group"
                    >
                      {/* Relationship color accent line */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 ${isChild ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-400'}`}></span>
                      
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isChild ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                          <Building2 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            {inst.display_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="capitalize">{inst.type || 'institution'}</span>
                            <span>•</span>
                            <span className="capitalize">{inst.relationship}</span>
                            <span>•</span>
                            <span>{getCountryName(inst.country_code)}</span>
                          </div>
                        </div>
                      </div>

                      {inst.ror && (
                        <a
                          href={inst.ror}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-450 hover:text-indigo-605 dark:hover:text-indigo-300 shrink-0 transition-colors"
                          title="View ROR Registry"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
