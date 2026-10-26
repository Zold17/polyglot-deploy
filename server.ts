import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint 1: Conversational Partner Chat (Gemini 3.8 Flash)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { language, scenario, userMessage, conversationHistory } = req.body;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json(getSafeFallbackReply(language, userMessage));
    }

    const langNames: Record<string, string> = {
      en: 'English (British/Global)',
      ja: 'Japanese (Nihongo with natural keigo/casual balance)',
      de: 'German (Deutsch with proper Sie/du)',
      nl: 'Dutch (Nederlands with natural gezellig tone)',
      fr: 'French (Français with authentic polite bistro & everyday Parisian style)',
    };

    const targetLangName = langNames[language] || 'English';

    const systemInstruction = `You are a warm, authentic, native speaker and language conversation coach fluent in ${targetLangName}.
The current scenario is: "${scenario}".
The learner is an Indonesian student who wants to master everyday daily conversation.

Rules:
1. Always respond in natural, everyday conversational ${targetLangName} (1-2 clear sentences).
2. For Japanese (ja), provide the natural Japanese script (kanji/kana) AND accurate Romaji pronunciation.
3. Provide an accurate natural Indonesian translation of your reply.
4. Provide a 1-sentence helpful grammar or cultural etiquette tip (e.g., why this word was chosen, polite vs casual nuance).
5. Provide 2-3 short, natural suggested replies in ${targetLangName} with brief Indonesian meaning in parentheses, which the learner can click to continue the conversation.

Return ONLY a valid JSON object matching the requested schema.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Conversation history: ${JSON.stringify(conversationHistory || [])}\nLearner said: "${userMessage}"\nRespond naturally to keep the daily conversation flowing.`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'Your reply in the target language' },
            romaji: { type: Type.STRING, description: 'Romaji reading for Japanese or phonetic guide' },
            phonetic: { type: Type.STRING, description: 'IPA or phonetic pronunciation hint' },
            translation: { type: Type.STRING, description: 'Natural Indonesian translation' },
            grammarTip: { type: Type.STRING, description: 'Brief cultural or grammatical insight in Indonesian' },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 suggested responses the user can say next',
            },
          },
          required: ['reply', 'translation', 'suggestedReplies'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return res.json(getSafeFallbackReply(req.body.language, req.body.userMessage));
  }
});

// Endpoint 2: Sentence Grammar & Cultural Deep-Dive
app.post('/api/ai/analyze-sentence', async (req: Request, res: Response) => {
  try {
    const { language, sentence } = req.body;

    if (!ai) {
      return res.json(getSafeSentenceFallback(language, sentence));
    }

    const langNames: Record<string, string> = {
      en: 'English',
      ja: 'Japanese',
      de: 'German',
      nl: 'Dutch',
      fr: 'French',
    };

    const systemInstruction = `You are an expert polyglot linguist and language tutor for Indonesian students.
Analyze the following sentence in ${langNames[language] || 'the target language'}: "${sentence}".
Explain the nuances in Indonesian clearly:
1. literalTranslation: Harfiah
2. naturalTranslation: Terjemahan alami percakapan sehari-hari
3. grammarStructure: Penjelasan komponen tata bahasa (partikel, kata kerja, tenses, susunan kata)
4. formalityLevel: Tingkat kesopanan (Formal / Sopan Standar / Santai / Slang)
5. culturalNote: Catatan etiket budaya sehari-hari terkait kalimat ini
6. alternativeExpressions: 2-3 variasi cara mengatakannya oleh penutur asli beserta konteksnya.

Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Sentence to analyze: "${sentence}" in ${langNames[language] || 'foreign language'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            literalTranslation: { type: Type.STRING },
            naturalTranslation: { type: Type.STRING },
            grammarStructure: { type: Type.STRING },
            formalityLevel: { type: Type.STRING },
            culturalNote: { type: Type.STRING },
            alternativeExpressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['phrase', 'context'],
              },
            },
          },
          required: [
            'literalTranslation',
            'naturalTranslation',
            'grammarStructure',
            'formalityLevel',
            'culturalNote',
            'alternativeExpressions',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/ai/analyze-sentence:', error);
    return res.json(getSafeSentenceFallback(req.body.language, req.body.sentence));
  }
});

// Endpoint 3: Dynamic Word-by-Word Dissector (Hiragana, Kanji & Compounds)
app.post('/api/ai/dissect-sentence', async (req: Request, res: Response) => {
  const sentence = (req.body?.sentence || '').toString();
  const language = (req.body?.language || 'ja').toString();

  try {
    if (!ai) {
      return res.json({
        summary: sentence,
        tokens: [
          { text: sentence, romaji: sentence, meaning: 'Kalimat percakapan', partOfSpeech: 'Frasa Lengkap' },
        ],
      });
    }

    const systemInstruction = `You are a specialized linguistic parser dissecting sentences word-by-word for Indonesian learners.
Language: ${language === 'ja' ? 'Japanese (Nihongo)' : language === 'de' ? 'German (Deutsch)' : language === 'fr' ? 'French' : language === 'nl' ? 'Dutch' : 'English'}.
Sentence: "${sentence}".

Dissect the sentence into individual tokens (words, particles, compounds):
For each token:
- text: the exact token in native script
- furigana: (if Japanese with Kanji, provide Hiragana reading)
- romaji: phonetic/romaji reading
- meaning: meaning of this token in Indonesian in context
- partOfSpeech: 'Kata Benda', 'Kata Kerja', 'Kata Sifat', 'Partikel', 'Kopula / Salam', or 'Kata Keterangan'
- kanjiComposition: (if token contains Kanji, break down each individual kanji and its standalone meaning)

Also provide:
- summary: brief natural translation in Indonesian
- culturalEtiquette: brief cultural or politeness tip

Return strictly JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Dissect this sentence word-by-word: "${sentence}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            culturalEtiquette: { type: Type.STRING },
            tokens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  furigana: { type: Type.STRING },
                  romaji: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  kanjiComposition: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        kanji: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                      },
                      required: ['kanji', 'meaning'],
                    },
                  },
                },
                required: ['text', 'romaji', 'meaning', 'partOfSpeech'],
              },
            },
          },
          required: ['summary', 'tokens'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/ai/dissect-sentence:', error);
    return res.json({
      summary: sentence,
      tokens: [
        { text: sentence, romaji: sentence, meaning: 'Kalimat percakapan', partOfSpeech: 'Frasa Lengkap' },
      ],
    });
  }
});

function getSafeFallbackReply(language: string, _userMessage: string) {
  const fallbacks: Record<string, any> = {
    ja: {
      reply: 'はい、喜んでお手伝いします！他にご質問はありますか？',
      romaji: 'Hai, yorokonde otetsudai shimasu! Hoka ni go-shitsumon wa arimasu ka?',
      translation: 'Ya, dengan senang hati saya bantu! Apakah ada pertanyaan lainnya?',
      grammarTip: '"Yorokonde" berarti "dengan senang hati" saat melayani atau merespon seseorang.',
      suggestedReplies: [
        'ありがとうございます (Arigatou gozaimasu - Terima kasih)',
        'おいくらですか？ (O-ikura desu ka? - Berapa harganya?)',
      ],
    },
    en: {
      reply: 'Of course! What else can I assist you with today?',
      translation: 'Tentu saja! Ada hal lain yang bisa saya bantu hari ini?',
      grammarTip: 'Use "Of course" as a polite, confident acknowledgement.',
      suggestedReplies: [
        'Could you show me the way? (Bisakah tunjukkan jalannya?)',
        'Thank you so much! (Terima kasih banyak!)',
      ],
    },
    de: {
      reply: 'Sehr gerne! Was möchten Sie noch wissen?',
      translation: 'Dengan senang hati! Apa lagi yang ingin Anda ketahui?',
      grammarTip: '"Was möchten Sie..." ist die höfliche Form mit dem Konjunktiv II.',
      suggestedReplies: [
        'Vielen Dank! (Terima kasih banyak!)',
        'Alles in Ordnung, danke. (Semuanya sudah baik, terima kasih.)',
      ],
    },
    nl: {
      reply: 'Natuurlijk! Kan ik je nog ergens anders bij helpen?',
      translation: 'Tentu saja! Bisakah saya membantu hal lainnya?',
      grammarTip: 'Kata "natuurlijk" adalah cara ramah dan lugas menyetujui sesuatu.',
      suggestedReplies: [
        'Dank je wel! (Terima kasih banyak!)',
        'Mag ik nog iets vragen? (Bolehkah saya bertanya satu hal lagi?)',
      ],
    },
    fr: {
      reply: 'Avec plaisir ! Avez-vous besoin d’autre chose ?',
      translation: 'Dengan senang hati! Apakah Anda membutuhkan hal lain?',
      grammarTip: '"Avez-vous besoin de..." adalah cara sopan menanyakan kebutuhan.',
      suggestedReplies: [
        'Merci beaucoup ! (Terima kasih banyak!)',
        'C’est tout pour le moment. (Itu saja untuk saat ini.)',
      ],
    },
  };
  return fallbacks[language] || fallbacks.en;
}

function getSafeSentenceFallback(_language: string, sentence: string) {
  return {
    literalTranslation: sentence,
    naturalTranslation: 'Ungkapan percakapan sehari-hari yang alami.',
    grammarStructure: 'Struktur baku bahasa percakapan sehari-hari yang mudah dipahami.',
    formalityLevel: 'Sopan Standar (Bagus untuk lingkungan umum, toko, dan teman baru).',
    culturalNote: 'Gunakan dengan intonasi ramah dan tatap mata lawan bicara.',
    alternativeExpressions: [
      { phrase: 'Bentuk lebih singkat', context: 'Untuk teman akrab atau situasi kasual' },
      { phrase: 'Bentuk lebih formal', context: 'Untuk situasi resmi atau kepada orang yang dituakan' },
    ],
  };
}

// Dev & Production Setup with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
