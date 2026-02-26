#!/usr/bin/env node

/**
 * Perplexity Search — Web-grounded SOTA discovery via OpenRouter
 * Calls Perplexity Sonar models through OpenRouter's OpenAI-compatible API.
 * Zero dependencies — uses Node 18+ built-in fetch().
 * Returns unified JSON envelope matching other ai-frontier skills.
 *
 * Requires: OPENROUTER_API_KEY environment variable
 */

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = {
  'sonar':              'perplexity/sonar',
  'sonar-pro':          'perplexity/sonar-pro',
  'sonar-reasoning':    'perplexity/sonar-reasoning',
  'sonar-reasoning-pro':'perplexity/sonar-reasoning-pro',
};

const DEFAULT_MODEL = 'sonar-pro';

async function searchPerplexity(query, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'OPENROUTER_API_KEY not set. Get one at https://openrouter.ai/keys',
      source: 'perplexity'
    };
  }

  const model = MODELS[options.model || DEFAULT_MODEL];
  if (!model) {
    return {
      success: false,
      error: `Unknown model: ${options.model}. Available: ${Object.keys(MODELS).join(', ')}`,
      source: 'perplexity'
    };
  }

  const maxTokens = options.maxTokens || 4000;
  const temperature = options.temperature ?? 0.2;

  try {
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/flight505/ai-frontier',
        'X-Title': 'ai-frontier research plugin'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: query }],
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      return {
        success: false,
        error: `OpenRouter API returned HTTP ${response.status}: ${errBody.substring(0, 200)}`,
        source: 'perplexity'
      };
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const answer = choice?.message?.content || '';
    const citations = data.citations || [];

    return {
      success: true,
      query,
      source: 'perplexity',
      result_count: 1,
      results: [{
        answer,
        citations,
        model: options.model || DEFAULT_MODEL
      }],
      meta: {
        timestamp: new Date().toISOString(),
        api_version: 'openrouter-perplexity-v1',
        model_id: model,
        tokens_used: data.usage || null
      }
    };
  } catch (error) {
    return { success: false, error: error.message, source: 'perplexity' };
  }
}

// ── SOTA Query Builder ──────────────────────────────────────────────
// Wraps a topic query with instructions that steer Perplexity toward
// current SOTA results rather than general information.

function buildSotaQuery(topic) {
  return `What is the current state-of-the-art (SOTA) for: ${topic}

Focus on:
1. The MOST RECENT methods and frameworks (last 6 months preferred)
2. What has SUPERSEDED older approaches — name the older method and its replacement
3. Key papers with arxiv IDs or DOIs and their publication dates
4. Open-source implementations with GitHub URLs if available
5. Quantitative benchmark results comparing old vs new approaches

Be specific about dates. For each method mentioned, state its publication year/month.
Distinguish between "widely adopted" and "just published / not yet validated".`;
}

function buildRecentQuery(topic, days = 30) {
  return `What are the most recent developments (last ${days} days) in: ${topic}

Focus on:
1. New papers, preprints, or announcements from the last ${days} days
2. New framework releases or major version updates
3. Benchmark results that changed the state-of-the-art
4. Include specific dates, arxiv IDs, and GitHub URLs where available

Only include developments from the last ${days} days. Do not include older work.`;
}

// ── CLI ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(JSON.stringify({
    success: false,
    error: `Usage:
  search "<query>"                     General web-grounded search
  search --sota "<topic>"              Current SOTA for a topic
  search --recent "<topic>" [--days=N] Recent developments (default 30 days)

Options:
  --model=sonar-pro|sonar|sonar-reasoning|sonar-reasoning-pro
  --max-tokens=N    (default 4000)
  --temperature=N   (default 0.2)

Requires: OPENROUTER_API_KEY environment variable`
  }, null, 2));
  process.exit(1);
}

// Parse arguments
let query = null;
let mode = 'search';
let options = {};
let days = 30;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sota') {
    mode = 'sota';
  } else if (args[i] === '--recent') {
    mode = 'recent';
  } else if (args[i].startsWith('--model=')) {
    options.model = args[i].split('=')[1];
  } else if (args[i].startsWith('--max-tokens=')) {
    options.maxTokens = parseInt(args[i].split('=')[1], 10);
  } else if (args[i].startsWith('--temperature=')) {
    options.temperature = parseFloat(args[i].split('=')[1]);
  } else if (args[i].startsWith('--days=')) {
    days = parseInt(args[i].split('=')[1], 10);
  } else if (!args[i].startsWith('--') && !query) {
    query = args[i];
  }
}

if (!query) {
  console.log(JSON.stringify({
    success: false,
    error: 'No query provided. Use --help for usage.',
    source: 'perplexity'
  }, null, 2));
  process.exit(1);
}

// Build final query based on mode
let finalQuery;
switch (mode) {
  case 'sota':
    finalQuery = buildSotaQuery(query);
    break;
  case 'recent':
    finalQuery = buildRecentQuery(query, days);
    break;
  default:
    finalQuery = query;
}

searchPerplexity(finalQuery, options).then(result => {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});
