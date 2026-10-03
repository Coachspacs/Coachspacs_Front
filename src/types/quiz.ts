export type AiQuizQuestionType = "multiple_choice" | "true_false";

export type AiQuizStatus = "pending" | "generating" | "ready" | "failed";

export interface AiQuizQuestion {
  id: number;
  question_text: string;
  question_type: AiQuizQuestionType;
  options?: string[]; // for multiple_choice, e.g. 4 options
  source_lesson?: {
    id: number;
    title: string;
  };
}

export interface AiQuizAttemptQuestionReview {
  question_id: number;
  selected_answer: number | boolean | null;
  is_correct: boolean;
  correct_answer: number | boolean;
  explanation?: string;
  source_lesson?: {
    id: number;
    title: string;
  };
}

export interface AiQuizAttempt {
  id?: number;
  score: number; // e.g. percentage 0-100
  total_questions?: number;
  correct_count?: number;
  submitted_at?: string;
  answers?: AiQuizAttemptQuestionReview[];
  review?: AiQuizAttemptQuestionReview[];
}

export interface AiQuizDetails {
  id: number;
  course_id?: number;
  status: AiQuizStatus;
  is_general?: boolean;
  notice?: string;
  questions: AiQuizQuestion[];
  question_count?: number;
  created_at?: string;
  latest_attempt?: AiQuizAttempt | null;
}

export interface CreateAiQuizRequest {
  lesson_ids: number[]; // 1 to 10 lessons of this course
  question_count: 5 | 10 | 15;
  lang?: "en" | "ar";
}

export interface CreateAiQuizResponse {
  id: number;
  status: "pending" | "ready" | "generating";
  message?: string;
}

export interface SubmitAiQuizAnswer {
  question_id: number;
  selected_answer: number | boolean;
}

export interface SubmitAiQuizRequest {
  answers: SubmitAiQuizAnswer[];
}

export interface SubmitAiQuizResponse {
  score: number;
  total_questions: number;
  correct_count: number;
  attempt_id?: number;
  answers?: AiQuizAttemptQuestionReview[];
  review?: AiQuizAttemptQuestionReview[];
  latest_attempt?: AiQuizAttempt;
}

export interface AiQuizListItem {
  id: number;
  course_id?: number;
  status: AiQuizStatus;
  question_count?: number;
  created_at: string;
  latest_score?: number | null;
  latest_attempt?: AiQuizAttempt | null;
  is_general?: boolean;
  notice?: string;
}
