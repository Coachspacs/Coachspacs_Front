import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
          <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-6xl font-black text-[#0F5244]/20 tracking-tighter">404</span>
            <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
            <p className="text-xs text-slate-500">The page you requested could not be found.</p>
            <Link
              href="/en"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
