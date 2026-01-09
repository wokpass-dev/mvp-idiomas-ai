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

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins for MVP. For prod, could restrict to client URL.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Removed to fix Express 5 PathError
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const { createClient } = require('@supabase/supabase-js');

// Init Supabase Admin (Service Role)
// Falls back to ANON key if SERVICE key matches (for dev), but needs SERVICE for best security
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseAdmin = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Parsing middleware for Twilio (form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Routes
const whatsappRouter = require('./whatsapp');
app.use('/api/whatsapp', whatsappRouter);

// Health Check
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

// DEBUG: Check if Env Vars are loaded correctly
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

// Admin Enpoints
app.get('/api/admin/users', (req, res) => {
  // Mock data for MVP - In production this would query Supabase Admin API
  res.json([
    { id: 'usr_123', email: 'gabriel@ejemplo.com', progress: 'Nivel A2 (En curso)', last_active: '2026-01-05' },
    { id: 'usr_456', email: 'demo@idiomas.ai', progress: 'Nivel B1 (Completado)', last_active: '2026-01-04' },
    { id: 'usr_789', email: 'test@cliente.com', progress: 'Nivel A1 (Inicio)', last_active: '2026-01-04' }
  ]);
});


const scenarios = require('./scenarios');

// Get Scenarios
app.get('/api/scenarios', (req, res) => {
  res.json(scenarios);
});

// Helper to get system prompt
// Helper to get system prompt (Recursive Search)
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
  // Fallback
  return { role: 'system', content: 'You are a helpful language tutor (Default Context).' };
};

const { getPlanConfig } = require('./services/profileRules'); // Import Rule Engine

// Helper: Freemium Usage Check
const checkUsage = async (userId) => {
  if (!userId || !supabaseAdmin) return { allowed: true }; // Skip if no user or no db connection

  try {
    // 1. Check Profile
    let { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('usage_count, is_premium')
      .eq('id', userId)
      .single();

    // SELF-HEALING: If no profile exists (old user), create one
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
      // Get Plan Config to determine limits
      const planConfig = getPlanConfig(profile);
      const DAILY_LIMIT = planConfig.limits.dailyMessages || 5;

      console.log(`📊 Usage: ${profile.usage_count}/${DAILY_LIMIT} | Premium: ${profile.is_premium} | Plan: ${planConfig.planId}`);

      // 2. Enforce Limit
      if (!profile.is_premium && profile.usage_count >= DAILY_LIMIT) {
        console.log('🛑 Limit Reached. Blocking.');
        return {
          allowed: false,
          status: 402,
          message: `Has alcanzado tu límite diario de ${DAILY_LIMIT} mensajes. Actualiza tu plan para continuar.`
        };
      }

      // 3. Increment Usage (Fire and Forget)
      supabaseAdmin.rpc('increment_usage', { user_id: userId }).then(({ error }) => {
        if (error) console.error('Error Incrementing Usage:', error);
      });

      return { allowed: true };
    }
  } catch (err) {
    console.error('Freemium Check Error:', err);
    return { allowed: true }; // Fail open on DB error to avoid outage
  }
  return { allowed: true };
};

// --- PROFILE ENDPOINTS ---
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

// -------------------------

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, scenarioId, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // SERVER-SIDE FREEMIUM CHECK 🔒
    // SERVER-SIDE FREEMIUM CHECK 🔒
    const usageCheck = await checkUsage(userId);
    if (!usageCheck.allowed) {
      return res.status(usageCheck.status || 402).json({
        error: 'Limit Reached',
        message: usageCheck.message || 'Has alcanzado tu límite.'
      });
    }

    // --- DYNAMIC PROFILE PROMPT INJECTION ---
    let systemMsg = { role: 'system', content: 'You are a helpful tutor.' };

    if (userId && supabaseAdmin) {
      // Fetch Profile for personalization
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*') // Get all fields including goal, interests etc.
        .eq('id', userId)
        .single();

      if (profile && profile.goal) {
        // Use RULE ENGINE if profile has data
        const planConfig = getPlanConfig(profile);
        systemMsg = planConfig.systemPrompt;
        console.log(`🧠 Rule Engine for ${userId}: Plan=${planConfig.planId}`);
      } else {
        // Fallback to Scenario-based or Default
        systemMsg = getSystemMessage(scenarioId);
      }
    } else {
      systemMsg = getSystemMessage(scenarioId);
    }
    // ----------------------------------------

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


// --- TRANSLATOR ENDPOINT (MOBILE) ---
const { processTranslation } = require('./services/translator');

app.post('/api/translate', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  const { userId, fromLang, toLang } = req.body;

  if (!audioFile) return res.status(400).json({ error: 'No audio provided' });

  try {
    // Optional: Check Usage Limits here if you want to charge for translations
    // const usageCheck = await checkUsage(userId);
    // if (!usageCheck.allowed) ...

    const result = await processTranslation({
      audioPath: audioFile.path,
      fromLang: fromLang || 'es',
      toLang: toLang || 'en',
      userId
    });

    res.json(result);

  } catch (error) {
    console.error('Translation Endpoint Error:', error);
    res.status(500).json({ error: 'Translation failed' });
  } finally {
    // Always cleanup uploaded file
    cleanup(audioFile.path);
  }
});

// Speak Endpoint
app.post('/api/speak', upload.single('audio'), async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const userId = req.body.userId; // Extract userId specifically for freemium
    // SERVER-SIDE FREEMIUM CHECK 🔒
    const usageCheck = await checkUsage(userId);
    if (!usageCheck.allowed) {
      if (req.file && req.file.path) cleanup(req.file.path); // Cleanup upload before returning
      return res.status(usageCheck.status || 402).json({
        error: 'Limit Reached',
        message: usageCheck.message || 'Has alcanzado tu límite.'
      });
    }
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

    // 2. Chat: Send text to GPT (Request structured JSON)
    const scenarioId = req.body.scenarioId;
    let systemMsg = { role: 'system', content: 'You are a helpful tutor.' };

    // --- DYNAMIC PROFILE PROMPT INJECTION (Voice) ---
    if (userId && supabaseAdmin) {
      // Fetch Profile for personalization
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
    // ------------------------------------------------

    // Modify system prompt to ensure JSON output
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
    const assistantText = aiContent.dialogue; // Text to be spoken
    const feedbackText = aiContent.feedback;  // Text to be shown only

    console.log('AI Dialogue:', assistantText);
    console.log('AI Feedback:', feedbackText);

    // 3. Audio Caching Strategy (MD5 Hash)
    const crypto = require('crypto');
    const cacheDir = 'audio_cache';
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // Create hash from text + voiceId (to avoid collisions if we change voices later)
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
      // TTS: Send to ElevenLabs
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
          responseType: 'arraybuffer'
        }
      );

      // Save to cache
      fs.writeFileSync(cachePath, Buffer.from(ttsResponse.data));
      audioBase64 = Buffer.from(ttsResponse.data).toString('base64');
    }

    // 4. Return result
    res.json({
      userText,
      assistantText, // The spoken part
      feedbackText,  // The correction part
      audioBase64
    });

  } catch (error) {
    console.error('Error in /api/speak:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  } finally {
    cleanup(audioFile.path);
  }
});

// --- Admin Stats Endpoint ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    // In production, verify Admin Token here
    const limit = parseInt(req.query.limit) || 20;

    // Note: This requires the usage_logs table to exist in Supabase
    const { data, error } = await supabaseAdmin
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Calculate simple aggregates
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
    res.status(500).json({ error: 'Failed to fetch stats (Check if table exists)' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
