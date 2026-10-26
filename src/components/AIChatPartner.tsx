import React, { useState, useRef, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { LANGUAGES } from '../data/languages';
import { AIChatMessage, SupportedLanguage } from '../types/curriculum';
import { sendAIChatMessage } from '../services/aiService';
import { playAudioSentence, playSoundEffect, stopAudio, getSpeechRecognition } from '../services/speechService';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Info,
  RotateCcw,
  Bot,
  User,
  Coffee,
  Compass,
  ShoppingBag,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';

const SCENARIOS = [
  { id: 'cafe', title: 'Di Kafe & Restoran', icon: Coffee, desc: 'Memesan minuman, menu favorit, dan membayar bon' },
  { id: 'transit', title: 'Arah & Stasiun Kereta', icon: Compass, desc: 'Menanyakan jadwal peron, rute metro, dan jalan kota' },
  { id: 'shopping', title: 'Belanja & Toko Suvenir', icon: ShoppingBag, desc: 'Menanyakan harga, ukuran baju, dan fasilitas bebas pajak' },
  { id: 'smalltalk', title: 'Obrolan Santai & Hobi', icon: MessageCircle, desc: 'Membicarakan musik, makanan, dan akhir pekan' },
  { id: 'emergency', title: 'Apotek & Situasi Darurat', icon: ShieldAlert, desc: 'Membeli obat flu, sakit kepala, dan bantuan medis' },
];

export const AIChatPartner: React.FC = () => {
  const { currentLanguage, romajiVisible, addPoints } = useProgress();
  const currentLang = LANGUAGES[currentLanguage];
  const persona = currentLang.speakerPersona;

  const [activeScenario, setActiveScenario] = useState<string>('cafe');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when language or scenario changes
  useEffect(() => {
    const initialGreetings: Record<SupportedLanguage, { text: string; romaji?: string; translation: string; tip: string; suggestions: string[] }> = {
      ja: {
        text: 'こんにちは！いらっしゃいませ。今日はお飲み物ですか、それともお食事ですか？',
        romaji: 'Konnichiwa! Irasshaimase. Kyou wa onomimono desu ka, sore tomo oshokuji desu ka?',
        translation: 'Halo! Selamat datang. Hari ini ingin memesan minuman atau makanan?',
        tip: 'Jawab dengan menyebutkan pesanan Anda diikuti kata "kudasai" (tolong).',
        suggestions: [
          'ホットコーヒーを一つください (Hotto koohii o hitotsu kudasai - Minta 1 kopi panas tolong)',
          'おすすめは何ですか？ (Osusume wa nan desu ka? - Apa rekomendasinya?)',
          'メニューを見せてください (Menyuu o misete kudasai - Tolong perlihatkan menunya)',
        ],
      },
      en: {
        text: "Hi there! Welcome. What can I get started for you today?",
        translation: 'Halo! Selamat datang. Apa yang bisa saya siapkan untuk Anda hari ini?',
        tip: 'Start your request with "Could I have..." or "I\'d like a..." for a natural tone.',
        suggestions: [
          'Could I get a flat white, please? (Bisakah saya pesan kopi flat white tolong?)',
          'What do you recommend today? (Apa rekomendasi Anda hari ini?)',
          'Just a glass of water for now, thanks! (Segelas air putih dulu untuk sekarang, terima kasih!)',
        ],
      },
      de: {
        text: 'Guten Tag! Willkommen bei uns. Was darf ich Ihnen heute bringen?',
        translation: 'Selamat siang! Selamat datang di tempat kami. Apa yang bisa saya bawakan untuk Anda hari ini?',
        tip: 'Verwenden Sie "Ich hätte gerne..." um höflich zu bestellen.',
        suggestions: [
          'Ich hätte gerne einen Kaffee und ein Croissant, bitte. (Saya ingin kopi dan croissant, tolong)',
          'Was ist die Spezialität des Hauses? (Apa menu spesial di sini?)',
          'Haben Sie auch pflanzliche Milch? (Apakah ada susu nabati/oat?)',
        ],
      },
      nl: {
        text: 'Hoi! Welkom. Waar heb je vandaag zin in?',
        translation: 'Halo! Selamat datang. Mau memesan apa yang enak hari ini?',
        tip: 'Orang Belanda sangat menyukai ungkapan santai seperti "Mag ik een..."',
        suggestions: [
          'Mag ik een koffie verkeerd, alsjeblieft? (Bolehkah saya pesan kopi susu tolong?)',
          'Hebben jullie ook appeltaart? (Apakah ada kue pai apel?)',
          'Wat is jullie lekkerste broodje? (Roti apa yang paling lezat di sini?)',
        ],
      },
      fr: {
        text: 'Bonjour ! Bienvenue. Qu’est-ce qui vous ferait plaisir aujourd’hui ?',
        translation: 'Halo! Selamat datang. Apa yang ingin Anda nikmati hari ini?',
        tip: 'Awali jawaban Anda dengan "Bonjour" dan gunakan "Je voudrais... s\'il vous plaît".',
        suggestions: [
          'Bonjour ! Je voudrais un café au lait, s’il vous plaît. (Halo! Saya ingin kopi susu, tolong)',
          'Avez-vous une formule petit-déjeuner ? (Apakah ada paket sarapan?)',
          'Quel est le plat du jour ? (Apa menu spesial hari ini?)',
        ],
      },
    };

    const initial = initialGreetings[currentLanguage] || initialGreetings.en;

    setMessages([
      {
        id: 'init-1',
        sender: 'assistant',
        text: initial.text,
        romaji: initial.romaji,
        translation: initial.translation,
        grammarTip: initial.tip,
        suggestedReplies: initial.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentLanguage, activeScenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    stopAudio();

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const scenarioObj = SCENARIOS.find((s) => s.id === activeScenario);
      const scenarioDesc = scenarioObj ? `${scenarioObj.title} - ${scenarioObj.desc}` : 'Percakapan sehari-hari';

      const res = await sendAIChatMessage(currentLanguage, scenarioDesc, text, history);

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        romaji: res.romaji,
        phonetic: res.phonetic,
        translation: res.translation,
        grammarTip: res.grammarTip,
        suggestedReplies: res.suggestedReplies,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      addPoints(10);

      // Play audio response automatically
      playAudioSentence(res.reply, currentLang.bcp47, 0.9);
    } catch (err) {
      console.warn('AI chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMic = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API.');
      return;
    }

    setIsRecording(true);
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang.bcp47;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Top Partner Persona Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={persona.avatar}
              alt={persona.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 text-base">{currentLang.flag}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{persona.name}</h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tutor AI Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">{persona.role} · {persona.city}</p>
            <p className="text-xs text-slate-600 mt-1 italic">"{persona.intro}"</p>
          </div>
        </div>

        {/* Reset Conversation Button */}
        <button
          onClick={() => {
            const initialGreetings = messages[0];
            if (initialGreetings) setMessages([initialGreetings]);
            playSoundEffect('click');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Mulai Ulang Percakapan</span>
        </button>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
          Topik:
        </span>
        {SCENARIOS.map((sc) => {
          const isSelected = activeScenario === sc.id;
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 mb-4 min-h-[440px] max-h-[560px] overflow-y-auto flex flex-col justify-between shadow-inner">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs shrink-0 overflow-hidden">
                  {isUser ? (
                    <User className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <img src={persona.avatar} alt="AI" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold opacity-75">
                      {isUser ? 'Anda' : persona.name}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => playAudioSentence(msg.text, currentLang.bcp47, 0.9)}
                        title="Dengarkan pengucapan"
                        className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-sm sm:text-base font-bold leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Romaji for Japanese or Phonetic */}
                  {msg.romaji && romajiVisible && (
                    <div className={`text-xs mt-1 italic tracking-wide ${isUser ? 'text-indigo-200' : 'text-indigo-600 font-medium'}`}>
                      {msg.romaji}
                    </div>
                  )}

                  {/* Translation */}
                  {msg.translation && (
                    <div className={`text-xs mt-1.5 ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {msg.translation}
                    </div>
                  )}

                  {/* Grammar & Culture Coach Tip */}
                  {msg.grammarTip && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5 bg-slate-50/80 p-2 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{msg.grammarTip}</span>
                    </div>
                  )}

                  {/* Suggested Replies */}
                  {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        Ide balasan cepat:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedReplies.map((reply, ridx) => (
                          <button
                            key={ridx}
                            onClick={() => handleSendMessage(reply.split('(')[0].trim())}
                            className="text-left text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            💬 {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1">{persona.name} sedang merespon percakapan...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm flex items-center gap-2">
        <button
          onClick={handleStartMic}
          title="Bicara lewat Mikrofon"
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={`Balas dalam ${currentLang.name} atau Indonesia...`}
          className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent px-2 py-1 outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
            inputText.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
