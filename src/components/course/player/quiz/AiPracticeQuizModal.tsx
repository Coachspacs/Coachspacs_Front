"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, PlusCircle, BarChart2 } from "lucide-react";
import {
  AiQuizDetails,
  AiQuizListItem,
  SubmitAiQuizAnswer,
} from "@/types/quiz";
import { aiQuizService } from "@/services/aiQuizService";
import { soundFx } from "@/lib/soundEffects";
import { LessonItem, SectionItem } from "../types";
import {
  normalizeQuizDetails,
  normalizeQuizQuestion,
  normalizeSubmissionResult,
  NormalizedSubmissionResult,
} from "./utils/quizNormalizer";
import {
  QuizHubView,
  QuizConfigView,
  QuizGeneratingView,
  QuizTakingView,
  QuizResultsView,
} from "./views";

export { normalizeQuizQuestion, normalizeQuizDetails };

export interface AiPracticeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | number;
  courseTitle: string;
  allLessons: LessonItem[];
  completedLessonIds?: string[];
  sections?: SectionItem[];
  onSelectLessonById?: (lessonId: string | number) => void;
  locale?: string;
  isAr?: boolean;
}

type ModalView = "hub" | "configure" | "generating" | "taking" | "results";

export function AiPracticeQuizModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  allLessons,
  completedLessonIds = [],
  sections = [],
  onSelectLessonById,
  locale = "en",
  isAr = false,
}: AiPracticeQuizModalProps) {
  // Current Active Screen
  const [currentView, setCurrentView] = useState<ModalView>("hub");

  // Hub data: previous quizzes
  const [pastQuizzes, setPastQuizzes] = useState<AiQuizListItem[]>([]);
  const [isLoadingPastQuizzes, setIsLoadingPastQuizzes] = useState<boolean>(false);

  // Configuration state
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(5);
  const [configError, setConfigError] = useState<string>("");
  const [rateLimitAvailableAt, setRateLimitAvailableAt] = useState<string | null>(null);

  // Generating / Polling state
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [generationPhase, setGenerationPhase] = useState<1 | 2 | 3 | 4>(1);
  const [generationProgress, setGenerationProgress] = useState<number>(20);
  const [generationError, setGenerationError] = useState<string>("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Quiz / Taking state
  const [quizDetails, setQuizDetails] = useState<AiQuizDetails | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<number, number | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Results & Review state (using NormalizedSubmissionResult)
  const [submissionResult, setSubmissionResult] = useState<NormalizedSubmissionResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect">("all");

  // Load Past Quizzes on modal open
  const loadPastQuizzes = useCallback(async () => {
    if (!courseId) return;
    setIsLoadingPastQuizzes(true);
    try {
      const data = await aiQuizService.getCourseQuizzes(courseId);
      setPastQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("[AiPracticeQuiz] Failed to load course quizzes:", err);
    } finally {
      setIsLoadingPastQuizzes(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isOpen) {
      loadPastQuizzes();
      // Initialize selected lessons with completed ones (up to 10) or first few lessons
      const initialIds: number[] = [];
      allLessons.forEach((l) => {
        const numId = Number(l.id);
        if (!isNaN(numId) && !l.is_locked) {
          if (completedLessonIds.includes(String(l.id)) && initialIds.length < 10) {
            initialIds.push(numId);
          }
        }
      });
      if (initialIds.length === 0) {
        allLessons.slice(0, Math.min(5, allLessons.length)).forEach((l) => {
          const numId = Number(l.id);
          if (!isNaN(numId) && !l.is_locked) {
            initialIds.push(numId);
          }
        });
      }
      setSelectedLessonIds(initialIds);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  }, [isOpen, courseId, allLessons, completedLessonIds, loadPastQuizzes]);

  // Clean polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Visual phases timer during generation
  useEffect(() => {
    if (currentView !== "generating") return;

    setGenerationPhase(1);
    setGenerationProgress(25);

    const t1 = setTimeout(() => {
      setGenerationPhase(2);
      setGenerationProgress(52);
    }, 2000);

    const t2 = setTimeout(() => {
      setGenerationPhase(3);
      setGenerationProgress(78);
    }, 4500);

    const t3 = setTimeout(() => {
      setGenerationPhase(4);
      setGenerationProgress(94);
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentView]);

  // Handle lesson toggle for quiz generation
  const handleToggleLessonSelection = (numId: number) => {
    setConfigError("");
    soundFx.playOptionSelect();
    setSelectedLessonIds((prev) => {
      if (prev.includes(numId)) {
        return prev.filter((id) => id !== numId);
      }
      if (prev.length >= 10) {
        setConfigError(
          isAr
            ? "الحد الأقصى المسموح به هو 10 دروس للاختبار الواحد."
            : "Maximum 10 lessons allowed per quiz."
        );
        return prev;
      }
      return [...prev, numId];
    });
  };

  const handleSelectAllUnlocked = () => {
    soundFx.playOptionSelect();
    const unlockedIds: number[] = [];
    for (const l of allLessons) {
      const numId = Number(l.id);
      if (!isNaN(numId) && !l.is_locked) {
        unlockedIds.push(numId);
        if (unlockedIds.length === 10) break;
      }
    }
    setSelectedLessonIds(unlockedIds);
  };

  const handleClearSelected = () => {
    soundFx.playOptionSelect();
    setSelectedLessonIds([]);
  };

  // Start Polling Helper
  const startPollingQuiz = (quizId: number) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 40; // 40 * 2.5s = 100 seconds timeout

    pollIntervalRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const rawDetails = await aiQuizService.getQuiz(quizId);
        const details = normalizeQuizDetails(rawDetails);

        if (details.status === "ready" && details.questions && details.questions.length > 0) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setGenerationProgress(100);
          soundFx.playCelebration();
          setQuizDetails(details);
          setCurrentQuestionIndex(0);
          setAnswersMap({});
          setTimeout(() => {
            setCurrentView("taking");
          }, 800);
          return;
        }

        if (details.status === "failed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setGenerationError(
            isAr
              ? "تعذر على الذكاء الاصطناعي إكمال إنشاء الاختبار. يمكنك إعادة المحاولة مجاناً."
              : "AI could not complete the quiz. Please try again."
          );
          return;
        }

        if (attempts >= maxAttempts) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setGenerationError(
            isAr
              ? "استغرق التوليد وقتاً أطول من المعتاد. يرجى الضغط على إعادة المحاولة."
              : "Generation took longer than expected. Please try again."
          );
        }
      } catch (err: any) {
        console.warn("[AiPracticeQuiz] Polling error:", err);
      }
    }, 2500);
  };

  // Start Generation: Calls POST /api/courses/{course_id}/ai-quizzes
  const handleStartGeneration = async () => {
    if (selectedLessonIds.length === 0) {
      setConfigError(
        isAr ? "يرجى تحديد درس واحد على الأقل." : "Please select at least 1 lesson."
      );
      return;
    }
    if (selectedLessonIds.length > 10) {
      setConfigError(
        isAr ? "يمكنك اختيار 10 دروس كحد أقصى." : "You can select up to 10 lessons."
      );
      return;
    }

    setConfigError("");
    setRateLimitAvailableAt(null);
    setGenerationError("");
    setCurrentView("generating");
    soundFx.playStepTransition("forward");

    try {
      const response = await aiQuizService.createQuiz(courseId, {
        lesson_ids: selectedLessonIds,
        question_count: questionCount,
        lang: isAr ? "ar" : "en",
      });

      const newQuizId = response.id;
      setActiveQuizId(newQuizId);
      startPollingQuiz(newQuizId);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      setCurrentView("configure");

      if (status === 429) {
        const avail = data?.available_at || data?.detail || "";
        setRateLimitAvailableAt(avail);
        setConfigError(
          isAr
            ? `لقد وصلت إلى الحد اليومي لتوليد الاختبارات. يمكنك المحاولة مجدداً لاحقاً: ${avail}`
            : `Daily quiz generation limit reached. Available again: ${avail}`
        );
      } else if (status === 403) {
        setConfigError(
          isAr
            ? "أحد الدروس المختارة غير متاح لحسابك. يرجى اختيار الدروس غير المغلقة فقط."
            : "One or more selected lessons are locked. Please choose only accessible lessons."
        );
      } else {
        const msg =
          data?.message ||
          data?.detail ||
          (isAr
            ? "تعذر بدء توليد الاختبار، يرجى التحقق من اتصالك والمحاولة مجدداً."
            : "Failed to generate quiz. Please retry.");
        setConfigError(msg);
      }
    }
  };

  // Open an existing or past quiz
  const handleOpenExistingQuiz = async (quizId: number) => {
    try {
      const rawDetails = await aiQuizService.getQuiz(quizId);
      const details = normalizeQuizDetails(rawDetails);
      setQuizDetails(details);
      setActiveQuizId(quizId);
      setCurrentQuestionIndex(0);
      setAnswersMap({});

      if (details.latest_attempt) {
        // If it was already completed, normalize results and open in results view
        const normalized = normalizeSubmissionResult(
          details.latest_attempt,
          details.questions
        );
        setSubmissionResult(normalized);
        setCurrentView("results");
      } else {
        // Ready to take
        setCurrentView("taking");
      }
      soundFx.playStepTransition("forward");
    } catch (err) {
      console.warn("Failed to load quiz details:", err);
    }
  };

  // Option selection during quiz taking
  const handleSelectAnswer = (qId: number, answerVal: number | boolean) => {
    soundFx.playOptionSelect();
    setAnswersMap((prev) => ({
      ...prev,
      [qId]: answerVal,
    }));
  };

  // Submit answers: Calls POST /api/ai-quizzes/{quiz_id}/submit
  const handleSubmitQuiz = async () => {
    if (!quizDetails || !activeQuizId) return;

    setSubmitError("");

    const unansweredCount = quizDetails.questions.filter(
      (q) => answersMap[q.id] === undefined
    ).length;

    if (unansweredCount > 0 && !showUnansweredConfirm) {
      setShowUnansweredConfirm(true);
      return;
    }

    setShowUnansweredConfirm(false);
    setIsSubmitting(true);

    try {
      const answersPayload: SubmitAiQuizAnswer[] = quizDetails.questions.map((q) => {
        const isTF = q.question_type === "true_false";
        const userVal = answersMap[q.id];

        let selected_answer: number | boolean;
        if (isTF) {
          selected_answer = typeof userVal === "boolean" ? userVal : false;
        } else {
          selected_answer =
            typeof userVal === "number" && !isNaN(userVal)
              ? userVal
              : typeof userVal === "string" && !isNaN(Number(userVal))
              ? Number(userVal)
              : 0;
        }

        return {
          question_id: q.id,
          selected_answer,
        };
      });

      const res = await aiQuizService.submitQuiz(activeQuizId, {
        answers: answersPayload,
      });

      // Refetch latest quiz details to capture any updated server-side attempt data
      let freshQuiz: AiQuizDetails | null = null;
      try {
        const fresh = await aiQuizService.getQuiz(activeQuizId);
        if (fresh) {
          freshQuiz = normalizeQuizDetails(fresh);
          setQuizDetails(freshQuiz);
        }
      } catch (e) {
        console.warn("[AiPracticeQuiz] Refetch after submit error:", e);
      }

      const mergedPayload = {
        ...(freshQuiz?.latest_attempt || {}),
        ...(res || {}),
        ...((res as any)?.attempt || {}),
        ...((res as any)?.latest_attempt || {}),
        ...((res as any)?.data || {}),
      };

      const normalized = normalizeSubmissionResult(
        mergedPayload,
        freshQuiz?.questions || quizDetails.questions,
        answersMap
      );

      setSubmissionResult(normalized);
      setCurrentView("results");
      soundFx.playCelebration();
      loadPastQuizzes();
    } catch (err: any) {
      console.warn("[AiPracticeQuiz] Submit error:", err);
      const errDetail =
        err?.response?.data?.answers?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (isAr
          ? "حدث خطأ أثناء تسليم الإجابات، يرجى التحقق والمحاولة مجدداً."
          : "Failed to submit answers. Please check and retry.");
      setSubmitError(errDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retake the same quiz
  const handleRetakeQuiz = () => {
    soundFx.playStepTransition("backward");
    setAnswersMap({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setCurrentView("taking");
  };

  // Review lesson shortcut
  const handleReviewLesson = (lessonId?: number) => {
    if (lessonId && onSelectLessonById) {
      onSelectLessonById(lessonId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans"
    >
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10"
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {isAr ? "اختبار الذكاء الاصطناعي التجريبي" : "AI Practice Quiz"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm sm:max-w-md">
                {courseTitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs in Header (Only when not taking or generating) */}
          {currentView !== "generating" && currentView !== "taking" && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  soundFx.playOptionSelect();
                  setCurrentView("configure");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === "configure"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? "إنشاء اختبار" : "New Quiz"}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playOptionSelect();
                  setCurrentView("hub");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === "hub"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>{isAr ? "سجل الاختبارات" : "My Quizzes"}</span>
                  {pastQuizzes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {pastQuizzes.length}
                    </span>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* VIEW 1: MY QUIZZES HUB */}
            {currentView === "hub" && (
              <QuizHubView
                pastQuizzes={pastQuizzes}
                isLoadingPastQuizzes={isLoadingPastQuizzes}
                onCreateNew={() => {
                  soundFx.playOptionSelect();
                  setCurrentView("configure");
                }}
                onOpenQuiz={handleOpenExistingQuiz}
                isAr={isAr}
              />
            )}

            {/* VIEW 2: CONFIGURE & GENERATE NEW QUIZ */}
            {currentView === "configure" && (
              <QuizConfigView
                questionCount={questionCount}
                onQuestionCountChange={setQuestionCount}
                allLessons={allLessons}
                selectedLessonIds={selectedLessonIds}
                completedLessonIds={completedLessonIds}
                onToggleLesson={handleToggleLessonSelection}
                onSelectAllUnlocked={handleSelectAllUnlocked}
                onClearSelected={handleClearSelected}
                configError={configError}
                onBack={() => setCurrentView("hub")}
                onStartGeneration={handleStartGeneration}
                isAr={isAr}
              />
            )}

            {/* VIEW 3: GENERATION & POLLING PROGRESS SCREEN */}
            {currentView === "generating" && (
              <QuizGeneratingView
                generationPhase={generationPhase}
                generationProgress={generationProgress}
                generationError={generationError}
                selectedLessonCount={selectedLessonIds.length}
                questionCount={questionCount}
                onRetry={handleStartGeneration}
                onAdjustSelection={() => setCurrentView("configure")}
                isAr={isAr}
              />
            )}

            {/* VIEW 4: ACTIVE QUIZ TAKING */}
            {currentView === "taking" && quizDetails && quizDetails.questions && quizDetails.questions.length > 0 && (
              <QuizTakingView
                quizDetails={quizDetails}
                currentQuestionIndex={currentQuestionIndex}
                answersMap={answersMap}
                onSelectAnswer={handleSelectAnswer}
                onGoToQuestion={(idx) => {
                  soundFx.playOptionSelect();
                  setCurrentQuestionIndex(idx);
                }}
                onPrevQuestion={() => {
                  soundFx.playOptionSelect();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                onNextQuestion={() => {
                  soundFx.playOptionSelect();
                  setCurrentQuestionIndex((prev) => prev + 1);
                }}
                onSubmitQuiz={handleSubmitQuiz}
                isSubmitting={isSubmitting}
                submitError={submitError}
                showUnansweredConfirm={showUnansweredConfirm}
                onCancelUnansweredConfirm={() => setShowUnansweredConfirm(false)}
                onConfirmSubmitAnyway={handleSubmitQuiz}
                isAr={isAr}
              />
            )}

            {/* VIEW 5: RESULTS & DETAILED REVIEW */}
            {currentView === "results" && submissionResult && (
              <QuizResultsView
                submissionResult={submissionResult}
                quizQuestions={quizDetails?.questions || []}
                reviewFilter={reviewFilter}
                onFilterChange={setReviewFilter}
                onRetakeQuiz={handleRetakeQuiz}
                onNewQuiz={() => setCurrentView("configure")}
                onViewHistory={() => setCurrentView("hub")}
                onReviewLesson={handleReviewLesson}
                isAr={isAr}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default AiPracticeQuizModal;
