const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper to delete file
const cleanup = (filePath) => {
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
        console.error('Error cleaning up file:', e);
    }
};

/**
 * Orchestrates the Interpreter Flow:
 * Audio -> Text (Source) -> Text (Target) -> Audio (Target)
 */
const processTranslation = async ({ audioPath, fromLang, toLang, userId }) => {
    try {
        console.log(`🌐 Translating for ${userId} [${fromLang} -> ${toLang}]`);

        // 1. STT: Whisper (Transcribe Source)
        // We add a prompt to guide Whisper if we know the source language
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioPath));
        formData.append('model', 'whisper-1');
        formData.append('language', fromLang); // Hint to improve accuracy

        const sttResponse = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );
        const originalText = sttResponse.data.text;
        console.log(`🎤 Heard (${fromLang}): "${originalText}"`);

        // 2. LLM: Contextual Translation
        // We ask GPT to act as a professional interpreter
        const systemPrompt = `You are a professional simultaneous interpreter. 
    Your task is to translate the user's input from ${fromLang} to ${toLang}.
    - Maintain the tone, emotion, and nuance.
    - Output ONLY the translated text. Do not add explanations or notes.
    - If the input is empty or unintelligible, reply with "..."`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: originalText }
            ],
        });

        const translatedText = completion.choices[0].message.content;
        console.log(`🗣️ Translated (${toLang}): "${translatedText}"`);

        // 3. TTS: ElevenLabs (Generate Target Audio)
        // We use a high-performance model for low latency
        const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default generic voice, could be dynamic based on gender/lang

        // ElevenLabs Multilingual Model is best for accents
        const ttsResponse = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                text: translatedText,
                model_id: "eleven_multilingual_v2", // Better for non-English
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            },
            {
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

        return {
            originalText,
            translatedText,
            audioBase64
        };

    } catch (error) {
        console.error('Translation Service Error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { processTranslation };
