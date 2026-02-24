#!/usr/bin/env node

/**
 * Hugging Face Papers Search — Free API, no key required
 * Searches HF Papers for AI/ML research with AI-generated summaries,
 * keywords, community upvotes, and GitHub repo links when available.
 * Returns unified JSON envelope optimized for LLM consumption.
 *
 * Replaces Papers With Code (PwC API deprecated, redirects to HF).
 */

const HF_API = 'https://huggingface.co/api';

async function searchPapers(query, maxResults = 10) {
  try {
    const params = new URLSearchParams({ q: query, limit: String(maxResults) });
    const response = await fetch(`${HF_API}/papers/search?${params}`);

    if (!response.ok) {
      return { success: false, error: `HF Papers API returned HTTP ${response.status}`, source: 'hf_papers' };
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [];

    const papers = items.map(item => {
      const paper = item.paper || item;
      const authors = (paper.authors || []).map(a => a.name || a.user?.fullname || '');
      const published = paper.publishedAt || '';
      const year = published ? parseInt(published.substring(0, 4), 10) : null;
      const abstract = paper.summary || '';
      const arxivId = paper.id || '';

      const codeRepos = [];
      if (paper.githubRepo) {
        codeRepos.push({
          url: paper.githubRepo,
          stars: paper.githubStars || 0,
          framework: 'unknown'
        });
      }

      return {
        title: paper.title || '',
        authors,
        year,
        abstract: abstract.length > 500 ? abstract.substring(0, 500) + '...' : abstract,
        tldr: paper.ai_summary || '',
        url: arxivId ? `https://arxiv.org/abs/${arxivId}` : '',
        pdf_url: arxivId ? `https://arxiv.org/pdf/${arxivId}` : '',
        citations: null,
        code_repos: codeRepos,
        relevance_score: null,
        key_methods: paper.ai_keywords || [],
        source_specific: {
          arxiv_id: arxivId,
          upvotes: paper.upvotes || 0,
          num_comments: item.numComments || 0,
          organization: paper.organization?.fullname || '',
          highlighted_title: item.highlightedTitle || '',
          highlighted_summary: item.highlightedSummary || ''
        }
      };
    });

    return {
      success: true,
      query,
      source: 'hf_papers',
      result_count: papers.length,
      results: papers,
      meta: {
        timestamp: new Date().toISOString(),
        api_version: 'huggingface-papers-v1'
      }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'hf_papers' };
  }
}

async function getTrending(maxResults = 10) {
  try {
    const response = await fetch(`${HF_API}/daily_papers?limit=${maxResults}`);

    if (!response.ok) {
      return { success: false, error: `HF Daily Papers API returned HTTP ${response.status}`, source: 'hf_papers' };
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [];

    const papers = items.map(item => {
      const paper = item.paper || item;
      const authors = (paper.authors || []).map(a => a.name || a.user?.fullname || '');
      const published = paper.publishedAt || '';
      const year = published ? parseInt(published.substring(0, 4), 10) : null;
      const abstract = paper.summary || '';
      const arxivId = paper.id || '';

      const codeRepos = [];
      if (paper.githubRepo) {
        codeRepos.push({
          url: paper.githubRepo,
          stars: paper.githubStars || 0,
          framework: 'unknown'
        });
      }

      return {
        title: paper.title || '',
        authors,
        year,
        abstract: abstract.length > 500 ? abstract.substring(0, 500) + '...' : abstract,
        tldr: paper.ai_summary || '',
        url: arxivId ? `https://arxiv.org/abs/${arxivId}` : '',
        pdf_url: arxivId ? `https://arxiv.org/pdf/${arxivId}` : '',
        citations: null,
        code_repos: codeRepos,
        relevance_score: null,
        key_methods: paper.ai_keywords || [],
        source_specific: {
          arxiv_id: arxivId,
          upvotes: paper.upvotes || 0,
          num_comments: item.numComments || 0,
          organization: paper.organization?.fullname || '',
          submitted_on_daily: paper.submittedOnDailyAt || ''
        }
      };
    });

    return {
      success: true,
      query: 'trending',
      source: 'hf_papers',
      result_count: papers.length,
      results: papers,
      meta: {
        timestamp: new Date().toISOString(),
        api_version: 'huggingface-papers-v1',
        type: 'daily_trending'
      }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'hf_papers' };
  }
}

async function getPaperDetail(arxivId) {
  try {
    const response = await fetch(`${HF_API}/papers/${encodeURIComponent(arxivId)}`);

    if (!response.ok) {
      return { success: false, error: `HF Papers API returned HTTP ${response.status}`, source: 'hf_papers' };
    }

    const paper = await response.json();
    const authors = (paper.authors || []).map(a => a.name || a.user?.fullname || '');

    const codeRepos = [];
    if (paper.githubRepo) {
      codeRepos.push({
        url: paper.githubRepo,
        stars: paper.githubStars || 0,
        framework: 'unknown'
      });
    }

    return {
      success: true,
      source: 'hf_papers',
      paper: {
        title: paper.title || '',
        authors,
        year: paper.publishedAt ? parseInt(paper.publishedAt.substring(0, 4), 10) : null,
        abstract: paper.summary || '',
        tldr: paper.ai_summary || '',
        url: `https://arxiv.org/abs/${arxivId}`,
        pdf_url: `https://arxiv.org/pdf/${arxivId}`,
        upvotes: paper.upvotes || 0,
        code_repos: codeRepos,
        key_methods: paper.ai_keywords || [],
        organization: paper.organization?.fullname || ''
      },
      meta: { timestamp: new Date().toISOString(), api_version: 'huggingface-papers-v1' }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'hf_papers' };
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(JSON.stringify({
    success: false,
    error: 'Usage: search <query> [maxResults] | search --trending [maxResults] | search --detail=<arxivId>'
  }, null, 2));
  process.exit(1);
}

if (args[0] === '--trending') {
  const max = args[1] ? parseInt(args[1], 10) : 10;
  getTrending(max).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
} else {
  const detailArg = args.find(a => a.startsWith('--detail='));
  if (detailArg) {
    getPaperDetail(detailArg.split('=')[1]).then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    });
  } else {
    const query = args[0];
    let maxResults = 10;
    for (let i = 1; i < args.length; i++) {
      if (!isNaN(parseInt(args[i], 10))) maxResults = parseInt(args[i], 10);
    }
    searchPapers(query, maxResults).then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    });
  }
}
