#!/usr/bin/env node

/**
 * arXiv Search — Direct API access (no API key required)
 * Searches arXiv Atom API for papers in AI/ML/data science categories.
 * Returns unified JSON envelope optimized for LLM consumption.
 */

const ARXIV_API = 'http://export.arxiv.org/api/query';
const DEFAULT_CATEGORIES = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'stat.ML', 'cs.MA'];

function buildQuery(query, categories, sortBy, maxResults) {
  const catFilter = categories.map(c => `cat:${c}`).join('+OR+');
  const searchQuery = `all:${encodeURIComponent(query)}+AND+(${catFilter})`;
  const sortParam = sortBy === 'date' ? 'submittedDate' : 'relevance';
  return `${ARXIV_API}?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=${sortParam}&sortOrder=descending`;
}

function parseAtomXml(xml) {
  const entries = [];
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryPattern.exec(xml)) !== null) {
    const entry = match[1];
    const get = (tag) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    const getAll = (tag) => {
      const results = [];
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
      let m;
      while ((m = re.exec(entry)) !== null) results.push(m[1].trim());
      return results;
    };
    const getAttr = (tag, attr) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, 'g'));
      return m ? m.map(x => { const a = x.match(new RegExp(`${attr}="([^"]*)"`)); return a ? a[1] : ''; }) : [];
    };

    const title = get('title').replace(/\s+/g, ' ');
    const abstract = get('summary').replace(/\s+/g, ' ');
    const published = get('published');
    const updated = get('updated');
    const authors = getAll('name');
    const categories = getAttr('category', 'term');
    const links = entry.match(/<link[^>]*>/g) || [];
    const pdfLink = links.find(l => l.includes('type="application/pdf"'));
    const pdfUrl = pdfLink ? (pdfLink.match(/href="([^"]*)"/) || [])[1] || '' : '';
    const absLink = links.find(l => l.includes('type="text/html"')) || links.find(l => !l.includes('type='));
    const absUrl = absLink ? (absLink.match(/href="([^"]*)"/) || [])[1] || '' : '';
    const id = get('id');
    const arxivId = id.replace('http://arxiv.org/abs/', '').replace(/v\d+$/, '');

    entries.push({
      title,
      authors,
      year: published ? parseInt(published.substring(0, 4), 10) : null,
      abstract: abstract.length > 500 ? abstract.substring(0, 500) + '...' : abstract,
      tldr: '',
      url: absUrl || id,
      pdf_url: pdfUrl,
      citations: null,
      code_repos: [],
      relevance_score: null,
      key_methods: [],
      source_specific: {
        arxiv_id: arxivId,
        categories,
        published,
        updated
      }
    });
  }
  return entries;
}

async function searchArxiv(query, maxResults = 10, sortBy = 'relevance', categories = null) {
  maxResults = Math.min(Math.max(1, maxResults), 100);
  const cats = categories || DEFAULT_CATEGORIES;
  try {
    const url = buildQuery(query, cats, sortBy, maxResults);
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `arXiv API returned HTTP ${response.status}`, source: 'arxiv' };
    }
    const xml = await response.text();
    const results = parseAtomXml(xml);
    return {
      success: true,
      query,
      source: 'arxiv',
      result_count: results.length,
      results,
      meta: {
        timestamp: new Date().toISOString(),
        api_version: 'arxiv-atom-1.0',
        categories_searched: cats,
        sort_by: sortBy
      }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'arxiv' };
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log(JSON.stringify({
    success: false,
    error: 'Query required. Usage: search <query> [maxResults] [--sort=date|relevance] [--cats=cs.AI,cs.LG]'
  }, null, 2));
  process.exit(1);
}

const query = args[0];
let maxResults = 10;
let sortBy = 'relevance';
let categories = null;

for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith('--sort=')) sortBy = args[i].split('=')[1];
  else if (args[i].startsWith('--cats=')) categories = args[i].split('=')[1].split(',');
  else if (!isNaN(parseInt(args[i], 10))) maxResults = parseInt(args[i], 10);
}

searchArxiv(query, maxResults, sortBy, categories).then(result => {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});
