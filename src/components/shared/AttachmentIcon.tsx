import React from "react";
import {
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File,
  Presentation,
} from "lucide-react";

interface AttachmentIconProps {
  fileName?: string;
  className?: string;
  size?: number;
}

export function getFileCategory(fileName = ""): {
  category: "pdf" | "word" | "excel" | "powerpoint" | "archive" | "code" | "generic";
  colorClass: string;
  badgeBg: string;
} {
  const name = fileName.toLowerCase();

  if (name.endsWith(".pdf")) {
    return {
      category: "pdf",
      colorClass: "text-rose-600",
      badgeBg: "bg-rose-50 border-rose-200/80 text-rose-700",
    };
  }
  if (name.endsWith(".doc") || name.endsWith(".docx")) {
    return {
      category: "word",
      colorClass: "text-blue-600",
      badgeBg: "bg-blue-50 border-blue-200/80 text-blue-700",
    };
  }
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) {
    return {
      category: "excel",
      colorClass: "text-[var(--color-primary-main)]",
      badgeBg: "bg-slate-50 border-slate-200/80 text-brand-dark",
    };
  }
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) {
    return {
      category: "powerpoint",
      colorClass: "text-amber-600",
      badgeBg: "bg-amber-50 border-amber-200/80 text-amber-700",
    };
  }
  if (
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".7z") ||
    name.endsWith(".tar") ||
    name.endsWith(".gz")
  ) {
    return {
      category: "archive",
      colorClass: "text-purple-600",
      badgeBg: "bg-purple-50 border-purple-200/80 text-purple-700",
    };
  }
  if (name.endsWith(".txt") || name.endsWith(".json") || name.endsWith(".js") || name.endsWith(".ts")) {
    return {
      category: "code",
      colorClass: "text-slate-600",
      badgeBg: "bg-slate-50 border-slate-200/80 text-slate-700",
    };
  }

  return {
    category: "generic",
    colorClass: "text-teal-600",
    badgeBg: "bg-teal-50 border-teal-200/80 text-teal-700",
  };
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentIcon({ fileName = "", className = "", size = 20 }: AttachmentIconProps) {
  const { category, colorClass } = getFileCategory(fileName);

  switch (category) {
    case "pdf":
      return <FileText size={size} className={`${colorClass} ${className}`} />;
    case "word":
      return <FileText size={size} className={`${colorClass} ${className}`} />;
    case "excel":
      return <FileSpreadsheet size={size} className={`${colorClass} ${className}`} />;
    case "powerpoint":
      return <Presentation size={size} className={`${colorClass} ${className}`} />;
    case "archive":
      return <FileArchive size={size} className={`${colorClass} ${className}`} />;
    case "code":
      return <FileCode size={size} className={`${colorClass} ${className}`} />;
    default:
      return <File size={size} className={`${colorClass} ${className}`} />;
  }
}
