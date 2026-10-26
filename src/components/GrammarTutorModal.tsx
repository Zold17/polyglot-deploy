import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES } from '../data/languages';
import { analyzeSentenceWithAI, SentenceAnalysis } from '../services/aiService';
import { playAudioSentence } from '../services/speechService';
import {
  Sparkles,
  X,
  Volume2,
  BookOpen,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface GrammarTutorModalProps {
  sentence: string;
  onClose: () => void;
}

export const GrammarTutorModal: React.FC<GrammarTutorModalProps> = ({ sentence, onClose }) => {
  const { currentLanguage } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];

  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    analyzeSentenceWithAI(currentLanguage, sentence)
      .then((data) => {
        if (isMounted) {
          setAnalysis(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sentence, currentLanguage]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bedah Tata Bahasa & Budaya AI
              </h3>
              <p className="text-xs text-slate-500">
                Tutor AI: Analisis mendalam ungkapan {currentLang.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Sentence Focus Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Kalimat Asli:
            </div>
            <div className="text-lg font-extrabold text-slate-900 leading-snug">
              {sentence}
            </div>
          </div>
          <button
            onClick={() => playAudioSentence(sentence, currentLang.bcp47, 0.9)}
            title="Dengarkan pelafalan"
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-xs font-semibold">Menganalisis nuansa tata bahasa dan budaya...</div>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            
            {/* Natural Translation */}
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="font-bold text-indigo-950 block mb-1">
                Terjemahan Alami Konteks Sehari-hari:
              </span>
              <p className="text-slate-700 text-sm leading-relaxed">
                "{analysis.naturalTranslation}"
              </p>
            </div>

            {/* Grammar Structure Breakdown */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Struktur Tata Bahasa:
              </span>
              <p className="text-slate-600 leading-relaxed">
                {analysis.grammarStructure}
              </p>
            </div>

            {/* Politeness / Formality Level */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">
                Tingkat Kesopanan (Register):
              </span>
              <p className="text-slate-600 leading-relaxed">
                {analysis.formalityLevel}
              </p>
            </div>

            {/* Cultural Nuance */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-950">
              <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                Catatan Budaya & Etiket:
              </span>
              <p className="leading-relaxed">
                {analysis.culturalNote}
              </p>
            </div>

            {/* Alternative Native Expressions */}
            {analysis.alternativeExpressions && analysis.alternativeExpressions.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">
                  Cara Alternatif Penutur Asli Mengatakannya:
                </span>
                <div className="space-y-2">
                  {analysis.alternativeExpressions.map((alt, aidx) => (
                    <div key={aidx} className="flex items-start gap-2 text-slate-700">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">{alt.phrase}</span>
                        <div className="text-[11px] text-slate-500">{alt.context}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Gagal memuat analisis. Silakan periksa koneksi.
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Mengerti, Lanjutkan Belajar
          </button>
        </div>

      </div>
    </div>
  );
};
