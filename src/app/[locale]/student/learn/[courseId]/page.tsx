"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { courseService } from "@/services/courseService";
import { CourseContentSidebar } from "@/components/course/CourseContentSidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  PlayCircle,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Share2,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Search,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Copy,
  Volume2,
  VolumeX,
  FileText,
  Trash2,
  Plus,
} from "lucide-react";

export default function CoursePlayerPage() {
  const t = useTranslations("player");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const courseId = params?.courseId as string;

  const { user } = useSelector((state: RootState) => state.auth);

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);

  // Video State & Player Container
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current) {
        playerContainerRef.current.requestFullscreen?.().catch((err) => {
          console.warn("Fullscreen error:", err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Exit fullscreen error:", err);
        });
      }
    }
  };

  // Load Course Data
  useEffect(() => {
    async function loadCourse() {
      setIsLoading(true);
      try {
        const data = await courseService.getCourseById(courseId, locale);
        if (data) {
          setCourse(data);
        }
      } catch (err) {
        console.warn("Failed to load course details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (courseId) {
      loadCourse();
    }
  }, [courseId, locale]);

  // Load Persisted Completed Lessons
  useEffect(() => {
    if (typeof window !== "undefined" && courseId) {
      try {
        const savedCompleted = localStorage.getItem(`coachspace_course_${courseId}_completed`);
        if (savedCompleted) {
          setCompletedLessonIds(JSON.parse(savedCompleted));
        }
      } catch (e) {
        console.warn("Could not read from localStorage:", e);
      }
    }
  }, [courseId]);

  // Normalize sections and lessons
  const sectionsList: any[] = useMemo(() => {
    const raw = (course as any)?.sections || (course as any)?.modules || [];
    if (raw.length > 0) return raw;
    return [
      {
        id: "sec-default-1",
        title_ar: "المقدمة والمفاهيم الأساسية",
        title_en: "Getting Started & Core Concepts",
        lessons: [
          {
            id: "les-def-1",
            title_ar: "الترحيب ونظرة عامة على الدورة",
            title_en: "Welcome & Course Overview",
            duration_minutes: 5,
            video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            id: "les-def-2",
            title_ar: "إعداد بيئة العمل والخطوات العملية",
            title_en: "Environment Setup & Practical Steps",
            duration_minutes: 12,
            video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
        ],
      },
    ];
  }, [course]);

  const allLessons = useMemo(() => {
    return sectionsList.flatMap((s: any, sIdx: number) => {
      const secTitle = isAr
        ? s.title_ar || s.title || t("sectionDefault", { index: sIdx + 1 })
        : s.title_en || s.title || t("sectionDefault", { index: sIdx + 1 });
      return (s.lessons || []).map((l: any, lIdx: number) => ({
        ...l,
        sectionId: s.id || `sec-${sIdx}`,
        sectionTitle: secTitle,
        title: isAr
          ? l.title_ar || l.title || t("lessonDefault", { index: lIdx + 1 })
          : l.title_en || l.title || t("lessonDefault", { index: lIdx + 1 }),
        durationFormatted: l.duration || `${l.duration_minutes || 5}:00`,
        videoUrl:
          (l.video_url && !l.video_url.includes("example.com"))
            ? l.video_url
            : l.videoUrl || l.video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      }));
    });
  }, [sectionsList, isAr, t]);

  const activeLesson = allLessons[activeLessonIndex] || allLessons[0];
  const isCurrentCompleted = activeLesson ? completedLessonIds.includes(String(activeLesson.id)) : false;

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Personal Lesson Notes State & Persistence
  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<{ id: string; time: number; timeFormatted: string; text: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && courseId && activeLesson?.id) {
      try {
        const savedNotes = localStorage.getItem(`coachspace_notes_${courseId}_${activeLesson.id}`);
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        } else {
          setNotes([]);
        }
      } catch (e) {
        setNotes([]);
      }
    }
  }, [courseId, activeLesson?.id]);

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLesson?.id) return;
    const currentSecs = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
    const mins = Math.floor(currentSecs / 60);
    const secs = Math.floor(currentSecs % 60);
    const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    const newNote = {
      id: `${Date.now()}`,
      time: currentSecs,
      timeFormatted,
      text: noteInput.trim(),
      createdAt: new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setNoteInput("");
    if (typeof window !== "undefined" && courseId) {
      localStorage.setItem(`coachspace_notes_${courseId}_${activeLesson.id}`, JSON.stringify(updated));
    }
    setToastMessage(t("noteSaved"));
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    if (typeof window !== "undefined" && courseId && activeLesson?.id) {
      localStorage.setItem(`coachspace_notes_${courseId}_${activeLesson.id}`, JSON.stringify(updated));
    }
  };

  const handleSeekToNote = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Initialize all sections as open
  useEffect(() => {
    if (sectionsList.length > 0) {
      const initialMap: Record<string, boolean> = {};
      sectionsList.forEach((s: any, idx: number) => {
        initialMap[s.id || `sec-${idx}`] = true;
      });
      setOpenSections(initialMap);
    }
  }, [sectionsList]);

  // Video Speed Controller
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle Lesson Completion
  const toggleLessonCompletion = (lessonId: string | number) => {
    const idStr = String(lessonId);
    let updated: string[];
    if (completedLessonIds.includes(idStr)) {
      updated = completedLessonIds.filter((id) => id !== idStr);
    } else {
      updated = [...completedLessonIds, idStr];
      setToastMessage(t("lessonCompletedNotice"));
      setTimeout(() => setToastMessage(null), 3500);
    }
    setCompletedLessonIds(updated);
    if (typeof window !== "undefined" && courseId) {
      localStorage.setItem(`coachspace_course_${courseId}_completed`, JSON.stringify(updated));
    }
  };

  // Handle Video Progress & Ended
  const handleVideoEnded = () => {
    if (activeLesson) {
      if (!completedLessonIds.includes(String(activeLesson.id))) {
        toggleLessonCompletion(activeLesson.id);
      }
    }
    if (autoplayNext && activeLessonIndex < allLessons.length - 1) {
      setNextCountdown(5);
    }
  };

  const handleNextLesson = React.useCallback(() => {
    setNextCountdown(null);
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [activeLessonIndex, allLessons.length]);

  const handlePrevLesson = React.useCallback(() => {
    setNextCountdown(null);
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [activeLessonIndex]);

  // Autoplay countdown timer
  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      setNextCountdown(null);
      handleNextLesson();
      return;
    }
    const timer = setTimeout(() => {
      setNextCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [nextCountdown, handleNextLesson]);

  // Add Note Handler
  // Jump by seconds (+10s or -10s)
  const handleJumpSeconds = (delta: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = newTime;
    }
  };

  // Share Lesson Link
  const handleShareLesson = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage(t("linkCopied"));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Detect YouTube video embed URL
  const embedVideoUrl = useMemo(() => {
    const url = activeLesson?.videoUrl;
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
  }, [activeLesson?.videoUrl]);

  // Filter lessons in sidebar
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sectionsList;
    const q = searchQuery.toLowerCase();
    return sectionsList
      .map((sec: any) => {
        const matchingLessons = (sec.lessons || []).filter((les: any) => {
          const tEn = (les.title_en || les.title || "").toLowerCase();
          const tAr = (les.title_ar || les.title || "").toLowerCase();
          return tEn.includes(q) || tAr.includes(q);
        });
        return {
          ...sec,
          lessons: matchingLessons,
        };
      })
      .filter((sec: any) => (sec.lessons || []).length > 0);
  }, [sectionsList, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="relative w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-300 tracking-wide animate-pulse">
          {t("loadingPlatform")}
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-md w-full text-center space-y-5 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t("courseNotFound")}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("courseNotFoundDesc")}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t("exploreCourses")}</span>
            </Link>
          </div>
        </div>
        <Footer variant="auth" />
      </div>
    );
  }

  const courseTitle = isAr ? course.title_ar || course.title || course.title_en : course.title_en || course.title || course.title_ar;
  const instructorName = typeof course.instructor === "object"
    ? course.instructor?.full_name || course.instructor?.name || t("verifiedCoach")
    : course.instructor || t("verifiedCoach");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/40 animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. STANDARD PLATFORM GLOBAL HEADER                        */}
      {/* ========================================================= */}
      <Header className="relative !top-auto !z-20" />

      {/* ========================================================= */}
      {/* 2. IMMERSIVE LEARNING STAGE                               */}
      {/* ========================================================= */}
      <main
        className={`flex-1 w-full ${
          theaterMode ? "max-w-[1800px]" : "max-w-[1650px]"
        } mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col ${
          theaterMode ? "lg:flex-col" : "lg:flex-row"
        } gap-6 sm:gap-7 items-start transition-all duration-300`}
      >
        {/* 1. DOMINANT VIDEO & LESSON WORKSPACE COLUMN */}
        <div
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[68%]" : "lg:w-full"
          } min-w-0 space-y-4 transition-all duration-300`}
        >
          {/* Sleek Above-Video Navigation Island */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-4 shadow-2xs">
            {/* Left / Start: Back Button + Course Title */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/${locale}/student/courses`}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0F5244] transition-colors shrink-0 group"
                title={t("backToCourses")}
              >
                <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-[#0F5244]/40 group-hover:bg-emerald-50/70 flex items-center justify-center transition-all shadow-2xs">
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180 text-slate-600 group-hover:text-[#0F5244] transition-colors" />
                </span>
                <span className="hidden sm:inline font-black text-slate-700 group-hover:text-[#0F5244]">
                  {t("backToCourses")}
                </span>
              </Link>

              <span className="text-slate-200 font-light hidden sm:inline">|</span>

              {/* Course Title Badge / Heading */}
              <div className="flex items-center gap-2 min-w-0">
                <h1
                  className="text-xs sm:text-sm md:text-base font-black text-slate-900 truncate"
                  title={courseTitle}
                >
                  {courseTitle}
                </h1>
                {activeLesson?.sectionTitle && (
                  <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-[10px] font-black text-[#0F5244] shrink-0 uppercase tracking-wider">
                    {activeLesson.sectionTitle}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Quick Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle Sidebar Button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 ${
                  sidebarOpen
                    ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    : "border-[#0F5244]/30 bg-emerald-50 text-[#0F5244] font-black"
                }`}
                title={sidebarOpen ? t("collapseSidebar") : t("expandSidebar")}
              >
                <BookOpen size={14} className={sidebarOpen ? "text-slate-500" : "text-[#0F5244]"} />
                <span className="hidden sm:inline">
                  {sidebarOpen ? t("collapseSidebar") : t("expandSidebar")}
                </span>
              </button>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShareLesson}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0F5244] transition-all cursor-pointer shadow-2xs shrink-0"
                title={t("linkCopied")}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {/* Cinematic Video Player Container (Strict 16:9 Aspect, Dominant) */}
          <div className="relative group">
            {/* Ambient Backglow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-emerald-600/15 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />

            <div
              ref={playerContainerRef}
              className="relative w-full aspect-video min-h-[240px] sm:min-h-[380px] md:min-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-850 shadow-2xl flex items-center justify-center"
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
                <video
                  ref={videoRef}
                  key={activeLesson?.id}
                  controls
                  playsInline
                  autoPlay={isPlaying}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                      setDuration(videoRef.current.duration || 0);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-contain"
                  src={activeLesson?.videoUrl}
                  poster={course.cover_image || course.image || undefined}
                >
                  Your browser does not support HTML5 video.
                </video>
              )}

              {/* Floating Overlay Controls on Hover */}
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-lg">
                  <PlayCircle size={14} className="text-emerald-400" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{activeLesson?.title}</span>
                </div>

                {!embedVideoUrl && (
                  <div className="pointer-events-auto flex items-center gap-2">
                    {/* Jump -10s / +10s */}
                    <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1 rounded-full text-white text-xs font-bold shadow-lg">
                      <button
                        type="button"
                        onClick={() => handleJumpSeconds(-10)}
                        className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title={t("jumpBack10")}
                      >
                        <RotateCcw size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJumpSeconds(10)}
                        className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title={t("jumpForward10")}
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>

                    {/* Playback Speed Pills */}
                    <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1 rounded-full text-[10px] font-bold shadow-lg">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            playbackSpeed === spd
                              ? "bg-[#0F5244] text-white font-black shadow-xs"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Overlay Theater Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setTheaterMode(!theaterMode)}
                      className="p-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors shadow-lg cursor-pointer"
                      title={theaterMode ? t("exitTheater") : t("theaterMode")}
                    >
                      {theaterMode ? <Minimize size={13} /> : <Maximize size={13} />}
                    </button>

                    {/* Overlay Native Fullscreen Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors shadow-lg cursor-pointer"
                      title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
                    >
                      {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Autoplay Next Countdown Overlay */}
              {nextCountdown !== null && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-black text-2xl animate-pulse shadow-xl shadow-emerald-500/20">
                    {nextCountdown}
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">{t("nextLesson")}</h4>
                    <p className="text-xs text-slate-300 max-w-sm mt-1 truncate">
                      {allLessons[activeLessonIndex + 1]?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleNextLesson}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0F5244] hover:brightness-110 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all"
                    >
                      {t("watchNow")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNextCountdown(null)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STUDIO ACTION & DETAILS WORKSPACE CARD */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Upper: Lesson Meta, Title, and Action Buttons */}
            <div className="p-5 sm:p-7 border-b border-slate-100 space-y-5">
              {/* Meta Tag Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono font-bold shadow-2xs">
                  <Clock size={12} className="text-slate-500" />
                  <span>{activeLesson?.durationFormatted || "5:00"}</span>
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-700 font-extrabold">
                  {activeLesson?.sectionTitle || t("mainSection")}
                </span>
                {activeLesson?.is_preview && (
                  <span className="inline-flex items-center gap-1.5 text-[#0F5244] bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-2xs">
                    <Sparkles size={11} className="text-emerald-600 shrink-0" />
                    <span>{t("freePreview")}</span>
                  </span>
                )}
              </div>

              {/* Lesson Big Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {activeLesson?.title}
              </h2>

              {/* Action Buttons Toolbar: Only essential actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* Primary: Mark as Complete */}
                <button
                  type="button"
                  onClick={() => toggleLessonCompletion(activeLesson?.id)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 ${
                    isCurrentCompleted
                      ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-2xs"
                      : "bg-[#0F5244] hover:bg-[#0b3c32] text-white shadow-md hover:shadow-lg shadow-[#0F5244]/20"
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${isCurrentCompleted ? "text-emerald-600" : "text-white"}`} />
                  <span>
                    {isCurrentCompleted
                      ? t("completedCheck")
                      : t("markCompleted")}
                  </span>
                </button>

                {/* Navigation: Prev / Next Lesson */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrevLesson}
                    disabled={activeLessonIndex === 0}
                    className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    <span className="hidden sm:inline">{t("prevLesson")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextLesson}
                    disabled={activeLessonIndex === allLessons.length - 1}
                    className="px-5 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#0b3c32] text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg shadow-[#0F5244]/20 cursor-pointer transition-all"
                  >
                    <span>{t("nextLesson")}</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lower: Course Overview & Instructor (Clean, no unnecessary tabs or notes) */}
            <div className="p-5 sm:p-7 space-y-6">
              {course.description && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <BookOpen size={14} className="text-[#0F5244]" />
                    <span>{t("aboutCourse")}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {course.description}
                  </p>
                </div>
              )}

              {Array.isArray(course.whatYouWillLearn) && course.whatYouWillLearn.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t("whatYouWillLearn")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Instructor Spotlight Card */}
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-gradient-to-br from-slate-50/90 via-emerald-50/20 to-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-4 min-w-0">
                    {course.instructor?.avatar ? (
                      <div className="relative shrink-0">
                        <Image
                          src={course.instructor.avatar}
                          alt={instructorName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                          <Check size={9} className="text-white font-bold" />
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-base font-black text-[#0F5244] shrink-0 shadow-xs">
                        {instructorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">{instructorName}</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-black text-[#0F5244]">
                          <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                          <span>{t("verifiedCoach")}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                        {t("verifiedInstructor")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COURSE CONTENT SIDEBAR */}
        <div
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[32%] lg:max-w-[420px]" : "hidden"
          } shrink-0 transition-all duration-300`}
        >
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] flex flex-col">
            <CourseContentSidebar
              isOpen={sidebarOpen}
              completedCount={completedCount}
              totalLessons={totalLessons}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredSections={filteredSections}
              openSections={openSections}
              onToggleSection={(secId) =>
                setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }))
              }
              allLessons={allLessons}
              activeLessonIndex={activeLessonIndex}
              onSelectLesson={(idx) => {
                setActiveLessonIndex(idx);
                setIsPlaying(true);
              }}
              completedLessonIds={completedLessonIds}
              onToggleLessonCompletion={toggleLessonCompletion}
              isAr={isAr}
              t={t}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. PLATFORM FOOTER                                        */}
      {/* ========================================================= */}
      <Footer variant="auth" />
    </div>
  );
}
