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
  try {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
  } catch (e) { console.error('Cleanup error:', e); }
};

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseAdmin = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const OpenAI = require('openai');
// Fix 401: Trim API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '',
});

app.use(express.urlencoded({ extended: true }));

const whatsappRouter = require('./whatsapp');
app.use('/api/whatsapp', whatsappRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    server: 'mvp-idiomas-server',
    checks: {
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      supabase_url: !!process.env.SUPABASE_URL
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MVP Idiomas AI Server Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug-config', (req, res) => {
  res.json({
    has_openai: !!process.env.OPENAI_API_KEY,
    has_supabase_url: !!process.env.SUPABASE_URL,
    has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_anon_key: !!process.env.SUPABASE_ANON_KEY,
    supabase_admin_ready: !!supabaseAdmin,
    env_port: process.env.PORT
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json([
    { id: 'usr_123', email: 'gabriel@ejemplo.com', progress: 'Nivel A2 (En curso)', last_active: '2026-01-05' },
    { id: 'usr_456', email: 'demo@idiomas.ai', progress: 'Nivel B1 (Completado)', last_active: '2026-01-04' },
    { id: 'usr_789', email: 'test@cliente.com', progress: 'Nivel A1 (Inicio)', last_active: '2026-01-04' }
  ]);
});

const scenarios = require('./scenarios');

app.get('/api/scenarios', (req, res) => {
  res.json(scenarios);
});

const getSystemMessage = (scenarioId) => {
  for (const level of scenarios) {
    if (level.modules) {
      for (const module of level.modules) {
        if (module.lessons) {
          const lesson = module.lessons.find(l => l.id === scenarioId);
          if (lesson) {
            return { role: 'system', content: lesson.system_prompt };
          }
        }
      }
    }
  }
  return { role: 'system', content: 'You are a helpful language tutor (Default Context).' };
};

const { getPlanConfig } = require('./services/profileRules');

const checkUsage = async (userId) => {
  if (!userId || !supabaseAdmin) return { allowed: true };
  try {
    let { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('usage_count, is_premium')
      .eq('id', userId)
      .single();

    if (!profile && (!selectError || selectError.code === 'PGRST116')) {
      console.log('⚠️ Profile missing. Creating default profile...');
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: userId, usage_count: 0, is_premium: false }])
        .select()
        .single();
      if (createError) {
        console.error('Error creating profile:', createError);
        return { allowed: false, error: 'User profile error' };
      }
      profile = newProfile;
    }

    if (profile) {
      const planConfig = getPlanConfig(profile);
      const DAILY_LIMIT = planConfig.limits.dailyMessages || 5;

      console.log(`📊 Usage: ${profile.usage_count}/${DAILY_LIMIT} | Premium: ${profile.is_premium} | Plan: ${planConfig.planId}`);

      if (!profile.is_premium && profile.usage_count >= DAILY_LIMIT) {
        console.log('🛑 Limit Reached. Blocking.');
        return {
          allowed: false,
          status: 402,
          message: `Has alcanzado tu límite diario de ${DAILY_LIMIT} mensajes. Actualiza tu plan para continuar.`
        };
      }

      supabaseAdmin.rpc('increment_usage', { user_id: userId }).then(({ error }) => {
        if (error) console.error('Error Incrementing Usage:', error);
      });

      return { allowed: true };
    }
  } catch (err) {
    console.error('Freemium Check Check Error:', err);
    return { allowed: true };
  }
  return { allowed: true };
};

app.post('/api/profile', async (req, res) => {
  const { userId, goal, level, interests, age } = req.body;
  if (!supabaseAdmin) return res.status(500).json({ error: 'DB not connected' });

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        goal,
        level,
        interests,
        age,
        onboarding_completed: true
      });

    if (error) throw error;
    res.json({ success: true, message: 'Profile saved' });
  } catch (err) {
    console.error('Profile Save Error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!supabaseAdmin) return res.status(500).json({ error: 'DB not connected' });

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;
  const validCodes = (process.env.STUDENT_ACCESS_CODES || '').split(',');
  if (validCodes.includes(code)) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, scenarioId, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const usageCheck = await checkUsage(userId);
    if (!usageCheck.allowed) {
      return res.status(usageCheck.status || 402).json({
        error: 'Limit Reached',
        message: usageCheck.message || 'Has alcanzado tu límite.'
      });
    }

    let systemMsg = { role: 'system', content: 'You are a helpful tutor.' };

    if (userId && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile && profile.goal) {
        const planConfig = getPlanConfig(profile);
        systemMsg = planConfig.systemPrompt;
        console.log(`🧠 Rule Engine for ${userId}: Plan=${planConfig.planId}`);
      } else {
        systemMsg = getSystemMessage(scenarioId);
      }
    } else {
      systemMsg = getSystemMessage(scenarioId);
    }

    const userMessages = messages.filter(m => m.role !== 'system');
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

const { processTranslation } = require('./services/translator');

app.post('/api/translate', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  const { userId, fromLang, toLang } = req.body;

  if (!audioFile) return res.status(400).json({ error: 'No audio provided' });

  try {
    const result = await processTranslation({
      audioPath: audioFile.path,
      fromLang: fromLang || 'es',
      toLang: toLang || 'en',
      userId
    });

    res.json(result);

  } catch (error) {
    console.error('Translation Endpoint Error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  } finally {
    cleanup(audioFile.path);
  }
});

// Speak Endpoint
app.post('/api/speak', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: 'No audio file uploaded', message: 'No se recibió el archivo de audio. (Error 400)' });
  }

  let currentStage = 'INIT';

  try {
    const userId = req.body.userId;
    const usageCheck = await checkUsage(userId);
    if (!usageCheck.allowed) {
      if (req.file && req.file.path) cleanup(req.file.path);
      return res.status(usageCheck.status || 402).json({
        error: 'Limit Reached',
        message: usageCheck.message || 'Has alcanzado tu límite.'
      });
    }

    // 1. STT: Send to OpenAI Whisper
    currentStage = 'STT (Whisper)';
    const path = require('path');
    const ext = path.extname(audioFile.originalname) || '.m4a';

    // Fix: Explicitly declare formData
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.path), `audio${ext}`);
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          // Fix 401: Trim API Key here as well
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : ''}`
        }
      }
    );
    const userText = transcriptionResponse.data.text;
    console.log('User said:', userText);

    // 2. Chat: Send text to GPT
    currentStage = 'LLM (Chat)';
    const scenarioId = req.body.scenarioId;
    let systemMsg = { role: 'system', content: 'You are a helpful tutor.' };

    if (userId && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile && profile.goal) {
        const planConfig = getPlanConfig(profile);
        systemMsg = planConfig.systemPrompt;
      } else {
        systemMsg = getSystemMessage(scenarioId);
      }
    } else {
      systemMsg = getSystemMessage(scenarioId);
    }

    const jsonSystemMsg = {
      role: 'system',
      content: `${systemMsg.content} 
        IMPORTANT: You must respond in valid JSON format with two fields:
        1. "dialogue": The spoken response to the user (Keep it conversational and brief).
        2. "feedback": Any corrections, grammar tips, or suggestions (in the user's language). If perfect, this can be null or empty.
        Example: { "dialogue": "Bonjour! Un café?", "feedback": "Dijiste 'un cafe', recuerda el acento." }`
    };

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        jsonSystemMsg,
        { role: 'user', content: userText }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(chatCompletion.choices[0].message.content);
    const assistantText = aiContent.dialogue;
    const feedbackText = aiContent.feedback;

    console.log('AI Dialogue:', assistantText);
    console.log('AI Feedback:', feedbackText);

    // 3. TTS: ElevenLabs
    currentStage = 'TTS (ElevenLabs)';
    const crypto = require('crypto');
    const cacheDir = 'audio_cache';
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
    const hash = crypto.createHash('md5').update(assistantText + ELEVENLABS_VOICE_ID).digest('hex');
    const cachePath = path.join(cacheDir, `${hash}.mp3`);

    let audioBase64;

    if (fs.existsSync(cachePath)) {
      console.log('Serving from CACHE (Money Saved!) 💰');
      const audioBuffer = fs.readFileSync(cachePath);
      audioBase64 = audioBuffer.toString('base64');
    } else {
      console.log('Generating new audio (API Call) 💸');

      // Fix 401: Trim API Key for ElevenLabs
      const elevenKey = process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.trim() : '';

      const ttsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          text: assistantText,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        },
        {
          headers: {
            'xi-api-key': elevenKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      fs.writeFileSync(cachePath, Buffer.from(ttsResponse.data));
      audioBase64 = Buffer.from(ttsResponse.data).toString('base64');
    }

    res.json({
      userText,
      assistantText,
      feedbackText,
      audioBase64
    });

  } catch (error) {
    console.error(`Error in /api/speak [${currentStage}]:`, error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Processing failed', stage: currentStage, details: error.message });
  } finally {
    if (audioFile) cleanup(audioFile.path);
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { data, error } = await supabaseAdmin
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const totalCost = data.reduce((acc, row) => acc + (row.cost_estimated || 0), 0);
    const deepSeekCount = data.filter(row => row.provider_llm === 'deepseek-chat').length;

    res.json({
      logs: data,
      summary: {
        total_cost_window: totalCost,
        deepseek_usage_pct: Math.round((deepSeekCount / data.length) * 100) || 0,
        cache_hits: data.filter(r => r.is_cache_hit).length
      }
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
