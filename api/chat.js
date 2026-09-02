export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ reply: "POST requests kawai." });

  try {
    const { message, image, step, supabaseUrl, supabaseKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ API Key ba ta samamu ba." });
    }

    // Amfani da sabon endpoint na gemini-3.6-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let systemContext = `STRICT RULE: Output ONLY functional executable code wrapped strictly in standard markdown block. Do NOT write conversational intros or prose.
    Use Supabase CDN (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2) for active database interaction.
    Supabase URL: ${supabaseUrl || 'YOUR_SUPABASE_URL'}
    Supabase Key: ${supabaseKey || 'YOUR_SUPABASE_ANON_KEY'}
    CRITICAL: Make ALL buttons interactive (attach onclick handlers, form submission handlers, dynamic data binding, and Supabase JS calls). Do not generate static unclickable buttons.`;

    let promptText = message || "Build functional code.";
    if (step === 1) {
      promptText = `${systemContext}\nGenerate complete functional login.html with Tailwind CSS based on user prompt: "${message}". Wrap strictly in \`\`\`html.`;
    }
    if (step === 2) {
      promptText = `${systemContext}\nGenerate functional dashboard.html with Tailwind CSS based on user prompt: "${message}". Wrap strictly in \`\`\`html.`;
    }
    if (step === 3) {
      promptText = `${systemContext}\nGenerate fully functional app.js for Supabase Auth, OTP, PIN, and database interactions based on prompt: "${message}". Wrap strictly in \`\`\`javascript.`;
    }
    if (step === 4) {
      promptText = `${systemContext}\nGenerate CSS styling for style.css. Wrap strictly in \`\`\`css.`;
    }

    let parts = [{ text: promptText }];

    if (image && typeof image === 'string' && image.includes('data:image')) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];

      if (base64Data) {
        parts.push({
          inline_data: { mime_type: mimeType, data: base64Data }
        });
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: parts }] })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `❌ Google API Error: ${data.error.message}` });
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
