import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HIRAGANA_DATA,
  KANJI_DATA,
  KANJI_QUIZZES,
  KATAKANA_DATA,
  DAKUON_DATA,
} from '../data/japaneseScriptData';
import {
  HiraganaChar,
  KatakanaChar,
  DakuonChar,
  KanjiItem,
} from '../types/kanji';
import { playAudioSentence, playSoundEffect } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import { dissectSentenceWithAI, SentenceDissection } from '../services/aiService';
import {
  Volume2,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Layers,
  ChevronRight,
  PenTool,
  Eraser,
  Languages,
  Split,
  Loader2,
  Check,
} from 'lucide-react';

type ScriptTab = 'kanji' | 'hiragana' | 'katakana' | 'dakuon' | 'canvas' | 'dissect' | 'quiz';

export const JapaneseScriptExplorer: React.FC = () => {
  const { addPoints } = useProgress();
  const [activeTab, setActiveTab] = useState<ScriptTab>('kanji');

  // Hiragana state
  const [selectedHiragana, setSelectedHiragana] = useState<HiraganaChar | null>(HIRAGANA_DATA[0]);

  // Katakana state
  const [selectedKatakana, setSelectedKatakana] = useState<KatakanaChar | null>(KATAKANA_DATA[0]);

  // Dakuon state
  const [selectedDakuon, setSelectedDakuon] = useState<DakuonChar | null>(DAKUON_DATA[0]);
  const [dakuonFilter, setDakuonFilter] = useState<'all' | 'dakuten' | 'handakuten'>('all');

  // Kanji state
  const [selectedKanjiCategory, setSelectedKanjiCategory] = useState<string>('all');
  const [kanjiSearch, setKanjiSearch] = useState<string>('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);

  // Canvas Latihan Tulis state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasTargetChar, setCanvasTargetChar] = useState<string>('あ');
  const [canvasTargetLabel, setCanvasTargetLabel] = useState<string>('Hiragana "a" (あ)');
  const [canvasBrushColor, setCanvasBrushColor] = useState<string>('#1e293b');
  const [canvasBrushSize, setCanvasBrushSize] = useState<number>(6);
  const [hasDrawn, setHasDrawn] = useState(false);

  // AI Sentence Dissector state
  const [dissectInput, setDissectInput] = useState<string>(
    'すみません、おすすめのラーメンはどれですか？'
  );
  const [dissectResult, setDissectResult] = useState<SentenceDissection | null>(null);
  const [isDissecting, setIsDissecting] = useState<boolean>(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState<boolean>(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Filter Kanji
  const filteredKanji = KANJI_DATA.filter((k) => {
    const matchesCat = selectedKanjiCategory === 'all' || k.category === selectedKanjiCategory;
    const q = kanjiSearch.toLowerCase();
    const matchesSearch =
      !q ||
      k.kanji.includes(q) ||
      k.meaning.toLowerCase().includes(q) ||
      k.romaji.toLowerCase().includes(q) ||
      k.onyomi.some((on) => on.toLowerCase().includes(q)) ||
      k.kunyomi.some((kun) => kun.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Filter Dakuon
  const filteredDakuon = DAKUON_DATA.filter((d) => {
    if (dakuonFilter === 'all') return true;
    return d.type === dakuonFilter;
  });

  const handlePlayAudio = (text: string) => {
    playAudioSentence(text, 'ja-JP', 0.85);
  };

  // Canvas helper: Draw watermark and calligraphy guide lines
  const drawGuideGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, char: string) => {
    ctx.clearRect(0, 0, width, height);

    // Light border background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calligraphy cross guides (dashed)
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Diagonal guidelines
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.restore();

    // Watermark character for tracing
    if (char) {
      ctx.save();
      ctx.font = `bold ${Math.floor(width * 0.58)}px 'Noto Sans JP', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.fillText(char, width / 2, height / 2 + 8);
      ctx.restore();
    }
  }, []);

  // Initialize canvas when entering canvas tab or changing character
  useEffect(() => {
    if (activeTab === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGuideGrid(ctx, canvas.width, canvas.height, canvasTargetChar);
        setHasDrawn(false);
      }
    }
  }, [activeTab, canvasTargetChar, drawGuideGrid]);

  // Canvas Drawing Handlers
  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = canvasBrushColor;
    ctx.lineWidth = canvasBrushSize;

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGuideGrid(ctx, canvas.width, canvas.height, canvasTargetChar);
    setHasDrawn(false);
    playSoundEffect('click');
  };

  const handleSelectCharForCanvas = (char: string, label: string) => {
    setCanvasTargetChar(char);
    setCanvasTargetLabel(label);
    setActiveTab('canvas');
    handlePlayAudio(char);
  };

  // Sentence Dissection
  const handleDissectSentence = async () => {
    if (!dissectInput.trim() || isDissecting) return;
    setIsDissecting(true);
    try {
      const result = await dissectSentenceWithAI('ja', dissectInput.trim());
      setDissectResult(result);
      playSoundEffect('success');
      addPoints(15);
    } catch {
      // Fallback is handled inside dissectSentenceWithAI
    } finally {
      setIsDissecting(false);
    }
  };

  // Preset sentences for quick dissection
  const presetSentences = [
    { label: 'Pesan Ramen', sentence: 'すみません、おすすめのラーメンはどれですか？' },
    { label: 'Tanya Arah Kafe', sentence: '駅の近くにおいしいカフェがありますか？' },
    { label: 'Minta Bon Terpisah', sentence: 'お会計を別々でお願いします。' },
    { label: 'Tanya Kereta Stasiun', sentence: 'この電車は東京駅に行きますか？' },
    { label: 'Bicara Santun', sentence: '日本語を勉強しています。ゆっくり話してください。' },
  ];

  // Quiz handlers
  const handleSelectQuizOption = (opt: string) => {
    if (quizIsAnswered) return;
    setQuizSelectedOption(opt);
    setQuizIsAnswered(true);

    const currentQ = KANJI_QUIZZES[quizIndex];
    const isRight = opt === currentQ.correctAnswer;
    setQuizIsCorrect(isRight);

    if (isRight) {
      playSoundEffect('success');
      setQuizScore((prev) => prev + 1);
      addPoints(20);
    } else {
      playSoundEffect('click');
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < KANJI_QUIZZES.length) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizIsAnswered(false);
      setQuizIsCorrect(false);
    } else {
      setQuizFinished(true);
      playSoundEffect('streak');
      addPoints(35);
    }
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setQuizIsCorrect(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Aksara Jepang Lengkap</span>
            <span aria-hidden="true">·</span>
            <span>Hiragana · Katakana · Dakuon · Kanji</span>
            <span aria-hidden="true">·</span>
            <span>Papan Tulis & Pembedah AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laboratorium Aksara & Tata Bahasa Jepang
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Kuasai huruf Hiragana, Katakana, variasi bunyi, Kanji percakapan sehari-hari, latihan goresan tangan, serta pembedah kata otomatis dengan AI.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start lg:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('kanji')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kanji'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kanji ({KANJI_DATA.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hiragana')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hiragana'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Hiragana (46)</span>
          </button>
          <button
            onClick={() => setActiveTab('katakana')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'katakana'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Katakana (46)</span>
          </button>
          <button
            onClick={() => setActiveTab('dakuon')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dakuon'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Dakuten ({DAKUON_DATA.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'canvas'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Papan Tulis</span>
          </button>
          <button
            onClick={() => setActiveTab('dissect')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dissect'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bedah Kalimat AI</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kuis</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: KANJI COLLECTION */}
      {activeTab === 'kanji' && (
        <div>
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kanjiSearch}
                onChange={(e) => setKanjiSearch(e.target.value)}
                placeholder="Cari Kanji, arti (misal: air, makan, stasiun), atau cara baca..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'angka_waktu', label: 'Angka & Waktu' },
                { id: 'makanan_kafe', label: 'Makanan & Kafe' },
                { id: 'tempat_arah', label: 'Tempat & Arah' },
                { id: 'kegiatan_harian', label: 'Kegiatan Harian' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedKanjiCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedKanjiCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kanji Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKanji.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedKanji(item)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      JLPT {item.jlptLevel} · {item.strokeCount} Goresan
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(item.kanji);
                      }}
                      title="Dengarkan pengucapan Kanji"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Big Character Display */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-black font-jp text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.kanji}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.meaning}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.romaji}</div>
                    </div>
                  </div>

                  {/* Onyomi / Kunyomi Summary */}
                  <div className="space-y-1 text-[11px] bg-slate-50 rounded-xl p-2.5 mt-3 border border-slate-100">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-400 mr-1.5">Kunyomi:</span>
                      {item.kunyomi.length > 0 ? item.kunyomi.join(', ') : '-'}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-400 mr-1.5">Onyomi:</span>
                      {item.onyomi.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Example word preview & quick actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate mr-2">Contoh: {item.examples[0]?.word} ({item.examples[0]?.furigana})</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCharForCanvas(item.kanji, `Kanji "${item.meaning}" (${item.kanji})`);
                      }}
                      title="Latihan tulis di papan kanvas"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: HIRAGANA GOJUON CHART */}
      {activeTab === 'hiragana' && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tabel 46 Huruf Hiragana (五十音 - Gojūon)</h3>
                <p className="text-xs text-slate-500">Aksara silabis utama untuk kata asli Jepang, partikel tata bahasa, dan furigana.</p>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                46 Karakter
              </span>
            </div>

            {/* Grid of Hiragana Characters */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {HIRAGANA_DATA.map((h, hidx) => {
                const isSelected = selectedHiragana?.character === h.character;
                return (
                  <button
                    key={hidx}
                    onClick={() => {
                      setSelectedHiragana(h);
                      handlePlayAudio(h.character);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl font-black font-jp text-slate-900">
                      {h.character}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {h.romaji}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Hiragana Detail Card */}
          {selectedHiragana && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center shadow-xs">
                  <span className="text-5xl font-black font-jp text-indigo-900">
                    {selectedHiragana.character}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Karakter Terpilih:
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    Romaji: /{selectedHiragana.romaji}/
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Contoh kata: <strong className="text-slate-900">{selectedHiragana.exampleWord}</strong> ({selectedHiragana.exampleRomaji}) - {selectedHiragana.exampleMeaning}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handlePlayAudio(selectedHiragana.character)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengar Lafal</span>
                </button>
                <button
                  onClick={() => handlePlayAudio(selectedHiragana.exampleWord)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Contoh Kata</span>
                </button>
                <button
                  onClick={() => handleSelectCharForCanvas(selectedHiragana.character, `Hiragana "${selectedHiragana.romaji}" (${selectedHiragana.character})`)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-200/70 border border-indigo-200 rounded-xl transition-colors cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tulis di Papan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: KATAKANA CHART */}
      {activeTab === 'katakana' && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tabel 46 Huruf Katakana (片仮名)</h3>
                <p className="text-xs text-slate-500">Khusus kata serapan asing, nama mancanegara, menu kafe (kopi, ramen, roti), dan onomatopoeia.</p>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                46 Karakter
              </span>
            </div>

            {/* Grid of Katakana Characters */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {KATAKANA_DATA.map((k, kidx) => {
                const isSelected = selectedKatakana?.character === k.character;
                return (
                  <button
                    key={kidx}
                    onClick={() => {
                      setSelectedKatakana(k);
                      handlePlayAudio(k.character);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl font-black font-jp text-slate-900">
                      {k.character}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {k.romaji}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Katakana Detail Card */}
          {selectedKatakana && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-xs">
                  <span className="text-5xl font-black font-jp text-amber-900">
                    {selectedKatakana.character}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Karakter Katakana Terpilih:
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    Romaji: /{selectedKatakana.romaji}/
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Serapan kata: <strong className="text-slate-900">{selectedKatakana.exampleWord}</strong> ({selectedKatakana.exampleRomaji}) - {selectedKatakana.exampleMeaning}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handlePlayAudio(selectedKatakana.character)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengar Lafal</span>
                </button>
                <button
                  onClick={() => handlePlayAudio(selectedKatakana.exampleWord)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Contoh Kata Serapan</span>
                </button>
                <button
                  onClick={() => handleSelectCharForCanvas(selectedKatakana.character, `Katakana "${selectedKatakana.romaji}" (${selectedKatakana.character})`)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tulis di Papan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: DAKUON & HANDAKUON CHART */}
      {activeTab === 'dakuon' && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Variasi Bunyi: Dakuten (゛) & Handakuten (゜)</h3>
                <p className="text-xs text-slate-500">Tanda kutip (tenten) dan lingkaran kecil (maru) yang mengubah bunyi konsonan (K→G, S→Z, T→D, H→B/P).</p>
              </div>
              
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  onClick={() => setDakuonFilter('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    dakuonFilter === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Semua (25)
                </button>
                <button
                  onClick={() => setDakuonFilter('dakuten')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    dakuonFilter === 'dakuten' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Dakuten (が/ざ/だ/ば)
                </button>
                <button
                  onClick={() => setDakuonFilter('handakuten')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    dakuonFilter === 'handakuten' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Handakuten (ぱ)
                </button>
              </div>
            </div>

            {/* Grid of Dakuon Characters */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {filteredDakuon.map((d, didx) => {
                const isSelected = selectedDakuon?.character === d.character;
                return (
                  <button
                    key={didx}
                    onClick={() => {
                      setSelectedDakuon(d);
                      handlePlayAudio(d.character);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl font-black font-jp text-slate-900">
                      {d.character}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {d.romaji}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      ({d.baseChar} + {d.type === 'dakuten' ? '゛' : '゜'})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Dakuon Detail Card */}
          {selectedDakuon && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center shadow-xs">
                  <span className="text-5xl font-black font-jp text-emerald-900">
                    {selectedDakuon.character}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Karakter {selectedDakuon.type === 'dakuten' ? 'Dakuten (゛)' : 'Handakuten (゜)'}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    Romaji: /{selectedDakuon.romaji}/ (Perubahan dari '{selectedDakuon.baseChar}')
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Contoh kata: <strong className="text-slate-900">{selectedDakuon.exampleWord}</strong> ({selectedDakuon.exampleRomaji}) - {selectedDakuon.exampleMeaning}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handlePlayAudio(selectedDakuon.character)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengar Lafal</span>
                </button>
                <button
                  onClick={() => handlePlayAudio(selectedDakuon.exampleWord)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Contoh Kata</span>
                </button>
                <button
                  onClick={() => handleSelectCharForCanvas(selectedDakuon.character, `Dakuon "${selectedDakuon.romaji}" (${selectedDakuon.character})`)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tulis di Papan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: INTERACTIVE STROKE WRITING CANVAS */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Papan Latihan Goresan
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Target: {canvasTargetLabel}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayAudio(canvasTargetChar)}
                  title="Dengarkan pengucapan huruf target"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Bersihkan</span>
                </button>
              </div>
            </div>

            {/* Canvas Box with Grid & Watermark */}
            <div className="relative border-2 border-slate-300 rounded-3xl overflow-hidden shadow-inner bg-white select-none touch-none">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="cursor-crosshair w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] block"
                onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
                onMouseMove={(e) => drawMove(e.clientX, e.clientY)}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    drawMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* Brush Controls & Tips */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Warna Kuas:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#1e293b', label: 'Tinta Hitam' },
                    { color: '#4f46e5', label: 'Indigo' },
                    { color: '#dc2626', label: 'Merah' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setCanvasBrushColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        canvasBrushColor === c.color ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'opacity-80'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Tebal:</span>
                {[4, 6, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => setCanvasBrushSize(size)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      canvasBrushSize === size
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            {hasDrawn && (
              <div className="w-full mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Bagus! Latihan goresan Anda terekam di papan.</span>
                </div>
                <button
                  onClick={() => {
                    playSoundEffect('success');
                    addPoints(10);
                    handleClearCanvas();
                  }}
                  className="font-bold underline cursor-pointer hover:text-emerald-950"
                >
                  Selesai (+10 Poin)
                </button>
              </div>
            )}
          </div>

          {/* Quick Character Picker for Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Pilih Huruf untuk Ditulis
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Klik karakter di bawah untuk memuat bayangan panduan goresan (watermark).
              </p>

              {/* Hiragana samples */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Hiragana Dasar
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {HIRAGANA_DATA.slice(0, 10).map((h, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCharForCanvas(h.character, `Hiragana "${h.romaji}" (${h.character})`)}
                      className={`p-2 rounded-xl text-center border font-jp text-lg font-black cursor-pointer transition-all ${
                        canvasTargetChar === h.character
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {h.character}
                    </button>
                  ))}
                </div>
              </div>

              {/* Katakana samples */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Katakana Serapan
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {KATAKANA_DATA.slice(0, 10).map((k, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCharForCanvas(k.character, `Katakana "${k.romaji}" (${k.character})`)}
                      className={`p-2 rounded-xl text-center border font-jp text-lg font-black cursor-pointer transition-all ${
                        canvasTargetChar === k.character
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {k.character}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kanji samples */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Kanji Sehari-hari
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {KANJI_DATA.slice(0, 10).map((kj, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCharForCanvas(kj.kanji, `Kanji "${kj.meaning}" (${kj.kanji})`)}
                      className={`p-2 rounded-xl text-center border font-jp text-lg font-black cursor-pointer transition-all ${
                        canvasTargetChar === kj.kanji
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {kj.kanji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 mt-4">
              <strong>Aturan Goresan Tradisional:</strong> Tulis dari atas ke bawah, dari kiri ke kanan, dan garis horizontal sebelum garis vertikal.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: UNIVERSAL SENTENCE DISSECTION (PEMBEDAH KALIMAT AI) */}
      {activeTab === 'dissect' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Analisis Morfologi & Struktur Kata AI</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Pembedah Kalimat Jepang Kata demi Kata
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Ketikkan atau tempel kalimat Jepang apa saja. AI Gemini akan memecahnya menjadi partikel, kata benda, kata kerja, furigana, romaji, serta arti mendalam tiap Kanji.
            </p>

            {/* Input & Action */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={dissectInput}
                onChange={(e) => setDissectInput(e.target.value)}
                placeholder="Contoh: すみません、おすすめのラーメンはどれですか？"
                className="flex-1 px-4 py-3 text-sm font-jp border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={handleDissectSentence}
                disabled={isDissecting || !dissectInput.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDissecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Split className="w-4 h-4" />
                    <span>Bedah Kalimat</span>
                  </>
                )}
              </button>
            </div>

            {/* Preset Sentences */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
              <span className="text-slate-400 font-semibold shrink-0">Coba contoh:</span>
              {presetSentences.map((ps, i) => (
                <button
                  key={i}
                  onClick={() => setDissectInput(ps.sentence)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-[11px]"
                >
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dissection Result View */}
          {dissectResult && (
            <div className="bg-white rounded-3xl border border-indigo-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              {/* Header with audio */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    Terjemahan & Ringkasan Alami:
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    "{dissectResult.summary}"
                  </div>
                </div>
                <button
                  onClick={() => handlePlayAudio(dissectInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengar Kalimat Lengkap</span>
                </button>
              </div>

              {/* Tokens Word by Word Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Pembedahan Kata demi Kata ({dissectResult.tokens.length} Bagian):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dissectResult.tokens.map((tok, tidx) => (
                    <div
                      key={tidx}
                      className="bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {tok.furigana && (
                            <span className="text-[10px] font-bold text-indigo-600 block">
                              {tok.furigana}
                            </span>
                          )}
                          <div className="text-xl font-black font-jp text-slate-900">
                            {tok.text}
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                            /{tok.romaji}/
                          </div>
                        </div>

                        <button
                          onClick={() => handlePlayAudio(tok.text)}
                          title="Dengarkan kata ini"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/80">
                        <div className="text-xs font-bold text-slate-800">
                          {tok.meaning}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {tok.partOfSpeech}
                        </span>
                      </div>

                      {/* If Kanji Composition exists */}
                      {tok.kanjiComposition && tok.kanjiComposition.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">
                            Unsur Kanji:
                          </span>
                          <div className="space-y-1">
                            {tok.kanjiComposition.map((kc, kidx) => (
                              <div
                                key={kidx}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="font-jp font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {kc.kanji}
                                </span>
                                <span className="text-slate-600">{kc.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Etiquette / Nuance Note */}
              {dissectResult.culturalEtiquette && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 block mb-0.5">
                      Tata Krama & Etika Bahasa:
                    </span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {dissectResult.culturalEtiquette}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 7: KANJI & HIRAGANA READING QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto">
          {!quizFinished ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4 pb-3 border-b border-slate-100">
                <span>Soal {quizIndex + 1} dari {KANJI_QUIZZES.length}</span>
                <span className="text-indigo-600 font-bold">Kuis Tebak Bacaan & Makna</span>
              </div>

              {/* Target Character Callout */}
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6 relative">
                <span className="text-6xl font-black font-jp text-slate-900">
                  {KANJI_QUIZZES[quizIndex].targetCharacter}
                </span>
                <button
                  onClick={() => handlePlayAudio(KANJI_QUIZZES[quizIndex].targetCharacter)}
                  title="Dengarkan pengucapan"
                  className="absolute right-4 top-4 p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prompt */}
              <div className="text-base sm:text-lg font-bold text-slate-900 mb-5 text-center">
                {KANJI_QUIZZES[quizIndex].prompt}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {KANJI_QUIZZES[quizIndex].options.map((opt, oidx) => {
                  const isSelected = quizSelectedOption === opt;
                  const isRight = opt === KANJI_QUIZZES[quizIndex].correctAnswer;

                  let style = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';
                  if (quizIsAnswered) {
                    if (isRight) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected && !isRight) {
                      style = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    } else {
                      style = 'border-slate-200 opacity-50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={oidx}
                      disabled={quizIsAnswered}
                      onClick={() => handleSelectQuizOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {quizIsAnswered && isRight && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {quizIsAnswered && isSelected && !isRight && (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {quizIsAnswered && (
                <div
                  className={`p-4 rounded-2xl mb-6 text-xs ${
                    quizIsCorrect
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold mb-1">
                    {quizIsCorrect ? '🎉 Benar sekali!' : '💡 Belum tepat!'}
                  </div>
                  <p>{KANJI_QUIZZES[quizIndex].explanation}</p>
                </div>
              )}

              {/* Footer Button */}
              {quizIsAnswered && (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {quizIndex + 1 < KANJI_QUIZZES.length ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir'}
                </button>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-1">
                Kuis Aksara Selesai!
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Skor Anda: <strong className="text-slate-900 text-sm">{quizScore} / {KANJI_QUIZZES.length}</strong> jawaban benar
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto mb-6 text-xs text-slate-600">
                Latihan terus membaca Kanji dan Hiragana dalam dialog agar Anda terbiasa membaca menu restoran dan plang stasiun di Jepang.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleResetQuiz}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  onClick={() => setActiveTab('kanji')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  <span>Kembali ke Koleksi Kanji</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Kanji Deep Dive Modal */}
      {selectedKanji && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  JLPT {selectedKanji.jlptLevel} · {selectedKanji.strokeCount} Goresan
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">Detail Karakter Kanji</h4>
              </div>
              <button
                onClick={() => setSelectedKanji(null)}
                className="text-xs px-3 py-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Kanji Big Visual */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mb-4 relative">
              <span className="text-6xl sm:text-7xl font-black font-jp text-slate-900">
                {selectedKanji.kanji}
              </span>
              <div className="text-sm font-bold text-indigo-600 mt-1">
                Romaji: {selectedKanji.romaji}
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                Arti: "{selectedKanji.meaning}"
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    handleSelectCharForCanvas(selectedKanji.kanji, `Kanji "${selectedKanji.meaning}" (${selectedKanji.kanji})`);
                    setSelectedKanji(null);
                  }}
                  title="Latihan tulis di papan kanvas"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePlayAudio(selectedKanji.kanji)}
                  title="Dengarkan pengucapan"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Readings Table */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
                <span className="text-indigo-950 font-bold block mb-1">Cara Baca Kunyomi (Jepang):</span>
                <span className="text-slate-700 font-medium">{selectedKanji.kunyomi.length > 0 ? selectedKanji.kunyomi.join(', ') : 'Tidak ada'}</span>
              </div>
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3">
                <span className="text-rose-950 font-bold block mb-1">Cara Baca Onyomi (Sino-Jepang):</span>
                <span className="text-slate-700 font-medium">{selectedKanji.onyomi.join(', ')}</span>
              </div>
            </div>

            {/* Examples in real life conversation */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Contoh Penggunaan dalam Kosa Kata:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedKanji.examples.map((ex, eidx) => (
                  <div
                    key={eidx}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-jp">
                        {ex.word} <span className="text-xs font-medium text-indigo-600">({ex.furigana} / {ex.romaji})</span>
                      </div>
                      <div className="text-xs text-slate-600">{ex.meaning}</div>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(ex.word)}
                      title="Dengarkan kata ini"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  handleSelectCharForCanvas(selectedKanji.kanji, `Kanji "${selectedKanji.meaning}" (${selectedKanji.kanji})`);
                  setSelectedKanji(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Buka di Papan Tulis</span>
              </button>
              <button
                onClick={() => setSelectedKanji(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
