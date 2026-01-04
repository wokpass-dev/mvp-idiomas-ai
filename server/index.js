const express = require('express');
const cors = require('cors');
require('dotenv').config();


const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configure Multer for temp storage
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir + '/' });

// Helper: Delete file
const cleanup = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting file:', err);
  });
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MVP Idiomas AI Server Running',
    timestamp: new Date().toISOString()
  });
});

const scenarios = require('./scenarios');

// Get Scenarios
app.get('/api/scenarios', (req, res) => {
  res.json(scenarios);
});

// Helper to get system prompt
const getSystemMessage = (scenarioId) => {
  const scenario = scenarios.find(s => s.id === scenarioId);
  return scenario
    ? { role: 'system', content: scenario.system_prompt }
    : { role: 'system', content: 'You are a helpful language tutor.' }; // Default
};

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, scenarioId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Inject system prompt if it's the start or override
    // Simple strategy: Always prepend system prompt appropriate for the scenario
    // We filter out any existing system messages from client to avoid duplication if we want strict control
    const userMessages = messages.filter(m => m.role !== 'system');
    const systemMsg = getSystemMessage(scenarioId);

    const finalMessages = [systemMsg, ...userMessages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: finalMessages,
    });

    res.json({
      role: 'assistant',
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Speak Endpoint
app.post('/api/speak', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    // 1. STT: Send to OpenAI Whisper
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.path));
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    const userText = transcriptionResponse.data.text;
    console.log('User said:', userText);

    // 2. Chat: Send text to GPT
    // Note: We should maintain history ideally, but for MVP we might need to pass it from frontend or keep simple
    // For now, let's treat it as single turn or rely on frontend sending context (TODO: Refactor for history)
    // Let's assume we just reply to this statement for the "Speak" MVP demo. 
    // Ideally, frontend sends previous messages context. For now, simple reply.
    const scenarioId = req.body.scenarioId; // Copied from formData or body? Multer puts text fields in req.body
    const systemMsg = getSystemMessage(scenarioId);

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        systemMsg,
        { role: 'user', content: userText }
      ],
    });
    const assistantText = chatCompletion.choices[0].message.content;
    console.log('AI said:', assistantText);

    // 3. TTS: Send to ElevenLabs
    const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default Rachel
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: assistantText,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // Important for audio
      }
    );

    // 4. Return result
    // We send back JSON with text AND the audio as base64 (or link, but base64 is easier for simple MVP)
    const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

    res.json({
      userText,
      assistantText,
      audioBase64
    });

  } catch (error) {
    console.error('Error in /api/speak:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  } finally {
    cleanup(audioFile.path); // Clean up temp file
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
