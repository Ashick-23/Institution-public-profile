import { getWorkData } from "@/lib/api";
import { SearchNav } from "@/components/dashboard/SearchNav";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Unlock, Globe, Quote,
  BookOpen, Calendar, Link2, Tag, FileText, Users
} from "lucide-react";

const SDG_COLORS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
};

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { work, relatedWorks } = await getWorkData(id);

  if (!work) notFound();

  // --- Helpers ---
  const fNum = (num: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num || 0);

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

  const getOABadgeStyle = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
      gold: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "Gold Open Access" },
      green: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", label: "Green Open Access" },
      hybrid: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Hybrid Open Access" },
      bronze: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", label: "Bronze Open Access" },
      diamond: { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe", label: "Diamond Open Access" },
    };
    return map[status?.toLowerCase()] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", label: status };
  };

  // --- Derived data ---
  const abstract = constructAbstract(work.abstract_inverted_index);
  const allAuthors = work.authorships || [];
  const oaStatus = work.open_access?.oa_status;
  const oaBadge = oaStatus && work.open_access?.is_oa ? getOABadgeStyle(oaStatus) : null;
  const publishedDate = work.publication_date || work.publication_year?.toString();
  const journal = work.primary_location?.source?.display_name;
  const volume = work.biblio?.volume;
  const issue = work.biblio?.issue;
  const pages = work.biblio?.first_page && work.biblio?.last_page
    ? `${work.biblio.first_page}–${work.biblio.last_page}` : null;

  const concepts = work.concepts?.slice(0, 10) || [];
  const sdgs = work.sustainable_development_goals?.map((s: any) => {
    const num = parseInt(s.id?.split('/').pop() || '0');
    return { id: num, name: s.display_name.replace(/^Goal \d+:\s*/, ""), score: s.score };
  }).filter((s: any) => s.id > 0) || [];

  const relatedList = relatedWorks?.results?.filter((w: any) => w.id !== work.id).slice(0, 4) || [];

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

        {/* ── Work Header ── */}
        <section className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <div className="p-6 md:p-8">
            <div className="space-y-4">

              {/* Type + Year breadcrumb */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wider capitalize">
                  <FileText className="size-3" />
                  {work.type?.replace("-", " ") || "Article"}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">{publishedDate}</span>
                {oaBadge && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border"
                      style={{ backgroundColor: oaBadge.bg, color: oaBadge.text, borderColor: oaBadge.border }}
                    >
                      <Unlock className="size-3" /> {oaBadge.label}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-primary leading-snug">
                {work.title}
              </h1>

              {/* Journal */}
              {journal && (
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <BookOpen className="size-3.5 text-slate-400 shrink-0" />
                  {journal}
                  {(volume || issue) && (
                    <span className="text-slate-400 font-normal">
                      {volume && `Vol. ${volume}`}{issue && `, Issue ${issue}`}{pages && `, pp. ${pages}`}
                    </span>
                  )}
                </p>
              )}

              {/* External links */}
              <div className="flex flex-wrap gap-3 pt-1">
                {work.doi && (
                  <a
                    href={work.doi}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2"
                  >
                    <Link2 className="size-3" /> DOI: {work.doi.replace("https://doi.org/", "")}
                  </a>
                )}
                {work.open_access?.oa_url && (
                  <a
                    href={work.open_access.oa_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 transition-colors underline underline-offset-2"
                  >
                    <Unlock className="size-3" /> Free Full Text
                  </a>
                )}
                <a
                  href={`https://openalex.org/${work.id?.split('/').pop()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors underline underline-offset-2"
                >
                  <ExternalLink className="size-3" /> OpenAlex
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Citations", value: fNum(work.cited_by_count), icon: Quote, sub: "times cited" },
            { label: "References", value: fNum(work.referenced_works?.length || 0), icon: BookOpen, sub: "reference list" },
            { label: "Authors", value: allAuthors.length, icon: Users, sub: "on this paper" },
            { label: "Published", value: work.publication_year || "—", icon: Calendar, sub: "year" },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Abstract + Concepts ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Abstract */}
            {abstract && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Abstract</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
                  <p className="text-sm text-slate-700 leading-relaxed">{abstract}</p>
                </div>
              </section>
            )}

            {/* Authors */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Authors</h2>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400">{allAuthors.length} total</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-100">
                {allAuthors.map((authorship: any, i: number) => {
                  const authorId = authorship.author?.id?.split('/').pop();
                  return (
                    <div key={authorship.author?.id || i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                      <div className="size-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {authorship.author?.display_name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/faculty/${authorId}`}
                          className="text-sm font-semibold text-slate-800 hover:text-primary hover:underline transition-colors"
                        >
                          {authorship.author?.display_name}
                        </Link>
                        {authorship.raw_affiliation_strings?.[0] && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{authorship.raw_affiliation_strings[0]}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">#{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Concepts / Keywords */}
            {concepts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Research Concepts</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
                  <div className="flex flex-wrap gap-2">
                    {concepts.map((c: any) => {
                      const opacity = Math.max(0.3, c.score || 0.5);
                      return (
                        <span
                          key={c.id}
                          title={`Relevance score: ${c.score?.toFixed(2)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: `rgba(13, 56, 98, ${opacity * 0.12})`,
                            color: `rgba(13, 56, 98, ${0.6 + opacity * 0.4})`,
                            borderColor: `rgba(13, 56, 98, ${opacity * 0.25})`,
                          }}
                        >
                          <Tag className="size-3" />
                          {c.display_name}
                          <span className="text-[9px] opacity-60 ml-0.5">L{c.level}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">

            {/* Metadata */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Bibliographic Data</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-100 text-xs">
                {[
                  { label: "Type", value: work.type?.replace("-", " ") },
                  { label: "Published", value: publishedDate },
                  { label: "Journal", value: journal },
                  { label: "Volume", value: volume },
                  { label: "Issue", value: issue },
                  { label: "Pages", value: pages },
                  { label: "Language", value: work.language?.toUpperCase() },
                  { label: "DOI", value: work.doi?.replace("https://doi.org/", ""), link: work.doi },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="text-slate-400 font-semibold w-20 shrink-0">{row.label}</span>
                    {row.link ? (
                      <a href={row.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{row.value}</a>
                    ) : (
                      <span className="text-slate-700 capitalize">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SDGs */}
            {sdgs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Aligned SDGs</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-2">
                  {sdgs.map((sdg: any) => (
                    <div key={sdg.id} className="bg-white border border-slate-200 rounded-sm shadow-sm flex items-center gap-3 p-3 hover:border-slate-300 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/sdgs/sdg-${sdg.id}.png`} alt={`SDG ${sdg.id}`} className="size-8 rounded object-contain shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-700 leading-tight">{sdg.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Confidence: {(sdg.score * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ── Related Works ── */}
        {relatedList.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400">Related Works</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400">via shared research theme</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedList.map((rw: any) => {
                const rwId = rw.id?.split('/').pop();
                return (
                  <Link
                    key={rw.id}
                    href={`/works/${rwId}`}
                    className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 hover:border-primary/40 hover:shadow-md transition-all group block"
                  >
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-primary line-clamp-2 leading-snug transition-colors">
                      {rw.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                      <span>{rw.publication_year}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-semibold text-primary tabular-nums">{fNum(rw.cited_by_count)} cit.</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Data sourced from <a href="https://openalex.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenAlex</a> · CC0</span>
          <Link href="/" className="hover:text-slate-600 transition-colors">← Back to Institution</Link>
        </footer>

      </main>
    </div>
  );
}
