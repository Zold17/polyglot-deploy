import React from 'react';
import { WordToken } from '../types/kanji';
import { playAudioSentence } from '../services/speechService';
import { Volume2, X, Sparkles, BookOpen, Layers } from 'lucide-react';

interface WordBreakdownModalProps {
  token: WordToken;
  onClose: () => void;
}

export const WordBreakdownModal: React.FC<WordBreakdownModalProps> = ({ token, onClose }) => {
  const handlePlayAudio = () => {
    playAudioSentence(token.text, 'ja-JP', 0.85);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="text-xs font-bold text-slate-900">Bedah Kata Perkata</div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 text-center relative">
          {token.furigana && (
            <div className="text-xs font-semibold text-indigo-600 mb-0.5 tracking-wider">
              {token.furigana}
            </div>
          )}
          <div className="text-3xl font-black text-slate-900 font-jp tracking-tight">
            {token.text}
          </div>
          <div className="text-xs text-slate-500 font-medium italic mt-1">
            /{token.romaji}/
          </div>

          <button
            onClick={handlePlayAudio}
            title="Dengarkan pengucapan kata ini"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer transition-transform active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs mb-5">
          {/* Part of speech */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Jenis Kata (Tata Bahasa):</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {token.partOfSpeech}
            </span>
          </div>

          {/* Meaning */}
          <div className="py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium block mb-1">Arti Kontekstual:</span>
            <div className="text-sm font-extrabold text-slate-900 leading-snug">
              {token.meaning}
            </div>
          </div>

          {/* Kanji Components Breakdown if available */}
          {token.kanjiComposition && token.kanjiComposition.length > 0 && (
            <div className="pt-1">
              <span className="text-slate-500 font-medium block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-500" />
                Unsur Pembentuk Kanji:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {token.kanjiComposition.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-2.5"
                  >
                    <span className="text-xl font-black font-jp text-rose-700 shrink-0">
                      {comp.kanji}
                    </span>
                    <div className="text-[11px] leading-tight">
                      <div className="font-bold text-slate-900">{comp.kanji}</div>
                      <div className="text-slate-600">{comp.meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Mengerti, Lanjutkan
          </button>
        </div>

      </div>
    </div>
  );
};
