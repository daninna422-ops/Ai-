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

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let systemContext = `CRITICAL MANDATE:
    1. DO NOT hardcode mock names (e.g. "Mubarak Ibrahim") or fake static balances (e.g. "150,000").
    2. All data MUST come dynamically from Supabase JS client.
    3. Include CDN for Supabase JS: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    4. Initialize Supabase: const supabase = window.supabase.createClient('${supabaseUrl || 'YOUR_SUPABASE_URL'}', '${supabaseKey || 'YOUR_SUPABASE_ANON_KEY'}');
    5. On Register: Execute supabase.from('profiles').insert([{ full_name, phone, pin, balance: 0 }]) and auth signup.
    6. On Login: Query Supabase profiles table, verify PIN/Phone, fetch REAL user name & dynamic balance.
    7. On Transfer/TopUp: Update Supabase profiles balance & insert transaction history into Supabase 'transactions' table.
    8. Output ONLY runnable code wrapped in markdown blocks.`;

    let promptText = message || "Build functional dynamic code.";
    if (step === 1) {
      promptText = `${systemContext}\nGenerate complete functional login.html with Tailwind CSS and full multi-step OTP/Registration UI connected directly to Supabase JS Auth & Database. Prompt: "${message}". Wrap in \`\`\`html.`;
    }
    if (step === 2) {
      promptText = `${systemContext}\nGenerate functional dashboard.html with Tailwind CSS. Include dynamic placeholders like <span id="userName">Cargando...</span> and <span id="userBalance">₦0.00</span> that will be populated dynamically from Supabase by app.js. Wrap in \`\`\`html.`;
    }
    if (step === 3) {
      promptText = `${systemContext}\nGenerate fully functional app.js using active Supabase JS SDK. Implement real dynamic register, real login, fetch user profile (name, account number, balance), transfer money logic updating Supabase tables, and active button click event handlers. Prompt: "${message}". Wrap in \`\`\`javascript.`;
    }
    if (step === 4) {
      promptText = `${systemContext}\nGenerate CSS styling for style.css. Wrap in \`\`\`css.`;
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
