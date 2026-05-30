export const OPENALEX_API_BASE = "https://api.openalex.org";

export async function getInstitution(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/institutions/${id}?mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch institution: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getInstitutionWorksGrowth(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=publication_year&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch works growth: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getTopResearchers(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/authors?filter=last_known_institutions.id:${id}&sort=cited_by_count:desc&per-page=15&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch top researchers: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getRecentWorks(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&sort=cited_by_count:desc&per-page=20&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch recent works: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Top journals/sources by publication count */
export async function getTopSources(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=primary_location.source.id&per-page=8&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

/** Works grouped by document type (article, book-chapter, preprint, etc.) */
export async function getWorksByType(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=type&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

/** Top collaborating countries by co-authorship */
export async function getCollaboratingCountries(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=authorships.countries&per-page=10&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

/** Open Access breakdown grouped by OA status */
export async function getOpenAccessBreakdown(id: string) {
  const res = await fetch(`${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=open_access.oa_status&mailto=test@example.com`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getRorData(rorUrl: string) {
  if (!rorUrl) return null;
  try {
    const rorId = rorUrl.split('/').pop();
    const res = await fetch(`https://api.ror.org/organizations/${rorId}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getWikidata(wikidataUrl: string) {
  if (!wikidataUrl) return null;
  try {
    const wikidataId = wikidataUrl.split('/').pop();
    const res = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&format=json&props=descriptions|aliases|claims&origin=*`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.entities[wikidataId as string];
  } catch {
    return null;
  }
}

export async function getInstitutionData(id: string = "I347237974") { // Default to Ashoka University
  const openAlexData = await getInstitution(id);

  // Parallel fetch for all enrichments and metrics
  const [worksGrowth, topResearchers, recentWorks, topSources, worksByType, collaboratingCountries, oaBreakdown, rorData, wikidata] = await Promise.all([
    getInstitutionWorksGrowth(id),
    getTopResearchers(id),
    getRecentWorks(id),
    getTopSources(id),
    getWorksByType(id),
    getCollaboratingCountries(id),
    getOpenAccessBreakdown(id),
    openAlexData.ids?.ror ? getRorData(openAlexData.ids.ror) : Promise.resolve(null),
    openAlexData.ids?.wikidata ? getWikidata(openAlexData.ids.wikidata) : Promise.resolve(null)
  ]);

  return {
    openAlexData,
    worksGrowth,
    topResearchers,
    recentWorks,
    topSources,
    worksByType,
    collaboratingCountries,
    oaBreakdown,
    rorData,
    wikidata
  };
}
