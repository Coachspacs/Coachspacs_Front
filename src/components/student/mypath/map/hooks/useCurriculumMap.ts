"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/soundEffects";
import {
  RoadmapMilestone,
  GeneratedRoadmap,
  MyPathPreferences,
} from "@/types/mypath";
import { roadmapService } from "@/services/roadmapService";
import { WaypointNode } from "../types";

interface UseCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale?: string;
  onMilestoneToggle: (id: string) => void;
  onReorderMilestones?: (newMilestones: RoadmapMilestone[]) => void;
  onRefreshRoadmap?: () => Promise<void>;
}

export function useCurriculumMap({
  roadmap,
  preferences,
  isAr = false,
  locale = "en",
  onMilestoneToggle,
  onReorderMilestones,
  onRefreshRoadmap,
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
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  // Auto-expand the active milestone when the current active index changes (e.g., on initial load or step completion)
  const previousActiveIdRef = useRef<string | null>(null);
  useEffect(() => {
    const activeM = milestonesState[currentActiveIndex];
    if (activeM && activeM.id !== previousActiveIdRef.current) {
      setExpandedMilestoneId(activeM.id);
      previousActiveIdRef.current = activeM.id;
    }
  }, [currentActiveIndex, milestonesState]);

  // Reordering milestone logic (US-18 #5)
  const handleMoveMilestone = async (index: number, direction: "up" | "down") => {
    let updated: RoadmapMilestone[] | null = null;
    let targetNewOrder = 1;
    const targetMilestone = milestonesState[index];

    if (direction === "up" && index > 0) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      targetNewOrder = index; // 1-based order
    } else if (direction === "down" && index < milestonesState.length - 1) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      targetNewOrder = index + 2; // 1-based order
    }

    if (updated && targetMilestone) {
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

      // Sync step order with backend PATCH /api/ai/roadmap/steps/:id
      try {
        await roadmapService.reorderStep(targetMilestone.id, targetNewOrder, locale);
      } catch (err) {}
    }
  };

  // Drag & Drop Reorder Handler (US-18 #5)
  const handleReorderGroup = async (newOrder: RoadmapMilestone[]) => {
    const prevOrder = [...milestonesState];
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

    // Sync newly ordered positions with backend
    try {
      for (let i = 0; i < newOrder.length; i++) {
        const item = newOrder[i];
        const oldPos = prevOrder.findIndex((m) => m.id === item.id);
        if (oldPos !== i) {
          await roadmapService.reorderStep(item.id, i + 1, locale);
        }
      }
    } catch (err) {}
  };

  // Skip milestone handler (US-18 #4a / #4b)
  const handleToggleSkip = async (milestoneId: string) => {
    const currentMilestone = milestonesState.find((m) => m.id === milestoneId);
    const isCurrentlySkipped = currentMilestone?.status === "skipped";
    const newStatusBackend = isCurrentlySkipped ? "pending" : "skipped";
    const nextLocalStatus = isCurrentlySkipped ? "planned" : "skipped";

    // Optimistic UI update
    const updated = milestonesState.map((m) => {
      if (m.id === milestoneId) {
        return { ...m, status: nextLocalStatus as any };
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

    // Call real backend PATCH /api/ai/roadmap/steps/:stepId
    try {
      await roadmapService.updateStepStatus(milestoneId, newStatusBackend, locale);
      // Re-plan remaining pending steps around it
      if (onRefreshRoadmap) {
        await onRefreshRoadmap();
      }
    } catch (err) {
      // Graceful offline preservation
    }
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
        colors: ["var(--color-primary-main)", "var(--color-primary-light)", "var(--color-primary-main)", "#F59E0B", "var(--color-primary-main)"],
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
