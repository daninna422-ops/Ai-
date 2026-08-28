import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Sharuɗɗan Tsaro da CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST requests only' });
  }

  try {
    const { message, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Dan Allah saka rubutu ko hoto.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY baki ganta a Vercel Environment Variables ba.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Yin amfani da model mai ƙarfin ganin hoto da gina code (gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let promptContents = [];

    // 1. Idan mutum ya aiko rubutu
    if (message) {
      promptContents.push(message);
    }

    // 2. Idan mutum ya aiko hoto (Base64)
    if (image) {
      // Fitad da ainihin data daga base64 header (data:image/png;base64,...)
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];

        promptContents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      } else {
        // Idan babu header direct base64 string aka tura
        promptContents.push({
          inlineData: {
            mimeType: 'image/png',
            data: image
          }
        });
      }
    }

    // Tura umarnin zuwa Gemini Vision API
    const result = await model.generateContent(promptContents);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Kuskuren Server:", error);
    return res.status(500).json({ 
      error: 'An samu kuskure wajen sarrafa sakon.',
      details: error.message 
    });
  }
}
