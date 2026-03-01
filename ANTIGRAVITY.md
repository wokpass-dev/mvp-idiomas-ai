# 🚀 SaaS Transition Context: SpeakGo / MVP Idiomas

Este documento resume el estado actual del proyecto tras la limpieza profunda realizada para su transición a un modelo SaaS. Este archivo está diseñado para que **ANTIGRAVITY** (o cualquier desarrollador/agente encargado) pueda retomar el trabajo de forma inmediata.

## 📌 Estado Actual del Repositorio
El repositorio ha sido purgado de prototipos legacy (`talkme/`, `talkme2/`, `mobile/`) y archivos de diagnóstico redundantes. Se ha mantenido una estructura "Lean" optimizada para escalabilidad.

### Estructura Preservada:
- `client/`: Frontend React (Vite) con Tailwind CSS.
- `server/`: Backend Node.js (Express).
- `render.yaml` & `vercel.json`: Configuraciones de despliegue automatizado.
- `README.md`: Documentación general del usuario.

---

## 🛠️ Core Tecnológico (Stack)

### 1. Backend AI (The "Brain")
El corazón del sistema reside en `server/services/aiRouter.js`. Implementa una arquitectura de **conmutación por error (Failover)**:
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

## 📝 Deuda Técnica y Próximos Pasos (ROADMAP)

### 1. Rebranding Global
El código aún contiene referencias a "TalkMe" y "Alex" (nombre del asistente). Se recomienda:
- Reemplazar "Talkme AI" por el nombre final del SaaS en `LandingPage.jsx` y `NewHomePage.jsx`.
- Actualizar el `BRAND_NAME` en `aiRouter.js`.

### 2. Desacoplamiento de URL de Producción
En `client/src/services/api.js`, la URL de producción está hardcodeada. Debe migrarse a una variable de entorno `VITE_API_URL` en el dashboard de Render/Vercel.

### 3. Pasarela de Pagos
Existe un componente `PaymentSetup.jsx` en el cliente, pero la validación de suscripciones premium en el backend (`checkUsage` en `index.js`) depende de un booleano `is_premium` en el perfil de Supabase que debe ser actualizado mediante webhooks de Stripe/Paddle.

### 4. Seguridad
Eliminar o proteger los endpoints de depuración `/api/debug/*` antes de escalar a usuarios reales.

---

**Preparado por:** Jules (Software Engineer Agent)
**Fecha:** Octubre 2026
**Objetivo:** Transición Exitosa a SaaS.
