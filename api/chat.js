export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ reply: "POST requests kawai." });

  try {
    const { message, image, step } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ API Key ba ta samamu ba a Vercel Variables." });
    }

    // Amfani da sabon model na gemini-3.6-flash wanda Google ke buqata yanzu
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let promptText = message || "Generate web app code for this step.";
    if (step === 1) promptText = `Generate valid raw HTML login layout with Tailwind CSS for: ${message || 'Login page'}`;
    if (step === 2) promptText = `Generate valid raw HTML dashboard layout with Tailwind CSS for: ${message || 'Dashboard page'}`;
    if (step === 3) promptText = `Generate valid JavaScript app logic for: ${message || 'App features'}`;
    if (step === 4) promptText = `Generate custom CSS styles for: ${message || 'UI styling'}`;

    let parts = [{ text: promptText }];

    // Sarrafa Hoto idan an aiko shi
    if (image && typeof image === 'string' && image.includes('data:image')) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];

      if (base64Data) {
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }
    }

    // Aika buƙata ta REST Fetch
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
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: aiReply });
    } else {
      return res.status(200).json({ reply: "❌ Google API ba ta dawo da sakamako mai kyau ba." });
    }

  } catch (error) {
    console.error("Direct Fetch Error:", error);
    return res.status(200).json({ reply: `❌ Fetch Error: ${error.message}` });
  }
}
