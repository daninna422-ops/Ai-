export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "❌ VERCEL ERROR: GEMINI_API_KEY ba ta samamu ba a Settings." });
  }

  return res.status(200).json({ 
    reply: "✅ Vercel Server yana aiki! API Key ɗinka tana nan. Matsalar tana wurin API Connection." 
  });
}
