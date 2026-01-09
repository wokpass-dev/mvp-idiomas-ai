const { translateWithDeepSeek } = require('./adapters/deepseek');
// Lazy load these to avoid crashing if deps/keys are missing immediately
const getDeepgram = () => require('./adapters/deepgram');
const getGoogle = () => require('./adapters/google');

// --- PROVIDER CONFIGURATION ---
const PROVIDERS = {
    PREMIUM: {
        id: 'premium',
        stt: 'openai-whisper',
        llm: 'gpt-4o',
        tts: 'elevenlabs'
    },
    CHALLENGER: {
        id: 'challenger',
        stt: 'deepgram',
        llm: 'deepseek-chat',
        tts: 'google-neural'
    }
};

/**
 * AI ROUTER
 * Decides which provider stack to use based on user segment or A/B logic.
 */
class AIRouter {
    constructor() {
        this.abRatio = parseFloat(process.env.AB_TEST_RATIO || '0');
    }

    getRoute(userId) {
        if (!userId) return PROVIDERS.PREMIUM;

        // Simple deterministic hash of userId
        const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const normalizedHash = (userHash % 100) / 100;

        if (normalizedHash < this.abRatio) {
            console.log(`[AI-ROUTER] Routing ${userId} to CHALLENGER (DeepSeek/Deepgram/Google)`);
            return PROVIDERS.CHALLENGER;
        } else {
            console.log(`[AI-ROUTER] Routing ${userId} to PREMIUM (OpenAI/ElevenLabs)`);
            return PROVIDERS.PREMIUM;
        }
    }

    // --- METHODS ---

    async transcribe(audioPath, lang, providerConfig) {
        if (providerConfig.stt === 'deepgram') {
            try {
                const { transcribeWithDeepgram } = getDeepgram();
                return await transcribeWithDeepgram(audioPath, lang);
            } catch (e) {
                console.error("Deepgram Error (Falling back to default):", e.message);
                return null; // Return null to trigger fallback
            }
        }
        return null; // Default (Whisper)
    }

    async translate(text, fromLang, toLang, providerConfig) {
        if (providerConfig.llm === 'deepseek-chat') {
            try {
                return await translateWithDeepSeek(text, fromLang, toLang);
            } catch (e) {
                console.error("DeepSeek Error (Fallback):", e.message);
                return null;
            }
        }
        return null; // Default (OpenAI)
    }

    async speak(text, lang, providerConfig) {
        if (providerConfig.tts === 'google-neural') {
            try {
                const { speakWithGoogle } = getGoogle();
                return await speakWithGoogle(text, lang);
            } catch (e) {
                console.error("Google TTS Error (Fallback):", e.message);
                return null;
            }
        }
        return null; // Default (ElevenLabs)
    }
}

module.exports = new AIRouter();
