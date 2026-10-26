import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES, LANGUAGE_LIST } from '../data/languages';
import { SupportedLanguage } from '../types/curriculum';
import { Play, Sparkles, BookOpen, Volume2, CheckCircle2 } from 'lucide-react';
import { playAudioSentence } from '../services/speechService';

interface HeroBannerProps {
  onStartLearning: () => void;
  onOpenAIChat: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartLearning, onOpenAIChat }) => {
  const { currentLanguage, setCurrentLanguage, completedUnits, totalStudyPoints } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];

  // Specific contextual imagery for each language
  const languageImages: Record<SupportedLanguage, string> = {
    ja: '/src/assets/images/tokyo_cafe_dialogue_1792979491186.jpg',
    en: '/src/assets/images/hero_multilingual_culture_1792979489790.jpg',
    de: '/src/assets/images/berlin_transport_dialogue_1792979491629.jpg',
    nl: '/src/assets/images/amsterdam_canal_dialogue_1792979491661.jpg',
    fr: '/src/assets/images/paris_bistro_dialogue_1792979491650.jpg',
  };

  const handlePlayGreeting = () => {
    playAudioSentence(currentLang.greeting, currentLang.bcp47, 0.9);
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Interactive Language Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            Pilih Bahasa:
          </span>
          {LANGUAGE_LIST.map((lang) => {
            const isSelected = lang.id === currentLanguage;
            return (
              <button
                key={lang.id}
                onClick={() => setCurrentLanguage(lang.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
                <span className="text-slate-400 font-normal text-[11px] hidden sm:inline">
                  ({lang.nativeName.split(' ')[0]})
                </span>
              </button>
            );
          })}
        </div>

        {/* Hero 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-7">
            {/* Clean unboxed metadata separator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
              <span>5 Bahasa Dunia</span>
              <span aria-hidden="true">·</span>
              <span>Kurikulum Percakapan Sehari-hari</span>
              <span aria-hidden="true">·</span>
              <span>Audio Native + AI Coach</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4 text-balance">
              Bicara Lancar Bahasa{' '}
              <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                {currentLang.name}
              </span>{' '}
              dalam Situasi Nyata.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
              {currentLang.description} Dirancang khusus untuk pelajar Indonesia yang ingin langsung percaya diri memesan makanan, navigasi kota, belanja, dan bergaul dengan penutur asli.
            </p>

            {/* Quick Greeting Audio Tester Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={handlePlayGreeting}
                  title="Dengarkan pengucapan"
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Ungkapan Salam Harian ({currentLang.nativeName}):</div>
                  <div className="text-sm font-bold text-slate-900">{currentLang.greeting}</div>
                  <div className="text-xs text-slate-600 italic">{currentLang.greetingMeaning}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Audio Otentik
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStartLearning}
                className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Percakapan Unit 1</span>
              </button>

              <button
                onClick={onOpenAIChat}
                className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Simulasi Bebas dengan {currentLang.speakerPersona.name}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Visual Atmosphere with Cultural Context */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 group">
              <img
                src={languageImages[currentLanguage]}
                alt={`Suasana percakapan ${currentLang.name}`}
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Tutor Native: {currentLang.speakerPersona.name} · {currentLang.speakerPersona.city}</span>
                </div>
                <div className="text-sm font-medium text-slate-200 leading-snug">
                  "{currentLang.speakerPersona.intro}"
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Stat & Feature Strip Below */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Kurikulum Praktis</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">7 Unit Percakapan</div>
            <div className="text-xs text-slate-500 mt-1">Kafe, stasiun, toko & darurat</div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Latihan Suara</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">Audio & Mic STT</div>
            <div className="text-xs text-slate-500 mt-1">Dengarkan dan uji lafal langsung</div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Poin Belajar</div>
            <div className="text-xl font-bold text-indigo-600 mt-0.5 font-mono tabular-nums">
              {totalStudyPoints} XP
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {completedUnits.length} unit selesai
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">AI Partner 24/7</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">Gemini Coach</div>
            <div className="text-xs text-slate-500 mt-1">Penjelasan tata bahasa & budaya</div>
          </div>
        </div>

      </div>
    </section>
  );
};
