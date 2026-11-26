// Vercel Serverless Function: Staff Login Gate
// Requires Environment Variable: APP_PASSWORD
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const expected = process.env.APP_PASSWORD || 'picasso2026';

  if (!password || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Invalid password' });
  }

  const token = Buffer.from(`lumentatix:${expected}`).toString('base64');
  return res.status(200).json({ ok: true, token });
}
