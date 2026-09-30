import { describe, it, expect } from "vitest";
import { generateRoadmapFromPreferences } from "@/lib/myPathGenerator";
import { MyPathPreferences } from "@/types/mypath";

describe("Student My Path (AI Learning Roadmap) Unit Tests", () => {
  it("generates a structured 4-milestone roadmap for AI track", () => {
    const preferences: MyPathPreferences = {
      track: "ai",
      level: "beginner",
      hoursPerWeek: "8",
      targetMonths: "6",
    };

    const roadmap = generateRoadmapFromPreferences(preferences);

    expect(roadmap).toBeDefined();
    expect(roadmap.estimatedWeeks).toBe(24);
    expect(roadmap.hoursPerWeek).toBe(8);
    expect(roadmap.milestones.length).toBe(4);

    // Verify sequential steps
    expect(roadmap.milestones[0].stepNumber).toBe(1);
    expect(roadmap.milestones[0].status).toBe("in_progress");
    expect(roadmap.milestones[0].skills.length).toBeGreaterThan(0);
    expect(roadmap.milestones[0].courses.length).toBeGreaterThan(0);

    expect(roadmap.milestones[3].stepNumber).toBe(4);
    expect(roadmap.milestones[3].projectTitle.length).toBeGreaterThan(0);
  });

  it("generates a structured 4-milestone roadmap for Frontend track", () => {
    const preferences: MyPathPreferences = {
      track: "frontend",
      level: "intermediate",
      hoursPerWeek: "15",
      targetMonths: "6",
    };

    const roadmap = generateRoadmapFromPreferences(preferences);

    expect(roadmap.estimatedWeeks).toBe(24);
    expect(roadmap.hoursPerWeek).toBe(15);
    expect(roadmap.milestones.length).toBe(4);
    expect(roadmap.milestones[0].skillsAr.length).toBeGreaterThan(0);
    expect(roadmap.milestones[0].titleAr.length).toBeGreaterThan(0);
  });

  it("ensures total weeks match month preferences dynamically", () => {
    const pref1Month: MyPathPreferences = {
      track: "frontend",
      level: "beginner",
      hoursPerWeek: "8",
      targetMonths: "1",
    };

    const roadmap1 = generateRoadmapFromPreferences(pref1Month);
    expect(roadmap1.estimatedWeeks).toBe(4);
  });
});
