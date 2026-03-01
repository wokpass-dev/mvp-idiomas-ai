const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: __dirname + '/.env' });

const key = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function run() {
    try {
        const result = await model.generateContent('hi');
        console.log('SUCCESS:', result.response.text());
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

run();
