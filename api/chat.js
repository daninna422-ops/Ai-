import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: "❌ Subuhana: POST requests kawai aka amince da su." });

  try {
    const { message, image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ Kuskure: Baka saka GEMINI_API_KEY a Vercel Environment Variables ba." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contents = [];

    // 1. Saka rubutun umarni
    const promptText = message || "Generate complete, functional web code based on this visual interface structure.";
    contents.push(promptText);

    // 2. Sarrafa Hoto idan an tura
    if (image && typeof image === 'string' && image.includes('base64,')) {
      try {
        const parts = image.split(';base64,');
        const mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        const base64Data = parts[1];

        if (base64Data) {
          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }
      } catch (imgErr) {
        console.error("Kuskuren sarrafa hoto:", imgErr);
      }
    }

    // Tura sako zuwa Gemini API
    const result = await model.generateContent(contents);
    const response = await result.response;
    const responseText = response.text();

    return res.status(200).json({ reply: responseText });

  } catch (error) {
    console.error("Critical Server Error:", error);
    return res.status(200).json({ 
      reply: `❌ Kuskuren Gemini Server: ${error.message || 'An samu matsalolin haɗi'}` 
    });
  }
}
