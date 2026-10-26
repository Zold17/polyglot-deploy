import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { LANGUAGES } from '../data/languages';
import { VocabularyItem } from '../types/curriculum';
import { playAudioSentence } from '../services/speechService';
import {
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Filter,
  Sparkles,
  Layers
} from 'lucide-react';

export const PhraseVault: React.FC = () => {
  const { currentLanguage, bookmarkedPhrases, toggleBookmark, romajiVisible } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];
  const units = CURRICULUM_DATA[currentLanguage] || [];

  // Aggregate all vocabulary from all units of this language
  const allPhrases: VocabularyItem[] = units.flatMap((u) => u.keyVocabulary);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'salam', label: 'Salam & Kesopanan' },
    { id: 'makanan', label: 'Kafe & Makanan' },
    { id: 'arah', label: 'Arah & Transport' },
    { id: 'belanja', label: 'Belanja & Ukuran' },
    { id: 'darurat', label: 'Darurat & Apotek' },
    { id: 'obrolan', label: 'Obrolan Santai' },
    { id: 'hotel', label: 'Hotel & Menginap' },
  ];

  const filteredPhrases = allPhrases.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesBookmark = !onlyBookmarks || bookmarkedPhrases.includes(item.id);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.word.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q) ||
      (item.romaji && item.romaji.toLowerCase().includes(q));

    return matchesCat && matchesBookmark && matchesSearch;
  });

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Kamus Ungkapan Bertahan Hidup</span>
            <span aria-hidden="true">·</span>
            <span>{currentLang.name}</span>
            <span aria-hidden="true">·</span>
            <span>{allPhrases.length} Frasa Kunci</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kamus Cepat Percakapan Harian
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Kumpulan ungkapan wajib yang paling sering diucapkan penutur asli dalam kehidupan sehari-hari lengkap dengan audio dan fitur latihan ingat.
          </p>
        </div>

        {/* Filter Bookmarks Toggle */}
        <button
          onClick={() => setOnlyBookmarks(!onlyBookmarks)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            onlyBookmarks
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Hanya Ditandai ({bookmarkedPhrases.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari frasa dalam bahasa asing atau artinya..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl pl-9 pr-3 py-2.5 outline-none border border-slate-200 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Pills (Functional Filter Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phrases Grid Cards */}
      {filteredPhrases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Tidak ada frasa yang sesuai dengan pencarian atau filter yang dipilih.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhrases.map((phrase) => {
            const isBookmarked = bookmarkedPhrases.includes(phrase.id);
            const isRevealed = revealedIds.includes(phrase.id);

            return (
              <div
                key={phrase.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {phrase.category.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => playAudioSentence(phrase.word, currentLang.bcp47, 0.9)}
                        title="Dengarkan pengucapan"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleBookmark(phrase.id)}
                        title="Tandai frasa ini"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Foreign Word */}
                  <div className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                    {phrase.word}
                  </div>

                  {/* Romaji or Phonetic */}
                  {phrase.romaji && romajiVisible && (
                    <div className="text-xs text-indigo-600 font-medium italic mb-2">
                      {phrase.romaji}
                    </div>
                  )}
                  {phrase.phonetic && (
                    <div className="text-xs text-slate-400 font-mono mb-2">
                      /{phrase.phonetic}/
                    </div>
                  )}
                </div>

                {/* Meaning & Reveal Toggle for Flashcard Style Recall */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-slate-700 font-medium leading-relaxed">
                      {phrase.meaning}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
