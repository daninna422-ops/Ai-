export default async function handler(req, res) {
  // Bada dama ga shiga ta ko ina (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Saƙo yana buƙata' });
    }

    // Kira izinin AI (Za ki iya saka API Key dinki na Gemini a nan ko a Vercel)
    const apiKey = process.env.GEMINI_API_KEY || "SURA_YOUR_API_KEY_HERE";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply, html: "<div>App Generated Successfully</div>" });
    } else {
      return res.status(500).json({ error: 'AI bai samar da amsa ba. Tabbatar da API Key.' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
