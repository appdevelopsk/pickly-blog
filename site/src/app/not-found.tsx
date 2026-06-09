import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="mb-4 text-6xl font-black text-slate-200">404</p>
          <h1 className="mb-3 text-2xl font-black text-slate-900">Page not found</h1>
          <p className="mb-8 max-w-md text-slate-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/en" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
              Go home
            </Link>
            <Link href="/en/articles" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-400 transition-colors">
              Browse all reviews
            </Link>
            <Link href="/en/popular" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-400 transition-colors">
              Popular picks
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
