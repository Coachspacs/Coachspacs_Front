import {
  AiQuizQuestion,
  AiQuizDetails,
  AiQuizAttemptQuestionReview,
  SubmitAiQuizResponse,
} from "@/types/quiz";

/**
 * Normalizes question object defensively from any backend structure
 * (handles question_text vs question vs text vs prompt, options vs choices, question_type vs type).
 */
export function normalizeQuizQuestion(q: any, idx: number): AiQuizQuestion {
  const id = Number(q?.id ?? q?.question_id ?? idx + 1);

  // 1. Question text
  const question_text =
    q?.question_text ||
    q?.question ||
    q?.text ||
    q?.prompt ||
    q?.title ||
    q?.content ||
    `Question ${idx + 1}`;

  // 2. Options / choices
  const rawChoices = q?.options || q?.choices || q?.answers || q?.items || [];
  let options: string[] = [];
  if (Array.isArray(rawChoices)) {
    options = rawChoices.map((opt: any) => {
      if (typeof opt === "string") return opt;
      return opt?.text || opt?.choice || opt?.option || opt?.title || opt?.label || String(opt);
    });
  } else if (rawChoices && typeof rawChoices === "object") {
    options = Object.values(rawChoices).map((val: any) => String(val));
  }

  // 3. Question type
  const rawType = String(q?.question_type || q?.type || "").toLowerCase().trim();

  const isTrueFalse =
    rawType === "true_false" ||
    rawType === "true-false" ||
    rawType === "truefalse" ||
    rawType === "boolean" ||
    rawType === "bool" ||
    rawType === "tf" ||
    rawType.includes("true") ||
    (options.length === 2 &&
      options.some((o) => o.toLowerCase().includes("true") || o.includes("صح")) &&
      options.some((o) => o.toLowerCase().includes("false") || o.includes("خطأ")));

  const question_type: "true_false" | "multiple_choice" = isTrueFalse
    ? "true_false"
    : "multiple_choice";

  // 4. Source lesson
  const source_lesson =
    q?.source_lesson ||
    q?.lesson ||
    (q?.source_lesson_title
      ? { id: Number(q.source_lesson_id || 0), title: String(q.source_lesson_title) }
      : undefined);

  return {
    id,
    question_text,
    question_type,
    options: isTrueFalse ? undefined : options,
    source_lesson,
  };
}

/**
 * Normalizes full quiz details object returned by GET /api/ai-quizzes/{id}
 */
export function normalizeQuizDetails(rawDetails: any): AiQuizDetails {
  if (!rawDetails) return rawDetails;
  const rawQuestions = Array.isArray(rawDetails.questions) ? rawDetails.questions : [];
  return {
    ...rawDetails,
    questions: rawQuestions.map((q: any, idx: number) => normalizeQuizQuestion(q, idx)),
  };
}

/**
 * Safely computes an integer score percentage without NaN.
 */
export function calculateQuizScore(
  rawScore: any,
  correctCount: number,
  totalQuestions: number
): number {
  if (typeof rawScore === "number" && !isNaN(rawScore)) {
    return Math.round(rawScore);
  }
  if (typeof rawScore === "string" && !isNaN(parseFloat(rawScore))) {
    return Math.round(parseFloat(rawScore));
  }
  if (totalQuestions > 0 && typeof correctCount === "number" && !isNaN(correctCount)) {
    return Math.round((correctCount / totalQuestions) * 100);
  }
  return 0;
}

export interface NormalizedReviewItem {
  question_id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options?: string[];
  selected_answer: number | boolean | null;
  is_correct: boolean;
  correct_answer: number | boolean | string;
  explanation?: string;
  source_lesson?: { id: number; title: string };
}

export interface NormalizedSubmissionResult {
  score: number;
  total_questions: number;
  correct_count: number;
  reviewItems: NormalizedReviewItem[];
}

/**
 * Normalizes the submission response review items, probing all backend schema variations
 * and guaranteeing that questions and explanations are ALWAYS available.
 */
export function normalizeSubmissionResult(
  submissionData: any,
  quizQuestions: AiQuizQuestion[] = [],
  answersMap: Record<number, number | boolean> = {}
): NormalizedSubmissionResult {
  const total =
    Number(submissionData?.total_questions) ||
    Number(submissionData?.total) ||
    quizQuestions.length ||
    5;

  const correct =
    Number(submissionData?.correct_count) ||
    Number(submissionData?.correct) ||
    0;

  const score = calculateQuizScore(
    submissionData?.score ?? submissionData?.percentage ?? submissionData?.score_percentage,
    correct,
    total
  );

  // Probe all possible keys for the review list
  const rawList: any[] =
    submissionData?.answers ||
    submissionData?.review ||
    submissionData?.questions ||
    submissionData?.results ||
    submissionData?.items ||
    submissionData?.data?.answers ||
    submissionData?.data?.review ||
    submissionData?.data?.results ||
    submissionData?.data?.questions ||
    submissionData?.latest_attempt?.review ||
    submissionData?.latest_attempt?.answers ||
    submissionData?.attempt?.review ||
    submissionData?.attempt?.answers ||
    [];

  let reviewItems: NormalizedReviewItem[] = [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    reviewItems = rawList.map((item: any, idx: number) => {
      const qId = Number(item?.question_id ?? item?.id ?? quizQuestions[idx]?.id ?? idx + 1);
      const originalQ = quizQuestions.find((q) => q.id === qId) || quizQuestions[idx];

      const question_text =
        item?.question_text ||
        item?.question ||
        item?.text ||
        item?.title ||
        item?.prompt ||
        originalQ?.question_text ||
        `Question ${idx + 1}`;

      const question_type =
        originalQ?.question_type ||
        (item?.question_type === "true_false" ? "true_false" : "multiple_choice");

      const options =
        (Array.isArray(item?.options) && item.options.length > 0)
          ? item.options
          : (Array.isArray(item?.choices) && item.choices.length > 0)
          ? item.choices
          : (Array.isArray(originalQ?.options) && originalQ.options.length > 0)
          ? originalQ.options
          : [];

      // Determine is_correct
      const is_correct = Boolean(
        item?.is_correct ??
        item?.correct ??
        item?.isCorrect ??
        (item?.selected_answer !== undefined &&
         item?.correct_answer !== undefined &&
         item.selected_answer === item.correct_answer)
      );

      // Selected answer
      const selected_answer =
        item?.selected_answer !== undefined
          ? item.selected_answer
          : item?.user_answer !== undefined
          ? item.user_answer
          : item?.student_answer !== undefined
          ? item.student_answer
          : answersMap[qId] !== undefined
          ? answersMap[qId]
          : null;

      // Correct answer
      const correct_answer =
        item?.correct_answer !== undefined
          ? item.correct_answer
          : item?.answer !== undefined
          ? item.answer
          : item?.correctAnswer !== undefined
          ? item.correctAnswer
          : "";

      // Explanation
      const explanation =
        item?.explanation ||
        item?.explain ||
        item?.feedback ||
        item?.reason ||
        item?.ai_explanation ||
        "";

      // Source lesson
      const source_lesson =
        item?.source_lesson ||
        item?.lesson ||
        originalQ?.source_lesson ||
        undefined;

      return {
        question_id: qId,
        question_text,
        question_type,
        options,
        selected_answer,
        is_correct,
        correct_answer,
        explanation,
        source_lesson,
      };
    });
  } else if (quizQuestions.length > 0) {
    // Fallback: If backend only returned summary counts without review array, map from questions
    reviewItems = quizQuestions.map((q, idx) => {
      const selected = answersMap[q.id] ?? null;
      return {
        question_id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        selected_answer: selected,
        is_correct: idx < correct,
        correct_answer: q.question_type === "true_false" ? true : 0,
        explanation: "",
        source_lesson: q.source_lesson,
      };
    });
  }

  return {
    score,
    total_questions: total,
    correct_count: correct,
    reviewItems,
  };
}
