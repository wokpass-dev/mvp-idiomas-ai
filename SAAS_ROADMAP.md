# Roadmap de Transición a SaaS (12 Semanas)

Este documento detalla el plan estratégico para transformar SpeakGo (anteriormente TalkMe/Alex) de un MVP funcional a una plataforma SaaS (Software as a Service) comercializable y escalable.

---

## 🏗️ Contexto Actual
- **Arquitectura:** Frontend (React) y Backend (Node.js/Express) desacoplados.
- **Backend:** Lógica de IA centralizada con secuencia de proveedores (Gemini -> OpenAI -> DeepSeek).
- **Frontend:** Soporte para escenarios, chat de voz/texto y control de límites freemium (HTTP 402).
- **Base de Datos:** Esquema multi-tenant inicial para WhatsApp SaaS (saas_clients, saas_chats, saas_messages).
- **Despliegue:** Configurado para Render (backend + frontend).

---

## 📅 Fases del Plan (12 Semanas)

### Fase 1: Productización del MVP (Semanas 1–2)
**Objetivo:** Pasar de una app funcional a un producto usable por clientes.
- **Paquetes de Producto:**
  - **Free:** X mensajes/mes, sin voz premium.
  - **Pro:** Más mensajes, voz, escenarios premium.
  - **Enterprise:** WhatsApp + reportes + soporte.
- **Onboarding:** Pantalla de selección de idioma, objetivo y nivel. Primer escenario guiado con tracking de completitud.
- **Métricas Base:** Registro, primer mensaje, lección completada, paywall mostrado, clic en upgrade.
- **Entregable:** Funnel básico medible.

### Fase 2: Monetización Real (Semanas 3–4)
**Objetivo:** Cobro y control de consumo.
- **Billing:** Integración de Stripe Checkout + Webhooks.
- **Límites en Backend:** Aplicación estricta de cuotas (mensajes/mes, minutos de audio).
- **Portal de Cliente:** Gestión de suscripción y visualización de consumo.
- **KPI Meta:** Primera conversión de pago.

### Fase 3: Multi-tenant B2B (Semanas 5–7)
**Objetivo:** Escalar a academias y empresas.
- **Tenant Model:** Implementar aislamiento de datos mediante RLS (Row Level Security) por `client_id` en Supabase.
- **Panel Admin por Tenant:** Alta de instructores y gestión de usuarios/escenarios.
- **White-label:** Personalización básica (logo, colores, nombre del bot).
- **KPI Meta:** 1 piloto B2B activo.

### Fase 4: Canal WhatsApp (Semanas 8–9)
**Objetivo:** WhatsApp como canal de adquisición y retención.
- **Conector Estable:** Mapeo de `instance_id` y `api_key` por cliente.
- **Handoff:** Lógica de transferencia Bot/Humano.
- **Campañas:** Recordatorios de práctica y reactivación automática.
- **KPI Meta:** Retención semanal en el canal.

### Fase 5: Confiabilidad y Escalado (Semanas 10–12)
**Objetivo:** Operar con estándares de alta disponibilidad.
- **Observabilidad:** Logs estructurados y alertas de errores críticos.
- **Control de Costos:** Caché de prompts frecuentes y cuotas de IA.
- **Seguridad:** Hardening de CORS y rotación de secrets.
- **KPI Meta:** Uptime > 99.5%, errores críticos < 1%.

---

## 📋 Backlog Priorizado

1. **Stripe Integration:** Checkout + Webhooks + Tabla de suscripciones.
2. **Plan Limits Middleware:** Control server-side basado en el plan del usuario.
3. **Usage Dashboard:** Vista de "Mi plan y consumo".
4. **Multi-tenant RLS:** Seguridad a nivel de base de datos para B2B.
5. **WhatsApp Connector:** Integración productiva con Evolution API.
6. **Observabilidad:** Suite de tests críticos y monitoreo.

---

## 📊 Métricas Clave (SaaS KPIs)
- **Activation Rate:** (Usuarios que envían primer mensaje) / (Registros totales).
- **Week-1 Retention:** Usuarios que regresan a practicar en 7 días.
- **Conversion Rate:** Free → Paid.
- **Gross Margin:** Ingresos - (Coste IA + Voz + Mensajería).
