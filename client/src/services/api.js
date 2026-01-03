import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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
