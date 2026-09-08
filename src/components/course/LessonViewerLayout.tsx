"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/slice";
import { tokenManager } from "@/lib/tokenManager";
import { authService } from "@/services/auth";
import { Logo } from "@/components/ui/Logo";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Footer } from "@/components/layout/Footer";
import { resolveMediaUrl } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Sliders,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Sparkles,
  Search,
  Share2,
  Bookmark,
  BookmarkCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Globe,
  User,
  LogOut,
  X,
  AlertCircle,
  Tv,
  ExternalLink,
  Plus,
  Trash2,
  Award,
  Keyboard,
} from "lucide-react";

export interface LessonItem {
  id: string | number;
  title: string;
  title_en?: string;
  title_ar?: string;
  duration?: string;
  duration_minutes?: number;
  video_url?: string;
  videoUrl?: string;
  is_preview?: boolean;
  is_locked?: boolean;
  sectionId?: string | number;
  sectionTitle?: string;
  description?: string;
  resources?: { name: string; size: string; url?: string }[];
}

export interface SectionItem {
  id: string | number;
  title: string;
  title_en?: string;
  title_ar?: string;
  lessons: LessonItem[];
}

export interface InstructorItem {
  id?: string | number;
  name?: string;
  full_name?: string;
  avatar?: string | null;
  slug?: string;
  headline?: string;
  headline_ar?: string;
  role?: string;
  role_ar?: string;
  bio?: string;
  verified?: boolean;
}

export interface LessonViewerLayoutProps {
  courseTitle: string;
  courseSlug?: string;
  courseCover?: string;
  courseDescription?: string;
  whatYouWillLearn?: string[];
  instructor?: InstructorItem;
  sections: SectionItem[];
  allLessons: LessonItem[];
  activeLessonIndex: number;
  completedLessonIds: string[];
  onSelectLesson: (index: number) => void;
  onToggleComplete: (lessonId: string | number) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  progressPercent?: number;
  serverProgressPercent?: number | null;
  locale?: string;
  isAr?: boolean;
  backHref?: string;
  isLoading?: boolean;
}

export function LessonViewerLayout({
  courseTitle,
  courseSlug = "",
  courseCover,
  courseDescription,
  whatYouWillLearn = [],
  instructor,
  sections,
  allLessons,
  activeLessonIndex,
  completedLessonIds,
  onSelectLesson,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  progressPercent: externalProgressPercent,
  serverProgressPercent,
  locale = "en",
  isAr: isArProp,
  backHref = "/student/courses",
  isLoading = false,
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

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
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
  const progressPercent =
    typeof serverProgressPercent === "number"
      ? serverProgressPercent
      : typeof externalProgressPercent === "number"
      ? externalProgressPercent
      : calculatedProgress;

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

  // Handle seeking via timeline scrubber
  const handleSeekScrubber = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle Volume change
  // Handle Volume change
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

  // Autohide controls during playback
  const handleMouseMovePlayer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !settingsMenuOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Notification Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Video Play / Pause
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

  // Jump seconds forward or backward
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

  // Jump to specific percent 0%-90% (Keys 0-9)
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

  // Change Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      triggerFeedback(<Settings size={26} />, `${speed}x`);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen?.().catch(console.warn);
      triggerFeedback(<Maximize size={26} />, t("fullscreen"));
    } else {
      document.exitFullscreen?.().catch(console.warn);
      triggerFeedback(<Minimize size={26} />, t("exitFullscreen"));
    }
  };

  // Time format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Video Ended & Autoplay Next
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

  // Autoplay Countdown
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

  // =========================================================================
  // Advanced YouTube Keyboard Shortcuts Handler
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or contentEditable
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

      // 1. Play / Pause: Space or 'k' / 'K'
      if (key === " " || key === "k" || key === "K") {
        e.preventDefault();
        handlePlayPause();
        return;
      }

      // 2. Seeking:
      // ArrowRight: +5s, ArrowLeft: -5s
      // 'l' / 'L': +10s, 'j' / 'J': -10s
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

      // 3. Volume Control:
      // ArrowUp: +10%
      // ArrowDown: -10%
      // 'm' / 'M': Mute/Unmute
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

      // 4. Quick Jump 0-9 (0% to 90%)
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        const digit = parseInt(key, 10);
        handleSeekPercent(digit * 10);
        return;
      }

      // 5. Fullscreen Toggle: 'f' / 'F'
      if (key === "f" || key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        return {
          ...sec,
          lessons: matchingLessons,
        };
      })
      .filter((sec) => (sec.lessons || []).length > 0);
  }, [sections, searchQuery]);

  // Detect YouTube Embed URL
  const embedVideoUrl = useMemo(() => {
    const url = activeLesson?.videoUrl || activeLesson?.video_url;
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    return null;
  }, [activeLesson?.videoUrl, activeLesson?.video_url]);

  // Language switch
  const handleToggleLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  const handleLogout = () => {
    authService.logout().catch(() => {});
    dispatch(logout());
    setUserDropdownOpen(false);
    router.push(`/${locale}/login`);
  };

  // Polish/Sanitize Titles & Descriptions for Executive Academy Appearance
  const displayCourseTitle = useMemo(() => {
    if (!courseTitle || courseTitle.trim().toLowerCase() === "test" || courseTitle.trim() === "") {
      return t("defaultCourseTitle");
    }
    return courseTitle;
  }, [courseTitle, t]);

  const displayLessonTitle = useMemo(() => {
    const raw = activeLesson?.title || "";
    if (
      !raw ||
      raw.trim().toLowerCase() === "test" ||
      raw.trim().toLowerCase() === "new lesson" ||
      raw.trim() === ""
    ) {
      return t("defaultLessonTitle");
    }
    return raw;
  }, [activeLesson?.title, t]);

  const displayCourseDescription = useMemo(() => {
    if (
      !courseDescription ||
      courseDescription.trim().length < 8 ||
      courseDescription.trim().toLowerCase() === "test"
    ) {
      return t("defaultCourseDescription");
    }
    return courseDescription;
  }, [courseDescription, t]);

  // Refined Instructor Data
  const rawInstructorName = instructor?.full_name || instructor?.name;
  const isGenericInstructor =
    !rawInstructorName ||
    rawInstructorName.trim().toLowerCase() === "instructor" ||
    rawInstructorName.trim().toLowerCase() === "admin";
  const instructorName = isGenericInstructor
    ? t("defaultInstructorName")
    : rawInstructorName;

  const rawHeadline =
    (isAr ? instructor?.headline_ar || instructor?.headline : instructor?.headline || instructor?.headline_ar) ||
    (isAr ? instructor?.role_ar || instructor?.role : instructor?.role);
  const isGenericHeadline =
    !rawHeadline ||
    rawHeadline.trim().toLowerCase() === "professional instructor & coach" ||
    rawHeadline.trim().toLowerCase() === "instructor";
  const instructorHeadline = isGenericHeadline
    ? t("defaultInstructorHeadline")
    : rawHeadline;
  const instructorSlug = instructor?.slug || String(instructor?.id || "instructor");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0F5244] selection:text-white"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/40 animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CLEAN STICKY NAVIGATION BAR                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs font-sans transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Logo showText={true} isAr={isAr} href={`/${locale}`} />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {/* Home */}
            <Link
              href={`/${locale}`}
              className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {tNav("home")}
            </Link>

            {/* Courses */}
            <Link
              href={`/${locale}/courses`}
              className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {tNav("courses")}
            </Link>

            {/* My Learning (Active in learning viewer) */}
            <Link
              href={`/${locale}/student/courses`}
              className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-extrabold bg-emerald-50 text-[#0F5244] border border-emerald-200/60 shadow-2xs inline-flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="h-4 w-4 text-[#0F5244] shrink-0" />
              <span>{tNav("myLearning")}</span>
            </Link>
          </nav>

          {/* Right Actions: Shopping Cart, Language Switcher, User Dropdown */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Shopping Cart Button */}
            <Link
              href={`/${locale}/student/cart`}
              className="p-2 text-slate-700 hover:text-[#0F5244] transition-colors cursor-pointer inline-flex items-center justify-center"
              title={tNav("cart")}
            >
              <span className="relative inline-flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartItems.length > 0 && (
                  <span className="absolute -top-2 -end-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#0F5244] px-1 text-[10px] font-black leading-none text-white border-2 border-white shadow-xs pointer-events-none">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </Link>

            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-emerald-300 hover:text-[#0F5244] transition-all shadow-2xs cursor-pointer active:scale-95"
              title={tHeader("switchLanguageLabel")}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span className="font-extrabold">{tHeader("switchLanguage")}</span>
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/20 transition-all cursor-pointer"
                title={user?.name || user?.email || "User Profile"}
              >
                {user?.avatar ? (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-xs">
                    <Image
                      src={user.avatar}
                      alt={user.name || "Avatar"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0F5244] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </button>

              {/* Dropdown Menu Card */}
              {userDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {user?.name || user?.fullName || t("registeredStudent")}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      {tHeader("studentRole")}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`/${locale}/student/courses`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F5244]"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tNav("myCourses")}</span>
                    </Link>
                    <Link
                      href={`/${locale}/student/settings`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F5244]"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tNav("accountSettings")}</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-start cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{tNav("logout")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. LESSON HEADER & CINEMATIC VIDEO STAGE                                   */}
      {/* ========================================================================= */}
      <main
        className={`flex-1 w-full ${
      theaterMode ? "max-w-[1850px]" : "max-w-[1680px]"
        } mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col ${
          theaterMode ? "lg:flex-col" : "lg:flex-row"
        } gap-6 sm:gap-7 items-start transition-all duration-300`}
      >
        {/* Dominant Left/Main Video Workspace Column */}
        <div
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[68%]" : "lg:w-full"
          } min-w-0 space-y-4 transition-all duration-300`}
        >
          {/* Breadcrumb-Style Navigation Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-bold min-w-0 flex-1">
              <Link
                href={`/${locale}${backHref}`}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors shrink-0 font-bold group"
                title={t("backToCourses")}
              >
                <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 text-slate-600 group-hover:text-slate-900" />
                </span>
                <span className="hidden sm:inline">{t("backToCourses")}</span>
              </Link>

              <span className="text-slate-300">·</span>

              {/* Course Name */}
              <span className="text-slate-600 font-bold truncate max-w-[140px] sm:max-w-[200px]" title={displayCourseTitle}>
                {displayCourseTitle}
              </span>

              <span className="text-slate-300">·</span>

              {/* Current Lesson Title */}
              <span className="text-slate-900 font-black truncate max-w-[150px] sm:max-w-[240px]" title={displayLessonTitle}>
                {displayLessonTitle}
              </span>
            </div>

            {/* Quick Header Actions (Progress pill) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Overall Course Progress Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200/80 bg-emerald-50/60 text-xs font-bold text-[#0F5244]">
                <Sparkles className="w-3.5 h-3.5 text-[#0F5244]" />
                <span>{progressPercent}% {t("completeBadge")}</span>
              </div>
            </div>
          </div>

          {/* Branded Video Frame (Dark Gradient, Soft 12px Rounded Corners, Gold Scrubber) */}
          <div className="relative">
            <div
              ref={playerContainerRef}
              onMouseMove={handleMouseMovePlayer}
              onMouseLeave={() => {
                if (isPlaying && !settingsMenuOpen) setShowControls(false);
              }}
              className="relative w-full aspect-video min-h-[260px] sm:min-h-[380px] md:min-h-[460px] rounded-xl overflow-hidden bg-gradient-to-br from-neutral-950 via-slate-900 to-neutral-950 border border-neutral-800 shadow-sm flex items-center justify-center select-none group/player fullscreen:rounded-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {embedVideoUrl ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={embedVideoUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    key={activeLesson?.id}
                    playsInline
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                        setDuration(videoRef.current.duration || 0);
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={handlePlayPause}
                    onDoubleClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const width = rect.width;
                      if (x < width * 0.35) {
                        handleJumpSeconds(-10);
                      } else if (x > width * 0.65) {
                        handleJumpSeconds(10);
                      } else {
                        handleToggleFullscreen();
                      }
                    }}
                    src={resolveMediaUrl(activeLesson?.videoUrl || activeLesson?.video_url)}
                    poster={courseCover || undefined}
                    onError={() => {
                      console.warn("Video playback error in LessonViewerLayout");
                      setIsPlaying(false);
                    }}
                  >
                    Your browser does not support HTML5 video.
                  </video>

                  {/* Backdrop for unstarted or paused */}
                  {!isPlaying && (
                    <div
                      onClick={handlePlayPause}
                      className={`absolute inset-0 z-20 cursor-pointer select-none transition-opacity duration-300 ${
                        !hasStartedPlayback || currentTime === 0
                          ? "bg-gradient-to-br from-slate-950 via-neutral-900 to-black"
                          : "bg-black/45 backdrop-blur-[1.5px]"
                      }`}
                    />
                  )}

                  {/* YouTube-Style Controls: Left Edge (-10s) | Center (Pure YouTube Play Triangle) | Right Edge (+10s) */}
                  <div
                    className={`absolute inset-0 z-25 flex items-center justify-between px-4 sm:px-10 lg:px-16 pointer-events-none transition-opacity duration-200 select-none ${
                      showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Rewind 10 Seconds (Left Edge) */}
                    <div className="pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpSeconds(-10);
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/55 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer group/rewind"
                        title={`${t("rewind10")} (J)`}
                        aria-label={t("rewind10")}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-none stroke-current"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <text
                            x="12"
                            y="15.5"
                            textAnchor="middle"
                            fill="white"
                            fontSize="7.5"
                            fontWeight="900"
                            fontFamily="sans-serif"
                            stroke="none"
                          >
                            10
                          </text>
                        </svg>
                      </button>
                    </div>

                    {/* Center: Pure YouTube Play Triangle (No circles, zero extra borders) */}
                    <div className="pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause();
                        }}
                        className="p-4 text-white transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer focus:outline-hidden group/ytplay"
                        title={isPlaying ? t("pause") : t("play")}
                        aria-label={isPlaying ? t("pause") : t("play")}
                      >
                        {isPlaying ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-16 h-16 sm:w-20 sm:h-20 fill-white text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
                          >
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-20 h-20 sm:w-24 sm:h-24 fill-white text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
                          >
                            <path d="M8 5.14v13.72a.86.86 0 001.3.74l11.45-6.86a.86.86 0 000-1.48L9.3 4.4a.86.86 0 00-1.3.74z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Forward 10 Seconds (Right Edge) */}
                    <div className="pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpSeconds(10);
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/55 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer group/forward"
                        title={`${t("forward10")} (L)`}
                        aria-label={t("forward10")}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-none stroke-current"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <text
                            x="12"
                            y="15.5"
                            textAnchor="middle"
                            fill="white"
                            fontSize="7.5"
                            fontWeight="900"
                            fontFamily="sans-serif"
                            stroke="none"
                          >
                            10
                          </text>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* YouTube-Style Shortcut Action Feedback Badge */}
                  {feedbackToast && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
                      <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded bg-black/90 backdrop-blur-md text-white border border-white/10 shadow-xl animate-in zoom-in-75 fade-in duration-150">
                        <div className="text-white">{feedbackToast.icon}</div>
                        {feedbackToast.text && (
                          <span className="text-xs sm:text-sm font-bold font-mono tracking-wider">
                            {feedbackToast.text}
                          </span>
                        )}
                      </div>
                    </div>
                  )}



                  {/* YouTube-Style Bottom Control Bar with Green Scrubber */}
                  <div
                    dir="ltr"
                    className={`absolute bottom-0 inset-x-0 z-30 pt-10 pb-2 px-3 sm:px-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-200 select-none ${
                      showControls || !isPlaying || settingsMenuOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {/* Minimal Scrubber Timeline with Green Progress Fill */}
                    <div
                      ref={progressBarRef}
                      onClick={handleSeekScrubber}
                      className="relative w-full h-1 hover:h-1.5 group/scrubber cursor-pointer bg-white/20 rounded transition-all duration-150 mb-2.5"
                    >
                      <div
                        className="h-full bg-emerald-500 rounded relative"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-sm scale-0 group-hover/scrubber:scale-100 transition-transform" />
                      </div>
                    </div>

                    {/* Control Bar Buttons Row */}
                    <div className="flex items-center justify-between text-white">
                      {/* Left: Play/Pause, Next, Volume, Timestamp */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={handlePlayPause}
                          className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title={isPlaying ? t("pause") : t("play")}
                        >
                          {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-white ms-0.5" />}
                        </button>

                        {/* 10s Rewind */}
                        <button
                          type="button"
                          onClick={() => handleJumpSeconds(-10)}
                          className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title={`${t("rewind10")} (J)`}
                          aria-label={t("rewind10")}
                        >
                          <RotateCcw size={16} />
                        </button>

                        {/* 10s Forward */}
                        <button
                          type="button"
                          onClick={() => handleJumpSeconds(10)}
                          className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title={`${t("forward10")} (L)`}
                          aria-label={t("forward10")}
                        >
                          <RotateCw size={16} />
                        </button>

                        {onNextLesson && activeLessonIndex < allLessons.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              onNextLesson();
                              setIsPlaying(true);
                            }}
                            className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            title={t("nextLesson")}
                          >
                            <SkipForward size={16} />
                          </button>
                        )}

                        {/* Volume */}
                        <div className="flex items-center group/vol">
                          <button
                            type="button"
                            onClick={handleToggleMute}
                            className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            title={isMuted || volume === 0 ? t("unmute") : t("mute")}
                          >
                            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          
                          <div className="w-0 opacity-0 overflow-hidden pointer-events-none group-hover/vol:w-16 sm:group-hover/vol:w-20 group-hover/vol:opacity-100 group-hover/vol:pointer-events-auto focus-within:w-16 sm:focus-within:w-20 focus-within:opacity-100 focus-within:pointer-events-auto transition-all duration-200 flex items-center px-1">
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.02}
                              value={isMuted ? 0 : volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              aria-label={t("volume")}
                              className="w-14 sm:w-18 h-1 appearance-none rounded cursor-pointer transition-all
                                [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-[3px]
                                [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded
                                [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                              style={{
                                background: `linear-gradient(to right, #10B981 ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.25) ${(isMuted ? 0 : volume) * 100}%)`,
                              }}
                            />
                          </div>
                        </div>

                        <span className="text-[11px] sm:text-xs text-white/90 font-mono font-medium ps-1">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right: Settings, Theater, Fullscreen */}
                      <div className="flex items-center gap-1 sm:gap-1.5 relative">
                        {/* Settings Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsMenuOpen(!settingsMenuOpen);
                              setSettingsSubmenu("main");
                            }}
                            className={`p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer ${
                              settingsMenuOpen ? "rotate-45 text-emerald-400 bg-white/10" : ""
                            }`}
                            title={t("settings")}
                          >
                            <Settings size={18} />
                          </button>

                          {settingsMenuOpen && (
                            <div
                              ref={settingsMenuRef}
                              dir={isAr ? "rtl" : "ltr"}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-12 right-0 w-60 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded p-1 shadow-2xl text-white text-xs z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                            >
                              {settingsSubmenu === "main" && (
                                <div className="space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setSettingsSubmenu("speed")}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/10 transition-colors cursor-pointer text-start"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} className="text-slate-400" />
                                      <span className="font-bold">{t("playbackSpeed")}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                                      <span>{playbackSpeed === 1 ? t("normalSpeed") : `${playbackSpeed}x`}</span>
                                      <ChevronRight size={13} className="rtl:rotate-180" />
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSettingsSubmenu("quality")}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/10 transition-colors cursor-pointer text-start"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Sliders size={14} className="text-slate-400" />
                                      <span className="font-bold">{t("quality")}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">{selectedQuality}</span>
                                      <ChevronRight size={13} className="rtl:rotate-180" />
                                    </div>
                                  </button>

                                  <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-white/10 transition-colors text-start">
                                    <span className="font-bold">{t("autoplayNext")}</span>
                                    <button
                                      type="button"
                                      onClick={() => setAutoplayNext(!autoplayNext)}
                                      className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                                        autoplayNext ? "bg-emerald-500" : "bg-neutral-700"
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                                          autoplayNext ? "left-4" : "left-0.5"
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {settingsSubmenu === "speed" && (
                                <div className="space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setSettingsSubmenu("main")}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-[11px] font-bold border-b border-white/10 mb-1"
                                  >
                                    <ChevronLeft size={14} className="rtl:rotate-180" />
                                    <span>{t("playbackSpeed")}</span>
                                  </button>
                                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((spd) => (
                                    <button
                                      key={spd}
                                      type="button"
                                      onClick={() => {
                                        handleSpeedChange(spd);
                                        setSettingsSubmenu("main");
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-start font-medium"
                                    >
                                      <span>{spd === 1 ? t("normalSpeedFull") : `${spd}x`}</span>
                                      {playbackSpeed === spd && <Check size={14} className="text-emerald-400 font-black" />}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {settingsSubmenu === "quality" && (
                                <div className="space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setSettingsSubmenu("main")}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-[11px] font-bold border-b border-white/10 mb-1"
                                  >
                                    <ChevronLeft size={14} className="rtl:rotate-180" />
                                    <span>{t("quality")}</span>
                                  </button>
                                  {["1080p HD", "720p", "480p", "Auto"].map((q) => (
                                    <button
                                      key={q}
                                      type="button"
                                      onClick={() => {
                                        setSelectedQuality(q);
                                        setSettingsSubmenu("main");
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-start font-medium"
                                    >
                                      <span>{q}</span>
                                      {selectedQuality === q && <Check size={14} className="text-emerald-400 font-black" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Theater Mode */}
                        <button
                          type="button"
                          onClick={() => setTheaterMode(!theaterMode)}
                          className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title={theaterMode ? t("exitTheater") : t("theaterMode")}
                        >
                          {theaterMode ? <Minimize size={17} /> : <Maximize size={17} />}
                        </button>

                        {/* Fullscreen */}
                        <button
                          type="button"
                          onClick={handleToggleFullscreen}
                          className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
                        >
                          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Autoplay Countdown Overlay Card */}
              {nextCountdown !== null && (
                <div className="absolute inset-0 z-30 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-2xl animate-pulse shadow-md">
                    {nextCountdown}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {t("nextLessonStarting")}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 truncate">
                      {allLessons[activeLessonIndex + 1]?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNextCountdown(null);
                        onNextLesson?.();
                        setIsPlaying(true);
                      }}
                      className="px-5 py-2 rounded bg-[#0F5244] hover:bg-[#07382E] text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
                    >
                      {t("watchNow")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNextCountdown(null)}
                      className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-medium text-xs cursor-pointer transition-all"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DEDICATED NAVIGATION & COMPLETION BAR (DIRECTLY BELOW VIDEO)           */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex items-center justify-between gap-3">
            {/* Completion Status & Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleComplete(activeLesson?.id)}
              className={`group/toggle h-9 px-3.5 sm:px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 ${
                isCurrentCompleted
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              }`}
              title={
                isCurrentCompleted
                  ? t("lessonCompletedUndoTooltip")
                  : t("markLessonCompletedTooltip")
              }
            >
              {isCurrentCompleted ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{t("completed")}</span>
                </>
              ) : (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 group-hover/toggle:border-slate-400 shrink-0 inline-block" />
                  <span>{t("markCompleted")}</span>
                </>
              )}
            </button>

            {/* Navigation Actions: Previous & Next Buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Lesson */}
              <button
                type="button"
                onClick={onPrevLesson}
                disabled={activeLessonIndex === 0}
                className="h-9 px-3.5 sm:px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                title={t("prevLesson")}
              >
                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180 text-slate-500" />
                <span>{t("prev")}</span>
              </button>

              {/* Next Lesson */}
              <button
                type="button"
                onClick={onNextLesson}
                disabled={activeLessonIndex >= allLessons.length - 1}
                className="h-9 px-4 sm:px-4.5 rounded-full bg-[#0F5244] hover:bg-[#0b3d32] text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
                title={t("nextLesson")}
              >
                <span>{t("next")}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-white/90" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. LESSON DETAILS & INDEPENDENT COACH PROFILE (SEPARATE CARD)              */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-7 space-y-6">
              {/* Lesson Meta Row & Title */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-slate-700">{activeLesson?.sectionTitle || t("currentModule")}</span>
                  {activeLesson?.is_preview && (
                    <>
                      <span className="text-slate-300 font-bold">·</span>
                      <span className="text-[#0F5244] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <Sparkles size={11} className="text-[#0F5244]" />
                        <span>{t("freePreview")}</span>
                      </span>
                    </>
                  )}
                  <span className="text-slate-300 font-bold">·</span>
                  <span className="font-mono text-slate-400">
                    {t("lessonOf", { current: activeLessonIndex + 1, total: allLessons.length })}
                  </span>
                </div>

                {/* Lesson Main Heading */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {displayLessonTitle}
                </h1>

                {activeLesson?.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              {/* Coach Profile Section: Refined, lightweight inline card */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 transition-colors">
                  <Link
                    href={`/${locale}/instructors/${instructorSlug}`}
                    className="flex items-center gap-3 min-w-0 group/author"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200/80 shrink-0 bg-white shadow-2xs group-hover/author:border-emerald-500/40 transition-colors">
                      {instructor?.avatar ? (
                        <Image
                          src={instructor.avatar}
                          alt={instructorName}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-sm text-[#0F5244] bg-emerald-50">
                          {instructorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover/author:text-[#0F5244] transition-colors">
                          {instructorName}
                        </span>
                        <VerifiedBadge size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {instructorHeadline}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/${locale}/instructors/${instructorSlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-emerald-300 bg-white hover:bg-emerald-50/60 text-slate-600 hover:text-[#0F5244] text-xs font-semibold transition-all shrink-0 self-start sm:self-center shadow-2xs"
                  >
                    <span>{t("viewProfile")}</span>
                    <ArrowRight size={13} className="rtl:rotate-180 text-slate-400 group-hover:text-[#0F5244]" />
                  </Link>
                </div>
              </div>

              {/* Overview Section: Green Eyebrow Label ("About this course"), Heading directly below */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-[#0F5244] font-bold text-[11px] tracking-widest uppercase mb-1">
                    {t("aboutThisCourseHeading")}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {displayCourseTitle}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line max-w-4xl">
                  {displayCourseDescription}
                </p>

                {whatYouWillLearn && whatYouWillLearn.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t("keySkills")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {whatYouWillLearn.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SIDEBAR (CONNECTED VERTICAL TIMELINE CURRICULUM)                        */}
        {/* ========================================================================= */}
        <aside
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[32%] lg:max-w-[420px]" : "hidden"
          } shrink-0 transition-all duration-300`}
        >
          <div className="w-full bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] flex flex-col">
            {/* Sidebar Header: Course Content & Overall Progress */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      {t("courseContent")}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {t("lessonsCompleted", { count: completedCount, total: totalLessons })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Completion Percentage Badge */}
                  <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-slate-800">
                    {progressPercent}%
                  </div>
                </div>
              </div>

              {/* Minimal Progress Bar with Green Fill */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F5244] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Lesson Search Input Field */}
              <div className="relative flex items-center pt-0.5">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchLessons")}
                  className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg ps-9 pe-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={t("clear")}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Connected Vertical Timeline Curriculum */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {filteredSections.length === 0 ? (
                <div className="py-12 text-center px-4 space-y-2">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {t("noLessonsFound")}
                  </p>
                </div>
              ) : (
                filteredSections.map((section, sIdx) => {
                  const secId = String(section.id || `sec-${sIdx}`);
                  const isOpenSection = openSections[secId] ?? true;
                  const secTitle = isAr
                    ? section.title_ar || section.title || t("sectionDefault", { index: sIdx + 1 })
                    : section.title_en || section.title || t("sectionDefault", { index: sIdx + 1 });
                  const secLessons = section.lessons || [];
                  const secCompleted = secLessons.filter((l) =>
                    completedLessonIds.includes(String(l.id))
                  ).length;

                  return (
                    <div key={secId} className="bg-white">
                      {/* Section Header Accordion */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSections((prev) => ({
                            ...prev,
                            [secId]: !prev[secId],
                          }))
                        }
                        className="w-full px-4 py-3 flex items-center justify-between text-start bg-slate-50/60 hover:bg-slate-100/70 transition-all cursor-pointer border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 flex items-center justify-center shrink-0">
                            {String(sIdx + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {secTitle}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 font-mono">
                              {secCompleted}/{secLessons.length} {t("completed")}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpenSection ? "rotate-0" : "rotate-180 rtl:-rotate-180"
                          }`}
                        >
                          <ChevronUp size={14} />
                        </div>
                      </button>

                      {/* Connected Vertical Timeline for Lessons */}
                      {isOpenSection && (
                        <div className="relative px-3 py-3">
                          {/* Continuous Vertical Timeline Line Centered with Circle Markers */}
                          {secLessons.length > 1 && (
                            <div className="absolute top-8 bottom-8 left-[31px] rtl:left-auto rtl:right-[31px] w-0.5 bg-slate-200 z-0" />
                          )}

                          <div className="space-y-1 relative z-10">
                            {secLessons.map((lesson, lIdx) => {
                              const globalIndex = allLessons.findIndex((l) => String(l.id) === String(lesson.id));
                              const isActive = globalIndex === activeLessonIndex;
                              const isDone = completedLessonIds.includes(String(lesson.id));
                              const isLocked = !!lesson.is_locked;
                              const lesTitle = isAr
                                ? lesson.title_ar || lesson.title || t("lessonDefault", { index: lIdx + 1 })
                                : lesson.title_en || lesson.title || t("lessonDefault", { index: lIdx + 1 });

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => {
                                    if (!isLocked) {
                                      onSelectLesson(globalIndex);
                                      setIsPlaying(true);
                                    }
                                  }}
                                  className={`relative flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
                                    isLocked
                                      ? "opacity-60 cursor-not-allowed"
                                      : "cursor-pointer group hover:bg-slate-50"
                                  } ${isActive ? "bg-slate-50/90" : ""}`}
                                >
                                  {/* Numbered Circular Marker on the Timeline */}
                                  <div
                                    className={`w-6 h-6 rounded-full shrink-0 relative z-10 flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                                      isDone
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : isActive
                                        ? "bg-[#0F5244] text-white ring-4 ring-[#0F5244]/20 shadow-xs"
                                        : isLocked
                                        ? "bg-slate-100 border border-slate-200 text-slate-400"
                                        : "bg-white border border-slate-300 text-slate-600 group-hover:border-slate-500"
                                    }`}
                                  >
                                    {isDone ? (
                                      <Check size={11} strokeWidth={3} />
                                    ) : isLocked ? (
                                      <Lock size={10} />
                                    ) : (
                                      <span>{globalIndex + 1}</span>
                                    )}
                                  </div>

                                  {/* Lesson Title and Meta */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span
                                        className={`text-xs truncate block leading-tight ${
                                          isActive
                                            ? "font-bold text-slate-950"
                                            : isDone
                                            ? "text-slate-500 font-medium"
                                            : isLocked
                                            ? "text-slate-400 font-medium"
                                            : "text-slate-700 font-medium group-hover:text-slate-950"
                                        }`}
                                      >
                                        {lesTitle}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                      <span>{lesson.duration || `${lesson.duration_minutes || 5}:00`}</span>
                                      {lesson.is_preview && (
                                        <span className="text-emerald-700 font-bold">· {t("free")}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Keyboard Shortcuts Dialog Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#0F5244]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t("keyboardShortcuts")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { keyNode: <span>Space / K</span>, desc: t("shortcutPlayPause") },
                {
                  keyNode: (
                    <span className="inline-flex items-center gap-1">
                      <ArrowLeft size={10} className="inline" /> / <ArrowRight size={10} className="inline" />
                    </span>
                  ),
                  desc: t("shortcutSeek5"),
                },
                { keyNode: <span>J / L</span>, desc: t("shortcutSeek10") },
                {
                  keyNode: (
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp size={10} className="inline" /> / <ArrowDown size={10} className="inline" />
                    </span>
                  ),
                  desc: t("shortcutVolume"),
                },
                { keyNode: <span>M</span>, desc: t("shortcutMute") },
                { keyNode: <span>0 - 9</span>, desc: t("shortcutJump") },
                { keyNode: <span>F</span>, desc: t("shortcutFullscreen") },
                { keyNode: <span>Double Click</span>, desc: t("shortcutDoubleClick") },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-medium text-slate-700">{item.desc}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold shadow-xs">
                    {item.keyNode}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 rounded bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Minimalist Footer */}
      <Footer variant="auth" />
    </div>
  );
}
