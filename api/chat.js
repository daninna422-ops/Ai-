import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ reply: "❌ POST requests kawai aka amince." });

  try {
    const { message, image, step } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ GEMINI_API_KEY baha sa a Vercel Environment Variables ba." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Amfani da sabon model mai sauri wajen gina code da Vision
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 3000,
        temperature: 0.1
      }
    });

    let promptText = "Generate clean code only. No markdown text.";
    if (step === 1) promptText = "Build responsive Tailwind login HTML screen based on this reference.";
    if (step === 2) promptText = "Build responsive Tailwind dashboard HTML layout based on this reference.";
    if (step === 3) promptText = "Build vanilla JS app.js logic code for this web application.";
    if (step === 4) promptText = "Build custom CSS styles in style.css.";

    let contents = [promptText, message || ""];

    // Karbar Hoto
    if (image && typeof image === 'string' && image.includes('data:image')) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];

      if (base64Data) {
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    const result = await model.generateContent(contents);
    const response = await result.response;
    return res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(200).json({ reply: `❌ Kuskure: ${error.message}` });
  }
}
