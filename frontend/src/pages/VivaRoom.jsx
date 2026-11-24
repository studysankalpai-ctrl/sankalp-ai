import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Square,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Printer,
  ChevronRight,
  Loader2,
  HelpCircle,
  Clock,
  Layers,
  ShieldCheck,
  Send,
  Zap,
  X,
} from 'lucide-react';
import useAppStore from '../store/appStore';
import api, { aiApi } from '../lib/api';
import { playSpeech, stopSpeech, cleanTextForSpeech } from '../lib/speechVoice';
import toast from 'react-hot-toast';

export default function VivaRoom() {
  const navigate = useNavigate();
  const {
    groqApiKey,
    groqModel,
    isAiConnected,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    subjects,
    setSelectedSubject,
  } = useAppStore();

  // Viva Configuration States
  const [sessionState, setSessionState] = useState('setup'); // 'setup' | 'in_viva' | 'report_card'
  const [selectedUnitNumber, setSelectedUnitNumber] = useState('');
  const [difficulty, setDifficulty] = useState('strict'); // 'strict' | 'friendly'
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active Viva States
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionTopic, setCurrentQuestionTopic] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isCrossQuestion, setIsCrossQuestion] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [examinerSpeaking, setExaminerSpeaking] = useState(false);
  const [vivaHistory, setVivaHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [examinerFeedback, setExaminerFeedback] = useState('');
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

  // Speech Recognition Reference
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef('');

  // Check if speech recognition is supported in this browser
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Stop all speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Update transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Start Candidate Speech Recognition
  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported) {
      toast.error('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop examiner audio if playing
    stopSpeech();
    setExaminerSpeaking(false);

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Default to Indian English / Hinglish

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript + ' ';
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev + ' ' + finalStr).trim());
        }
        setInterimTranscript(interimStr);

        // Reset silence timer on new speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          // If candidate speaks at least 6 words and pauses for 3 seconds, offer gentle guidance
        }, 3000);
      };

      rec.onerror = (e) => {
        if (e.error === 'no-speech') return;
        console.warn('[Speech Recognition Warning]:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('[Speech Recognition Error]:', err);
      setIsListening(false);
    }
  }, [isSpeechRecognitionSupported]);

  // Stop Candidate Speech Recognition
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  // Speak Examiner's text using natural voice
  const speakExaminerText = (text, onComplete) => {
    stopListening();
    setExaminerSpeaking(true);
    const cleaned = cleanTextForSpeech(text);

    playSpeech({
      messageId: `viva_${Date.now()}`,
      content: cleaned,
      rate: 0.98,
      onFinish: () => {
        setExaminerSpeaking(false);
        if (typeof onComplete === 'function') onComplete();
        // Auto-start listening after examiner finishes speaking!
        setTimeout(() => {
          startListening();
        }, 500);
      },
    });
  };

  // 1. Initialize and Start Viva Session
  const handleStartViva = async () => {
    if (!isAiConnected || !groqApiKey) {
      toast.error('Connect your Groq API key in Settings to activate AI Viva');
      navigate('/settings');
      return;
    }

    if (!selectedSubject?._id) {
      toast.error('Please select an active academic subject first');
      return;
    }

    setLoading(true);
    try {
      const callStart = typeof aiApi?.startViva === 'function' ? aiApi.startViva : (p) => api.post('/ai/viva/start', p);
      const res = await callStart({
        apiKey: groqApiKey,
        subjectId: selectedSubject._id,
        unitNumber: selectedUnitNumber ? Number(selectedUnitNumber) : null,
        difficulty,
        totalQuestions: Number(totalQuestions),
        model: groqModel,
      });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setCurrentQuestion(data.question_text);
        setCurrentQuestionTopic(data.syllabus_topic_tested || '');
        setQuestionNumber(data.question_number || 1);
        setIsCrossQuestion(false);
        setTranscript('');
        setInterimTranscript('');
        setVivaHistory([]);
        setFinalReport(null);
        setSessionState('in_viva');

        toast.success(`Oral Viva Started: ${selectedSubject.name}`);

        // Read out examiner's greeting and Question 1
        const initialSpeech = `${data.greeting} Question number one: ${data.question_text}`;
        speakExaminerText(initialSpeech);
      } else {
        toast.error('Failed to start viva session. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error starting viva');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Candidate's Spoken Answer for Evaluation
  const handleSubmitSpokenAnswer = async () => {
    stopListening();
    const fullAnswer = (transcript + ' ' + interimTranscript).trim();

    if (!fullAnswer || fullAnswer.length < 5) {
      toast.error('Please speak your answer into the microphone before submitting.');
      return;
    }

    setLoading(true);
    try {
      const callRespond = typeof aiApi?.respondViva === 'function' ? aiApi.respondViva : (p) => api.post('/ai/viva/respond', p);
      const res = await callRespond({
        apiKey: groqApiKey,
        subjectId: selectedSubject?._id,
        unitNumber: selectedUnitNumber ? Number(selectedUnitNumber) : null,
        difficulty,
        questionNumber,
        totalQuestions: Number(totalQuestions),
        currentQuestionText: currentQuestion,
        candidateSpokenAnswer: fullAnswer,
        previousHistory: vivaHistory,
        isCrossQuestion,
        model: groqModel,
      });

      if (res.data?.success && res.data.data) {
        const turnData = res.data.data;

        // Record turn in history
        const turnRecord = {
          questionNumber,
          isCrossQuestion,
          question: currentQuestion,
          topic: turnData.syllabus_topic_tested || currentQuestionTopic,
          answer: fullAnswer,
          marks: turnData.marks_awarded,
          feedback: turnData.verbal_feedback,
          missing: turnData.missing_concept,
        };
        const updatedHistory = [...vivaHistory, turnRecord];
        setVivaHistory(updatedHistory);
        setExaminerFeedback(turnData.verbal_feedback);
        if (turnData.syllabus_topic_tested) {
          setCurrentQuestionTopic(turnData.syllabus_topic_tested);
        }

        // CASE A: Examination is Completed -> Show Report Card
        if (turnData.is_final && turnData.report_card) {
          setFinalReport(turnData.report_card);
          setSessionState('report_card');

          const finalSpeech = `${turnData.verbal_feedback} That concludes your oral viva examination. Your overall result is ready on screen.`;
          speakExaminerText(finalSpeech);
          return;
        }

        // CASE B: Moving to Cross-Question or Next Question
        setTranscript('');
        setInterimTranscript('');
        setCurrentQuestion(turnData.next_question_text);
        setQuestionNumber(turnData.next_question_number || questionNumber + 1);
        setIsCrossQuestion(Boolean(turnData.is_cross_question));

        // Speak feedback + next question
        const nextSpeech = `${turnData.verbal_feedback} ${turnData.is_cross_question ? 'Now answer this follow-up:' : 'Next question:'} ${turnData.next_question_text}`;
        speakExaminerText(nextSpeech);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error evaluating response');
    } finally {
      setLoading(false);
    }
  };

  // Repeat the current examiner question
  const handleRepeatQuestion = () => {
    if (!currentQuestion) return;
    speakExaminerText(`Let me repeat the question: ${currentQuestion}`);
  };

  // End viva early
  const handleEndVivaEarly = () => {
    stopSpeech();
    stopListening();
    setSessionState('setup');
    toast.success('Viva session concluded.');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-[#0B1020] text-gray-950 dark:text-white overflow-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* 1. SETUP SCREEN: Configure & Launch Voice Viva Room */}
      {/* ============================================================ */}
      {sessionState === 'setup' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            {/* Header Badge & Title (No Gradients) */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                Smart Viva Room
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                Step into a live virtual university oral exam. Speak your answers naturally the AI Examiner listens, evaluates your conceptual depth, and asks real cross-questions.
              </p>
            </div>

            {/* Subject & Semester Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" /> Subject
                </label>
                <select
                  value={selectedSubject?._id || ''}
                  onChange={(e) => {
                    const found = subjects.find((s) => s._id === e.target.value);
                    if (found) setSelectedSubject(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs sm:text-sm text-gray-950 dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id} className="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" /> Syllabus Scope
                </label>
                <select
                  value={selectedUnitNumber}
                  onChange={(e) => setSelectedUnitNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs sm:text-sm text-gray-950 dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
                    Full Practical Syllabus
                  </option>
                  {(selectedSubject?.units || []).map((u) => (
                    <option key={u.number} value={u.number} className="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
                      Unit {u.number}: {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prescribed Syllabus Preview Provided to AI Examiner */}
            {selectedUnitNumber ? (() => {
              const activeUnit = (selectedSubject?.units || []).find(
                (u) => u.number === Number(selectedUnitNumber)
              );
              if (!activeUnit) return null;
              return (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                      Unit {activeUnit.number} Syllabus Provided to AI Examiner:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-[10px] font-bold">
                      ✓ Connected to Viva
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] max-h-32 overflow-y-auto leading-relaxed">
                    <p className="font-semibold text-gray-950 dark:text-white mb-1">
                      {activeUnit.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {activeUnit.description || (activeUnit.topics || []).join(', ') || 'Core concepts and working mechanisms of ' + activeUnit.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                    💡 The AI Examiner will ask oral viva questions strictly based on these unit topics.
                  </p>
                </div>
              );
            })() : (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>📚 Full Syllabus Mode: Examiner will test questions across all 5 units.</span>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">5 Units Connected</span>
              </div>
            )}

            {/* Examiner Persona & Viva Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Persona */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" /> Examiner Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDifficulty('strict')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      difficulty === 'strict'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <span>Strict External</span>
                    <span className={`text-[10px] font-normal ${difficulty === 'strict' ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>
                      Asks cross-questions
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('friendly')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      difficulty === 'friendly'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <span>Friendly Prof</span>
                    <span className={`text-[10px] font-normal ${difficulty === 'friendly' ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>
                      Encouraging & calm
                    </span>
                  </button>
                </div>
              </div>

              {/* Length */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" /> Viva Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalQuestions(n)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        totalQuestions === n
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400'
                      }`}
                    >
                      {n} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button (Black in Light Theme, White in Dark Theme - No Gradient) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartViva}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.005] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing Examination Desk...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Start Oral Viva Examination</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Zero Typing Needed
              </span>
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Real University Cross-Questions
              </span>
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Instant Report Card & Grade
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ACTIVE VIVA SCREEN: Voice-First Oral Exam Call Desk */}
      {/* ============================================================ */}
      {sessionState === 'in_viva' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#0B1020]">
          {/* Top Status Bar */}
          <div className="h-14 sm:h-16 px-4 sm:px-8 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Live Viva: Q{questionNumber} of {totalQuestions}
              </span>
              {isCrossQuestion && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  ⚠️ Cross-Question
                </span>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {selectedSubject?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSyllabusModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs font-semibold flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer"
                title="View Prescribed Syllabus Topics"
              >
                <BookOpen className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                <span className="hidden sm:inline">Syllabus</span>
              </button>
              <button
                type="button"
                onClick={handleRepeatQuestion}
                className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs font-semibold flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer"
                title="Repeat Examiner Question"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                <span className="hidden sm:inline">Repeat</span>
              </button>
              <button
                type="button"
                onClick={handleEndVivaEarly}
                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Conclude Examination"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>End</span>
              </button>
            </div>
          </div>

          {/* Center Stage: The Live Voice Examination Orb & Audio Wave */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between max-w-3xl mx-auto w-full space-y-6">
            {/* Examiner Question Box */}
            <div className="w-full p-4 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-2 text-center animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest flex-wrap">
                <Volume2 className="w-4 h-4 animate-pulse text-indigo-600 dark:text-indigo-400" />
                <span>External Examiner Asks</span>
                {currentQuestionTopic && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[10px] font-bold normal-case">
                    • {currentQuestionTopic}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-950 dark:text-white leading-relaxed">
                "{currentQuestion}"
              </h2>
              {examinerFeedback && (
                <p className="text-xs text-amber-800 dark:text-amber-300 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <strong>Examiner's Reaction:</strong> {examinerFeedback}
                </p>
              )}
            </div>

            {/* Interactive Voice Orb (Solid Colors - No Gradients) */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-8 space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Concentric Pulsing Ripples */}
                {isListening && (
                  <>
                    <span className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping" />
                    <span className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse" />
                  </>
                )}
                {examinerSpeaking && (
                  <>
                    <span className="absolute w-44 h-44 rounded-full bg-indigo-500/20 animate-ping" />
                    <span className="absolute w-36 h-36 rounded-full bg-indigo-500/30 animate-pulse" />
                  </>
                )}

                {/* Big Center Microphone Button (No Gradient) */}
                <button
                  type="button"
                  onClick={() => (isListening ? stopListening() : startListening())}
                  disabled={loading}
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                    isListening
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 dark:ring-emerald-500/50 scale-105'
                      : examinerSpeaking
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 dark:ring-indigo-500/50 animate-pulse'
                      : 'bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black ring-4 ring-gray-200 dark:ring-gray-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Mic className="w-10 h-10 animate-bounce" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Speaking...</span>
                    </>
                  ) : examinerSpeaking ? (
                    <>
                      <Volume2 className="w-10 h-10 animate-pulse" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Examiner</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 text-white dark:text-black" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Tap to Answer</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Hint */}
              <div className="text-center space-y-1">
                <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">
                  {isListening
                    ? '🟢 Listening to your answer... Speak naturally into mic'
                    : examinerSpeaking
                    ? '🔊 Examiner is speaking... Listen carefully'
                    : 'Tap the mic to begin speaking your oral response'}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  {isListening ? 'Tap mic again or click "Submit Spoken Answer" when finished' : 'Speak clearly in English or Hinglish'}
                </p>
              </div>
            </div>

            {/* Candidate Live Spoken Transcript Display */}
            <div className="w-full space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs min-h-[90px] max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                    <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Your Spoken Answer (Live Transcript):
                  </span>
                  {isListening && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse text-[10px]">
                      ● Recording Audio
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-950 dark:text-white leading-relaxed italic font-medium">
                  {transcript || interimTranscript
                    ? `${transcript} ${interimTranscript}`
                    : 'Your spoken words will appear here in real-time as you speak...'}
                </p>
              </div>

              {/* Submit Spoken Response Button (Solid Black in Light Theme - No Gradient) */}
              <button
                type="button"
                onClick={handleSubmitSpokenAnswer}
                disabled={loading || (!transcript.trim() && !interimTranscript.trim())}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Examiner is Evaluating Your Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Spoken Answer to Examiner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. POST-VIVA REPORT CARD: Comprehensive University Evaluation */}
      {/* ============================================================ */}
      {sessionState === 'report_card' && finalReport && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header / Grade Badge (No Gradients) */}
            <div className="text-center space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Official Oral Viva Scorecard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
                Viva Voce Assessment Complete
              </h2>
              <div className="flex items-center justify-center gap-3 pt-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white">
                  {finalReport.overall_score} / {finalReport.max_possible_score}
                </span>
                <span className="px-3 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs sm:text-sm shadow-xs">
                  {finalReport.grade}
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 max-w-lg mx-auto italic pt-1">
                "{finalReport.verdict}"
              </p>
            </div>

            {/* Strengths & Weaknesses 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Demonstrated Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                  {(finalReport.strengths || []).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Revision Checklist */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Concepts to Revise Before Real Exam
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  {(finalReport.weaknesses || []).map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Top Tricky Trap Questions */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" /> 🎯 3 Trap Questions Examiners Love in this Subject
              </h4>
              <div className="space-y-1.5">
                {(finalReport.examiner_trap_questions || []).map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900/80 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                    <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons (Solid Black / Contrast - No Gradient) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSessionState('setup')}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Another Viva Session</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Scorecard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Quick View Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <h3 className="font-bold text-sm text-gray-950 dark:text-white">
                  Prescribed Syllabus Topics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSyllabusModal(false)}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto text-xs pr-1">
              {selectedUnitNumber ? (() => {
                const u = (selectedSubject?.units || []).find((x) => x.number === Number(selectedUnitNumber));
                if (!u) return <p className="text-gray-500">No unit details found.</p>;
                return (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <p className="font-bold text-gray-950 dark:text-white text-sm">
                      Unit {u.number}: {u.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {u.description || (u.topics || []).join(', ') || u.name}
                    </p>
                  </div>
                );
              })() : (
                (selectedSubject?.units || []).map((u) => (
                  <div key={u.number} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                    <p className="font-bold text-gray-950 dark:text-white">
                      Unit {u.number}: {u.name}
                    </p>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {u.description || (u.topics || []).join(', ') || u.name}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSyllabusModal(false)}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs cursor-pointer transition-colors"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
