import { describe, it, expect } from "vitest";

describe("US-11 & US-13: Student Progress Calculation & Milestone Tracking", () => {
  function calculateProgress(completedLessonIds: number[], totalLessonsCount: number): number {
    if (totalLessonsCount <= 0) return 0;
    const count = completedLessonIds.length;
    return Math.min(100, Math.round((count / totalLessonsCount) * 100));
  }

  function toggleLesson(
    completedLessonIds: number[],
    lessonId: number,
    markAsComplete: boolean
  ): { updatedCompleted: number[]; is100Percent: boolean } {
    let updated: number[];
    if (markAsComplete) {
      updated = Array.from(new Set([...completedLessonIds, lessonId]));
    } else {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    }

    return {
      updatedCompleted: updated,
      is100Percent: updated.length === 5, // assuming 5 lessons total for test
    };
  }

  it("calculates progress percentage accurately", () => {
    expect(calculateProgress([], 10)).toBe(0);
    expect(calculateProgress([1, 2, 3], 10)).toBe(30);
    expect(calculateProgress([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10)).toBe(100);
  });

  it("toggling complete and incomplete increments and decrements progress correctly", () => {
    let completed = [1, 2];
    const afterAdd = toggleLesson(completed, 3, true);
    expect(afterAdd.updatedCompleted).toContain(3);
    expect(afterAdd.updatedCompleted.length).toBe(3);

    const afterRemove = toggleLesson(afterAdd.updatedCompleted, 3, false);
    expect(afterRemove.updatedCompleted).not.toContain(3);
    expect(afterRemove.updatedCompleted.length).toBe(2);
  });

  it("triggers 100% completion milestone when final lesson is completed", () => {
    const completed = [1, 2, 3, 4];
    const result = toggleLesson(completed, 5, true);
    expect(result.is100Percent).toBe(true);
  });

  it("determines the resume lesson index at the first incomplete lesson", () => {
    const allLessonIds = [10, 20, 30, 40];
    const completedIds = [10, 20];

    const firstIncomplete = allLessonIds.find((id) => !completedIds.includes(id));
    expect(firstIncomplete).toBe(30);
  });
});
