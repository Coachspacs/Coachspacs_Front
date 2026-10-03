"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  RemoveFormatting,
} from "lucide-react";
import { sanitizeLegalHtml, convertBulletTextToHtml } from "./legalUtils";

interface LegalRichTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  dir?: "rtl" | "ltr";
  placeholder?: string;
  minHeight?: string;
  className?: string;
  disabled?: boolean;
}

export function LegalRichTextEditor({
  value,
  onChange,
  dir = "ltr",
  placeholder = "Write content here...",
  minHeight = "130px",
  className = "",
  disabled = false,
}: LegalRichTextEditorProps) {
  const isRtl = dir === "rtl";
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalHtml, setInternalHtml] = useState(() => convertBulletTextToHtml(value || ""));

  // Synchronize internal DOM when external value changes
  useEffect(() => {
    const converted = convertBulletTextToHtml(value || "");
    if (editorRef.current && editorRef.current.innerHTML !== converted) {
      editorRef.current.innerHTML = converted;
      setInternalHtml(converted);
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const sanitized = sanitizeLegalHtml(currentHtml);
    setInternalHtml(sanitized);
    onChange(sanitized);
  }, [onChange]);

  const execFormat = (command: string, formatVal: string | undefined = undefined) => {
    if (disabled || isSourceMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, formatVal);
    emitChange();
  };

  const handleAddLink = () => {
    if (disabled || isSourceMode) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    const url = prompt(isRtl ? "أدخل رابط URL:" : "Enter Link URL:", "https://");
    if (!url) return;

    if (!selectedText) {
      const linkText = prompt(isRtl ? "أدخل نص الرابط:" : "Enter Link Text:", url);
      const htmlToInsert = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 underline font-semibold">${linkText || url}</a>`;
      document.execCommand("insertHTML", false, htmlToInsert);
    } else {
      document.execCommand("createLink", false, url);
    }
    emitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      execFormat("bold");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      execFormat("italic");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      handleAddLink();
    }
  };

  // Toggle between HTML and Visual view without losing content
  const handleToggleMode = () => {
    if (isSourceMode) {
      // Switching from HTML source back to Visual
      if (editorRef.current) {
        editorRef.current.innerHTML = internalHtml;
      }
      onChange(internalHtml);
      setIsSourceMode(false);
    } else {
      // Switching from Visual to HTML source
      const currentHtml = editorRef.current?.innerHTML || value || "";
      setInternalHtml(currentHtml);
      setIsSourceMode(true);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all bg-white overflow-hidden shadow-2xs ${
        isFocused
          ? "border-[#0F5244] ring-2 ring-[#0F5244]/10"
          : "border-slate-200 hover:border-slate-300"
      } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""} ${className}`}
    >
      {/* Formatting Toolbar */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="flex items-center flex-wrap gap-1 px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 text-slate-700 text-xs select-none"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat("bold");
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "عريض (Ctrl+B)" : "Bold (Ctrl+B)"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat("italic");
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "مائل (Ctrl+I)" : "Italic (Ctrl+I)"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat("insertUnorderedList");
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "قائمة نقطية" : "Bullet List"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat("insertOrderedList");
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "قائمة رقمية" : "Numbered List"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleAddLink();
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "إدراج رابط (Ctrl+K)" : "Insert Link (Ctrl+K)"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat("removeFormat");
          }}
          disabled={disabled || isSourceMode}
          title={isRtl ? "إزالة التنسيق" : "Clear Formatting"}
          className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-700 active:bg-slate-300 transition-colors cursor-pointer disabled:opacity-40"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleMode}
            title={
              isSourceMode
                ? isRtl
                  ? "معاينة مرئية"
                  : "Visual Editor"
                : isRtl
                ? "عرض الكود HTML"
                : "View HTML Source"
            }
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isSourceMode
                ? "bg-emerald-100 text-[#0F5244]"
                : "hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">
              {isSourceMode ? "Visual" : "HTML"}
            </span>
          </button>
        </div>
      </div>

      {/* Editable Body Area - Both preserved in DOM to prevent unmount wiping */}
      <textarea
        dir="ltr"
        value={internalHtml}
        disabled={disabled}
        onChange={(e) => {
          setInternalHtml(e.target.value);
          onChange(e.target.value);
        }}
        style={{ minHeight }}
        className={`w-full p-3.5 text-xs font-mono text-slate-800 bg-slate-900/5 focus:outline-none resize-y ${
          isSourceMode ? "block" : "hidden"
        }`}
        placeholder="<p>HTML Content...</p>"
      />

      <div
        ref={editorRef}
        contentEditable={!disabled}
        dir={dir}
        onInput={emitChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          emitChange();
        }}
        onKeyDown={handleKeyDown}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className={`p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none leading-relaxed transition-all [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_ol]:space-y-1 [&_p]:mb-2 [&_a]:text-emerald-700 [&_a]:underline [&_a]:font-semibold ${
          isRtl ? "text-right" : "text-left"
        } ${isSourceMode ? "hidden" : "block"}`}
      />
    </div>
  );
}
