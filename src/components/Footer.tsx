import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BookOpen, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const locale = useLocale();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CoachSpace.</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering global talent with elite coaching, interactive video courses, and verified career credentials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/courses`} className="hover:text-brand-400 transition-colors">Course Catalog</Link></li>
              <li><Link href={`/${locale}/courses?category=Web+Development`} className="hover:text-brand-400 transition-colors">Web Development</Link></li>
              <li><Link href={`/${locale}/courses?category=Design`} className="hover:text-brand-400 transition-colors">UI/UX Design</Link></li>
              <li><Link href={`/${locale}/courses?category=Business`} className="hover:text-brand-400 transition-colors">Executive Coaching</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/register`} className="hover:text-brand-400 transition-colors">Become an Instructor</Link></li>
              <li><Link href={`/${locale}/cart`} className="hover:text-brand-400 transition-colors">Cart & Checkout</Link></li>
              <li><Link href={`/${locale}/certificates/cert-8849`} className="hover:text-brand-400 transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-brand-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-brand-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-brand-400 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-brand-400" />
              <span>support@coachspace.com</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CoachSpace Inc. All rights reserved. Built for high-performance learning.
        </div>
      </div>
    </footer>
  );
};
