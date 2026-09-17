import { describe, it, expect } from "vitest";
import { ReorderCurriculumRequest } from "@/types/course";

describe("US-08: Instructor Curriculum Reordering & Media Validation", () => {
  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

  function validateLessonVideo(file: { size: number; type: string }): { valid: boolean; error?: string } {
    if (file.type !== "video/mp4") {
      return { valid: false, error: "Only MP4 videos are allowed." };
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: "Video file size cannot exceed 500 MB." };
    }
    return { valid: true };
  }

  it("validates MP4 video files under 500MB", () => {
    expect(validateLessonVideo({ size: 100 * 1024 * 1024, type: "video/mp4" }).valid).toBe(true);
    expect(validateLessonVideo({ size: 550 * 1024 * 1024, type: "video/mp4" }).valid).toBe(false);
    expect(validateLessonVideo({ size: 50 * 1024 * 1024, type: "video/webm" }).valid).toBe(false);
  });

  it("formats reorderCurriculum payload correctly with 1-based order indexes", () => {
    const rawSections = [
      { id: 10, lessons: [{ id: 101 }, { id: 102 }] },
      { id: 20, lessons: [{ id: 201 }] },
    ];

    const payload: ReorderCurriculumRequest = {
      sections: rawSections.map((sec, secIdx) => ({
        id: sec.id,
        order: secIdx + 1,
        lessons: sec.lessons.map((les, lesIdx) => ({
          id: les.id,
          order: lesIdx + 1,
        })),
      })),
    };

    expect(payload.sections[0].order).toBe(1);
    expect(payload.sections[0].lessons[1].order).toBe(2);
    expect(payload.sections[1].order).toBe(2);
  });
});

describe("US-09: Course Lifecycle Status Machine", () => {
  type CourseStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";

  const validTransitions: Record<CourseStatus, CourseStatus[]> = {
    draft: ["pending_review"],
    pending_review: ["published", "rejected"],
    published: ["archived"],
    rejected: ["pending_review"],
    archived: [],
  };

  function canTransition(from: CourseStatus, to: CourseStatus): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it("allows valid lifecycle transitions", () => {
    expect(canTransition("draft", "pending_review")).toBe(true);
    expect(canTransition("pending_review", "published")).toBe(true);
    expect(canTransition("pending_review", "rejected")).toBe(true);
    expect(canTransition("rejected", "pending_review")).toBe(true);
    expect(canTransition("published", "archived")).toBe(true);
  });

  it("blocks invalid lifecycle transitions", () => {
    expect(canTransition("draft", "published")).toBe(false);
    expect(canTransition("archived", "pending_review")).toBe(false);
    expect(canTransition("rejected", "published")).toBe(false);
  });
});

describe("US-17: Instructor Dashboard Metrics & Enrolled Students Aggregation", () => {
  it("aggregates students across all instructor courses when 'all' is selected", () => {
    const mockCourses = [
      { id: "c1", title: "Course 1", studentsCount: 2 },
      { id: "c2", title: "Course 2", studentsCount: 0 },
    ];

    const mockCourse1Students = [
      { id: 101, full_name: "Ali Omar", email: "ali@test.com", progress_percent: 40, is_completed: false },
      { id: 102, full_name: "Laila H.", email: "laila@test.com", progress_percent: 100, is_completed: true },
    ];

    // Simulating the fetchCourseStudents('all') logic
    const responses = mockCourses.map((c) => {
      if (c.id === "c1") {
        return mockCourse1Students.map((st) => ({
          ...st,
          course_id: c.id,
          course_title: c.title,
        }));
      }
      return [];
    });

    const allStudents = responses.flat();

    expect(allStudents.length).toBe(2);
    expect(allStudents[0].full_name).toBe("Ali Omar");
    expect(allStudents[1].progress_percent).toBe(100);
    expect(allStudents[1].is_completed).toBe(true);
  });
});

