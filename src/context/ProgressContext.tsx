import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/curriculum';

interface ProgressContextType {
  currentLanguage: SupportedLanguage;
  setCurrentLanguage: (lang: SupportedLanguage) => void;
  completedUnits: string[];
  markUnitCompleted: (unitId: string) => void;
  completedDialogues: string[];
  markDialogueCompleted: (dialogueId: string) => void;
  bookmarkedPhrases: string[];
  toggleBookmark: (phraseId: string) => void;
  isBookmarked: (phraseId: string) => boolean;
  streakDays: number;
  totalStudyPoints: number;
  addPoints: (amount: number) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  furiganaVisible: boolean;
  setFuriganaVisible: (visible: boolean) => void;
  romajiVisible: boolean;
  setRomajiVisible: (visible: boolean) => void;
}

const STORAGE_KEY = 'polyglot_learning_progress_v1';

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>('ja');
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);
  const [completedDialogues, setCompletedDialogues] = useState<string[]>([]);
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [totalStudyPoints, setTotalStudyPoints] = useState<number>(180);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [furiganaVisible, setFuriganaVisible] = useState<boolean>(true);
  const [romajiVisible, setRomajiVisible] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentLanguage) setCurrentLanguageState(parsed.currentLanguage);
        if (Array.isArray(parsed.completedUnits)) setCompletedUnits(parsed.completedUnits);
        if (Array.isArray(parsed.completedDialogues)) setCompletedDialogues(parsed.completedDialogues);
        if (Array.isArray(parsed.bookmarkedPhrases)) setBookmarkedPhrases(parsed.bookmarkedPhrases);
        if (typeof parsed.streakDays === 'number') setStreakDays(parsed.streakDays);
        if (typeof parsed.totalStudyPoints === 'number') setTotalStudyPoints(parsed.totalStudyPoints);
        if (typeof parsed.speechRate === 'number') setSpeechRate(parsed.speechRate);
        if (typeof parsed.romajiVisible === 'boolean') setRomajiVisible(parsed.romajiVisible);
      }
    } catch (e) {
      console.warn('Failed reading progress from localStorage:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      const data = {
        currentLanguage,
        completedUnits,
        completedDialogues,
        bookmarkedPhrases,
        streakDays,
        totalStudyPoints,
        speechRate,
        romajiVisible,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed saving progress to localStorage:', e);
    }
  }, [currentLanguage, completedUnits, completedDialogues, bookmarkedPhrases, streakDays, totalStudyPoints, speechRate, romajiVisible]);

  const setCurrentLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
  };

  const markUnitCompleted = (unitId: string) => {
    if (!completedUnits.includes(unitId)) {
      setCompletedUnits((prev) => [...prev, unitId]);
      setTotalStudyPoints((prev) => prev + 50);
    }
  };

  const markDialogueCompleted = (dialogueId: string) => {
    if (!completedDialogues.includes(dialogueId)) {
      setCompletedDialogues((prev) => [...prev, dialogueId]);
      setTotalStudyPoints((prev) => prev + 25);
    }
  };

  const toggleBookmark = (phraseId: string) => {
    setBookmarkedPhrases((prev) =>
      prev.includes(phraseId) ? prev.filter((id) => id !== phraseId) : [...prev, phraseId]
    );
  };

  const isBookmarked = (phraseId: string) => bookmarkedPhrases.includes(phraseId);

  const addPoints = (amount: number) => {
    setTotalStudyPoints((prev) => prev + amount);
  };

  return (
    <ProgressContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage,
        completedUnits,
        markUnitCompleted,
        completedDialogues,
        markDialogueCompleted,
        bookmarkedPhrases,
        toggleBookmark,
        isBookmarked,
        streakDays,
        totalStudyPoints,
        addPoints,
        speechRate,
        setSpeechRate,
        furiganaVisible,
        setFuriganaVisible,
        romajiVisible,
        setRomajiVisible,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
