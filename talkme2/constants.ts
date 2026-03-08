
import { SyllabusItem, CEFRLevel, Language } from './types';

export const SYLLABUS: Record<CEFRLevel, SyllabusItem> = {
  'A1': {
    level: 'A1',
    grammarPoints: ['Present simple', 'Personal pronouns', 'Basic prepositions'],
    recommendedVocabulary: ['Family', 'Hobbies', 'Colors', 'Numbers', 'Basic food']
  },
  'A2': {
    level: 'A2',
    grammarPoints: ['Past simple', 'Comparative/Superlative', 'Future intentions (going to)'],
    recommendedVocabulary: ['Work', 'Travel', 'Health', 'Daily routines', 'Shopping']
  },
  'B1': {
    level: 'B1',
    grammarPoints: ['Present perfect', 'Conditional types 0 and 1', 'Passive voice basics'],
    recommendedVocabulary: ['Environment', 'Education', 'Social issues', 'Emotions']
  },
  'B2': {
    level: 'B2',
    grammarPoints: ['All conditionals', 'Advanced modals', 'Reporting verbs'],
    recommendedVocabulary: ['Politics', 'Technology', 'Science', 'Academic discussions']
  },
  'C1': {
    level: 'C1',
    grammarPoints: ['Inversion', 'Cleft sentences', 'Subjunctive forms'],
    recommendedVocabulary: ['Idiomatic expressions', 'Subtle nuances', 'Abstract philosophy']
  },
  'C2': {
    level: 'C2',
    grammarPoints: ['Complete mastery', 'Literary devices', 'Archaic forms'],
    recommendedVocabulary: ['Mastery of all registers', 'Specific professional domains']
  }
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  'English': '🇬🇧',
  'German': '🇩🇪',
  'French': '🇫🇷',
  'Spanish': '🇪🇸',
  'Portuguese': '🇧🇷',
  'Italian': '🇮🇹'
};

export const getTutorSystemPrompt = (level: CEFRLevel, language: Language) => {
  const syllabus = SYLLABUS[level];

  const languageSpecific: Record<Language, string> = {
    'English': 'Pay attention to articles (a/the), verb tenses, and prepositions.',
    'German': 'Pay special attention to verb placement (V2 rule), cases (Nominativ/Akkusativ/Dativ/Genitiv), and noun genders.',
    'French': 'Ensure correct use of gender, accentuation, and subjunctive mood when needed.',
    'Spanish': 'Focus on ser/estar distinction, subjunctive triggers, and pronoun placement.',
    'Portuguese': 'Watch for nasal vowels, personal infinitive, and false cognates with Spanish.',
    'Italian': 'Focus on congiuntivo usage, double consonants, and article+preposition contractions.'
  };

  return `
You are "TalkMe", a world-class adaptive language tutor for ${language}.
Your student is at the CEFR level: ${level}.

PERSONALITY:
- You are warm, encouraging, and patient.
- You create immersive, real-life scenarios to practice (e.g., ordering food, asking for directions, job interview).
- You celebrate progress and keep motivation high with occasional emojis.
- You adapt difficulty naturally based on student responses.

SYLLABUS CONSTRAINTS:
- Only use grammar from: ${syllabus.grammarPoints.join(', ')}.
- Focus vocabulary on: ${syllabus.recommendedVocabulary.join(', ')}.
- ${languageSpecific[language]}

PROTOCOL:
1. Conversation First: Respond naturally to the student's message in ${language}. Keep the conversation flowing and engaging.
2. Subtle Correction: Do not interrupt the flow in the "response_text". Use the "corrections" and "grammar_tip" fields to provide feedback on the user's previous message.
3. Language Balance: Respond primarily in ${language}. If the user is A1/A2, you may include brief translations in parentheses.
4. Vocabulary Building: Always include a "vocabulary_check" with a useful word or phrase from your response.
5. JSON STRUCTURE: You MUST respond strictly in JSON format.

JSON schema:
{
  "response_text": "Your conversational response in ${language}",
  "corrections": ["Array of specific mistakes from user's last message, or empty if perfect"],
  "grammar_tip": "A short, helpful technical tip explaining one rule the user can improve",
  "vocabulary_check": "A word or phrase used in your response that the user should learn at their level"
}
  `.trim();
};
