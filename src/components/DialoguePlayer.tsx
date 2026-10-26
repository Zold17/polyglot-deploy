import React, { useState, useEffect } from 'react';
import { CurriculumUnit, DialogueTurn } from '../types/curriculum';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES } from '../data/languages';
import { playAudioSentence, stopAudio, playSoundEffect, calculateSpeechAccuracy, getSpeechRecognition } from '../services/speechService';
import { getSentenceTokens } from '../data/japaneseWordTokens';
import { WordToken } from '../types/kanji';
import { WordBreakdownModal } from './WordBreakdownModal';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Info,
  BookOpen,
  Layers
} from 'lucide-react';

interface DialoguePlayerProps {
  unit: CurriculumUnit;
  onNextUnit?: () => void;
  onOpenGrammarModal: (sentence: string) => void;
  onSwitchToRoleplay: () => void;
}

export const DialoguePlayer: React.FC<DialoguePlayerProps> = ({
  unit,
  onNextUnit,
  onOpenGrammarModal,
  onSwitchToRoleplay,
}) => {
  const {
    currentLanguage,
    markDialogueCompleted,
    markUnitCompleted,
    completedUnits,
    speechRate,
    setSpeechRate,
    romajiVisible,
    setRomajiVisible,
    addPoints,
  } = useProgress();

  const currentLang = LANGUAGES[currentLanguage];
  const [activeTurnIndex, setActiveTurnIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<{ term: string; meaning: string } | null>(null);
  const [selectedToken, setSelectedToken] = useState<WordToken | null>(null);
  const [showBreakdownTokens, setShowBreakdownTokens] = useState<boolean>(true);

  // Microphone practice state
  const [activeRecordingTurnId, setActiveRecordingTurnId] = useState<string | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const turns = unit.dialogue.turns;
  const isUnitCompleted = completedUnits.includes(unit.id);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Play single line
  const handlePlayLine = (index: number) => {
    stopAudio();
    setActiveTurnIndex(index);
    const turn = turns[index];
    playAudioSentence(turn.text, currentLang.bcp47, speechRate, () => {
      setActiveTurnIndex(null);
    });
  };

  // Play entire conversation sequentially
  const handlePlayAll = () => {
    if (isPlayingAll) {
      stopAudio();
      setIsPlayingAll(false);
      setActiveTurnIndex(null);
      return;
    }

    setIsPlayingAll(true);
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= turns.length) {
        setIsPlayingAll(false);
        setActiveTurnIndex(null);
        playSoundEffect('success');
        return;
      }

      setActiveTurnIndex(currentIndex);
      const turn = turns[currentIndex];
      currentIndex += 1;

      playAudioSentence(turn.text, currentLang.bcp47, speechRate, () => {
        setTimeout(playNext, 600);
      });
    };

    playNext();
  };

  // Start speech recognition practice for a specific line
  const handleStartSpeakingPractice = (turn: DialogueTurn) => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API. Silakan gunakan Google Chrome atau Edge.');
      return;
    }

    stopAudio();
    setActiveRecordingTurnId(turn.id);
    setSpokenTranscript('');
    setSpeechScore(null);
    setIsListening(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang.bcp47;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        setIsListening(false);

        // Evaluate accuracy against target text or romaji
        const score = calculateSpeechAccuracy(turn.text, transcript);
        setSpeechScore(score);

        if (score >= 70) {
          playSoundEffect('success');
          addPoints(15);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleCompleteUnit = () => {
    markDialogueCompleted(unit.dialogue.title);
    markUnitCompleted(unit.id);
    playSoundEffect('streak');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Top Breadcrumb & Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>Unit 0{unit.unitNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{unit.level}</span>
              <span aria-hidden="true">·</span>
              <span>{currentLang.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {unit.dialogue.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Skenario: {unit.scenario}
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <span className="text-slate-400 px-1 text-[11px]">Kecepatan:</span>
              <button
                onClick={() => setSpeechRate(0.75)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  speechRate === 0.75 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                0.75x
              </button>
              <button
                onClick={() => setSpeechRate(0.95)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  speechRate === 0.95 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1.0x
              </button>
            </div>

            {/* Romaji toggle for Japanese */}
            {currentLanguage === 'ja' && (
              <>
                <button
                  onClick={() => setShowBreakdownTokens(!showBreakdownTokens)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    showBreakdownTokens
                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showBreakdownTokens ? 'Bedah Kata: Aktif' : 'Bedah Kata: Mati'}</span>
                </button>

                <button
                  onClick={() => setRomajiVisible(!romajiVisible)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    romajiVisible ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {romajiVisible ? 'Romaji Aktif' : 'Romaji Sembunyi'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Playback Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                isPlayingAll
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPlayingAll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlayingAll ? 'Jeda Audio Dialog' : 'Putar Seluruh Dialog'}</span>
            </button>

            <button
              onClick={onSwitchToRoleplay}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <span>Mode Roleplay Saya</span>
            </button>
          </div>

          {/* Speakers Present */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Penutur:</span>
            {unit.dialogue.speakers.map((spk, idx) => (
              <span key={idx} className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {spk.avatar} {spk.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Line-by-Line Dialogue List */}
      <div className="space-y-4 mb-8">
        {turns.map((turn, index) => {
          const isActive = activeTurnIndex === index;
          const isPracticingThis = activeRecordingTurnId === turn.id;

          return (
            <div
              key={turn.id}
              className={`bg-white rounded-2xl border p-5 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                    {turn.isUserSpeaker ? '🙋' : '💬'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {turn.speaker}
                  </span>
                  {turn.isUserSpeaker && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Giliran Anda
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Play audio button */}
                  <button
                    onClick={() => handlePlayLine(index)}
                    title="Dengarkan kalimat ini"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 transition-colors cursor-pointer ${
                      isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Microphone Practice Button */}
                  <button
                    onClick={() => handleStartSpeakingPractice(turn)}
                    title="Latih pengucapan dengan mikrofon"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isPracticingThis && isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPracticingThis && isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>

                  {/* Grammar / Culture AI Breakdown */}
                  <button
                    onClick={() => onOpenGrammarModal(turn.text)}
                    title="Bedah tata bahasa dan budaya dengan AI"
                    className="w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Target Text with Word-by-Word Breakdown */}
              <div className="pl-9">
                {currentLanguage === 'ja' && showBreakdownTokens ? (
                  <div className="mb-2">
                    <div className="flex flex-wrap items-end gap-x-2.5 gap-y-3 pt-2 pb-1">
                      {getSentenceTokens(turn.text).map((token, tidx) => (
                        <button
                          key={tidx}
                          onClick={() => setSelectedToken(token)}
                          title="Klik untuk membedah kata dan Kanji ini"
                          className="group inline-flex flex-col items-center p-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 transition-all cursor-pointer text-left"
                        >
                          {token.furigana ? (
                            <span className="text-[10px] font-bold text-indigo-600 tracking-wide font-jp leading-none mb-0.5">
                              {token.furigana}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-transparent leading-none mb-0.5 select-none">
                              -
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-black text-slate-900 font-jp leading-tight group-hover:text-indigo-700">
                            {token.text}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 group-hover:text-slate-600">
                            {token.romaji}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-1">
                      <Layers className="w-3 h-3" />
                      <span>Mode Bedah Kata: Klik setiap kata di atas untuk melihat arti & komponen Kanji.</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {turn.text}
                  </div>
                )}

                {/* Romaji (Japanese) or Phonetic Hint */}
                {turn.romaji && romajiVisible && (
                  <div className="text-xs font-medium text-indigo-700 mt-1 italic tracking-wide">
                    {turn.romaji}
                  </div>
                )}
                {turn.phonetic && (
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    /{turn.phonetic}/
                  </div>
                )}

                {/* Indonesian Translation */}
                <div className="text-sm text-slate-600 mt-1.5 font-normal">
                  {turn.translation}
                </div>

                {/* Grammar Context Note */}
                {turn.grammarNote && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{turn.grammarNote}</span>
                  </div>
                )}

                {/* Clickable Keywords */}
                {turn.keywords && turn.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Kosa kata:</span>
                    {turn.keywords.map((kw, kidx) => (
                      <button
                        key={kidx}
                        onClick={() => setSelectedWord(kw)}
                        className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        {kw.term}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Microphone Feedback Area */}
                {isPracticingThis && (
                  <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-indigo-600" />
                        {isListening ? 'Mendengarkan suara Anda... Silakan bicara!' : 'Hasil Analisis Suara:'}
                      </span>
                      {speechScore !== null && (
                        <span className={`font-mono font-bold ${speechScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          Akurasi: {speechScore}%
                        </span>
                      )}
                    </div>

                    {spokenTranscript && (
                      <div className="text-xs text-slate-800 bg-white p-2 rounded border border-indigo-100 mt-1">
                        Terdeteksi: "<span className="font-semibold">{spokenTranscript}</span>"
                      </div>
                    )}

                    {speechScore !== null && (
                      <div className="text-[11px] mt-1.5 font-medium text-indigo-900">
                        {speechScore >= 70 ? (
                          <span className="text-emerald-700">🎉 Luar biasa! Lafal Anda sangat jelas dan alami. (+15 XP)</span>
                        ) : (
                          <span className="text-amber-700">💡 Coba dengarkan lagi tombol audio lalu ulangi dengan tempo sedikit lebih lambat.</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Vocabulary Word Modal / Popover */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="text-xs font-semibold text-slate-400 mb-1">Arti Kosa Kata</div>
            <div className="text-lg font-bold text-slate-900 mb-1">{selectedWord.term}</div>
            <div className="text-sm text-indigo-600 font-medium mb-4">{selectedWord.meaning}</div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedWord(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Token Breakdown Modal */}
      {selectedToken && (
        <WordBreakdownModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}

      {/* Unit Completion Footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {isUnitCompleted ? 'Unit Ini Sudah Ditandai Selesai' : 'Selesai Mempelajari Dialog Ini?'}
            </div>
            <div className="text-xs text-slate-500">
              Dapatkan +50 XP dan simpan kemajuan Anda di kurikulum.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCompleteUnit}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isUnitCompleted
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isUnitCompleted ? 'Telah Ditandai Selesai' : 'Tandai Selesai (+50 XP)'}</span>
          </button>

          {onNextUnit && (
            <button
              onClick={onNextUnit}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              <span>Unit Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
