const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF de diagnóstico estratégico premium.
 * @param {Object} data - Datos del diagnóstico (perfil, brechas, ruta, etc.)
 * @param {string} outputPath - Ruta donde guardar el PDF.
 */
async function generateDiagnosticPDF(data, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // --- Estilos de Colores ---
        const colors = {
            primary: '#1A237E', // Azul Oscuro Profundo
            secondary: '#0D47A1', // Azul Eléctrico
            accent: '#FFD600',    // Dorado/Amarillo para énfasis
            text: '#212121',
            lightText: '#757575',
            bg: '#F5F5F5'
        };

        // --- Encabezado ---
        doc.rect(0, 0, 600, 80).fill(colors.primary);
        doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('PUENTES GLOBALES', 50, 25);
        doc.fontSize(10).font('Helvetica').text('DIAGNÓSTICO ESTRATÉGICO DE POSICIONAMIENTO INTERNACIONAL', 50, 50);

        // --- Info del Cliente ---
        doc.moveDown(4);
        doc.fillColor(colors.primary).fontSize(14).font('Helvetica-Bold').text('PERFIL ANALIZADO:', 50, 100);
        doc.fillColor(colors.text).fontSize(12).font('Helvetica').text(`Usuario: ${data.userName || 'Profesional IT'}`, 50, 120);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 50, 135);

        // --- Clasificación (Highlight Box) ---
        doc.rect(50, 160, 500, 60).fill(colors.bg);
        doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('CLASIFICACIÓN DE PERFIL:', 65, 175);
        doc.fillColor(colors.secondary).fontSize(18).text(data.classification || 'PENDIENTE DE VALIDACIÓN', 65, 190);

        // --- Métrica Visual (Barra de Potencial) ---
        const potential = data.potentialScore || 0; // 1-10
        doc.fillColor(colors.lightText).fontSize(9).text('POTENCIAL DE MIGRACIÓN ESTRATÉGICA', 350, 175);
        doc.rect(350, 190, 180, 15).fill('#E0E0E0');
        doc.rect(350, 190, 18 * potential, 15).fill(colors.accent);

        // --- Sección 1: Diagnóstico de Brechas ---
        doc.moveDown(6);
        doc.fillColor(colors.primary).fontSize(16).font('Helvetica-Bold').text('1. EVALUACIÓN DE BRECHAS ESTRATÉGICAS', 50);
        doc.rect(50, doc.y, 500, 2).fill(colors.primary);
        doc.moveDown(1);

        const brechas = [
            { label: 'Brecha Técnica', val: data.brechaTecnica || 'En evaluación' },
            { label: 'Brecha Idiomática', val: data.brechaIngles || 'En evaluación' },
            { label: 'Brecha de Posicionamiento', val: data.brechaPosicionamiento || 'En evaluación' },
            { label: 'Brecha Documental', val: data.brechaDocumental || 'En evaluación' }
        ];

        brechas.forEach(b => {
            doc.fillColor(colors.primary).fontSize(11).font('Helvetica-Bold').text(b.label, 60);
            doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(b.val, 70);
            doc.moveDown(0.5);
        });

        // --- Sección 2: Ruta Recomendada ---
        doc.moveDown(1);
        doc.fillColor(colors.primary).fontSize(16).font('Helvetica-Bold').text('2. RUTA DE ACCIÓN RECOMENDADA', 50);
        doc.rect(50, doc.y, 500, 2).fill(colors.primary);
        doc.moveDown(1);

        doc.fillColor(colors.secondary).fontSize(12).font('Helvetica-Bold').text(`RUTA SOLICITADA: ${data.ruta || 'Híbrida (Remoto → Migración)'}`);
        doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(`TIEMPO ESTIMADO DE PREPARACIÓN: ${data.tiempoEstimado || '6 - 12 meses'}`, { oblique: true });

        doc.moveDown(1);
        const fases = data.fases || [
            "Fase 1: Optimización de perfiles internacionales (LinkedIn/CV ATS).",
            "Fase 2: Construcción de evidencia pública y portafolio técnico.",
            "Fase 3: Exposición y networking en mercados objetivo.",
            "Fase 4: Aplicación estratégica y preparación de entrevistas."
        ];

        fases.forEach((f, i) => {
            doc.fillColor(colors.primary).font('Helvetica-Bold').text(`Fase ${i + 1}: `, 60, doc.y, { continued: true });
            doc.fillColor(colors.text).font('Helvetica').text(f);
            doc.moveDown(0.5);
        });

        // --- Footer / Mantra ---
        const bottomY = doc.page.height - 100;
        doc.rect(0, bottomY, 600, 100).fill(colors.bg);
        doc.fillColor(colors.lightText).fontSize(8).font('Helvetica-Oblique').text('Este documento es una estimación estratégica basada en el diagnóstico interactivo con SPEAKGO v5.0.', 50, bottomY + 20);

        doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold').text('CLARITY > HOPE  |  STRUCTURE > EMOTION  |  PREPARATION > PROMISES', 50, bottomY + 50, { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

module.exports = { generateDiagnosticPDF };
