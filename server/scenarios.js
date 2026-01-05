const curriculum = [
    // ==================================================================================
    // 🟢 NIVEL A1 – PRINCIPIANTE ABSOLUTO (8 Módulos)
    // ==================================================================================
    {
        id: 'a1',
        title: 'Nivel A1: Principiante Absoluto',
        description: 'Objetivo: Sobrevivir lingüísticamente.',
        locked: false, // Unlocked by default
        modules: [
            {
                id: 'a1_1', title: 'Módulo A1.1: Primer Contacto', lessons: [
                    { id: 'a1_1_1', title: 'Sonidos y Pronunciación', type: 'practice', system_prompt: 'Pronunciation coach. Practice vowels and basic sounds.' },
                    { id: 'a1_1_2', title: 'Saludos y Despedidas', type: 'roleplay', system_prompt: 'Friendly neighbor. Exchange greetings and farewells.' },
                    { id: 'a1_1_3', title: 'Presentarse', type: 'roleplay', system_prompt: 'Receptionist. Ask for name and origin.' },
                    { id: 'a1_1_p', title: 'PROYECTO: Presentación', type: 'project', system_prompt: 'EVALUATION. User introduces themselves.' }
                ]
            },
            {
                id: 'a1_2', title: 'Módulo A1.2: Vida Diaria', lessons: [
                    { id: 'a1_2_1', title: 'Verbos Ser/Estar/Tener', type: 'practice', system_prompt: 'Grammar drill. Ser vs Estar.' },
                    { id: 'a1_2_2', title: 'Rutinas y Horarios', type: 'roleplay', system_prompt: 'Friend. Discuss daily routine.' },
                    { id: 'a1_2_p', title: 'PROYECTO: Mi Día', type: 'project', system_prompt: 'EVALUATION. Describe daily routine.' }
                ]
            },
            {
                id: 'a1_3', title: 'Módulo A1.3: Personas y Familia', lessons: [
                    { id: 'a1_3_1', title: 'Describir Personas', type: 'roleplay', system_prompt: 'Describe a photo of a person.' },
                    { id: 'a1_3_2', title: 'La Familia', type: 'roleplay', system_prompt: 'Talk about family members.' },
                    { id: 'a1_3_p', title: 'PROYECTO: Mi Familia', type: 'project', system_prompt: 'EVALUATION. Introduce a family member.' }
                ]
            },
            {
                id: 'a1_4', title: 'Módulo A1.4: Comida y Compras', lessons: [
                    { id: 'a1_4_1', title: 'Pedir Comida', type: 'roleplay', system_prompt: 'Waiter in a cafe. Take order.' },
                    { id: 'a1_4_2', title: 'Precios y Cantidades', type: 'roleplay', system_prompt: 'Market vendor. Discuss prices.' },
                    { id: 'a1_4_p', title: 'PROYECTO: En el Bar', type: 'project', system_prompt: 'EVALUATION. Order and pay in a bar.' }
                ]
            },
            {
                id: 'a1_5', title: 'Módulo A1.5: Lugares y Direcciones', lessons: [
                    { id: 'a1_5_1', title: 'Preposiciones', type: 'practice', system_prompt: 'Practice location prepositions.' },
                    { id: 'a1_5_2', title: 'Transporte', type: 'roleplay', system_prompt: 'Buy a train ticket.' },
                    { id: 'a1_5_p', title: 'PROYECTO: ¿Cómo llego?', type: 'project', system_prompt: 'EVALUATION. Ask for directions.' }
                ]
            },
            {
                id: 'a1_6', title: 'Módulo A1.6: Trabajo Básico', lessons: [
                    { id: 'a1_6_1', title: 'Profesiones', type: 'roleplay', system_prompt: 'Talk about professions.' },
                    { id: 'a1_6_p', title: 'PROYECTO: Presentación Laboral', type: 'project', system_prompt: 'EVALUATION. Introduce yourself at work.' }
                ]
            },
            {
                id: 'a1_7', title: 'Módulo A1.7: Salud y Emergencias', lessons: [
                    { id: 'a1_7_1', title: 'Síntomas Simples', type: 'roleplay', system_prompt: 'Doctor. Describe symptoms.' },
                    { id: 'a1_7_p', title: 'PROYECTO: Farmacia', type: 'project', system_prompt: 'EVALUATION. Buy medicine.' }
                ]
            },
            {
                id: 'a1_8', title: 'Módulo A1.8: Examen Final A1', lessons: [
                    { id: 'a1_final', title: 'Examen de Certificación', type: 'exam', system_prompt: 'EXAM MODE. Comprehensive A1 test.' }
                ]
            }
        ]
    },

    // ==================================================================================
    // 🟡 NIVEL A2 – USUARIO FUNCIONAL (8 Módulos)
    // ==================================================================================
    {
        id: 'a2',
        title: 'Nivel A2: Usuario Funcional',
        description: 'Objetivo: Autonomía básica.',
        locked: true,
        modules: [
            { id: 'a2_1', title: 'Módulo A2.1: Pasado Simple', lessons: [{ id: 'a2_1_1', title: 'Mis Vacaciones', type: 'roleplay', system_prompt: 'Talk about past holidays.' }] },
            { id: 'a2_2', title: 'Módulo A2.2: Futuro y Planes', lessons: [{ id: 'a2_2_1', title: 'Planes del Finde', type: 'roleplay', system_prompt: 'Discuss future plans.' }] },
            { id: 'a2_3', title: 'Módulo A2.3: Trabajo y CV', lessons: [{ id: 'a2_3_1', title: 'Mi Experiencia', type: 'roleplay', system_prompt: 'Describe work experience.' }] },
            { id: 'a2_4', title: 'Módulo A2.4: Vivienda', lessons: [{ id: 'a2_4_1', title: 'Alquilar Piso', type: 'roleplay', system_prompt: 'Rent an apartment.' }] },
            { id: 'a2_5', title: 'Módulo A2.5: Bancos y Trámites', lessons: [{ id: 'a2_5_1', title: 'Abrir Cuenta', type: 'roleplay', system_prompt: 'Open bank account.' }] },
            { id: 'a2_6', title: 'Módulo A2.6: Opiniones', lessons: [{ id: 'a2_6_1', title: 'Me gusta/No me gusta', type: 'roleplay', system_prompt: 'Express opinions.' }] },
            { id: 'a2_7', title: 'Módulo A2.7: Problemas', lessons: [{ id: 'a2_7_1', title: 'Reclamar', type: 'roleplay', system_prompt: 'Make a complaint.' }] },
            { id: 'a2_8', title: 'Módulo A2.8: Examen Final A2', lessons: [{ id: 'a2_final', title: 'Simulación Migratoria', type: 'exam', system_prompt: 'Immigration officer interview.' }] }
        ]
    },

    // ==================================================================================
    // 🔵 NIVEL B1 – INTERMEDIO REAL (10 Módulos)
    // ==================================================================================
    {
        id: 'b1',
        title: 'Nivel B1: Intermedio Real',
        description: 'Objetivo: Vivir y trabajar.',
        locked: true,
        modules: [
            { id: 'b1_1', title: 'Experiencias de Vida', lessons: [] },
            { id: 'b1_2', title: 'Coherencia y Conectores', lessons: [] },
            { id: 'b1_3', title: 'Emails Laborales', lessons: [] },
            { id: 'b1_4', title: 'Reuniones de Trabajo', lessons: [] },
            { id: 'b1_5', title: 'Conflictos', lessons: [] },
            { id: 'b1_6', title: 'Actualidad', lessons: [] },
            { id: 'b1_7', title: 'Sistema de Salud', lessons: [] },
            { id: 'b1_8', title: 'Entrevistas Laborales', lessons: [] },
            { id: 'b1_9', title: 'Simulacro Oficial', lessons: [] },
            { id: 'b1_10', title: 'Plan de Mejora', lessons: [] }
        ]
    },

    // ==================================================================================
    // 🟣 NIVEL B2 – PROFESIONAL (10 Módulos)
    // ==================================================================================
    {
        id: 'b2',
        title: 'Nivel B2: Profesional',
        description: 'Objetivo: Fluidez y autoridad.',
        locked: true,
        modules: [
            { id: 'b2_1', title: 'Argumentación', lessons: [] },
            { id: 'b2_2', title: 'Debate', lessons: [] },
            // ... more modules
        ]
    },

    // ==================================================================================
    // 🔴 NIVEL C1 – AVANZADO (8 Módulos)
    // ==================================================================================
    {
        id: 'c1',
        title: 'Nivel C1: Avanzado',
        description: 'Objetivo: Nivel nativo funcional.',
        locked: true,
        modules: [
            { id: 'c1_1', title: 'Matices y Sutilezas', lessons: [] },
            { id: 'c1_8', title: 'Simulación Laboral Compleja', lessons: [] }
        ]
    }
];

module.exports = curriculum;
