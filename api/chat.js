export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ reply: "POST requests kawai." });

  try {
    const { message, step, supabaseUrl, supabaseKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ API Key ba ta samamu ba." });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let systemContext = `STRICT RULE: Output ONLY runnable code inside markdown blocks.
    Supabase URL: ${supabaseUrl || 'YOUR_SUPABASE_URL'}
    Supabase Key: ${supabaseKey || 'YOUR_SUPABASE_ANON_KEY'}
    MUST include <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> inside HTML.
    MUST include complete embedded working JavaScript script tag at the bottom of login.html to handle register & login directly with Supabase. Do not cut off the JS script tag.`;

    let promptText = message || "Build dynamic code.";
    if (step === 1) {
      promptText = `${systemContext}\nGenerate lean functional login.html with Tailwind CSS and full functional Supabase Auth/Profiles JS script attached at the bottom. Prompt: "${message}". Wrap in \`\`\`html.`;
    }
    if (step === 2) {
      promptText = `${systemContext}\nGenerate functional dynamic dashboard.html with Tailwind CSS. Wrap in \`\`\`html.`;
    }
    if (step === 3) {
      promptText = `${systemContext}\nGenerate app.js for fetching real user profiles and balance from Supabase. Wrap in \`\`\`javascript.`;
    }
    if (step === 4) {
      promptText = `${systemContext}\nGenerate style.css. Wrap in \`\`\`css.`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `❌ API Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ reply: "❌ Engine ba ta iya samar da lambobin code ba." });
    }

  } catch (error) {
    return res.status(200).json({ reply: `❌ Fetch Error: ${error.message}` });
  }
}
