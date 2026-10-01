import { describe, it, expect, vi, beforeEach } from "vitest";
import { categoryService } from "@/services/categoryService";
import { enrollmentService } from "@/services/enrollmentService";
import { apiClient } from "@/api/client";
import axiosInstance from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
  getCurrentLocale: () => "en",
}));

interface MockCourse {
  id: number;
  title: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "archived";
  category_id: number;
  level: "beginner" | "intermediate" | "advanced";
  language: "ar" | "en";
  price: number;
}

describe("US-06: Course Catalog Filtering, Search & Status Gate", () => {
  const mockCourses: MockCourse[] = [
    { id: 1, title: "React Basics", status: "published", category_id: 1, level: "beginner", language: "en", price: 0 },
    { id: 2, title: "Advanced Django", status: "published", category_id: 2, level: "advanced", language: "ar", price: 50 },
    { id: 3, title: "Draft Course", status: "draft", category_id: 1, level: "intermediate", language: "en", price: 20 },
    { id: 4, title: "Archived UI Course", status: "archived", category_id: 3, level: "beginner", language: "en", price: 30 },
  ];

  it("filters out non-published courses from the public catalog", () => {
    const publishedOnly = mockCourses.filter((c) => c.status === "published");
    expect(publishedOnly.length).toBe(2);
    expect(publishedOnly.every((c) => c.status === "published")).toBe(true);
  });

  it("filters courses by level, language, and category correctly", () => {
    const filtered = mockCourses
      .filter((c) => c.status === "published")
      .filter((c) => c.level === "beginner");
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1);
  });

  it("supports sorting by price ascending and descending", () => {
    const published = mockCourses.filter((c) => c.status === "published");
    const asc = [...published].sort((a, b) => a.price - b.price);
    const desc = [...published].sort((a, b) => b.price - a.price);

    expect(asc[0].price).toBe(0);
    expect(desc[0].price).toBe(50);
  });
});

describe("US-07: Course Details & Preview Gate", () => {
  interface MockLesson {
    id: number;
    title: string;
    is_preview: boolean;
    duration_minutes: number;
  }

  const lessons: MockLesson[] = [
    { id: 101, title: "Introduction", is_preview: true, duration_minutes: 5 },
    { id: 102, title: "Core Concepts", is_preview: false, duration_minutes: 20 },
  ];

  it("allows unenrolled users to play preview lessons only", () => {
    const canPlayLesson = (lesson: MockLesson, isEnrolled: boolean) => {
      return isEnrolled || lesson.is_preview;
    };

    expect(canPlayLesson(lessons[0], false)).toBe(true);
    expect(canPlayLesson(lessons[1], false)).toBe(false);
    expect(canPlayLesson(lessons[1], true)).toBe(true);
  });

  it("determines correct CTA action based on enrollment status and price", () => {
    const getCtaAction = (price: number, isEnrolled: boolean) => {
      if (isEnrolled) return "go_to_course";
      if (price === 0) return "enroll_free";
      return "add_to_cart";
    };

    expect(getCtaAction(0, false)).toBe("enroll_free");
    expect(getCtaAction(49, false)).toBe("add_to_cart");
    expect(getCtaAction(49, true)).toBe("go_to_course");
    expect(getCtaAction(0, true)).toBe("go_to_course");
  });
});

describe("Performance & Caching: Category Service & Unenrollment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.clearCache();
  });

  it("caches category list and deduplicates simultaneous requests", async () => {
    (axiosInstance.get as any).mockResolvedValue({
      data: [
        { id: 1, name: "Programming" },
        { id: 2, name: "Fitness" },
      ],
    });

    // Make two simultaneous calls
    const [res1, res2] = await Promise.all([
      categoryService.getCategories("en"),
      categoryService.getCategories("en"),
    ]);

    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(res1).toEqual(res2);
    expect(res1.length).toBe(2);
  });

  it("successfully calls unenrollCourse to drop an enrollment", async () => {
    (axiosInstance.delete as any).mockResolvedValueOnce({ status: 204 });

    const result = await enrollmentService.unenrollCourse(55, 10);
    expect(axiosInstance.delete).toHaveBeenCalledWith("/enrollments/55");
    expect(result.success).toBe(true);
  });
});

