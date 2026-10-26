import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { LANGUAGES } from '../data/languages';
import { CurriculumUnit } from '../types/curriculum';
import {
  MessageSquare,
  CheckCircle,
  Play,
  Users,
  Lightbulb,
  Sparkles,
  ChevronRight,
  BookOpen,
  Volume2,
  ArrowRight
} from 'lucide-react';

interface CurriculumViewProps {
  onSelectUnit: (unit: CurriculumUnit, mode: 'dialogue' | 'roleplay' | 'quiz') => void;
  onOpenAIChat: () => void;
  onOpenScriptTab?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onSelectUnit, onOpenAIChat, onOpenScriptTab }) => {
  const { currentLanguage, completedUnits } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];
  const units = CURRICULUM_DATA[currentLanguage] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Kurikulum Percakapan</span>
            <span aria-hidden="true">·</span>
            <span>{currentLang.name}</span>
            <span aria-hidden="true">·</span>
            <span>{units.length} Unit Harian</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Peta Jalur Percakapan Sehari-hari
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Selesaikan percakapan bertahap mulai dari salam dan pemesanan kafe hingga mengatasi situasi darurat dan check-in hotel.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm min-w-[240px]">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
            <span>Kemajuan Bahasa Ini</span>
            <span className="font-bold text-indigo-600">
              {Math.round((completedUnits.filter(id => id.startsWith(currentLanguage)).length / Math.max(1, units.length)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedUnits.filter(id => id.startsWith(currentLanguage)).length / Math.max(1, units.length)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Japanese Hiragana & Kanji Spotlight Banner */}
      {currentLanguage === 'ja' && onOpenScriptTab && (
        <div className="bg-gradient-to-r from-rose-50 via-white to-indigo-50 border border-rose-200 rounded-2xl p-5 mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-jp font-black text-2xl shadow-sm shrink-0">
              あ/漢
            </div>
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">
                Modul Aksara Baru
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Belajar Kata Perkata: 46 Hiragana & Kanji Harian
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Eksplorasi tabel gojūon, cara baca Onyomi/Kunyomi, unsur pembentuk kanji, dan kuis tebak bacaan interaktif.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenScriptTab}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>Buka Modul Aksara & Kanji</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of 7 Curriculum Units */}
      <div className="space-y-6">
        {units.map((unit) => {
          const isDone = completedUnits.includes(unit.id);

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone
                  ? 'border-emerald-200 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="p-5 sm:p-6">
                
                {/* Unit Header Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      0{unit.unitNumber}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-indigo-600">
                        {unit.level}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        {unit.titleId}
                      </h3>
                    </div>
                  </div>

                  {isDone ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Selesai Dipelajari</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">
                      {unit.dialogue.turns.length} Dialog · {unit.keyVocabulary.length} Kosa Kata
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {unit.description}
                </p>

                {/* Cultural Tip Callout Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-5 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-amber-950">
                    <span className="font-bold text-amber-900 mr-1.5">
                      {unit.culturalTip.title}:
                    </span>
                    {unit.culturalTip.content}
                  </div>
                </div>

                {/* Dialogue Preview Snippet */}
                <div className="bg-slate-50 rounded-xl p-3.5 mb-5 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
                    <span>Cuplikan Percakapan: "{unit.dialogue.title}"</span>
                    <span className="text-[11px] text-slate-400">Skenario: {unit.scenario}</span>
                  </div>

                  <div className="space-y-2">
                    {unit.dialogue.turns.slice(0, 2).map((turn) => (
                      <div key={turn.id} className="text-xs flex items-start gap-2 text-slate-700">
                        <span className="font-bold text-slate-900 whitespace-nowrap min-w-[65px]">
                          {turn.speaker}:
                        </span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">{turn.text}</span>
                          {turn.romaji && (
                            <span className="text-slate-400 ml-2 italic">({turn.romaji})</span>
                          )}
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {turn.translation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectUnit(unit, 'dialogue')}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Studio Audio Dialog</span>
                    </button>

                    <button
                      onClick={() => onSelectUnit(unit, 'roleplay')}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Roleplay Interaktif</span>
                    </button>

                    <button
                      onClick={() => onSelectUnit(unit, 'quiz')}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Kuis Pemahaman</span>
                    </button>
                  </div>

                  <button
                    onClick={onOpenAIChat}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Latihan Bebas Topik Ini</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
