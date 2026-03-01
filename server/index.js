const express = require('express');
const cors = require('cors');
require('dotenv').config();

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

app.get('/test-qr', (req, res) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, 'test_qr.html'), 'utf8');
    res.send(html);
  } catch (e) {
    res.status(500).send('Error loading test page: ' + e.message);
  }
});

// WhatsApp SaaS Module
const whatsappSaasRouter = require('./services/whatsappSaas');
app.use('/webhook/whatsapp', whatsappSaasRouter);


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


app.get('/api/admin/users', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'DB not connected' });

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, goal, level, usage_count, is_premium, created_at, last_active')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 for performance

    if (error) throw error;

    // Transform for frontend
    const users = data.map(u => ({
      id: u.id,
      email: u.email || 'No Email', // Supabase Auth might separate email, but profiles might have it if synced
      progress: `Nivel ${u.level || '?'} (${u.goal || 'General'})`,
      type: u.is_premium ? 'Premium' : 'Free',
      usage: u.usage_count,
      last_active: u.last_active ? new Date(u.last_active).toLocaleDateString() : 'N/A'
    }));

    res.json(users);
  } catch (err) {
    console.error('Admin Users Error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin Config Endpoint (For Provider Switcher)
const aiRouter = require('./services/aiRouter'); // Ensure this is singleton
app.get('/api/admin/config', (req, res) => {
  res.json({
    force_provider: aiRouter.override || 'auto',
    ab_ratio: aiRouter.abRatio
  });
});

app.post('/api/admin/config', (req, res) => {
  const { provider } = req.body;
  // provider: 'premium' | 'challenger' | 'auto' (null)
  const overrideVal = provider === 'auto' ? null : provider;

  if (provider) {
    aiRouter.setOverride(overrideVal);
    res.json({ success: true, message: `Provider forced to ${overrideVal || 'AUTO'}` });
  } else {
    res.status(400).json({ error: 'Missing provider' });
  }
});

const { buildCurriculum } = require('./scenarios');

app.get('/api/scenarios', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const userId = req.query.userId;
    let completedScenarios = [];

    // Fetch student progress from DB
    if (userId && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('student_progress')
        .select('scenario_id')
        .eq('user_id', userId)
        .eq('status', 'completed');
      if (data) completedScenarios = data.map(d => d.scenario_id);
    }

    const curriculum = buildCurriculum(lang, completedScenarios);
    res.json(curriculum);
  } catch (err) {
    console.error('Scenarios Error:', err);
    // Fallback: return basic curriculum without progress
    res.json(buildCurriculum(req.query.lang || 'en', []));
  }
});

const getSystemMessage = (scenarioId, lang = 'en') => {
  const curriculum = buildCurriculum(lang, []);
  for (const level of curriculum) {
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

const { generateResponse, generateAudio, getSpeakGoPrompt, cleanTextForTTS } = require('./services/aiRouter');

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

    let systemPrompt = 'You are a helpful tutor.';
    let language = 'en';
    let level = 'A1';

    if (userId && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        level = profile.level || 'A1';
        // Try to infer language from goal or default to EN
        if (profile.goal && profile.goal.toLowerCase().includes('alem')) language = 'de';
        else if (profile.goal && profile.goal.toLowerCase().includes('fran')) language = 'fr';

        systemPrompt = getSpeakGoPrompt(language, level);
      }
    }

    // If scenarioId is present, we might want to append scenario context?
    // For now, let's trust the Syllabus Prompt as the core.

    // Extract user message and history
    const userLastMsg = messages[messages.length - 1].content;
    const history = messages.slice(0, -1);

    const aiRawResponse = await generateResponse(userLastMsg, systemPrompt, history);

    // Parse JSON from AI (SpeakGo now outputs structured data)
    let aiContent = { message: aiRawResponse, correction: null, tip: null };

    try {
      const cleanJson = aiRawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.message) aiContent.message = parsed.message;
      if (parsed.correction) aiContent.correction = parsed.correction;
      if (parsed.tip) aiContent.tip = parsed.tip;
    } catch (e) {
      console.warn("AI JSON Parse failed in /api/chat, falling back to raw text");
    }

    res.json({
      role: 'assistant',
      content: aiContent.message,
      correction: aiContent.correction,
      tip: aiContent.tip
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



    // 1. STT: Usamos OpenAI Whisper para transcribir (más estable que Gemini)
    currentStage = 'STT (Whisper)';

    // Debug: Ver qué archivo recibimos
    console.log('📁 Archivo recibido:', {
      originalname: audioFile.originalname,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      path: audioFile.path
    });

    // FIX: Multer guarda archivos SIN extensión. Whisper necesita la extensión .webm
    // para detectar el formato correctamente.
    const originalPath = audioFile.path;
    const newPath = originalPath + '.webm';

    console.log('🔄 Renombrando archivo:', originalPath, '→', newPath);
    fs.renameSync(originalPath, newPath);

    console.log('🎤 Transcribiendo audio con OpenAI Whisper...');

    let userText = ''; // Declarar fuera del try

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(newPath),
        model: 'whisper-1',
        language: 'en', // Puedes cambiar según el idioma del usuario
      });

      userText = transcription.text.trim();
      console.log('✅ Whisper STT exitoso:', userText);

      // Limpiar el archivo renombrado
      cleanup(newPath);

      if (!userText) {
        return res.json({
          userText: "",
          assistantText: "No te escuché bien, ¿podrías repetir?",
          feedbackText: null,
          audioBase64: null
        });
      }
    } catch (whisperError) {
      console.error('❌ Error en Whisper STT:', whisperError.message);
      // Limpiar archivo en caso de error
      if (fs.existsSync(newPath)) cleanup(newPath);
      throw whisperError; // Re-lanzar para que lo maneje el catch principal
    }

    // 2. Chat: Use aiRouter (Gemini Flash)
    currentStage = 'LLM (Chat)';

    let systemPrompt = getSpeakGoPrompt('en', 'A1'); // Default

    if (userId && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        const lang = (profile.goal && profile.goal.toLowerCase().includes('alem')) ? 'de' :
          (profile.goal && profile.goal.toLowerCase().includes('fran')) ? 'fr' : 'en';
        systemPrompt = getSpeakGoPrompt(lang, profile.level || 'A1');
      }
    }

    // Append JSON instruction specifically for Speak mode
    const jsonInstruction = `
        IMPORTANT: You must respond in valid JSON format with two fields:
        1. "dialogue": The spoken response to the user (Keep it conversational and brief).
        2. "feedback": Any corrections, grammar tips, or suggestions (in the user's language). If perfect, this can be null or empty.
        Example: { "dialogue": "Bonjour! Un café?", "feedback": "Dijiste 'un cafe', recuerda el acento." }
        RETURN ONLY JSON.`;

    const combinedPrompt = systemPrompt; // getSpeakGoPrompt now includes JSON instructions

    // Call Router
    const aiRawResponse = await generateResponse(userText, combinedPrompt, []);

    // Parse JSON
    let cleanJson = aiRawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    let aiContent = { message: aiRawResponse, correction: null, tip: null };
    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.message) aiContent.message = parsed.message;
      if (parsed.correction) aiContent.correction = parsed.correction;
      if (parsed.tip) aiContent.tip = parsed.tip;
    } catch (e) {
      console.warn("AI JSON Parse failed in /api/speak, fallback to raw text");
    }

    let assistantText = cleanTextForTTS(aiContent.message);
    const feedbackText = aiContent.correction || aiContent.tip;

    // CRITICAL FIX: If AI fails or returns empty, provide a fallback message to prevent ElevenLabs 422
    if (!assistantText || assistantText.trim().length === 0) {
      console.warn("⚠️ AI Response was empty. Using fallback message.");
      assistantText = "Lo siento, tuve un problema técnico. ¿Podrías repetirlo?";
    }

    console.log('AI Dialogue:', assistantText);
    console.log('AI Feedback:', feedbackText);

    // 3. TTS: ElevenLabs (Premium Stable Solution)
    currentStage = 'TTS (ElevenLabs)';
    const crypto = require('crypto');
    const cacheDir = 'audio_cache';
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Ajustamos la voz según el idioma (ID de prueba por defecto)
    const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
    const hash = crypto.createHash('md5').update(assistantText + ELEVENLABS_VOICE_ID).digest('hex');
    const cachePath = path.join(cacheDir, `${hash}.mp3`);

    let audioBase64;

    if (fs.existsSync(cachePath)) {
      console.log('✅ Serving from CACHE (Speed optimized) 💰');
      audioBase64 = fs.readFileSync(cachePath).toString('base64');
    } else {
      audioBase64 = await generateAudio(assistantText);
      if (audioBase64) {
        fs.writeFileSync(cachePath, Buffer.from(audioBase64, 'base64'));
      }
    }

    res.json({
      userText,
      assistantText,
      feedbackText,
      audioBase64
    });

  } catch (error) {
    const errorData = error.response ? (error.response.data instanceof Buffer ? error.response.data.toString() : JSON.stringify(error.response.data)) : error.message;
    console.error(`Error in /api/speak [${currentStage}]:`, errorData);
    res.status(500).json({
      error: 'Processing failed',
      stage: currentStage,
      details: errorData
    });
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
