// Vercel Serverless Function: Hidden Gemini AI Proxy
// Requires Environment Variables: GEMINI_API_KEY and APP_PASSWORD
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.APP_PASSWORD || 'picasso2026';
  const expectedToken = Buffer.from(`lumentatix:${expected}`).toString('base64');
  const incomingToken = req.headers['x-lumentatix-token'];

  if (!incomingToken || incomingToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );
    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
}
