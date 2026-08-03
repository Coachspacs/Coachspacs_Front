import Link from "next/link";

interface LogoProps {
  compact?: boolean;
  showText?: boolean;
  isAr?: boolean;
  className?: string;
  imageClassName?: string;
}

export function Logo({
  compact = false,
  showText = true,
  isAr = false,
  className = "",
  imageClassName = "",
}: LogoProps) {
  const logoHeight = compact ? 36 : 50;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 shrink-0 focus:outline-none ${className}`}
    >
      {/* Logo Image explicitly sized & vertically centered */}
      <img
        src="/images/logo.png"
        alt="Coach Space Logo"
        className={`w-auto shrink-0 object-contain ${
          imageClassName
            ? imageClassName
            : compact
            ? "h-9 sm:h-10"
            : "h-12 sm:h-14"
        }`}
        style={{ height: `${logoHeight}px`, width: "auto" }}
      />

      {showText && (
        <span
          className={`font-extrabold text-[#0F5244] tracking-tight rtl:tracking-normal leading-none flex items-center shrink-0 ${
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
          style={{ lineHeight: 1 }}
        >
          {isAr ? "كوتش سبيس" : "Coach Space"}
        </span>
      )}
    </Link>
  );
}
