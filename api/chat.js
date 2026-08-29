import { GoogleGenerativeAI } from '@google/generative-ai';

// Daidaita nauyin sako don kare sabar daga ambaliyar bayanai (Vercel payload limits)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Karɓar Sharuɗɗan Tsaro da Haɗin gizo (CORS Headers)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ reply: "❌ Kuskure: Ana karɓar buƙatar POST kawai." });
  }

  try {
    const { message, image, step } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ 
        reply: "❌ GEMINI_API_KEY ba ta samamu ba. Tabbatar ka saka ta a Vercel Settings -> Environment Variables." 
      });
    }

    // Fara haɗawa da Google Gemini Engine
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.2
      }
    });

    // Gina System Prompt dangane da matakin ginin app (Step 1 - Step 4)
    let stepInstructions = "";
    if (step === 1) {
      stepInstructions = "SYSTEM INSTRUCTION: You are an expert front-end developer. Generate ONLY valid raw code for `login.html`. Build a complete, functional UI with user authentication screens, forms, input validation, clean responsive design, and CSS using Tailwind CDN. Do not return markdown chatter outside the code.";
    } else if (step === 2) {
      stepInstructions = "SYSTEM INSTRUCTION: You are an expert UI/UX developer. Generate ONLY valid raw code for `dashboard.html`. Build a full high-end web dashboard screen with sidebar, cards, tables, charts shell, and dynamic header based on the input image or text. Do not return markdown chatter outside code.";
    } else if (step === 3) {
      stepInstructions = "SYSTEM INSTRUCTION: You are a JavaScript engineer. Generate ONLY valid raw JavaScript code for `app.js`. Include dynamic functional logic, DOM manipulation, authentication state handling, and interactive features for the layout previously built.";
    } else if (step === 4) {
      stepInstructions = "SYSTEM INSTRUCTION: You are a CSS designer. Generate ONLY clean pure CSS rules for `style.css` to polish animations, custom scrollbars, dark-mode elements, and typography.";
    }

    let contents = [stepInstructions, message || "Gina lambobi masu inganci a aikace dangane da wannan samfurin."];

    // Sarrafa hoto idan an aiko shi ta hanyan Base64
    if (image && typeof image === 'string' && image.includes('data:image')) {
      try {
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
      } catch (e) {
        console.error("Kuskuren sarrafa Tsarin Hoto:", e);
      }
    }

    // Aikawa da nema zuwa ga Gemini Engine
    const result = await model.generateContent(contents);
    const response = await result.response;
    const textResult = response.text();

    return res.status(200).json({ reply: textResult });

  } catch (error) {
    console.error("Critical Gemini Server Error:", error);
    return res.status(200).json({ 
      reply: `❌ Kuskure daga Server: ${error.message || 'Hana haɗuwa da tsarin sabar'}` 
    });
  }
}
