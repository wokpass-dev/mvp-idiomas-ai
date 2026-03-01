-- ============================================
-- TABLA: conversations
-- Memoria persistente de chat por usuario
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    provider TEXT DEFAULT 'unknown',        -- gemini, openai, deepseek
    persona TEXT DEFAULT 'SPEAKGO',          -- SPEAKGO, SPEAKGO_MIGRATION, etc.
    language TEXT DEFAULT 'en',             -- en, fr, de, it, pt
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para buscar historial rápido por usuario
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id, created_at DESC);

-- Índice para analytics
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider, created_at DESC);

-- RLS (Row Level Security) - los usuarios solo ven sus propias conversaciones
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios autenticados ven solo sus propios mensajes
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: el service role puede insertar (el server)
CREATE POLICY "Service role can insert" ON conversations
    FOR INSERT WITH CHECK (true);

-- Policy: el service role puede leer todo (para admin)
CREATE POLICY "Service role can read all" ON conversations
    FOR SELECT USING (true);

-- ============================================
-- FUNCIÓN: Obtener últimos N mensajes de un usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_history(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (role TEXT, content TEXT, provider TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE
AS $$
    SELECT role, content, provider, created_at
    FROM conversations
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit;
$$;
