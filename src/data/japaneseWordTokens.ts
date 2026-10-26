import { WordToken } from '../types/kanji';

export const JAPANESE_DIALOGUE_TOKENS: Record<string, WordToken[]> = {
  // Unit 1 Lines
  'こんにちは！はじめまして、健二です。': [
    { text: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Halo / Selamat siang', partOfSpeech: 'Kopula / Salam' },
    { text: 'はじめまして', romaji: 'Hajimemashite', meaning: 'Senang berkenalan (pertama kali)', partOfSpeech: 'Kopula / Salam' },
    { text: '健二', furigana: 'けんじ', romaji: 'Kenji', meaning: 'Nama orang (Kenji)', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '健', meaning: 'Sehat' }, { kanji: '二', meaning: 'Kedua' }] },
    { text: 'です', romaji: 'desu', meaning: 'Adalah (kopula sopan)', partOfSpeech: 'Kopula / Salam' },
  ],
  'はじめまして！インドネシアから来ました。どうぞよろしくお願いします。': [
    { text: 'はじめまして', romaji: 'Hajimemashite', meaning: 'Senang berkenalan', partOfSpeech: 'Kopula / Salam' },
    { text: 'インドネシア', romaji: 'Indoneshia', meaning: 'Indonesia', partOfSpeech: 'Kata Benda' },
    { text: 'から', romaji: 'kara', meaning: 'Dari (partikel penanda asal)', partOfSpeech: 'Partikel' },
    { text: '来ました', furigana: 'きました', romaji: 'kimashita', meaning: 'Datang (bentuk lampau sopan)', partOfSpeech: 'Kata Kerja', kanjiComposition: [{ kanji: '来', meaning: 'Datang' }] },
    { text: 'どうぞ', romaji: 'douzo', meaning: 'Silakan / dengan hormat', partOfSpeech: 'Kata Keterangan' },
    { text: 'よろしく', romaji: 'yoroshiku', meaning: 'Kebaikan / keramahan', partOfSpeech: 'Kopula / Salam' },
    { text: 'お願いします', furigana: 'おねがいします', romaji: 'onegaishimasu', meaning: 'Mohon / tolong', partOfSpeech: 'Kata Kerja', kanjiComposition: [{ kanji: '願', meaning: 'Permintaan / permohonan' }] },
  ],
  'ようこそ日本へ！日本語がお上手ですね。': [
    { text: 'ようこそ', romaji: 'Youkoso', meaning: 'Selamat datang', partOfSpeech: 'Kopula / Salam' },
    { text: '日本', furigana: 'にほん', romaji: 'Nihon', meaning: 'Jepang', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '日', meaning: 'Matahari' }, { kanji: '本', meaning: 'Asal mula / buku' }] },
    { text: 'へ', romaji: 'e', meaning: 'Ke (partikel penanda arah tujuan)', partOfSpeech: 'Partikel' },
    { text: '日本語', furigana: 'にほんご', romaji: 'Nihongo', meaning: 'Bahasa Jepang', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '語', meaning: 'Bahasa' }] },
    { text: 'が', romaji: 'ga', meaning: 'Penanda subjek / topik spesifik', partOfSpeech: 'Partikel' },
    { text: 'お上手', furigana: 'おじょうず', romaji: 'ojouzu', meaning: 'Pintar / terampil (pujian sopan)', partOfSpeech: 'Kata Sifat', kanjiComposition: [{ kanji: '上', meaning: 'Atas' }, { kanji: '手', meaning: 'Tangan (keahlian)' }] },
    { text: 'ですね', romaji: 'desu ne', meaning: 'Bukan? / ya kan?', partOfSpeech: 'Partikel' },
  ],

  // Unit 2 Lines
  'いらっしゃいませ！店内でお召し上がりですか？': [
    { text: 'いらっしゃいませ', romaji: 'Irasshaimase', meaning: 'Selamat datang (salam staf toko)', partOfSpeech: 'Kopula / Salam' },
    { text: '店内', furigana: 'てんない', romaji: 'tennai', meaning: 'Di dalam kafe (dine-in)', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '店', meaning: 'Toko' }, { kanji: '内', meaning: 'Dalam' }] },
    { text: 'で', romaji: 'de', meaning: 'Di (partikel penanda lokasi kegiatan)', partOfSpeech: 'Partikel' },
    { text: 'お召し上がり', furigana: 'おめしあがり', romaji: 'omeshiagari', meaning: 'Menikmati santapan (keigo sangat sopan)', partOfSpeech: 'Kata Kerja', kanjiComposition: [{ kanji: '召', meaning: 'Memanggil/makan' }, { kanji: '上', meaning: 'Atas' }] },
    { text: 'ですか', romaji: 'desu ka', meaning: 'Apakah? (partikel tanya)', partOfSpeech: 'Partikel' },
  ],
  'はい、店内でお願いします。ホットコーヒーを一つください。': [
    { text: 'はい', romaji: 'Hai', meaning: 'Ya', partOfSpeech: 'Kopula / Salam' },
    { text: '店内で', furigana: 'てんないで', romaji: 'tennai de', meaning: 'Di tempat / dine-in', partOfSpeech: 'Kata Benda' },
    { text: 'お願いします', furigana: 'おねがいします', romaji: 'onegaishimasu', meaning: 'Tolong', partOfSpeech: 'Kata Kerja' },
    { text: 'ホットコーヒー', romaji: 'hotto koohii', meaning: 'Kopi panas (katakana)', partOfSpeech: 'Kata Benda' },
    { text: 'を', romaji: 'o', meaning: 'Partikel penanda objek kalimat', partOfSpeech: 'Partikel' },
    { text: '一つ', furigana: 'ひとつ', romaji: 'hitotsu', meaning: 'Satu buah', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '一', meaning: 'Satu' }] },
    { text: 'ください', romaji: 'kudasai', meaning: 'Tolong berikan saya', partOfSpeech: 'Kata Kerja' },
  ],
  '以上で大丈夫です。お会計はカードでできますか？': [
    { text: '以上', furigana: 'いじょう', romaji: 'ijou', meaning: 'Itu saja / sekian', partOfSpeech: 'Kata Keterangan', kanjiComposition: [{ kanji: '以', meaning: 'Mulai dari' }, { kanji: '上', meaning: 'Atas' }] },
    { text: 'で', romaji: 'de', meaning: 'Dengan / penanda kondisi', partOfSpeech: 'Partikel' },
    { text: '大丈夫です', furigana: 'だいじょうぶです', romaji: 'daijoubu desu', meaning: 'Sudah cukup / tidak apa-apa', partOfSpeech: 'Kata Sifat', kanjiComposition: [{ kanji: '大', meaning: 'Besar' }, { kanji: '丈', meaning: 'Tegap' }, { kanji: '夫', meaning: 'Pria' }] },
    { text: 'お会計', furigana: 'おかいけい', romaji: 'okaikei', meaning: 'Pembayaran / tagihan kasir', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '会', meaning: 'Pertemuan' }, { kanji: '計', meaning: 'Perhitungan' }] },
    { text: 'は', romaji: 'wa', meaning: 'Partikel topik kalimat', partOfSpeech: 'Partikel' },
    { text: 'カード', romaji: 'kaado', meaning: 'Kartu kredit / debit', partOfSpeech: 'Kata Benda' },
    { text: 'で', romaji: 'de', meaning: 'Dengan (alat bayar)', partOfSpeech: 'Partikel' },
    { text: 'できますか', romaji: 'dekimasu ka', meaning: 'Bisakah?', partOfSpeech: 'Kata Kerja' },
  ],

  // Unit 3 Lines
  'すみません、山手線のホームはどこですか？': [
    { text: 'すみません', romaji: 'Sumimasen', meaning: 'Permisi / Maaf', partOfSpeech: 'Kopula / Salam' },
    { text: '山手線', furigana: 'やまのてせん', romaji: 'Yamanote-sen', meaning: 'Jalur kereta Yamanote Tokyo', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '山', meaning: 'Gunung' }, { kanji: '手', meaning: 'Tangan' }, { kanji: '線', meaning: 'Garis / jalur rel' }] },
    { text: 'の', romaji: 'no', meaning: 'Partikel kepemilikan / penjelas', partOfSpeech: 'Partikel' },
    { text: 'ホーム', romaji: 'hoomu', meaning: 'Peron stasiun kereta', partOfSpeech: 'Kata Benda' },
    { text: 'は', romaji: 'wa', meaning: 'Partikel penanda topik', partOfSpeech: 'Partikel' },
    { text: 'どこ', romaji: 'doko', meaning: 'Di mana', partOfSpeech: 'Kata Benda' },
    { text: 'ですか', romaji: 'desu ka', meaning: 'Apakah?', partOfSpeech: 'Partikel' },
  ],
  '山手線ですね。まっすぐ行って、階段を上がった14番線です。': [
    { text: 'まっすぐ', romaji: 'massugu', meaning: 'Lurus ke depan', partOfSpeech: 'Kata Keterangan' },
    { text: '行って', furigana: 'いって', romaji: 'itte', meaning: 'Pergi / berjalan (bentuk -te)', partOfSpeech: 'Kata Kerja', kanjiComposition: [{ kanji: '行', meaning: 'Pergi' }] },
    { text: '階段', furigana: 'かいだん', romaji: 'kaidan', meaning: 'Anak tangga', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '階', meaning: 'Lantai' }, { kanji: '段', meaning: 'Tingkatan' }] },
    { text: 'を', romaji: 'o', meaning: 'Melalui (partikel arah)', partOfSpeech: 'Partikel' },
    { text: '上がった', furigana: 'あがった', romaji: 'agatta', meaning: 'Naik ke atas', partOfSpeech: 'Kata Kerja', kanjiComposition: [{ kanji: '上', meaning: 'Atas' }] },
    { text: '14番線', furigana: 'じゅうよんばんせん', romaji: 'juu-yon bansen', meaning: 'Peron jalur nomor 14', partOfSpeech: 'Kata Benda', kanjiComposition: [{ kanji: '番', meaning: 'Nomor' }, { kanji: '線', meaning: 'Jalur rel' }] },
    { text: 'です', romaji: 'desu', meaning: 'Adalah', partOfSpeech: 'Kopula / Salam' },
  ],
};

// Fallback token generator for any Japanese sentence not explicitly keyed
export const getSentenceTokens = (sentence: string): WordToken[] => {
  if (JAPANESE_DIALOGUE_TOKENS[sentence]) {
    return JAPANESE_DIALOGUE_TOKENS[sentence];
  }

  // Segment by spaces or punctuation if user enters dynamic sentence
  const parts = sentence.split(/([、。！？\s]+)/).filter(Boolean);
  return parts.map((part) => ({
    text: part,
    romaji: part,
    meaning: 'Kosa kata percakapan',
    partOfSpeech: 'Kata Benda',
  }));
};
