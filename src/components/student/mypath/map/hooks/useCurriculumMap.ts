"use client";

import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/soundEffects";
import {
  RoadmapMilestone,
  GeneratedRoadmap,
  MyPathPreferences,
} from "@/types/mypath";
import { WaypointNode } from "../types";

interface UseCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  onMilestoneToggle: (id: string) => void;
  onReorderMilestones?: (newMilestones: RoadmapMilestone[]) => void;
}

export function useCurriculumMap({
  roadmap,
  preferences,
  isAr = false,
  onMilestoneToggle,
  onReorderMilestones,
}: UseCurriculumMapProps) {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Local milestones state to support real-time skipping, completion & reordering
  const [milestonesState, setMilestonesState] = useState<RoadmapMilestone[]>(
    roadmap.milestones,
  );

  useEffect(() => {
    setMilestonesState(roadmap.milestones);
  }, [roadmap.milestones]);

  // Enrolled courses detection from storage/session (Purchase requirement)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("coachspace_enrolled_courses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const ids = parsed.map((c: any) =>
            String(c.id || c.course_id || c.slug || "").toLowerCase(),
          );
          setEnrolledCourseIds(ids);
        }
      }
    } catch {}
  }, []);

  // Initialize sound preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coachspace_mypath_sound_enabled");
      if (saved !== null) {
        const val = saved === "true";
        setSoundOn(val);
        soundFx.setEnabled(val);
      }
    } catch {}
  }, []);

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    soundFx.setEnabled(nextVal);
    try {
      localStorage.setItem("coachspace_mypath_sound_enabled", String(nextVal));
    } catch {}
    if (nextVal) soundFx.playOptionSelect();
  };

  const totalCount = milestonesState.length;
  const completedCount = milestonesState.filter(
    (m) => m.status === "completed",
  ).length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active milestone index (first non-completed and non-skipped milestone)
  const activeMilestoneIndex = milestonesState.findIndex(
    (m) => m.status !== "completed" && m.status !== "skipped",
  );
  const currentActiveIndex =
    activeMilestoneIndex === -1 ? totalCount - 1 : activeMilestoneIndex;

  // Accordion state: ONLY the active lesson is expanded by default, others collapsed
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    () => {
      const activeM = milestonesState[currentActiveIndex];
      return activeM ? activeM.id : milestonesState[0]?.id || null;
    },
  );

  // Reordering milestone logic
  const handleMoveMilestone = (index: number, direction: "up" | "down") => {
    let updated: RoadmapMilestone[] | null = null;
    if (direction === "up" && index > 0) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < milestonesState.length - 1) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }

    if (updated) {
      setMilestonesState(updated);

      // Auto-expand the milestone that is NOW at Stage 1 / active stage
      const firstActive = updated.find(
        (m) => m.status !== "completed" && m.status !== "skipped",
      );
      const targetToExpand = firstActive ? firstActive.id : updated[0]?.id;
      if (targetToExpand) {
        setExpandedMilestoneId(targetToExpand);
      }

      // Persist the new order in localStorage and notify parent
      try {
        const updatedRoadmap = { ...roadmap, milestones: updated };
        localStorage.setItem(
          "coachspace_student_roadmap",
          JSON.stringify(updatedRoadmap),
        );
      } catch {}

      onReorderMilestones?.(updated);

      if (soundOn) soundFx.playOptionSelect();
    }
  };

  // Drag & Drop Reorder Handler
  const handleReorderGroup = (newOrder: RoadmapMilestone[]) => {
    setMilestonesState(newOrder);

    // Auto-expand the milestone that is NOW at Stage 1 / active stage
    const firstActive = newOrder.find(
      (m) => m.status !== "completed" && m.status !== "skipped",
    );
    const targetToExpand = firstActive ? firstActive.id : newOrder[0]?.id;
    if (targetToExpand) {
      setExpandedMilestoneId(targetToExpand);
    }

    // Persist the new order in localStorage and notify parent
    try {
      const updatedRoadmap = { ...roadmap, milestones: newOrder };
      localStorage.setItem(
        "coachspace_student_roadmap",
        JSON.stringify(updatedRoadmap),
      );
    } catch {}

    onReorderMilestones?.(newOrder);
  };

  // Skip milestone handler
  const handleToggleSkip = (milestoneId: string) => {
    const updated = milestonesState.map((m) => {
      if (m.id === milestoneId) {
        const newStatus = m.status === "skipped" ? "planned" : "skipped";
        return { ...m, status: newStatus as any };
      }
      return m;
    });
    setMilestonesState(updated);

    try {
      const updatedRoadmap = { ...roadmap, milestones: updated };
      localStorage.setItem(
        "coachspace_student_roadmap",
        JSON.stringify(updatedRoadmap),
      );
    } catch {}

    onReorderMilestones?.(updated);

    if (soundOn) soundFx.playOptionSelect();
  };

  // Dynamic Waypoint coordinates generation with generous top and bottom margins
  const waypoints: WaypointNode[] = useMemo(() => {
    if (totalCount === 0) return [];
    if (totalCount === 1) {
      return [{ milestoneIndex: 0, xPercent: 50, yPercent: 50 }];
    }

    const startY = 22; // Well-spaced clearance below Roadmap Start Line
    const endY = 80; // Well-spaced clearance above Goal Marker

    return milestonesState.map((_, idx) => {
      // Alternate left (~25%) and right (~75%)
      const isEven = idx % 2 === 0;
      const xPercent = isEven ? 25 : 75;
      const yPercent =
        totalCount <= 1
          ? 50
          : startY + (idx / (totalCount - 1)) * (endY - startY);

      return {
        milestoneIndex: idx,
        xPercent,
        yPercent,
      };
    });
  }, [milestonesState, totalCount]);

  // Dynamic ultra-smooth S-Curve SVG road path connecting start pin, all waypoints, and end goal
  const svgRoadPath = useMemo(() => {
    if (waypoints.length === 0) return "";

    const points = waypoints.map((wp) => ({
      x: (wp.xPercent / 100) * 800,
      y: (wp.yPercent / 100) * 1000,
    }));

    // Start line origin coordinate in SVG viewBox (center top)
    const startOrigin = { x: 400, y: 45 };
    // End goal coordinate in SVG viewBox (center bottom)
    const endTarget = { x: 400, y: 955 };

    // Full sequence from Start Line -> all Checkpoint waypoints -> Finish Goal
    const allNodes = [startOrigin, ...points, endTarget];

    let d = `M ${allNodes[0].x} ${allNodes[0].y}`;
    for (let i = 0; i < allNodes.length - 1; i++) {
      const p1 = allNodes[i];
      const p2 = allNodes[i + 1];
      const dy = p2.y - p1.y;
      // Smooth natural cubic bezier S-curve with vertical departure and arrival tangents
      const cp1x = p1.x;
      const cp1y = p1.y + dy * 0.5;
      const cp2x = p2.x;
      const cp2y = p2.y - dy * 0.5;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [waypoints]);

  const triggerCelebration = () => {
    try {
      soundFx.playCelebration();
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ["#0F5244", "#10B981", "#38E09D", "#F59E0B", "#D1FAE5"],
      });
    } catch {}
  };

  const handleToggleCompleted = (milestoneId: string) => {
    const target = milestonesState.find((m) => m.id === milestoneId);
    if (target && target.status !== "completed") {
      triggerCelebration();
    } else {
      soundFx.playOptionSelect();
    }
    onMilestoneToggle(milestoneId);
  };

  // Human readable track title
  const getTrackName = () => {
    if (preferences.customTrackName) return preferences.customTrackName;
    switch (preferences.track) {
      case "uiux":
        return isAr
          ? "تصميم واجهات وتجربة المستخدم (UI/UX)"
          : "UI/UX Product Design";
      case "frontend":
        return isAr
          ? "تطوير واجهات المستخدم (Frontend Development)"
          : "Frontend Web Engineering";
      case "backend":
        return isAr
          ? "تطوير البنية الخلفية والسحابية (Backend)"
          : "Backend & Cloud Architecture";
      case "fullstack":
        return isAr
          ? "التطوير الشامل المتكامل (Full-Stack)"
          : "Full-Stack Web Development";
      case "ai":
        return isAr
          ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)"
          : "Artificial Intelligence & ML";
      case "data":
        return isAr
          ? "علم وهندسة البيانات (Data Science)"
          : "Data Science & Analytics";
      case "mobile":
        return isAr
          ? "تطوير تطبيقات الموبايل (Mobile Apps)"
          : "Cross-Platform Mobile Apps";
      case "cloud":
        return isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps";
      default:
        return isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap";
    }
  };

  // Dynamic responsive height: adapts cleanly when cards are collapsed vs expanded
  const isAnyExpanded = Boolean(expandedMilestoneId);
  const dynamicMinHeight = Math.max(
    800,
    totalCount * (isAnyExpanded ? 270 : 190),
  );

  return {
    soundOn,
    toggleSound,
    isReorderModalOpen,
    setIsReorderModalOpen,
    milestonesState,
    enrolledCourseIds,
    totalCount,
    completedCount,
    progressPercent,
    currentActiveIndex,
    expandedMilestoneId,
    setExpandedMilestoneId,
    handleMoveMilestone,
    handleReorderGroup,
    handleToggleSkip,
    handleToggleCompleted,
    waypoints,
    svgRoadPath,
    getTrackName,
    dynamicMinHeight,
  };
}
