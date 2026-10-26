export type SupportedLanguage = 'en' | 'ja' | 'de' | 'nl' | 'fr';

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  bcp47: string; // e.g. en-US, ja-JP, de-DE, nl-NL, fr-FR
  greeting: string;
  greetingMeaning: string;
  accentColor: string;
  secondaryColor: string;
  description: string;
  speakerPersona: {
    name: string;
    role: string;
    city: string;
    avatar: string;
    intro: string;
  };
  totalUnits: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  romaji?: string;
  meaning: string;
  category: 'salam' | 'makanan' | 'arah' | 'belanja' | 'darurat' | 'obrolan' | 'hotel';
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  isUserSpeaker?: boolean;
  avatar?: string;
  text: string;
  romaji?: string;
  phonetic?: string;
  translation: string;
  grammarNote?: string;
  keywords?: {
    term: string;
    meaning: string;
  }[];
}

export interface PracticeExercise {
  id: string;
  type: 'reply_choice' | 'pronounce' | 'sentence_order';
  prompt: string;
  contextText?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  targetSpeechText?: string;
  wordsToOrder?: string[];
}

export interface CurriculumUnit {
  id: string;
  unitNumber: number;
  title: string;
  titleId: string;
  level: 'Pemula (A1)' | 'Dasar (A2)' | 'Menengah (B1)';
  description: string;
  iconName: string;
  scenario: string;
  culturalTip: {
    title: string;
    content: string;
  };
  dialogue: {
    title: string;
    speakers: {
      name: string;
      role: string;
      avatar: string;
    }[];
    turns: DialogueTurn[];
  };
  keyVocabulary: VocabularyItem[];
  exercises: PracticeExercise[];
}

export interface UserProgress {
  selectedLanguage: SupportedLanguage;
  completedUnits: Record<SupportedLanguage, string[]>;
  completedDialogues: Record<SupportedLanguage, string[]>;
  quizScores: Record<string, number>;
  bookmarkedPhrases: string[];
  streakDays: number;
  lastStudyDate: string;
  totalPracticeTimeMinutes: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  romaji?: string;
  phonetic?: string;
  translation?: string;
  grammarTip?: string;
  suggestedReplies?: string[];
  timestamp: string;
}
