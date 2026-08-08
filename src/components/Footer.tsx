import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BookOpen, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const locale = useLocale();

  return (
    <footer className="w-full bg-gradient-to-b from-[#003836] via-[#004442] to-[#022423] text-emerald-100/90 shrink-0 border-t border-emerald-800/40 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6CF8BB] text-[#003836] flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-[#003836]" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">CoachSpace.</span>
            </Link>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Empowering global talent with elite coaching, interactive video courses, and verified career credentials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link href={`/${locale}/courses`} className="hover:text-[#6CF8BB] transition-colors">Course Catalog</Link></li>
              <li><Link href={`/${locale}/courses?category=Web+Development`} className="hover:text-[#6CF8BB] transition-colors">Web Development</Link></li>
              <li><Link href={`/${locale}/courses?category=Design`} className="hover:text-[#6CF8BB] transition-colors">UI/UX Design</Link></li>
              <li><Link href={`/${locale}/courses?category=Business`} className="hover:text-[#6CF8BB] transition-colors">Executive Coaching</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link href={`/${locale}/register`} className="hover:text-[#6CF8BB] transition-colors">Become an Instructor</Link></li>
              <li><Link href={`/${locale}/cart`} className="hover:text-[#6CF8BB] transition-colors">Cart & Checkout</Link></li>
              <li><Link href={`/${locale}/certificates/cert-8849`} className="hover:text-[#6CF8BB] transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-[#6CF8BB] hover:text-[#003836] transition-all flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-[#6CF8BB] hover:text-[#003836] transition-all flex items-center justify-center">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-[#6CF8BB] hover:text-[#003836] transition-all flex items-center justify-center">
                <Github className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-200">
              <Mail className="w-4 h-4 text-[#6CF8BB]" />
              <span>support@coachspace.com</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-800/50 text-center text-xs text-emerald-300/70">
          © {new Date().getFullYear()} CoachSpace Inc. All rights reserved. Built for high-performance learning.
        </div>
      </div>
    </footer>
  );
};
