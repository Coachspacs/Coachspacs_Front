"use client";

import React, { RefObject } from "react";
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
  Sliders,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  SkipForward,
  Award,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import { LessonItem } from "./types";

interface LessonVideoPlayerProps {
  activeLesson?: LessonItem;
  activeLessonIndex: number;
  allLessons: LessonItem[];
  courseCover?: string;
  isAr: boolean;
  theaterMode: boolean;
  setTheaterMode: (val: boolean) => void;
  playerContainerRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  settingsMenuRef: RefObject<HTMLDivElement | null>;
  progressBarRef: RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isFullscreen: boolean;
  playbackSpeed: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  autoplayNext: boolean;
  setAutoplayNext: (val: boolean) => void;
  nextCountdown: number | null;
  setNextCountdown: (val: number | null) => void;
  showControls: boolean;
  hasStartedPlayback: boolean;
  feedbackToast: { icon: React.ReactNode; text?: string } | null;
  settingsMenuOpen: boolean;
  setSettingsMenuOpen: (val: boolean) => void;
  settingsSubmenu: "main" | "speed" | "quality";
  setSettingsSubmenu: (val: "main" | "speed" | "quality") => void;
  selectedQuality: string;
  setSelectedQuality: (val: string) => void;
  isCurrentCompleted: boolean;
  handleMouseMovePlayer: () => void;
  handlePlayPause: () => void;
  handleJumpSeconds: (delta: number) => void;
  handleToggleFullscreen: () => void;
  handleVideoEnded: () => void;
  handleSeekScrubber: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleToggleMute: () => void;
  handleVolumeChange: (newVol: number, showToast?: boolean) => void;
  handleSpeedChange: (speed: number) => void;
  formatTime: (secs: number) => string;
  onToggleComplete: (lessonId: string | number) => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  onFinishCourse?: () => void;
  handleNavigateToCertificate: () => void;
  setIsPlaying: (val: boolean) => void;
  setCurrentTime: (val: number) => void;
  setDuration: (val: number) => void;
  t: any;
}

export function LessonVideoPlayer({
  activeLesson,
  activeLessonIndex,
  allLessons,
  courseCover,
  isAr,
  theaterMode,
  setTheaterMode,
  playerContainerRef,
  videoRef,
  settingsMenuRef,
  progressBarRef,
  isPlaying,
  isFullscreen,
  playbackSpeed,
  currentTime,
  duration,
  volume,
  isMuted,
  autoplayNext,
  setAutoplayNext,
  nextCountdown,
  setNextCountdown,
  showControls,
  hasStartedPlayback,
  feedbackToast,
  settingsMenuOpen,
  setSettingsMenuOpen,
  settingsSubmenu,
  setSettingsSubmenu,
  selectedQuality,
  setSelectedQuality,
  isCurrentCompleted,
  handleMouseMovePlayer,
  handlePlayPause,
  handleJumpSeconds,
  handleToggleFullscreen,
  handleVideoEnded,
  handleSeekScrubber,
  handleToggleMute,
  handleVolumeChange,
  handleSpeedChange,
  formatTime,
  onToggleComplete,
  onPrevLesson,
  onNextLesson,
  onFinishCourse,
  handleNavigateToCertificate,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  t,
}: LessonVideoPlayerProps) {
  const videoSrc = activeLesson?.videoUrl || activeLesson?.video_url;
  const isEmbedVideo =
    videoSrc &&
    (videoSrc.includes("youtube.com") ||
      videoSrc.includes("youtu.be") ||
      videoSrc.includes("vimeo.com"));

  const embedVideoUrl = isEmbedVideo
    ? videoSrc.includes("youtube.com/watch?v=")
      ? videoSrc.replace("watch?v=", "embed/")
      : videoSrc.includes("youtu.be/")
      ? videoSrc.replace("youtu.be/", "youtube.com/embed/")
      : videoSrc
    : null;

  return (
    <>
      {/* Branded Video Frame */}
      <div className="relative">
        <div
          ref={playerContainerRef}
          onMouseMove={handleMouseMovePlayer}
          onMouseLeave={() => {
            if (isPlaying && !settingsMenuOpen) handleMouseMovePlayer();
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

              {/* YouTube-Style Controls */}
              <div
                className={`absolute inset-0 z-25 flex items-center justify-between px-4 sm:px-10 lg:px-16 pointer-events-none transition-opacity duration-200 select-none ${
                  showControls || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Rewind 10 Seconds */}
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

                {/* Center: YouTube Play Triangle */}
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

                {/* Forward 10 Seconds */}
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
                {/* Scrubber Timeline */}
                <div
                  ref={progressBarRef}
                  onClick={handleSeekScrubber}
                  className="relative w-full h-1 hover:h-1.5 group/scrubber cursor-pointer bg-white/20 rounded transition-all duration-150 mb-2.5"
                >
                  <div
                    className="h-full bg-slate-1000 rounded relative"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-light shadow-sm scale-0 group-hover/scrubber:scale-100 transition-transform" />
                  </div>
                </div>

                {/* Control Bar Buttons Row */}
                <div className="flex items-center justify-between text-white">
                  {/* Left Controls */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title={isPlaying ? t("pause") : t("play")}
                    >
                      {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-white ms-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleJumpSeconds(-10)}
                      className="p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title={`${t("rewind10")} (J)`}
                      aria-label={t("rewind10")}
                    >
                      <RotateCcw size={16} />
                    </button>

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

                  {/* Right Controls */}
                  <div className="flex items-center gap-1 sm:gap-1.5 relative">
                    {/* Settings Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsMenuOpen(!settingsMenuOpen);
                          setSettingsSubmenu("main");
                        }}
                        className={`p-1.5 rounded text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer ${
                          settingsMenuOpen ? "rotate-45 text-[var(--color-primary-main)] bg-white/10" : ""
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
                                  <span className="px-1.5 py-0.5 rounded bg-slate-1000/20 text-[var(--color-primary-main)] text-[10px] font-bold">{selectedQuality}</span>
                                  <ChevronRight size={13} className="rtl:rotate-180" />
                                </div>
                              </button>

                              <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-white/10 transition-colors text-start">
                                <span className="font-bold">{t("autoplayNext")}</span>
                                <button
                                  type="button"
                                  onClick={() => setAutoplayNext(!autoplayNext)}
                                  className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                                    autoplayNext ? "bg-slate-1000" : "bg-neutral-700"
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
                                  {playbackSpeed === spd && <Check size={14} className="text-[var(--color-primary-main)] font-black" />}
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
                                  {selectedQuality === q && <Check size={14} className="text-[var(--color-primary-main)] font-black" />}
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
              <div className="w-14 h-14 rounded-full border-2 border-[var(--color-primary-main)]/40 flex items-center justify-center text-[var(--color-primary-main)] font-bold text-2xl animate-pulse shadow-md">
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
                  className="px-5 py-2 rounded bg-brand-dark hover:bg-[#07382E] text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
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

      {/* DEDICATED NAVIGATION & COMPLETION BAR */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex items-center justify-between gap-3">
        {/* Completion Status & Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleComplete(activeLesson?.id || "")}
          className={`group/toggle h-9 px-3.5 sm:px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 ${
            isCurrentCompleted
              ? "bg-slate-100 text-[var(--color-primary-main)] border border-slate-200 hover:bg-slate-200/80 hover:border-slate-300"
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
              <CheckCircle2 size={15} className="text-[var(--color-primary-main)] shrink-0" />
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

          {/* Next Lesson or Finish Course */}
          {activeLessonIndex >= allLessons.length - 1 ? (
            <button
              type="button"
              onClick={handleNavigateToCertificate}
              className="h-9 px-4 sm:px-5 rounded-full bg-[var(--color-primary-dark)] hover:bg-brand-dark text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Award size={14} className="text-amber-300 shrink-0" />
              <span>{t("finishCourseBtn")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextLesson}
              className="h-9 px-3.5 sm:px-4 rounded-full border border-brand-dark bg-brand-dark hover:bg-[#07382E] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
              title={t("nextLesson")}
            >
              <span>{t("next")}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
