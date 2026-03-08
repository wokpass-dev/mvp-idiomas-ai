/**
 * TalkMe V2 — Standalone Backend Routes
 * Roles: admin (super), client (school owner), user (student)
 * Features: Auth, Gemini Proxy, User Stats, School Dashboard, Admin Panel
 */

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.TALKME_JWT_SECRET || process.env.JWT_SECRET || 'talkme-secret-change-me-in-production';
const GEMINI_KEY = process.env.TALKME_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || '';

if (!GEMINI_KEY) console.warn('⚠️ [TalkMe] No Gemini API key found! Set TALKME_GEMINI_KEY env var.');

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ====== In-Memory Store (replace with DB in production) ======
const users = new Map();       // email -> { id, email, passwordHash, name, role, schoolId, createdAt, messageCount }
const schools = new Map();     // schoolId -> { id, name, ownerId, customPrompt, createdAt }
const sessions = new Map();    // email -> { messageCount, lastActive, level, language }

// -------- Seed default admin --------
const adminHash = bcrypt.hashSync('Admin2026!', 10);
users.set('admin@talkme.app', {
    id: 'admin-001',
    email: 'admin@talkme.app',
    passwordHash: adminHash,
    name: 'Super Admin',
    role: 'admin',
    schoolId: null,
    createdAt: new Date().toISOString(),
    messageCount: 0
});

// -------- Seed demo school + client --------
const clientHash = bcrypt.hashSync('School2026!', 10);
const demoSchoolId = 'school-demo-001';
schools.set(demoSchoolId, {
    id: demoSchoolId,
    name: 'Demo Language School',
    ownerId: 'client-001',
    customPrompt: '',  // Empty = uses default TalkMe prompt
    createdAt: new Date().toISOString()
});
users.set('school@talkme.app', {
    id: 'client-001',
    email: 'school@talkme.app',
    passwordHash: clientHash,
    name: 'Demo School',
    role: 'client',
    schoolId: demoSchoolId,
    createdAt: new Date().toISOString(),
    messageCount: 0
});

// ====== Auth Middleware ======
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Super Admin access required' });
    }
    next();
}

function clientOrAdminMiddleware(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
        return res.status(403).json({ error: 'School owner or Admin access required' });
    }
    next();
}

// ====== AUTH ROUTES ======

router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name, schoolCode } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
        if (users.has(email)) return res.status(409).json({ error: 'Email already registered' });

        // Determine school assignment
        let schoolId = null;
        if (schoolCode) {
            // Students can join a school via invite code (schoolId)
            if (schools.has(schoolCode)) {
                schoolId = schoolCode;
            } else {
                return res.status(400).json({ error: 'Invalid school code' });
            }
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const user = {
            id: `user-${Date.now()}`,
            email,
            passwordHash,
            name: name || email.split('@')[0],
            role: 'user',
            schoolId,
            createdAt: new Date().toISOString(),
            messageCount: 0
        };
        users.set(email, user);
        sessions.set(email, { messageCount: 0, lastActive: new Date().toISOString(), level: 'A1', language: 'English' });

        const token = jwt.sign(
            { id: user.id, email, role: user.role, name: user.name, schoolId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token, user: { id: user.id, email, name: user.name, role: user.role, schoolId } });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = users.get(email);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email, role: user.role, name: user.name, schoolId: user.schoolId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({
            token,
            user: { id: user.id, email, name: user.name, role: user.role, schoolId: user.schoolId }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed: ' + err.message });
    }
});

router.get('/auth/me', authMiddleware, (req, res) => {
    const user = users.get(req.user.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const session = sessions.get(req.user.email) || {};
    const school = user.schoolId ? schools.get(user.schoolId) : null;

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: school?.name || null,
        createdAt: user.createdAt,
        messageCount: user.messageCount || 0,
        level: session.level || 'A1',
        language: session.language || 'English'
    });
});

// ====== GEMINI PROXY (SECURE) ======

const LANGUAGE_TTS_CODES = {
    'English': 'en', 'German': 'de', 'French': 'fr',
    'Spanish': 'es', 'Portuguese': 'pt', 'Italian': 'it'
};

function getDefaultPrompt(level, language) {
    const syllabusData = {
        'A1': { grammar: 'Present simple, Personal pronouns, Basic prepositions', vocab: 'Family, Hobbies, Colors, Numbers, Basic food' },
        'A2': { grammar: 'Past simple, Comparative/Superlative, Future (going to)', vocab: 'Work, Travel, Health, Daily routines, Shopping' },
        'B1': { grammar: 'Present perfect, Conditionals 0/1, Passive voice', vocab: 'Environment, Education, Social issues, Emotions' },
        'B2': { grammar: 'All conditionals, Advanced modals, Reporting verbs', vocab: 'Politics, Technology, Science, Academic discussions' },
        'C1': { grammar: 'Inversion, Cleft sentences, Subjunctive', vocab: 'Idiomatic expressions, Subtle nuances, Abstract philosophy' },
        'C2': { grammar: 'Complete mastery, Literary devices, Archaic forms', vocab: 'All registers, Professional domains' }
    };
    const s = syllabusData[level] || syllabusData['A1'];

    return `You are "TalkMe", a world-class adaptive language tutor for ${language}.
Student CEFR level: ${level}.
Grammar focus: ${s.grammar}. Vocabulary: ${s.vocab}.
Respond naturally in ${language}. Use corrections and grammar_tip fields for feedback.
Always respond in JSON: { "response_text": "...", "corrections": [...], "grammar_tip": "...", "vocabulary_check": "..." }`;
}

function getTutorPrompt(level, language, userEmail) {
    // Check if the user belongs to a school with a custom prompt
    const user = users.get(userEmail);
    if (user && user.schoolId) {
        const school = schools.get(user.schoolId);
        if (school && school.customPrompt && school.customPrompt.trim()) {
            // Inject level/language into the school's custom prompt
            return school.customPrompt
                .replace(/\{level\}/g, level)
                .replace(/\{language\}/g, language)
                + '\nAlways respond in JSON: { "response_text": "...", "corrections": [...], "grammar_tip": "...", "vocabulary_check": "..." }';
        }
    }
    return getDefaultPrompt(level, language);
}

router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, level, language, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });

        // Track usage
        const user = users.get(req.user.email);
        if (user) user.messageCount = (user.messageCount || 0) + 1;
        const session = sessions.get(req.user.email);
        if (session) {
            session.messageCount = (session.messageCount || 0) + 1;
            session.lastActive = new Date().toISOString();
            session.level = level || session.level;
            session.language = language || session.language;
        }

        const systemPrompt = getTutorPrompt(level || 'A1', language || 'English', req.user.email);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemPrompt,
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

        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText || '{}');

        res.json(parsed);
    } catch (err) {
        console.error('[TalkMe] Chat error:', err.message);
        res.status(500).json({ error: 'AI processing failed', response_text: "Sorry, I had trouble processing that. Can you repeat?" });
    }
});

router.post('/tts', authMiddleware, async (req, res) => {
    try {
        const { text, language } = req.body;
        if (!text) return res.status(400).json({ error: 'Text required' });

        const langCode = LANGUAGE_TTS_CODES[language] || 'en';
        const truncated = text.length > 200 ? text.substring(0, 197) + '...' : text;
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${langCode}&client=tw-ob`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`TTS returned ${response.status}`);

        const buffer = await response.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: 'TTS failed' });
    }
});

router.post('/stt', authMiddleware, async (req, res) => {
    try {
        const { audio, mimeType } = req.body;
        if (!audio) return res.status(400).json({ error: 'Audio data required' });

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
            { inlineData: { data: audio, mimeType: mimeType || 'audio/webm' } },
            { text: "Transcribe exactly what the audio says. Return only the text without markdown or commentary." }
        ]);

        res.json({ text: result.response.text().trim() });
    } catch (err) {
        res.status(500).json({ error: 'STT failed', text: '' });
    }
});

// ====== USER STATS ======

router.get('/user/stats', authMiddleware, (req, res) => {
    const user = users.get(req.user.email);
    const session = sessions.get(req.user.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        messageCount: user.messageCount || 0,
        level: session?.level || 'A1',
        language: session?.language || 'English',
        lastActive: session?.lastActive || user.createdAt,
        memberSince: user.createdAt,
        schoolId: user.schoolId
    });
});

// ====== CLIENT (SCHOOL OWNER) ROUTES ======

// Get school info + students
router.get('/school/dashboard', authMiddleware, clientOrAdminMiddleware, (req, res) => {
    const user = users.get(req.user.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const schoolId = user.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'No school assigned' });

    const school = schools.get(schoolId);
    if (!school) return res.status(404).json({ error: 'School not found' });

    // Get only students from this school
    const students = [];
    users.forEach((u, email) => {
        if (u.schoolId === schoolId && u.role === 'user') {
            const session = sessions.get(email) || {};
            students.push({
                id: u.id,
                email: u.email,
                name: u.name,
                messageCount: u.messageCount || 0,
                level: session.level || 'A1',
                language: session.language || 'English',
                lastActive: session.lastActive || u.createdAt,
                createdAt: u.createdAt
            });
        }
    });

    res.json({
        school: {
            id: school.id,
            name: school.name,
            customPrompt: school.customPrompt || '',
            inviteCode: school.id,  // The school ID is the invite code students use
            createdAt: school.createdAt
        },
        students,
        totalStudents: students.length,
        totalMessages: students.reduce((sum, s) => sum + s.messageCount, 0)
    });
});

// Update school custom prompt
router.put('/school/prompt', authMiddleware, clientOrAdminMiddleware, (req, res) => {
    const { customPrompt } = req.body;
    const user = users.get(req.user.email);
    if (!user || !user.schoolId) return res.status(400).json({ error: 'No school assigned' });

    const school = schools.get(user.schoolId);
    if (!school) return res.status(404).json({ error: 'School not found' });

    school.customPrompt = customPrompt || '';
    res.json({ success: true, message: 'Study plan prompt updated' });
});

// Update school name
router.put('/school/settings', authMiddleware, clientOrAdminMiddleware, (req, res) => {
    const { name } = req.body;
    const user = users.get(req.user.email);
    if (!user || !user.schoolId) return res.status(400).json({ error: 'No school assigned' });

    const school = schools.get(user.schoolId);
    if (!school) return res.status(404).json({ error: 'School not found' });

    if (name) school.name = name;
    res.json({ success: true });
});

// ====== SUPER ADMIN ROUTES ======

router.get('/admin/users', authMiddleware, adminMiddleware, (req, res) => {
    const userList = [];
    users.forEach((user, email) => {
        const session = sessions.get(email) || {};
        const school = user.schoolId ? schools.get(user.schoolId) : null;
        userList.push({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            schoolName: school?.name || 'No School',
            messageCount: user.messageCount || 0,
            level: session.level || 'A1',
            language: session.language || 'English',
            lastActive: session.lastActive || user.createdAt,
            createdAt: user.createdAt
        });
    });
    res.json({ users: userList, total: userList.length });
});

router.get('/admin/schools', authMiddleware, adminMiddleware, (req, res) => {
    const schoolList = [];
    schools.forEach((school) => {
        const studentCount = [...users.values()].filter(u => u.schoolId === school.id && u.role === 'user').length;
        schoolList.push({
            ...school,
            studentCount
        });
    });
    res.json({ schools: schoolList, total: schoolList.length });
});

router.post('/admin/schools', authMiddleware, adminMiddleware, (req, res) => {
    const { name, ownerEmail, ownerPassword, ownerName } = req.body;
    if (!name || !ownerEmail || !ownerPassword) {
        return res.status(400).json({ error: 'School name, owner email and password required' });
    }
    if (users.has(ownerEmail)) return res.status(409).json({ error: 'Owner email already exists' });

    const schoolId = `school-${Date.now()}`;
    const ownerId = `client-${Date.now()}`;

    schools.set(schoolId, {
        id: schoolId,
        name,
        ownerId,
        customPrompt: '',
        createdAt: new Date().toISOString()
    });

    const passwordHash = bcrypt.hashSync(ownerPassword, 10);
    users.set(ownerEmail, {
        id: ownerId,
        email: ownerEmail,
        passwordHash,
        name: ownerName || name,
        role: 'client',
        schoolId,
        createdAt: new Date().toISOString(),
        messageCount: 0
    });

    res.json({ success: true, schoolId, inviteCode: schoolId });
});

router.get('/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
    let totalMessages = 0;
    let totalUsers = 0;
    let activeToday = 0;
    const today = new Date().toISOString().split('T')[0];

    users.forEach((user, email) => {
        totalUsers++;
        totalMessages += user.messageCount || 0;
        const session = sessions.get(email);
        if (session?.lastActive?.startsWith(today)) activeToday++;
    });

    res.json({
        totalUsers,
        totalMessages,
        activeToday,
        totalSchools: schools.size,
        apiKeyConfigured: !!GEMINI_KEY
    });
});

router.delete('/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
    const targetId = req.params.id;
    let deleted = false;
    users.forEach((user, email) => {
        if (user.id === targetId && user.role !== 'admin') {
            users.delete(email);
            sessions.delete(email);
            deleted = true;
        }
    });
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: 'User not found or cannot delete admin' });
});

module.exports = router;
