const { generateResponse } = require('./services/aiRouter');

async function test() {
    try {
        console.log('Testing generateResponse...');
        const response = await generateResponse('Hola ALEX, ¿quién eres?', 'ALEX_MIGRATION');
        console.log('RESPONSE:', response);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
