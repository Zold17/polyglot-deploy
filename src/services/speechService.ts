// Speech Synthesis & Recognition Services for Multilingual Daily Learning

export const playAudioSentence = (
  text: string,
  langCode: string,
  rate: number = 0.95,
  onEnd?: () => void
): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any currently playing audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
};

export const stopAudio = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Play subtle pleasant sound effects using Web Audio API
export const playSoundEffect = (type: 'success' | 'click' | 'streak') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'streak') {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch {
    // Gracefully ignore audio context limitations
  }
};

// Calculate string similarity (0 - 100%) for speech pronunciation testing
export const calculateSpeechAccuracy = (targetText: string, spokenText: string): number => {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?!'"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const target = clean(targetText);
  const spoken = clean(spokenText);

  if (!spoken || !target) return 0;
  if (target === spoken) return 100;

  // Simple token overlap and Levenshtein metric
  const targetWords = target.split(' ');
  const spokenWords = spoken.split(' ');

  let matches = 0;
  for (const word of targetWords) {
    if (spokenWords.includes(word)) {
      matches += 1;
    }
  }
  const tokenScore = (matches / Math.max(targetWords.length, spokenWords.length)) * 100;
  return Math.min(100, Math.round(tokenScore));
};

// Get Web Speech Recognition constructor safely
export const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};
