# 🚀 SaaS Transition Context: SpeakGo

Este documento resume el estado actual del proyecto tras la limpieza profunda y el rebranding realizado para su transición a un modelo SaaS. Este archivo está diseñado para que **ANTIGRAVITY** (o cualquier desarrollador/agente encargado) pueda retomar el trabajo de forma inmediata.

## 📌 Estado Actual del Repositorio
El repositorio ha sido purgado de prototipos legacy y archivos de diagnóstico redundantes. Se ha realizado un **rebranding completo a "SpeakGo"**.

### Estructura Preservada:
- `client/`: Frontend React (Vite) con Tailwind CSS. Reconfigurado para usar `VITE_API_URL`.
- `server/`: Backend Node.js (Express). Limpiado de endpoints de depuración sensibles.
- `render.yaml` & `vercel.json`: Configuraciones de despliegue automatizado.
- `README.md`: Documentación general del usuario.

---

## 🛠️ Core Tecnológico (Stack)

### 1. Backend AI (The "Brain")
El corazón del sistema reside en `server/services/aiRouter.js`. Implementa una arquitectura de **conmutación por error (Failover)** bajo la marca **SpeakGo**:
- **Prioridad 1:** Gemini 2.0 Flash (vía `@google/generative-ai`).
- **Prioridad 2:** OpenAI GPT-4o-mini (vía `openai` SDK).
- **Prioridad 3:** DeepSeek Chat (vía API REST).
- **TTS:** Soporte dual para ElevenLabs (Premium) y Google TTS (Gratis/Fallback).

### 2. Base de Datos y Auth
Utiliza **Supabase** de forma extensiva:
- **Auth:** Manejo de sesiones en `client/src/supabaseClient.js`.
- **Profiles:** Tabla central para límites de uso (freemium), niveles de idioma e intereses.
- **Memoria Persistente:** Las conversaciones se guardan en la tabla `conversations` para que la IA tenga contexto histórico entre sesiones.

### 3. Integración WhatsApp SaaS
Ubicado en `server/services/whatsappSaas.js`. Utiliza la librería `@whiskeysockets/baileys`. Está diseñado para actuar como un webhook escalable para multi-tenancy.

---

## 📝 Próximos Pasos (ROADMAP)

### 1. Despliegue en Nuevo Repositorio
El código está listo para ser subido a `https://github.com/wokpass-dev/saasdeidiomas2026.git`.

### 2. Pasarela de Pagos
Existe un componente `PaymentSetup.jsx` en el cliente, pero la validación de suscripciones premium en el backend (`checkUsage` en `index.js`) depende de un booleano `is_premium` en el perfil de Supabase que debe ser actualizado mediante webhooks de Stripe/Paddle.

### 3. Escalado de WhatsApp
Configurar los triggers de eventos para que SpeakGo actúe de forma proactiva con los estudiantes mediante notificaciones push de WhatsApp.

---

**Preparado por:** Jules (Software Engineer Agent)
**Fecha:** Octubre 2026
**Objetivo:** Lanzamiento Exitoso de SpeakGo SaaS.
