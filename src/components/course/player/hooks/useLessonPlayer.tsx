"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Sparkles,
} from "lucide-react";
import { LessonViewerLayoutProps } from "../types";

export function useLessonPlayer({
  courseSlug = "",
  sections,
  allLessons,
  activeLessonIndex,
  completedLessonIds,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  onFinishCourse,
  progressPercent: externalProgressPercent,
  serverProgressPercent,
  locale = "en",
  isAr: isArProp,
}: LessonViewerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const dispatch = useDispatch();

  const t = useTranslations("player");
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");

  const isAr = isArProp !== undefined ? isArProp : locale === "ar";
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  const userRole = (user?.role || "").toLowerCase();
  const isAdmin = Boolean(
    isAuthenticated && (
      userRole === "admin" ||
      userRole === "superuser" ||
      userRole === "superadmin" ||
      user?.is_superuser === true ||
      (user as any)?.isSuperuser === true
    )
  );

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [hasDismissedCelebration, setHasDismissedCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Video Player state
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube-like Shortcut Feedback Indicator Overlay
  const [feedbackToast, setFeedbackToast] = useState<{ icon: React.ReactNode; text?: string } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFeedback = (icon: React.ReactNode, text?: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedbackToast({ icon, text });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 700);
  };

  // YouTube Settings Popover State
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState<"main" | "speed" | "quality">("main");
  const [selectedQuality, setSelectedQuality] = useState("1080p HD");
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const activeLesson = allLessons[activeLessonIndex] || allLessons[0];
  const isCurrentCompleted = activeLesson ? completedLessonIds.includes(String(activeLesson.id)) : false;

  // Calculate Progress
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const calculatedProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const progressPercent = Math.max(
    calculatedProgress,
    typeof serverProgressPercent === "number" ? serverProgressPercent : 0,
    typeof externalProgressPercent === "number" ? externalProgressPercent : 0
  );

  // Auto-trigger Course Completion Celebration Modal once 100% is reached
  useEffect(() => {
    if (progressPercent >= 100 && totalLessons > 0 && completedCount >= totalLessons) {
      if (!hasDismissedCelebration) {
        setShowCelebrationModal(true);
      }
    }
  }, [progressPercent, totalLessons, completedCount, hasDismissedCelebration]);

  const handleNavigateToCertificate = () => {
    if (onFinishCourse) {
      onFinishCourse();
    } else {
      router.push(`/${locale}/student/certificates/${courseSlug || "1"}`);
    }
  };

  // Initialize all sections as open
  useEffect(() => {
    if (sections.length > 0) {
      const initial: Record<string, boolean> = {};
      sections.forEach((sec, idx) => {
        initial[String(sec.id || `sec-${idx}`)] = true;
      });
      setOpenSections(initial);
    }
  }, [sections]);

  // Handle Fullscreen Listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Dropdown close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSeekScrubber = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVol: number, showToast = false) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setVolume(clamped);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted = clamped === 0;
      setIsMuted(clamped === 0);
    }
    if (showToast) {
      const pct = Math.round(clamped * 100);
      if (clamped === 0) {
        triggerFeedback(<VolumeX size={26} />, "0%");
      } else {
        triggerFeedback(<Volume2 size={26} />, `${pct}%`);
      }
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
      if (nextMuted) {
        triggerFeedback(<VolumeX size={26} />, t("muted"));
      } else {
        const pct = Math.round((volume || 1) * 100);
        triggerFeedback(<Volume2 size={26} />, `${pct}%`);
      }
    }
  };

  const handleMouseMovePlayer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !settingsMenuOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Video playback was prevented:", error);
            setIsPlaying(false);
          });
        }
        setIsPlaying(true);
        setHasStartedPlayback(true);
        triggerFeedback(<Play size={32} className="fill-white ms-0.5" />, t("play"));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        triggerFeedback(<Pause size={32} className="fill-white" />, t("pause"));
      }
    }
  };

  const handleJumpSeconds = (delta: number) => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || duration || 0;
      const newTime = Math.max(0, Math.min(dur, current + delta));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      if (delta > 0) {
        triggerFeedback(<RotateCw size={26} />, `+${delta}s`);
      } else {
        triggerFeedback(<RotateCcw size={26} />, `${delta}s`);
      }
    }
  };

  const handleSeekPercent = (pct: number) => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || duration || 0;
      if (dur > 0) {
        const newTime = dur * (pct / 100);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        triggerFeedback(<Sparkles size={24} />, `${pct}%`);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      triggerFeedback(<Settings size={26} />, `${speed}x`);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen?.().catch(console.warn);
      triggerFeedback(<Maximize size={26} />, t("fullscreen"));
    } else {
      document.exitFullscreen?.().catch(console.warn);
      triggerFeedback(<Minimize size={26} />, t("exitFullscreen"));
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleVideoEnded = () => {
    if (activeLesson) {
      if (!completedLessonIds.includes(String(activeLesson.id))) {
        onToggleComplete(activeLesson.id);
      }
    }
    if (autoplayNext && activeLessonIndex < allLessons.length - 1) {
      setNextCountdown(5);
    }
  };

  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      setNextCountdown(null);
      if (onNextLesson) {
        onNextLesson();
        setIsPlaying(true);
      }
      return;
    }
    const timer = setTimeout(() => {
      setNextCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [nextCountdown, onNextLesson]);

  // Advanced Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("input") ||
          target.closest("textarea"))
      ) {
        return;
      }

      if (!videoRef.current) return;

      const key = e.key;

      if (key === " " || key === "k" || key === "K") {
        e.preventDefault();
        handlePlayPause();
        return;
      }

      if (key === "ArrowRight") {
        e.preventDefault();
        handleJumpSeconds(5);
        return;
      }
      if (key === "ArrowLeft") {
        e.preventDefault();
        handleJumpSeconds(-5);
        return;
      }
      if (key === "l" || key === "L") {
        e.preventDefault();
        handleJumpSeconds(10);
        return;
      }
      if (key === "j" || key === "J") {
        e.preventDefault();
        handleJumpSeconds(-10);
        return;
      }

      if (key === "ArrowUp") {
        e.preventDefault();
        if (isMuted) {
          setIsMuted(false);
          if (videoRef.current) videoRef.current.muted = false;
        }
        const nextVol = Math.min(1, Math.round((volume + 0.1) * 10) / 10);
        handleVolumeChange(nextVol > 0 ? nextVol : 0.1, true);
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        const nextVol = Math.max(0, Math.round((volume - 0.1) * 10) / 10);
        handleVolumeChange(nextVol, true);
        return;
      }
      if (key === "m" || key === "M") {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        const digit = parseInt(key, 10);
        handleSeekPercent(digit * 10);
        return;
      }

      if (key === "f" || key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, volume, duration, isMuted]);

  // Filtered Sections by Search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections
      .map((sec) => {
        const matchingLessons = (sec.lessons || []).filter((les) => {
          const tEn = (les.title_en || les.title || "").toLowerCase();
          const tAr = (les.title_ar || les.title || "").toLowerCase();
          return tEn.includes(q) || tAr.includes(q);
        });
        return { ...sec, lessons: matchingLessons };
      })
      .filter((sec) => (sec.lessons || []).length > 0);
  }, [sections, searchQuery]);

  return {
    router,
    pathname,
    dispatch,
    t,
    tNav,
    tHeader,
    isAr,
    user,
    isAuthenticated,
    isAdmin,
    cartItems,
    sidebarOpen,
    setSidebarOpen,
    theaterMode,
    setTheaterMode,
    searchQuery,
    setSearchQuery,
    openSections,
    setOpenSections,
    toastMessage,
    setToastMessage,
    userDropdownOpen,
    setUserDropdownOpen,
    showShortcutsModal,
    setShowShortcutsModal,
    showCelebrationModal,
    setShowCelebrationModal,
    hasDismissedCelebration,
    setHasDismissedCelebration,
    mounted,
    playerContainerRef,
    videoRef,
    dropdownRef,
    settingsMenuRef,
    progressBarRef,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    playbackSpeed,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    isMuted,
    autoplayNext,
    setAutoplayNext,
    nextCountdown,
    setNextCountdown,
    showControls,
    hasStartedPlayback,
    setHasStartedPlayback,
    feedbackToast,
    settingsMenuOpen,
    setSettingsMenuOpen,
    settingsSubmenu,
    setSettingsSubmenu,
    selectedQuality,
    setSelectedQuality,
    activeLesson,
    isCurrentCompleted,
    totalLessons,
    completedCount,
    progressPercent,
    filteredSections,
    triggerFeedback,
    showToast,
    handleSeekScrubber,
    handleVolumeChange,
    handleToggleMute,
    handleMouseMovePlayer,
    handlePlayPause,
    handleJumpSeconds,
    handleSeekPercent,
    handleSpeedChange,
    handleToggleFullscreen,
    formatTime,
    handleVideoEnded,
    handleNavigateToCertificate,
  };
}
