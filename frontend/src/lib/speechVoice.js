/**
 * SANKALP AI Expressive Speech Engine
 * Human-like Audio Read Aloud for University Students
 * - Cleans markdown artifacts so speech sounds natural
 * - Prioritizes Natural / Neural Indian English & Hindi voices
 * - Chunks long text to bypass browser speech synthesis timeouts
 */

let activeUtteranceQueue = [];
let currentChunkIndex = 0;
let isSpeakingActive = false;
let isPausedState = false;
let activeMessageId = null;
let currentRate = 1.0;
let onStateChangeCallback = null;

export function registerSpeechListener(callback) {
  onStateChangeCallback = callback;
}

export function unregisterSpeechListener() {
  onStateChangeCallback = null;
}

function notifyStateChange() {
  if (typeof onStateChangeCallback === 'function') {
    onStateChangeCallback({
      isPlaying: isSpeakingActive && !isPausedState,
      isPaused: isPausedState,
      activeMessageId,
      rate: currentRate,
    });
  }
}

/**
 * Clean markdown and technical syntax so the voice reads like an expressive human teacher
 */
export function cleanTextForSpeech(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';
  let text = markdown;

  // 1. Convert code blocks into a natural spoken announcement
  text = text.replace(/```[a-z]*\n([\s\S]*?)```/gi, (_, code) => {
    const lines = code.trim().split('\n');
    if (lines.length <= 2) {
      return ` Here is a code example: ${code.replace(/[{}();<>=]/g, ' ')}. `;
    }
    return ' Refer to the complete code implementation shown on your screen. ';
  });

  // 2. Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Convert LaTeX math formulas into clear spoken words
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, ' Formula. ');
  text = text.replace(/\\boxed\{([^}]+)\}/g, '$1');
  text = text.replace(/\$([^$]+)\$/g, '$1');

  // 4. Clean Markdown headings (##, ###) into spoken pauses
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');

  // 5. Clean up bold & italics
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // 6. Clean table pipes and delimiters
  text = text.replace(/\|[ \t]*\|/g, '');
  text = text.replace(/\|[-:]+\|/g, '');
  text = text.replace(/\|/g, ', ');

  // 7. Clean bullet points & numbered lists
  text = text.replace(/^[-*•]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 8. Clean horizontal rules, blockquote symbols
  text = text.replace(/^>+\s*/gm, '');
  text = text.replace(/^-{3,}$/gm, '');

  // 9. Clean multiple newlines and spaces
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Pick the most natural, human-like voice available on user's device
 */
export function getBestNaturalVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Natural / Neural Indian English Voice (e.g. Edge Neerja, Prabhat, Rishi Enhanced)
  const indianNatural = voices.find(
    (v) => (v.lang === 'en-IN' || v.lang === 'en_IN') && /(natural|neural|online|enhanced)/i.test(v.name)
  );
  if (indianNatural) return indianNatural;

  // 2. Standard Indian English Voice
  const indianEng = voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN');
  if (indianEng) return indianEng;

  // 3. Natural Hindi Voice
  const hindiNatural = voices.find(
    (v) => (v.lang === 'hi-IN' || v.lang === 'hi_IN') && /(natural|neural|online|enhanced|google)/i.test(v.name)
  );
  if (hindiNatural) return hindiNatural;

  // 4. Other Hindi Voice
  const hindi = voices.find((v) => v.lang === 'hi-IN' || v.lang === 'hi_IN');
  if (hindi) return hindi;

  // 5. High-quality UK / US English Natural Voice
  const englishNatural = voices.find(
    (v) => /(natural|neural|enhanced|google)/i.test(v.name) && v.lang.startsWith('en')
  );
  if (englishNatural) return englishNatural;

  // 6. Fallback to any English voice
  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

/**
 * Split text into natural sentence chunks (~150-200 characters)
 * This prevents mobile browser and WebKit speech synthesis cancellation bugs on long texts.
 */
function splitIntoSentences(text) {
  if (!text) return [];
  // Split on punctuation (. ? ! \n)
  const rawParts = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const part of rawParts) {
    if ((current + ' ' + part).length > 200 && current.length > 0) {
      chunks.push(current.trim());
      current = part;
    } else {
      current = (current + ' ' + part).trim();
    }
  }
  if (current.length > 0) chunks.push(current.trim());
  return chunks;
}

/**
 * Play Speech for a given message
 */
export function playSpeech({ messageId, content, rate = currentRate, onFinish }) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  // If already playing this message, resume if paused
  if (activeMessageId === messageId && isPausedState) {
    window.speechSynthesis.resume();
    isPausedState = false;
    notifyStateChange();
    return true;
  }

  // Stop any ongoing speech
  stopSpeech();

  const cleaned = cleanTextForSpeech(content);
  if (!cleaned) return false;

  const chunks = splitIntoSentences(cleaned);
  if (chunks.length === 0) return false;

  activeUtteranceQueue = chunks;
  currentChunkIndex = 0;
  isSpeakingActive = true;
  isPausedState = false;
  activeMessageId = messageId;
  currentRate = rate;

  function speakNextChunk() {
    if (!isSpeakingActive || currentChunkIndex >= activeUtteranceQueue.length) {
      stopSpeech();
      if (typeof onFinish === 'function') onFinish();
      return;
    }

    const chunkText = activeUtteranceQueue[currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    const voice = getBestNaturalVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = currentRate;
    utterance.pitch = 1.02; // warm, natural conversational pitch
    utterance.lang = voice?.lang || 'en-IN';

    utterance.onend = () => {
      currentChunkIndex++;
      if (isSpeakingActive) {
        speakNextChunk();
      }
    };

    utterance.onerror = (e) => {
      // Ignore user-triggered cancellation
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      currentChunkIndex++;
      if (isSpeakingActive) speakNextChunk();
    };

    window.speechSynthesis.speak(utterance);
    notifyStateChange();
  }

  speakNextChunk();
  return true;
}

/**
 * Pause Speech
 */
export function pauseSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis && isSpeakingActive && !isPausedState) {
    window.speechSynthesis.pause();
    isPausedState = true;
    notifyStateChange();
  }
}

/**
 * Resume Speech
 */
export function resumeSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis && isSpeakingActive && isPausedState) {
    window.speechSynthesis.resume();
    isPausedState = false;
    notifyStateChange();
  }
}

/**
 * Stop Speech completely
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtteranceQueue = [];
  currentChunkIndex = 0;
  isSpeakingActive = false;
  isPausedState = false;
  activeMessageId = null;
  notifyStateChange();
}

/**
 * Change Playback Rate (e.g. 1.0, 1.25, 1.5)
 */
export function setSpeechRate(rate) {
  currentRate = rate;
  notifyStateChange();
}

export function getSpeechStatus() {
  return {
    isPlaying: isSpeakingActive && !isPausedState,
    isPaused: isPausedState,
    activeMessageId,
    rate: currentRate,
  };
}
