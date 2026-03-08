
const API_BASE = import.meta.env.VITE_API_URL || 'https://mvp-idiomas-server.onrender.com';

function getToken(): string | null {
    return localStorage.getItem('talkme_token');
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ====== Chat (Secure Proxy) ======
export async function sendChatMessage(
    message: string,
    level: string,
    language: string,
    history: { role: string; parts: { text: string }[] }[]
) {
    const res = await fetch(`${API_BASE}/api/talkme/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message, level, language, history })
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
    return res.json();
}

// ====== TTS (Secure Proxy) ======
export async function fetchTTS(text: string, language: string): Promise<ArrayBuffer> {
    const res = await fetch(`${API_BASE}/api/talkme/tts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text, language })
    });
    if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
    return res.arrayBuffer();
}

// ====== STT (Secure Proxy) ======
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });

    const audio = await base64Promise;
    const mimeType = audioBlob.type.includes('mp4') ? 'audio/mp4' : 'audio/webm';

    const res = await fetch(`${API_BASE}/api/talkme/stt`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ audio, mimeType })
    });
    if (!res.ok) throw new Error(`STT failed: ${res.status}`);
    const data = await res.json();
    return data.text || '';
}

// ====== User Stats ======
export async function fetchUserStats() {
    const res = await fetch(`${API_BASE}/api/talkme/user/stats`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
    return res.json();
}

// ====== School (Client) Dashboard ======
export async function fetchSchoolDashboard() {
    const res = await fetch(`${API_BASE}/api/talkme/school/dashboard`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`School dashboard failed: ${res.status}`);
    return res.json();
}

export async function updateSchoolPrompt(customPrompt: string) {
    const res = await fetch(`${API_BASE}/api/talkme/school/prompt`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ customPrompt })
    });
    if (!res.ok) throw new Error(`Prompt update failed: ${res.status}`);
    return res.json();
}

export async function updateSchoolSettings(name: string) {
    const res = await fetch(`${API_BASE}/api/talkme/school/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`Settings update failed: ${res.status}`);
    return res.json();
}

// ====== Super Admin ======
export async function fetchAdminUsers() {
    const res = await fetch(`${API_BASE}/api/talkme/admin/users`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Admin users failed: ${res.status}`);
    return res.json();
}

export async function fetchAdminStats() {
    const res = await fetch(`${API_BASE}/api/talkme/admin/stats`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Admin stats failed: ${res.status}`);
    return res.json();
}

export async function fetchAdminSchools() {
    const res = await fetch(`${API_BASE}/api/talkme/admin/schools`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Admin schools failed: ${res.status}`);
    return res.json();
}

export async function createSchool(data: { name: string; ownerEmail: string; ownerPassword: string; ownerName: string }) {
    const res = await fetch(`${API_BASE}/api/talkme/admin/schools`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Create school failed: ${res.status}`);
    return res.json();
}

export async function deleteUser(userId: string) {
    const res = await fetch(`${API_BASE}/api/talkme/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json();
}
