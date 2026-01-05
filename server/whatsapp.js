const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI (Env vars are global if loaded in index.js, but safe to re-init)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Mock In-Memory History (optional for context, but Translator is usually stateless)
// const conversationHistory = {}; 

router.post('/incoming', async (req, res) => {
    try {
        // Twilio sends form-urlencoded params. 
        // Key params: Body (text), From (whatsapp:+123...), MediaUrl0 (if audio)
        const { Body, From } = req.body;

        console.log(`📩 WhatsApp from ${From}: ${Body}`);

        if (!Body) {
            return res.status(200).send('<Response></Response>'); // Empty TwiML OK
        }

        // 1. Translator Logic via GPT-4o
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional interpreter for travelers. Translate the user's text. If Spanish -> English. If English -> Spanish. Return ONLY the translation, nothing else."
                },
                { role: "user", content: Body }
            ]
        });

        const translation = completion.choices[0].message.content;
        console.log(`🔁 Translation: ${translation}`);

        // 2. Respond to Twilio (TwiML format)
        // Twilio expects XML to reply to the user
        res.type('text/xml');
        res.send(`
      <Response>
        <Message>
          <Body>🔤 ${translation}</Body>
        </Message>
      </Response>
    `);

    } catch (error) {
        console.error('WhatsApp Error:', error);
        // Don't crash Twilio retries - send empty OK
        res.status(200).send('<Response><Message>Error en el servicio de traducción.</Message></Response>');
    }
});

module.exports = router;
