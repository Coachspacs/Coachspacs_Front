"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { courseService } from "@/services/courseService";
import { Header } from "@/components/layout/Header";
import { CoursePlayerSubHeader } from "@/components/course/CoursePlayerSubHeader";
import { CourseContentSidebar } from "@/components/course/CourseContentSidebar";
import { Logo } from "@/components/ui/Logo";
import {
  PlayCircle,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Award,
  BookOpen,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Download,
  FileText,
  MessageSquare,
  StickyNote,
  Share2,
  Sparkles,
  Check,
  Clock,
  ShieldCheck,
  Search,
  Maximize,
  Minimize,
  Sliders,
  Send,
  Trash2,
  ExternalLink,
  Layers,
  RotateCcw,
  RotateCw,
  Copy,
  Volume2,
  VolumeX,
} from "lucide-react";

interface NoteItem {
  id: string;
  lessonId: string;
  timestamp: number; // in seconds
  timestampFormatted: string;
  text: string;
  createdAt: string;
}

interface DiscussionItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  isInstructor?: boolean;
  timeAgo: string;
  content: string;
  likes: number;
}

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
  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "discussion" | "notes">("overview");

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  // Notes & Discussion
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Simulated Discussions
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([
    {
      id: "d1",
      authorName: isAr ? "طارق العمري" : "Tarek Al-Omari",
      timeAgo: isAr ? "منذ يومين" : "2 days ago",
      content: isAr
        ? "هل يمكن تطبيق هذه الخطوات مع أطر عمل أخرى؟ وكيف يتم ضبط إعدادات الأمان؟"
        : "Can these steps be applied with other modern frameworks? How do we configure production security?",
      likes: 4,
    },
    {
      id: "d2",
      authorName: isAr ? "المدرب المعتمد" : "Verified Coach",
      isInstructor: true,
      timeAgo: isAr ? "منذ يوم" : "1 day ago",
      content: isAr
        ? "أهلاً طارق! نعم بالتأكيد، المبادئ المعمارية المذكورة في هذا الدرس قياسية ويمكن ربطها بأي بيئة سحابية."
        : "Hi Tarek! Yes absolutely, the architectural principles taught here are standard and map cleanly to any cloud infrastructure.",
      likes: 9,
    },
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Load Persisted Completed Lessons & Notes
  useEffect(() => {
    if (typeof window !== "undefined" && courseId) {
      try {
        const savedCompleted = localStorage.getItem(`coachspace_course_${courseId}_completed`);
        if (savedCompleted) {
          setCompletedLessonIds(JSON.parse(savedCompleted));
        }
        const savedNotes = localStorage.getItem(`coachspace_course_${courseId}_notes`);
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
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
      const secTitle = isAr ? s.title_ar || s.title || `القسم ${sIdx + 1}` : s.title_en || s.title || `Section ${sIdx + 1}`;
      return (s.lessons || []).map((l: any, lIdx: number) => ({
        ...l,
        sectionId: s.id || `sec-${sIdx}`,
        sectionTitle: secTitle,
        title: isAr ? l.title_ar || l.title || `الدرس ${lIdx + 1}` : l.title_en || l.title || `Lesson ${lIdx + 1}`,
        durationFormatted: l.duration || `${l.duration_minutes || 5}:00`,
        videoUrl:
          l.video_url ||
          l.videoUrl ||
          l.video ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      }));
    });
  }, [sectionsList, isAr]);

  const activeLesson = allLessons[activeLessonIndex] || allLessons[0];
  const isCurrentCompleted = activeLesson ? completedLessonIds.includes(String(activeLesson.id)) : false;

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
  }, [nextCountdown]);

  const handleNextLesson = () => {
    setNextCountdown(null);
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevLesson = () => {
    setNextCountdown(null);
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  // Add Note Handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeLesson) return;

    const noteItem: NoteItem = {
      id: `note-${Date.now()}`,
      lessonId: String(activeLesson.id),
      timestamp: currentTime,
      timestampFormatted: formatTime(currentTime),
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString(locale, { month: "short", day: "numeric" }),
    };

    const updated = [noteItem, ...notes];
    setNotes(updated);
    setNewNoteText("");
    if (typeof window !== "undefined" && courseId) {
      localStorage.setItem(`coachspace_course_${courseId}_notes`, JSON.stringify(updated));
    }
    setToastMessage(isAr ? "تم حفظ الملاحظة بنجاح" : "Note saved successfully");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    if (typeof window !== "undefined" && courseId) {
      localStorage.setItem(`coachspace_course_${courseId}_notes`, JSON.stringify(updated));
    }
  };

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
      setToastMessage(isAr ? "تم نسخ رابط الدرس إلى الحافظة!" : "Lesson link copied to clipboard!");
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

  // Jump to Note Timestamp
  const handleJumpToTimestamp = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Add Question to Discussion
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newDisc: DiscussionItem = {
      id: `q-${Date.now()}`,
      authorName: user?.fullName || user?.name || (isAr ? "أنت (طالب مسجل)" : "You (Student)"),
      timeAgo: isAr ? "الآن" : "Just now",
      content: newQuestionText.trim(),
      likes: 1,
    };

    setDiscussions([newDisc, ...discussions]);
    setNewQuestionText("");
    setToastMessage(isAr ? "تم نشر سؤالك بنجاح" : "Question posted successfully");
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      <div className="min-h-[70vh] bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-800 space-y-4 font-sans">
        <div className="relative w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
        <p className="text-sm font-extrabold text-slate-600 tracking-wide animate-pulse">
          {isAr ? "جاري تحضير المنصة والفصل الدراسي..." : "Preparing your classroom experience..."}
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">{isAr ? "لم نتمكن من فتح الدورة" : "Course Not Found"}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? "الدورة المطلوبة غير متوفرة أو لم يتم نشرها بعد، أو تم تغيير معرف الدورة."
              : "The requested course could not be loaded or is not published yet."}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{isAr ? "تصفح الدورات المتاحة" : "Explore Courses"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const courseTitle = isAr ? course.title_ar || course.title || course.title_en : course.title_en || course.title || course.title_ar;
  const instructorName = typeof course.instructor === "object" ? course.instructor?.full_name || course.instructor?.name : course.instructor || (isAr ? "مدرب معتمد" : "Verified Coach");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={15} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. GLOBAL MAIN SITE HEADER                                 */}
      {/* ========================================================= */}
      <Header />

      {/* ========================================================= */}
      {/* 2. COURSE NAVIGATION SUB-HEADER (STICKY BELOW MAIN HEADER) */}
      {/* ========================================================= */}
      <CoursePlayerSubHeader
        locale={locale}
        isAr={isAr}
        t={t}
        courseTitle={courseTitle}
        activeLesson={activeLesson}
        progressPercent={progressPercent}
        theaterMode={theaterMode}
        onToggleTheaterMode={() => setTheaterMode(!theaterMode)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeLessonIndex={activeLessonIndex}
        totalLessons={totalLessons}
      />

      {/* ========================================================= */}
      {/* 3. MAIN LEARNING STAGE                                    */}
      {/* ========================================================= */}
      <div className={`flex-1 w-full ${theaterMode ? "max-w-[1700px]" : "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col ${theaterMode ? "lg:flex-col" : "lg:flex-row"} gap-6 sm:gap-8 items-start transition-all duration-300`}>
        
        {/* VIDEO & CONTENT STAGE (Left / Center) */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          
          {/* Cinematic Video Player Container */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-2xl shadow-slate-950/25 flex items-center justify-center group">
            
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

            {/* Top Floating Info Bar Overlay (visible on hover) */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-white text-xs font-extrabold shadow-lg">
                <PlayCircle size={14} className="text-[#45D1B4]" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{activeLesson?.title}</span>
              </div>

              {!embedVideoUrl && (
                <div className="pointer-events-auto flex items-center gap-1.5">
                  {/* Jump -10s / +10s */}
                  <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-white/10 p-1 rounded-full text-white text-xs font-bold shadow-lg">
                    <button
                      type="button"
                      onClick={() => handleJumpSeconds(-10)}
                      className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="-10s"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpSeconds(10)}
                      className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="+10s"
                    >
                      <RotateCw size={13} />
                    </button>
                  </div>

                  {/* Playback Speed Pill */}
                  <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-white/10 p-1 rounded-full text-[10px] font-bold shadow-lg">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                          playbackSpeed === spd
                            ? "bg-[#0F5244] text-[#45D1B4] font-black shadow-xs"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Autoplay Next 5s Overlay */}
            {nextCountdown !== null && (
              <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center p-6 animate-in fade-in">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-black text-2xl animate-pulse shadow-lg shadow-emerald-500/20">
                  {nextCountdown}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">{t("nextLesson")}</h4>
                  <p className="text-xs text-slate-300 max-w-sm mt-0.5 truncate">
                    {allLessons[activeLessonIndex + 1]?.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
                  >
                    {t("nextLesson")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNextCountdown(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COMPACT ACTION & NAVIGATION BAR */}
          <div className="bg-white rounded-2xl p-3.5 sm:px-5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {/* Left Action: Mark Completed + Autoplay */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleLessonCompletion(activeLesson?.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  isCurrentCompleted
                    ? "bg-emerald-50 border border-emerald-400 text-emerald-900 hover:bg-emerald-100"
                    : "bg-[#0F5244] hover:bg-[#07382E] text-white shadow-xs hover:shadow active:scale-98"
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isCurrentCompleted ? "text-emerald-600" : "text-white"}`} />
                <span>{isCurrentCompleted ? (isAr ? "مكتمل ✓ (انقر للإلغاء)" : "Completed ✓ (Click to Undo)") : t("markCompleted")}</span>
              </button>

              {/* Autoplay Toggle Switch */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors">
                <span className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={autoplayNext}
                    onChange={(e) => setAutoplayNext(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0F5244]" />
                </span>
                <span className="hidden sm:inline">{t("autoplayNext")}</span>
              </label>
            </div>

            {/* Right Navigation: Prev / Next buttons + Share */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevLesson}
                disabled={activeLessonIndex === 0}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  activeLessonIndex === 0
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer shadow-2xs"
                }`}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t("prevLesson")}</span>
              </button>

              <button
                type="button"
                onClick={handleNextLesson}
                disabled={activeLessonIndex === allLessons.length - 1}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                  activeLessonIndex === allLessons.length - 1
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#0F5244] hover:bg-[#07382E] border-[#0F5244] text-white cursor-pointer shadow-xs hover:shadow"
                }`}
              >
                <span>{t("nextLesson")}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={handleShareLesson}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#0F5244] transition-colors cursor-pointer shadow-2xs"
                title={isAr ? "مشاركة رابط الدرس" : "Share Lesson"}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {/* TABBED INFORMATION SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {/* Tab Navigation Headers */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 pt-3 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "overview"
                    ? "border-[#0F5244] text-[#0F5244] font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen size={15} />
                <span>{t("overview")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "resources"
                    ? "border-[#0F5244] text-[#0F5244] font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Download size={15} />
                <span>{t("resources")}</span>
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0F5244] text-[10px] flex items-center justify-center font-black">
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("discussion")}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "discussion"
                    ? "border-[#0F5244] text-[#0F5244] font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare size={15} />
                <span>{t("discussion")}</span>
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                  {discussions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`pb-3 px-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "notes"
                    ? "border-[#0F5244] text-[#0F5244] font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <StickyNote size={15} />
                <span>{t("notes")}</span>
                {notes.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                    {notes.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="p-5 sm:p-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Hero Title & Meta */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        <Clock size={12} />
                        <span>{activeLesson?.durationFormatted || "5:00"}</span>
                      </span>
                      <span>•</span>
                      <span>{activeLesson?.sectionTitle || "Course Section"}</span>
                      <span>•</span>
                      <span className="text-slate-400">{isAr ? "دورة تدريبية معتمدة" : "Certified Course"}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      {activeLesson?.title}
                    </h2>

                    <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {isAr
                        ? "يقدم هذا الدرس خطوات عملية وتوجيهات تطبيقية مباشرة للارتقاء بمهاراتك المهنية وتحقيق أهداف هذا المساق بأعلى جودة."
                        : "This lesson provides hands-on guidance and actionable steps to elevate your practical skills and master the learning milestones."}
                    </p>
                  </div>

                  {/* Lesson Objectives Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 border border-emerald-100/80 space-y-3 shadow-2xs">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0F5244] flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span>{isAr ? "مخرجات وأهداف هذا الدرس" : "Lesson Key Objectives"}</span>
                    </h3>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>{isAr ? "فهم سير العمل الأساسي وتطبيق الممارسات الموصى بها." : "Understand core workflow and apply industry best practices."}</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>{isAr ? "تجنب الأخطاء الشائعة وتحسين كفاءة التنفيذ العملي." : "Avoid common pitfalls and optimize execution efficiency."}</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>{isAr ? "إكمال التمرين التطبيقي ومراجعة النتيجة مع المدرب." : "Complete the hands-on exercise and validate with your mentor."}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructor Bio Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-base font-black text-[#0F5244] shadow-xs shrink-0">
                        {instructorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-slate-900 truncate">{instructorName}</h4>
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {isAr ? "مدرب معتمد ومستشار تدريب محترف في CoachSpace" : "Certified Coach & Professional Mentor at CoachSpace"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("discussion")}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                    >
                      {isAr ? "اسأل المدرب" : "Ask Instructor"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: RESOURCES */}
              {activeTab === "resources" && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-xs text-slate-500 font-semibold mb-2">
                    {isAr ? "الملفات والمصادر المرفقة المتاحة للتحميل مع هذا الدرس:" : "Downloadable files and supplementary materials for this lesson:"}
                  </p>
                  {[
                    {
                      title: isAr ? "دليل ملخص الدرس وملف المفاهيم (PDF)" : "Lesson CheatSheet & Summary Guide (PDF)",
                      size: "2.4 MB",
                      type: "PDF Document",
                    },
                    {
                      title: isAr ? "حزمة التمارين البرمجية والملفات التطبيقية (ZIP)" : "Hands-on Exercise & Starter Kit (ZIP)",
                      size: "14.8 MB",
                      type: "Archive",
                    },
                    {
                      title: isAr ? "شرائح العرض والمراجع التكميلية (Slides)" : "Slide Deck & Reference Checklist (PDF)",
                      size: "1.1 MB",
                      type: "Slides",
                    },
                  ].map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{res.title}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{res.size} • {res.type}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage(isAr ? "جاري بدء تحميل الملف..." : "Starting file download...");
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#0F5244] hover:text-white text-slate-700 border border-slate-200/80 transition-all cursor-pointer shrink-0 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Download size={13} />
                        <span>{isAr ? "تحميل" : "Download"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: DISCUSSION */}
              {activeTab === "discussion" && (
                <div className="space-y-5 animate-in fade-in">
                  <form onSubmit={handlePostQuestion} className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                      <MessageSquare size={14} className="text-emerald-600" />
                      <span>{t("askQuestion")}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder={t("askPlaceholder")}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newQuestionText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Send size={12} />
                        <span>{t("postQuestion")}</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {discussions.map((disc) => (
                      <div key={disc.id} className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              disc.isInstructor ? "bg-emerald-100 text-[#0F5244]" : "bg-slate-100 text-slate-700"
                            }`}>
                              {disc.authorName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-slate-900">{disc.authorName}</span>
                                {disc.isInstructor && (
                                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                                    {isAr ? "مدرب" : "Instructor"}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{disc.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pr-9 rtl:pr-0 rtl:pl-9">{disc.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-5 animate-in fade-in">
                  <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <StickyNote size={14} className="text-amber-500" />
                        <span>{isAr ? `تدوين ملاحظة خاصة عند:` : `Private note at:`}</span>
                        <span className="text-[#0F5244] font-mono font-black bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg">
                          {formatTime(currentTime)}
                        </span>
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder={t("addNotePlaceholder")}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Check size={13} strokeWidth={3} />
                        <span>{t("saveNote")}</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {notes.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                        {t("noNotes")}
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/70 flex items-start justify-between gap-3 shadow-2xs hover:border-emerald-200 transition-colors">
                          <div className="space-y-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleJumpToTimestamp(note.timestamp)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] text-[11px] font-mono font-black cursor-pointer border border-emerald-200/60 transition-colors"
                            >
                              <Play size={10} className="fill-current" />
                              <span>{note.timestampFormatted}</span>
                            </button>
                            <p className="text-xs text-slate-800 leading-relaxed">{note.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. SYLLABUS / CURRICULUM SIDEBAR (Right)                  */}
        {/* ========================================================= */}
        {/* 4. SYLLABUS / CURRICULUM SIDEBAR (Right) */}
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
        />
      </div>

      {/* ========================================================= */}
      {/* 3. SLIM LIGHTWEIGHT BOTTOM BAR                            */}
      {/* ========================================================= */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold shrink-0 mt-auto shadow-2xs">
        <div className="flex items-center gap-2 truncate">
          <span className="hidden sm:inline">
            {completedCount}/{totalLessons} {isAr ? "دروس مكتملة" : "lessons completed"}
          </span>
          <Link href={`/${locale}/courses`} className="hover:text-slate-900 transition-colors">
            {isAr ? "المساعدة" : "Help"}
          </Link>
        </div>
      </footer>
    </div>
  );
}
