import axios from 'axios';

const getBaseUrl = () => {
    // 1. Try environment variable
    let url = import.meta.env.VITE_API_URL;

    // 2. Fallback if missing
    if (!url) {
        // If in production (Render), use the hardcoded production URL
        // If in development (Local), use localhost
        url = import.meta.env.PROD
            ? 'https://mvp-idiomas-server.onrender.com/api'
            : 'http://localhost:3000/api';
    }

    // 3. Normalization (fix protocol and /api suffix)
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }

    if (!url.endsWith('/api')) {
        url = `${url.replace(/\/$/, '')}/api`;
    }

    console.log('API Base URL:', url); // Debug check
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get available scenarios
export const getScenarios = async () => {
    const response = await api.get('/scenarios');
    return response.data;
};

export const sendMessage = async (messages, scenarioId) => {
    const response = await api.post('/chat', { messages, scenarioId });
    return response.data;
};

export const sendAudio = async (audioBlob, scenarioId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    if (scenarioId) {
        formData.append('scenarioId', scenarioId);
    }

    // axios handles multipart/form-data boundary automatically if we pass FormData
    // but explicit header helps sometimes or just let axios do it.
    // Let's rely on Axios auto-detection for FormData
    const response = await api.post('/speak', formData);
    return response.data;
};

export default api;
