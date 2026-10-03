import { apiClient } from "@/api/client";
import {
  CreateAiQuizRequest,
  CreateAiQuizResponse,
  AiQuizDetails,
  SubmitAiQuizRequest,
  SubmitAiQuizResponse,
  AiQuizListItem,
} from "@/types/quiz";

export const aiQuizService = {
  /**
   * Request generation of an AI practice quiz from selected lessons.
   * Returns 202 with quiz id and status 'pending'.
   */
  async createQuiz(
    courseId: number | string,
    data: CreateAiQuizRequest
  ): Promise<CreateAiQuizResponse> {
    const res = await apiClient.post<CreateAiQuizResponse>(
      `/courses/${courseId}/ai-quizzes`,
      {
        lesson_ids: data.lesson_ids,
        question_count: data.question_count,
        lang: data.lang,
      }
    );
    return res.data;
  },

  /**
   * Poll or retrieve a quiz by ID.
   * Status can be 'pending', 'generating', 'ready', or 'failed'.
   * When 'ready', includes questions and any previous latest_attempt.
   */
  async getQuiz(quizId: number | string): Promise<AiQuizDetails> {
    const res = await apiClient.get<AiQuizDetails>(`/ai-quizzes/${quizId}`);
    return res.data;
  },

  /**
   * Submit student answers for an AI practice quiz.
   * Returns calculated score, results per question, correct answers, explanations, and review lessons.
   */
  async submitQuiz(
    quizId: number | string,
    data: SubmitAiQuizRequest
  ): Promise<SubmitAiQuizResponse> {
    const res = await apiClient.post<SubmitAiQuizResponse>(
      `/ai-quizzes/${quizId}/submit`,
      data
    );
    return res.data;
  },

  /**
   * Get all AI practice quizzes created by the current student for this course.
   * Listed newest first, with status and latest score.
   */
  async getCourseQuizzes(courseId: number | string): Promise<AiQuizListItem[]> {
    const res = await apiClient.get<AiQuizListItem[] | { results?: AiQuizListItem[] }>(
      `/courses/${courseId}/ai-quizzes`
    );
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray((res.data as any)?.results)) {
      return (res.data as any).results;
    }
    return [];
  },
};

export default aiQuizService;
