export interface HiraganaChar {
  character: string;
  romaji: string;
  group: 'vowels' | 'k' | 's' | 't' | 'n' | 'h' | 'm' | 'y' | 'r' | 'w' | 'n_single';
  exampleWord: string;
  exampleRomaji: string;
  exampleMeaning: string;
}

export interface KatakanaChar {
  character: string;
  romaji: string;
  group: 'vowels' | 'k' | 's' | 't' | 'n' | 'h' | 'm' | 'y' | 'r' | 'w' | 'n_single';
  exampleWord: string;
  exampleRomaji: string;
  exampleMeaning: string;
}

export interface DakuonChar {
  character: string;
  romaji: string;
  type: 'dakuten' | 'handakuten' | 'yoon';
  baseChar: string;
  exampleWord: string;
  exampleRomaji: string;
  exampleMeaning: string;
}

export interface KanjiItem {
  id: string;
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  romaji: string;
  meaning: string;
  category: 'angka_waktu' | 'makanan' | 'tempat_arah' | 'kehidupan';
  strokeCount: number;
  jlptLevel: 'N5' | 'N4';
  examples: {
    word: string;
    furigana: string;
    romaji: string;
    meaning: string;
  }[];
}

export interface WordToken {
  text: string;
  furigana?: string;
  romaji: string;
  meaning: string;
  partOfSpeech: 'Kata Benda' | 'Kata Kerja' | 'Kata Sifat' | 'Partikel' | 'Kopula / Salam' | 'Kata Keterangan';
  kanjiComposition?: {
    kanji: string;
    meaning: string;
  }[];
}

export interface KanjiQuizQuestion {
  id: string;
  prompt: string;
  targetCharacter: string;
  targetFurigana?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
