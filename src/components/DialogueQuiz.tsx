import React, { useState } from 'react';
import { CurriculumUnit, PracticeExercise } from '../types/curriculum';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES } from '../data/languages';
import { playAudioSentence, playSoundEffect, calculateSpeechAccuracy, getSpeechRecognition } from '../services/speechService';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Mic,
  Volume2
} from 'lucide-react';

interface DialogueQuizProps {
  unit: CurriculumUnit;
  onFinish: () => void;
}

export const DialogueQuiz: React.FC<DialogueQuizProps> = ({ unit, onFinish }) => {
  const { currentLanguage, addPoints } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];

  const exercises = unit.exercises;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Speech practice in quiz
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [spokenResult, setSpokenResult] = useState<string>('');

  const currentEx: PracticeExercise | undefined = exercises[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentEx?.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSoundEffect('success');
      setScore((prev) => prev + 1);
      addPoints(20);
    } else {
      playSoundEffect('click');
    }
  };

  const handleStartMic = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara.');
      return;
    }

    setIsRecording(true);
    setSpokenResult('');

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang.bcp47;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSpokenResult(transcript);
        setIsRecording(false);
        setIsAnswered(true);

        const acc = calculateSpeechAccuracy(currentEx?.targetSpeechText || currentEx?.correctAnswer || '', transcript);
        const passed = acc >= 60;
        setIsCorrect(passed);

        if (passed) {
          playSoundEffect('success');
          setScore((prev) => prev + 1);
          addPoints(25);
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setSpokenResult('');
    } else {
      setIsCompleted(true);
      playSoundEffect('streak');
      addPoints(30);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setIsCompleted(false);
    setSpokenResult('');
  };

  if (!currentEx || isCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Kuis Unit Selesai!
          </h3>
          <p className="text-xs text-slate-600 mb-6">
            Skor Anda: <strong className="text-indigo-600 text-sm font-bold">{score} / {exercises.length}</strong> pertanyaan benar. Poin pemahaman telah ditambahkan.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis</span>
            </button>
            <button
              onClick={onFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <span>Lanjut ke Kurikulum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* Progress Tracker */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4 pb-3 border-b border-slate-100">
          <span>Pertanyaan {currentIndex + 1} dari {exercises.length}</span>
          <span className="text-indigo-600 font-bold">{unit.titleId}</span>
        </div>

        {/* Question Prompt */}
        <div className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
          {currentEx.prompt}
        </div>

        {/* Options for reply_choice */}
        {currentEx.type === 'reply_choice' && currentEx.options && (
          <div className="space-y-3 mb-6">
            {currentEx.options.map((opt, oidx) => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentEx.correctAnswer;

              let buttonStyle = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';
              if (isAnswered) {
                if (isRight) {
                  buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                } else {
                  buttonStyle = 'border-slate-100 opacity-50 text-slate-400';
                }
              }

              return (
                <button
                  key={oidx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${buttonStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isRight && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                  {isAnswered && isSelected && !isRight && <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Pronunciation Exercise */}
        {currentEx.type === 'pronounce' && (
          <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 mb-6 text-center">
            <div className="text-xs text-indigo-900 font-medium mb-1">Target Pengucapan:</div>
            <div className="text-lg font-bold text-slate-900 mb-4">
              {currentEx.correctAnswer}
            </div>

            <div className="flex justify-center gap-3 mb-3">
              <button
                onClick={() => playAudioSentence(currentEx.correctAnswer, currentLang.bcp47, 0.9)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Dengarkan</span>
              </button>

              <button
                onClick={handleStartMic}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isRecording ? 'Mendengarkan...' : 'Tekan & Ucapkan'}</span>
              </button>
            </div>

            {spokenResult && (
              <div className="text-xs text-slate-700 mt-2">
                Suara Anda: "<strong>{spokenResult}</strong>"
              </div>
            )}
          </div>
        )}

        {/* Explanation Banner */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${
            isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <span className="font-bold block mb-1">
              {isCorrect ? '✓ Tepat Sekali!' : 'Perlu Diingat:'}
            </span>
            {currentEx.explanation}
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <span>{currentIndex + 1 < exercises.length ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Akhir'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
