const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: __dirname + '/.env' });

const key = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(key);

async function run() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const axios = require('axios');
        const res = await axios.get(url);
        console.log('MODELS:', res.data.models.map(m => m.name));
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

run();
