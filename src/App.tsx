import React, { useState } from 'react';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CurriculumView } from './components/CurriculumView';
import { DialoguePlayer } from './components/DialoguePlayer';
import { RoleplayMode } from './components/RoleplayMode';
import { AIChatPartner } from './components/AIChatPartner';
import { PhraseVault } from './components/PhraseVault';
import { DialogueQuiz } from './components/DialogueQuiz';
import { GrammarTutorModal } from './components/GrammarTutorModal';
import { JapaneseScriptExplorer } from './components/JapaneseScriptExplorer';
import { CURRICULUM_DATA } from './data/curriculumData';
import { LANGUAGES, LANGUAGE_LIST } from './data/languages';
import { CurriculumUnit } from './types/curriculum';

function AppContent() {
  const { currentLanguage } = useProgress();
  const currentUnits = CURRICULUM_DATA[currentLanguage] || [];

  const [activeTab, setActiveTab] = useState<'curriculum' | 'dialogue' | 'roleplay' | 'ai-partner' | 'phrases' | 'script'>('curriculum');
  const [selectedUnit, setSelectedUnit] = useState<CurriculumUnit>(currentUnits[0] || {} as CurriculumUnit);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [grammarModalSentence, setGrammarModalSentence] = useState<string | null>(null);

  // Update selected unit if current language changes and current unit is from another language
  React.useEffect(() => {
    if (!selectedUnit?.id?.startsWith(currentLanguage)) {
      setSelectedUnit(currentUnits[0] || ({} as CurriculumUnit));
    }
  }, [currentLanguage, currentUnits, selectedUnit]);

  const handleSelectUnit = (unit: CurriculumUnit, mode: 'dialogue' | 'roleplay' | 'quiz') => {
    setSelectedUnit(unit);
    if (mode === 'quiz') {
      setIsQuizMode(true);
      setActiveTab('curriculum');
    } else {
      setIsQuizMode(false);
      setActiveTab(mode);
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleNextUnit = () => {
    const currentIndex = currentUnits.findIndex((u) => u.id === selectedUnit.id);
    if (currentIndex !== -1 && currentIndex + 1 < currentUnits.length) {
      setSelectedUnit(currentUnits[currentIndex + 1]);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } else {
      setActiveTab('curriculum');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsQuizMode(false);
          setActiveTab(tab);
        }}
        onOpenAIChat={() => {
          setIsQuizMode(false);
          setActiveTab('ai-partner');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
      />

      {/* Hero Banner with Language Switching & Quick Play */}
      <HeroBanner
        onStartLearning={() => {
          setIsQuizMode(false);
          setSelectedUnit(currentUnits[0]);
          setActiveTab('dialogue');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenAIChat={() => {
          setIsQuizMode(false);
          setActiveTab('ai-partner');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 pb-16">
        {isQuizMode && selectedUnit ? (
          <DialogueQuiz
            unit={selectedUnit}
            onFinish={() => {
              setIsQuizMode(false);
              setActiveTab('curriculum');
            }}
          />
        ) : (
          <>
            {activeTab === 'curriculum' && (
              <CurriculumView
                onSelectUnit={handleSelectUnit}
                onOpenAIChat={() => {
                  setActiveTab('ai-partner');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                onOpenScriptTab={() => {
                  setActiveTab('script');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'dialogue' && selectedUnit && (
              <DialoguePlayer
                unit={selectedUnit}
                onNextUnit={handleNextUnit}
                onOpenGrammarModal={(sentence) => setGrammarModalSentence(sentence)}
                onSwitchToRoleplay={() => setActiveTab('roleplay')}
              />
            )}

            {activeTab === 'roleplay' && selectedUnit && (
              <RoleplayMode
                unit={selectedUnit}
                onFinishRoleplay={() => setActiveTab('curriculum')}
              />
            )}

            {activeTab === 'phrases' && <PhraseVault />}

            {activeTab === 'script' && <JapaneseScriptExplorer />}

            {activeTab === 'ai-partner' && <AIChatPartner />}
          </>
        )}
      </main>

      {/* Grammar & Cultural Analysis Modal */}
      {grammarModalSentence && (
        <GrammarTutorModal
          sentence={grammarModalSentence}
          onClose={() => setGrammarModalSentence(null)}
        />
      )}

      {/* Refined Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PolyglotLingo</span>
            <span>·</span>
            <span>Platform Pembelajaran Percakapan 5 Bahasa Dunia</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {LANGUAGE_LIST.map((lang) => (
              <span key={lang.id} className="text-slate-600">
                {lang.flag} {lang.name}
              </span>
            ))}
          </div>

          <div>
            Kurikulum Percakapan Sehari-hari · Bahasa Indonesia
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}
