const express = require('express');
const cors = require('cors');
require('dotenv').config();
const aiRouter = require('./services/aiRouter');
const pdfService = require('./services/pdfService');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BRAND_NAME = "SPEAKGO";

app.use(cors());
app.use(express.json());

// Monitoring & Status
app.get('/api/providers/status', (req, res) => {
    res.json(aiRouter.getProviderConfigStatus());
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', branding: BRAND_NAME, timestamp: new Date().toISOString() });
});

// Basic chat endpoint for testing/WhatsApp relay
app.post('/api/chat', async (req, res) => {
    const { message, userId, persona } = req.body;
    try {
        const response = await aiRouter.generateResponse(message, persona || 'SPEAKGO_MIGRATION', [], userId || 'test_user');
        res.json({ assistant: response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PDF Generation Endpoint
app.post('/api/generate-pdf', async (req, res) => {
    const { userId, customData } = req.body;

    // Retrieve state from memory if not provided in customData
    const state = aiRouter.getUserState(userId) || {};
    const data = {
        userName: customData?.name || state.name || 'Profesional IT',
        classification: customData?.classification || (state.tecnico > 7 ? 'Perfil de Alto Potencial' : 'Perfil en Preparación'),
        potentialScore: customData?.potentialScore || state.tecnico || 5,
        brechaTecnica: customData?.brechaTecnica || (state.tecnico < 8 ? 'Necesita fortalecer stack internacional (Cloud/DevOps).' : 'Sólida para mercado global.'),
        brechaIngles: customData?.brechaIngles || (state.ingles === 'C1' || state.ingles === 'C2' ? 'Competitivo.' : 'Necesita alcanzar nivel B2/C1.'),
        brechaPosicionamiento: customData?.brechaPosicionamiento || 'LinkedIn requiere optimización bilingüe.',
        brechaDocumental: customData?.brechaDocumental || 'Pendiente de validación de pasaporte.',
        ruta: customData?.ruta || 'Híbrida (Remoto → Migración)',
        tiempoEstimado: customData?.tiempoEstimado || (state.tecnico > 7 ? '3 - 6 meses' : '8 - 12 meses'),
        fases: customData?.fases
    };

    const fileName = `diagnostic_${userId || 'guest'}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, 'uploads', 'diagnostics', fileName);

    try {
        await pdfService.generateDiagnosticPDF(data, filePath);

        // Return stream or link (here we return a path for simplicity in this example)
        // In production, you might want to return a downloadable link or stream the buffer
        res.json({
            success: true,
            message: "Diagnóstico generado exitosamente",
            downloadUrl: `/api/download-pdf/${fileName}`
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Falla al generar el PDF de diagnóstico" });
    }
});

// Download PDF endpoint
app.get('/api/download-pdf/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'diagnostics', req.params.fileName);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "Archivo no encontrado" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ${BRAND_NAME} Minimal Server running on port ${PORT}`);
});
