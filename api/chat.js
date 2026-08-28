import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Bada damar karbar hotuna
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { message, image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: "❌ Kuskure: GEMINI_API_KEY baha sa a Vercel Environment Variables ba." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let promptContents = [];

    if (message) promptContents.push(message);

    if (image) {
      const base64Data = image.split(',')[1] || image;
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

      promptContents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const result = await model.generateContent(promptContents);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Vercel Backend Error:", error);
    return res.status(200).json({ reply: `❌ Kuskure daga Server/Gemini: ${error.message}` });
  }
}
