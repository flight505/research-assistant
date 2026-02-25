#!/usr/bin/env node

/**
 * Semantic Scholar Search — Academic Graph API (free, no key for 100 req/sec)
 * Rich metadata: citations, TLDRs, influence scores, related papers.
 * Returns unified JSON envelope optimized for LLM consumption.
 */

const S2_API = 'https://api.semanticscholar.org/graph/v1';
const FIELDS = 'title,authors,year,abstract,tldr,url,openAccessPdf,citationCount,influentialCitationCount,fieldsOfStudy,venue,externalIds,publicationDate';

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * 2 ** i));
      else return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * 2 ** i));
    }
  }
}

async function searchPapers(query, maxResults = 10, yearFrom = null, openAccess = false) {
  try {
    const params = new URLSearchParams({
      query,
      limit: String(Math.min(maxResults, 100)),
      fields: FIELDS
    });
    if (yearFrom) params.set('year', `${yearFrom}-`);
    if (openAccess) params.set('openAccessPdf', '');

    const response = await fetchWithRetry(`${S2_API}/paper/search?${params}`);

    if (!response.ok) {
      return { success: false, error: `S2 API returned HTTP ${response.status} after retries`, source: 'semantic_scholar' };
    }

    const data = await response.json();
    const papers = (data.data || []).map(paper => ({
      title: paper.title || '',
      authors: (paper.authors || []).map(a => a.name),
      year: paper.year,
      abstract: paper.abstract
        ? (paper.abstract.length > 500 ? paper.abstract.substring(0, 500) + '...' : paper.abstract)
        : '',
      tldr: paper.tldr?.text || '',
      url: paper.url || '',
      pdf_url: paper.openAccessPdf?.url || '',
      citations: paper.citationCount || 0,
      code_repos: [],
      relevance_score: null,
      key_methods: [],
      source_specific: {
        s2_paper_id: paper.paperId,
        influential_citations: paper.influentialCitationCount || 0,
        fields_of_study: paper.fieldsOfStudy || [],
        venue: paper.venue || '',
        doi: paper.externalIds?.DOI || '',
        arxiv_id: paper.externalIds?.ArXiv || '',
        publication_date: paper.publicationDate || ''
      }
    }));

    return {
      success: true,
      query,
      source: 'semantic_scholar',
      result_count: papers.length,
      results: papers,
      meta: {
        timestamp: new Date().toISOString(),
        api_version: 'semantic-scholar-graph-v1',
        total_available: data.total || papers.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'semantic_scholar' };
  }
}

async function getPaperDetails(paperId) {
  try {
    const detailFields = FIELDS + ',references,citations';
    const response = await fetchWithRetry(`${S2_API}/paper/${encodeURIComponent(paperId)}?fields=${detailFields}`);
    if (!response.ok) {
      return { success: false, error: `S2 API returned HTTP ${response.status}`, source: 'semantic_scholar' };
    }
    const paper = await response.json();
    return {
      success: true,
      source: 'semantic_scholar',
      paper: {
        title: paper.title || '',
        authors: (paper.authors || []).map(a => a.name),
        year: paper.year,
        abstract: paper.abstract || '',
        tldr: paper.tldr?.text || '',
        url: paper.url || '',
        pdf_url: paper.openAccessPdf?.url || '',
        citations: paper.citationCount || 0,
        influential_citations: paper.influentialCitationCount || 0,
        venue: paper.venue || '',
        fields_of_study: paper.fieldsOfStudy || [],
        doi: paper.externalIds?.DOI || '',
        references_count: (paper.references || []).length,
        top_references: (paper.references || []).slice(0, 10).map(r => ({
          title: r.title,
          year: r.year,
          citations: r.citationCount
        })),
        recent_citations: (paper.citations || []).slice(0, 10).map(c => ({
          title: c.title,
          year: c.year,
          citations: c.citationCount
        }))
      },
      meta: { timestamp: new Date().toISOString(), api_version: 'semantic-scholar-graph-v1' }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'semantic_scholar' };
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log(JSON.stringify({
    success: false,
    error: 'Usage: search <query> [maxResults] [--year=2024] [--open-access] [--detail=<paperId>]'
  }, null, 2));
  process.exit(1);
}

const detailArg = args.find(a => a.startsWith('--detail='));
if (detailArg) {
  const paperId = detailArg.split('=')[1];
  getPaperDetails(paperId).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
} else {
  const query = args[0];
  let maxResults = 10;
  let yearFrom = null;
  let openAccess = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--year=')) yearFrom = parseInt(args[i].split('=')[1], 10);
    else if (args[i] === '--open-access') openAccess = true;
    else if (!isNaN(parseInt(args[i], 10))) maxResults = parseInt(args[i], 10);
  }
  searchPapers(query, maxResults, yearFrom, openAccess).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}
