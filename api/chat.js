export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message, step, termiiApiKey, supabaseUrl, supabaseKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "❌ Saka GEMINI_API_KEY a Vercel!" });

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let systemRule = `STRICT MANDATE:
    1. For OTP verification, DO NOT use mock static OTP like '1234'.
    2. Integrate Termii SMS API endpoint (https://api.ng.termii.com/api/sms/send) to send real 6-digit OTP code to user's phone via SMS.
    3. Generate dynamic 6-digit OTP code using Math.floor(100000 + Math.random() * 900000).
    4. Store generated OTP in JavaScript variable or localStorage to compare with user input.
    5. Termii API Key: ${termiiApiKey || 'YOUR_TERMII_API_KEY'}
    6. All user details must save into Supabase DB directly on verified OTP.`;

    let promptText = `${systemRule}\nTask: Generate dynamic single file code for step ${step}. Prompt: ${message}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Ba a samu lambobin kodi ba.";

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    return res.status(200).json({ reply: `❌ Error: ${error.message}` });
  }
}
