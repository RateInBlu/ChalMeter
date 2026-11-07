import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support image uploads up to 20MB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side Gemini AI client initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    service: 'ChalMeter India Backend',
    geminiConfigured: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Vehicle OCR & Identification API
app.post('/api/ocr/scan', async (req: Request, res: Response) => {
  try {
    const { imageDataUrl } = req.body;

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid request: imageDataUrl is required as a base64 string.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(200).json({
        success: false,
        fallback: true,
        message: 'Gemini API key is not configured on the server. Falling back to browser OCR engine.',
      });
      return;
    }

    const base64Data = imageDataUrl.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');
    const mimeMatch = imageDataUrl.match(/^data:(image\/[a-z0-9-+.]+);base64,/i);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const prompt = `Analyze this vehicle photograph in India.
Inspect the High Security Registration Plate (HSRP) and vehicle body.

STRICT INSTRUCTIONS:
1. NEVER invent or hallucinate missing registration plate characters.
2. If any character is obscured, cropped, or ambiguous, insert '?' for that character (e.g. "DL 01 ?? 1234").
3. Determine predominant vehicle colour accurately.
4. Identify vehicle make, model, and vehicle type.
5. Identify the plate category (Private White, Commercial Yellow, Electric Green, Rental Black).

Return a strict JSON object with:
- "registrationNumber": string, exactly what is legible on plate e.g. "DL 01 AB 1234"
- "make": string e.g. "Tata", "Mahindra", "Maruti Suzuki", "Hyundai", "Toyota", "Kia", "Honda", or "Unknown"
- "model": string e.g. "Nexon", "Thar", "Creta", "Swift", "Fortuner", or "Vehicle"
- "colour": string e.g. "White", "Black", "Silver Grey", "Red", "Blue", "Brown", "Yellow"
- "vehicleType": one of ["Car / SUV", "Hatchback", "Sedan", "Two-Wheeler / Bike", "Auto Rickshaw", "Commercial / Bus / Truck"]
- "plateType": one of ["White (Private)", "Yellow (Commercial)", "Green (Electric EV)", "Black (Self-Drive / Rental)"]
- "confidence": integer between 40 and 99
- "needsManualVerification": boolean (true if any character was ambiguous or plate partially hidden)
- "verificationReason": string (brief explanation if manual verification is needed)
`;

    let rawText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastErr: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                registrationNumber: { type: Type.STRING },
                make: { type: Type.STRING },
                model: { type: Type.STRING },
                colour: { type: Type.STRING },
                vehicleType: { type: Type.STRING },
                plateType: { type: Type.STRING },
                confidence: { type: Type.INTEGER },
                needsManualVerification: { type: Type.BOOLEAN },
                verificationReason: { type: Type.STRING },
              },
              required: [
                'registrationNumber',
                'make',
                'model',
                'colour',
                'vehicleType',
                'plateType',
                'confidence',
                'needsManualVerification',
              ],
            },
          },
        });

        rawText = response.text?.trim() || '';
        if (rawText) {
          lastErr = null;
          break;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`Attempt with ${model} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!rawText && lastErr) {
      throw lastErr;
    }
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    res.json({
      success: true,
      data: parsedData,
      rawTextFound: rawText,
    });
  } catch (error: any) {
    console.error('Gemini vision extraction error:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process vehicle image via Gemini vision API.',
    });
  }
});

// Setup Vite dev server middleware or serve production build
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChalMeter] Server listening at http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ChalMeter server:', err);
  process.exit(1);
});
