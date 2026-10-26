import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES, LANGUAGE_LIST } from '../data/languages';
import { SupportedLanguage } from '../types/curriculum';
import { MessageSquareQuote, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: 'curriculum' | 'dialogue' | 'roleplay' | 'ai-partner' | 'phrases' | 'script';
  setActiveTab: (tab: 'curriculum' | 'dialogue' | 'roleplay' | 'ai-partner' | 'phrases' | 'script') => void;
  onOpenAIChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAIChat }) => {
  const { currentLanguage, setCurrentLanguage, streakDays } = useProgress();
  const currentLangInfo = LANGUAGES[currentLanguage];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('curriculum');
          }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            PL
          </span>
          <span>PolyglotLingo</span>
        </a>

        {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'curriculum' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
            }`}
          >
            Kurikulum
          </button>
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'dialogue' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
            }`}
          >
            Studio Dialog
          </button>
          <button
            onClick={() => setActiveTab('roleplay')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'roleplay' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
            }`}
          >
            Roleplay
          </button>
          {currentLanguage === 'ja' && (
            <button
              onClick={() => setActiveTab('script')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'script' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : 'hover:text-slate-900 text-rose-700'
              }`}
            >
              <span>Aksara & Kanji</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('phrases')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'phrases' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
            }`}
          >
            Kamus Cepat
          </button>
          <button
            onClick={() => setActiveTab('ai-partner')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'ai-partner' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
            }`}
          >
            Tutor AI
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Pilih Bahasa"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
              className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border-0 rounded-lg px-2.5 py-1.5 cursor-pointer appearance-none pr-7 focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {LANGUAGE_LIST.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 text-slate-500 text-xs">▼</div>
          </div>

          {/* Quick Streak Indicator */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays} Hari</span>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
            <span>Tanya AI ({currentLangInfo.speakerPersona.name})</span>
          </button>
        </div>

      </div>
    </header>
  );
};
