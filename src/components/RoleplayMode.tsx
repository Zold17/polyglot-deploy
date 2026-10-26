import React, { useState, useEffect } from 'react';
import { CurriculumUnit, DialogueTurn } from '../types/curriculum';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES } from '../data/languages';
import { playAudioSentence, playSoundEffect, calculateSpeechAccuracy, stopAudio, getSpeechRecognition } from '../services/speechService';
import {
  Users,
  Mic,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RoleplayModeProps {
  unit: CurriculumUnit;
  onFinishRoleplay: () => void;
}

export const RoleplayMode: React.FC<RoleplayModeProps> = ({ unit, onFinishRoleplay }) => {
  const { currentLanguage, addPoints, romajiVisible } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];

  const turns = unit.dialogue.turns;
  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>(
    turns.find((t) => t.isUserSpeaker)?.speaker || 'Anda (Pejalan)'
  );
  const [history, setHistory] = useState<DialogueTurn[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [spokenInput, setSpokenInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [scoreFeedback, setScoreFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Reset and start from turn 0
    setCurrentTurnIdx(0);
    setHistory([]);
    setIsCompleted(false);
    setScoreFeedback(null);
  }, [unit]);

  const activeTurn = turns[currentTurnIdx];
  const isMyTurn = activeTurn && (activeTurn.isUserSpeaker || activeTurn.speaker === userRole);

  // Play audio automatically when computer speaks
  useEffect(() => {
    if (!activeTurn || isCompleted) return;

    if (!isMyTurn) {
      // Computer partner turn
      const timer = setTimeout(() => {
        playAudioSentence(activeTurn.text, currentLang.bcp47, 0.9, () => {
          // Add to visible history and step forward
          setHistory((prev) => [...prev, activeTurn]);
          if (currentTurnIdx + 1 < turns.length) {
            setCurrentTurnIdx((prev) => prev + 1);
          } else {
            setIsCompleted(true);
            playSoundEffect('streak');
            addPoints(40);
          }
        });
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [currentTurnIdx, isMyTurn, isCompleted]);

  // User submits their response (either via choice click or speaking)
  const handleUserRespond = (chosenText: string) => {
    playSoundEffect('click');
    setHistory((prev) => [...prev, { ...activeTurn, text: chosenText }]);
    setScoreFeedback('Jawaban tepat! Percakapan berlanjut...');

    setTimeout(() => {
      setScoreFeedback(null);
      if (currentTurnIdx + 1 < turns.length) {
        setCurrentTurnIdx((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        playSoundEffect('streak');
        addPoints(40);
      }
    }, 900);
  };

  // Speech input for roleplay
  const handleStartMic = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API.');
      return;
    }

    setIsRecording(true);
    setSpokenInput('');

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang.bcp47;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSpokenInput(transcript);
        setIsRecording(false);

        const acc = calculateSpeechAccuracy(activeTurn.text, transcript);
        if (acc >= 50) {
          handleUserRespond(activeTurn.text);
        } else {
          setScoreFeedback(`Lafal terdeteksi: "${transcript}". Coba ulangi lagi lebih jelas.`);
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Generate plausible alternative response choices for multiple-choice interaction
  const generateChoices = () => {
    if (!activeTurn) return [];
    return [
      activeTurn.text,
      `[Alternatif Sopan] ${activeTurn.text}`,
      activeTurn.keywords?.[0] ? `${activeTurn.keywords[0].term} をお願いします` : 'はい、大丈夫です。',
    ];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Roleplay Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <Users className="w-4 h-4" />
            <span>Mode Roleplay Simulasi Percakapan</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Unit 0{unit.unitNumber} · {unit.dialogue.title}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Masuklah ke dalam skenario nyata: <strong>{unit.scenario}</strong>. Tanggapi percakapan lawan bicara secara langsung.
        </p>
      </div>

      {/* Roleplay Dialogue Arena */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mb-6 min-h-[380px] flex flex-col justify-between shadow-xs">
        
        {/* Chat History Flow */}
        <div className="space-y-4 mb-6">
          {history.map((turn, i) => {
            const isMe = turn.isUserSpeaker || turn.speaker === userRole;
            return (
              <div
                key={i}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end animate-in fade-in duration-200`}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0">
                  {isMe ? '🙋' : '💬'}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-4 ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <div className="text-[11px] font-bold opacity-75 mb-1">
                    {turn.speaker}
                  </div>
                  <div className="text-sm sm:text-base font-bold leading-snug">
                    {turn.text}
                  </div>
                  {turn.romaji && romajiVisible && (
                    <div className={`text-xs mt-1 italic ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`}>
                      {turn.romaji}
                    </div>
                  )}
                  <div className={`text-xs mt-1 ${isMe ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {turn.translation}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Active Pending Computer Turn Indicator */}
          {!isMyTurn && !isCompleted && activeTurn && (
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm">
                💬
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="animate-spin text-indigo-600">●</span>
                <span>{activeTurn.speaker} sedang berbicara...</span>
              </div>
            </div>
          )}
        </div>

        {/* User Interaction Controls When It's User Turn */}
        {isMyTurn && !isCompleted && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Giliran Anda Membalas ({userRole}):</span>
              <span className="text-[11px] text-indigo-600 font-semibold">Pilih atau Ucapkan</span>
            </div>

            {/* Prompt Hint */}
            <div className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
              Maksud yang ingin disampaikan: <em>"{activeTurn.translation}"</em>
            </div>

            {/* Response Options */}
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleUserRespond(activeTurn.text)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
              >
                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                  {activeTurn.text}
                </div>
                {activeTurn.romaji && (
                  <div className="text-xs text-indigo-600 italic mt-0.5">
                    {activeTurn.romaji}
                  </div>
                )}
              </button>
            </div>

            {/* Speak with microphone button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleStartMic}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isRecording ? 'Mendengarkan... Bicaralah!' : 'Ucapkan Langsung (Mic)'}</span>
              </button>

              {scoreFeedback && (
                <span className="text-xs font-semibold text-indigo-600 animate-fade-in">
                  {scoreFeedback}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Completion Congratulations */}
        {isCompleted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950 mb-1">
              Roleplay Percakapan Berhasil Diselesaikan!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto mb-4">
              Hebat! Anda telah mempraktikkan alur percakapan ini dari awal hingga akhir dengan penutur asli. (+40 XP didapatkan)
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentTurnIdx(0);
                  setHistory([]);
                  setIsCompleted(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Roleplay</span>
              </button>
              <button
                onClick={onFinishRoleplay}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer shadow-sm"
              >
                <span>Kembali ke Kurikulum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
