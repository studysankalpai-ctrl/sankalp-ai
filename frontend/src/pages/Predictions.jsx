import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  Loader2,
  Printer,
  Eye,
} from 'lucide-react';
import { publicApi, aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import MasterPaperModal from '../components/exam/MasterPaperModal';
import toast from 'react-hot-toast';

export default function Predictions() {
  const { selectedSubject, groqApiKey, groqModel, isAiConnected } = useAppStore();
  const [analysis, setAnalysis] = useState(null);
  const [predictionsList, setPredictionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Master Final Paper State
  const [masterPaper, setMasterPaper] = useState(null);
  const [masterPaperModalOpen, setMasterPaperModalOpen] = useState(false);
  const [generatingFinalPaper, setGeneratingFinalPaper] = useState(false);

  useEffect(() => {
    async function loadAnalysis() {
      if (!selectedSubject) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await publicApi.getAnalysis(selectedSubject._id);
        if (res.data?.success) {
          setAnalysis(res.data.data);
          setPredictionsList(res.data.data.analysis_data?.predictions || []);
        }
      } catch (err) {
        console.warn('No published analysis yet:', err.message);
        setAnalysis(null);
        setPredictionsList([]);
      } finally {
        setLoading(false);
      }

      // Check for locally cached Master Final Paper
      try {
        const savedPapers = JSON.parse(localStorage.getItem('sankalp_saved_final_papers') || '{}');
        if (savedPapers[selectedSubject._id]) {
          setMasterPaper(savedPapers[selectedSubject._id]);
        } else {
          setMasterPaper(null);
        }
      } catch { }
    }
    loadAnalysis();
  }, [selectedSubject]);

  const handleGenerateMasterFinalPaper = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate the Master Final Paper');
      return;
    }
    if (!selectedSubject) {
      toast.error('Please select a subject from the top header');
      return;
    }

    setGeneratingFinalPaper(true);
    try {
      const res = await aiApi.generateFinalPaper({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject._id,
      });

      if (res.data?.success && res.data.data) {
        setMasterPaper(res.data.data);
        setMasterPaperModalOpen(true);

        // Cache in local storage for instant re-opening
        try {
          const savedPapers = JSON.parse(localStorage.getItem('sankalp_saved_final_papers') || '{}');
          savedPapers[selectedSubject._id] = res.data.data;
          localStorage.setItem('sankalp_saved_final_papers', JSON.stringify(savedPapers));
        } catch { }

        toast.success(`Generated: ${res.data.data.paper_title}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate Master Final Paper');
    } finally {
      setGeneratingFinalPaper(false);
    }
  };

  const handleGenerateFreshPredictions = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate fresh exam predictions with SANKALP AI');
      return;
    }
    setGenerating(true);
    try {
      const res = await aiApi.generatePredictions({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject._id,
      });
      if (res.data?.success) {
        setPredictionsList(res.data.data);
        toast.success('Generated fresh exam trend predictions!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="5-Year Final Exam Paper"
        description="Syllabus-grounded question trends from 5-year archives synthesized into a full examination paper with model solutions."
        badge={selectedSubject ? `${selectedSubject.code} • Final Paper` : 'Select Subject in Header'}
        actions={
          selectedSubject && isAiConnected && (
            <button
              onClick={handleGenerateFreshPredictions}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? 'Analyzing Trends...' : 'Refresh AI Questions'}
            </button>
          )
        }
      />

      {/* Official Required Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-bold">Exam Advisory:</span> These questions are AI-generated based on past 5-year paper trends and syllabus frequency. Use them as high-priority exam preparation.
        </div>
      </div>

      {/* 5-Year Cross-Paper Master Preparation Paper Card (Clean Black & White) */}
      {selectedSubject && (
        <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-gray-950 dark:bg-black text-white border border-gray-800 dark:border-gray-800 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2 max-w-2xl w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs font-semibold border border-white/15 backdrop-blur-xs">
                <FileCheck2 className="w-3.5 h-3.5 text-white" />
                <span>5-Year Multi-Paper Analysis</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Final Paper  {selectedSubject.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Our AI analyzes all 5 years of past question papers together, extracts the questions asked continuously, and compiles an authentic university examination paper with model solutions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
              {masterPaper && (
                <button
                  onClick={() => setMasterPaperModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-[1.02] w-full sm:w-auto text-center"
                >
                  <Eye className="w-4 h-4 text-white shrink-0" />
                  <span>View Existing Paper</span>
                </button>
              )}

              <button
                onClick={handleGenerateMasterFinalPaper}
                disabled={generatingFinalPaper || !isAiConnected}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-950 shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 w-full sm:w-auto text-center"
              >
                {generatingFinalPaper ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-gray-950 shrink-0" />
                )}
                <span>
                  {generatingFinalPaper
                    ? 'Analyzing 5-Yr Papers...'
                    : masterPaper
                      ? 'Regenerate Final Paper'
                      : 'Generate Final Paper Now'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading historical prediction models..." />
      ) : predictionsList.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No prediction report published for this subject yet"
          description={
            isAiConnected
              ? 'Click "Refresh AI Questions" above to synthesize an instant trend forecast using SANKALP AI.'
              : 'Connect your API key in Settings or wait for the administrator to publish an analysis for this subject.'
          }
          actionText={isAiConnected ? 'Generate Now' : 'Connect SANKALP AI'}
          actionLink={isAiConnected ? null : '/settings'}
          onAction={isAiConnected ? handleGenerateFreshPredictions : null}
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Banner if Available */}
          {analysis?.analysis_data?.summary && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Examination Trend Summary
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.analysis_data.summary}
              </p>
              {analysis.years_analyzed?.length > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Historical Archive Analyzed: {analysis.years_analyzed.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Predictions Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictionsList.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {item.category || 'Predicted Question'}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {item.suggested_marks ? `${item.suggested_marks} Marks` : '10 Marks'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                    {item.topic_or_question || item.topic}
                  </h3>

                  <p className="text-xs text-gray-400 mb-3">
                    {item.relevant_unit || item.unit || 'Core Unit'}
                  </p>

                  {/* Confidence Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {item.confidence_category || item.confidence || 'High Historical Priority'}
                    </span>
                  </div>

                  {/* Recommendation Reason */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Historical Rationale
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.reason_for_recommendation || item.reason}
                    </p>
                  </div>

                  {/* Preparation Advice */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> Scoring Advice
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.preparation_advice || item.advice || 'Master standard definitions, architectural diagrams, and point-wise explanations.'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/mentor?topic=${encodeURIComponent(item.topic_or_question || item.topic)}&subjectId=${selectedSubject?._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Practice Answer with SANKALP AI
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Master Preparation Paper Modal */}
      {masterPaperModalOpen && (
        <MasterPaperModal
          paper={masterPaper}
          onClose={() => setMasterPaperModalOpen(false)}
        />
      )}
    </div>
  );
}
