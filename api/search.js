const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a vendor-neutral AI tool recommendation engine. Given a task, search the web for current, reputable information and recommend the best AI tools or products for it. Never favor any single company. Base recommendations on genuine fit for the task, not popularity alone.

Respond with ONLY a JSON object, no markdown code fences, no preamble, no explanation outside the JSON. Use this exact shape:

{
  "results": [
    {
      "rank": 1,
      "name": "Tool Name",
      "category": "short category label, 2-3 words",
      "why": "1-2 sentence reason this tool fits the specific task, written plainly",
      "sources": ["Source Name"]
    }
  ]
}

Return 3 to 5 results, ranked best fit first.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body || {};

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or empty query' });
  }

  if (query.length > 300) {
    return res.status(400).json({ error: 'Query too long' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Task: "${query.trim()}"

Find the best current AI tools for this task and return the JSON as instructed.`,
        },
      ],
    });

    const textBlock = [...message.content].reverse().find((b) => b.type === 'text');

    if (!textBlock || !textBlock.text) {
      return res.status(502).json({ error: 'No response generated. Try again.' });
    }

    const cleaned = textBlock.text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse model output as JSON:', cleaned);
      return res.status(502).json({ error: 'Could not read results. Try rephrasing your query.' });
    }

    if (!parsed.results || !Array.isArray(parsed.results) || parsed.results.length === 0) {
      return res.status(502).json({ error: 'No results found for that task.' });
    }

    return res.status(200).json({ query: query.trim(), results: parsed.results });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Something went wrong. Try again in a moment.' });
  }
};
