'use client';

import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="py-12 border-t border-white/5 px-6 bg-dark">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-text-muted font-light">
        <div>© 2025 digiRestau. All rights reserved.</div>
        <div className="flex items-center flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/upcoming-features" className="hover:text-white transition-colors font-bold text-saffron">Upcoming Features 🚀</Link>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          Made with <span className="text-saffron">❤️</span> in India 🇮🇳
        </div>
      </div>
    </footer>
  );
}
