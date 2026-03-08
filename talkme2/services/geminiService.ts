
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getTutorSystemPrompt } from "../constants";
import { CEFRLevel, Language, TutorFeedback, LANGUAGE_TTS_CODES } from "../types";

// The API key is injected via environment variables.
const API_KEY = import.meta.env.VITE_API_KEY as string;

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!API_KEY) {
      console.error("⚠️ VITE_API_KEY not found in environment");
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  async generateResponse(
    message: string,
    level: CEFRLevel,
    language: Language,
    history: { role: 'user' | 'model', parts: { text: string }[] }[]
  ): Promise<TutorFeedback> {
    const systemInstruction = getTutorSystemPrompt(level, language);

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            response_text: { type: SchemaType.STRING },
            corrections: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            grammar_tip: { type: SchemaType.STRING },
            vocabulary_check: { type: SchemaType.STRING }
          },
          required: ["response_text"]
        }
      }
    });

    try {
      const chat = model.startChat({
        history: history
      });

      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      return JSON.parse(responseText || '{}') as TutorFeedback;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return { response_text: "I'm sorry, I had trouble processing that. Can you repeat?" };
    }
  }

  async generateSpeech(text: string, language: Language = 'English'): Promise<Uint8Array> {
    try {
      const langCode = LANGUAGE_TTS_CODES[language] || 'en';
      // Truncate text if too long for TTS endpoint (max ~200 chars works best)
      const truncated = text.length > 200 ? text.substring(0, 197) + '...' : text;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${langCode}&client=tw-ob`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TTS returned ${response.status}`);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (error) {
      console.error("TTS error:", error);
      throw new Error("No audio generated");
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const base64Data = await base64Promise;
      const mimeType = audioBlob.type.includes('mp4') ? 'audio/mp4' : 'audio/webm';

      const result = await model.generateContent([
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: "Transcribe exactly what the audio says. Return only the text without markdown or commentary." }
      ]);

      return result.response.text().trim();
    } catch (error) {
      console.error("STT Failed:", error);
      return "";
    }
  }
}

export const gemini = new GeminiService();
