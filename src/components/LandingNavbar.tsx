'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Upcoming', href: '/upcoming-features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-saffron flex items-center justify-center relative shadow-lg shadow-saffron/20 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg font-bold">d</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border-2 border-dark animate-pulse-custom" />
          </div>
          <span className="text-2xl font-fraunces font-bold tracking-tight text-white">
            digi<span style={{ color: '#F4622A' }}>Restau</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted hover:text-saffron transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-white hover:text-saffron transition-colors">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-full bg-saffron text-white text-sm font-bold shadow-lg shadow-saffron/20 hover:bg-saffron-light hover:-translate-y-0.5 transition-all"
          >
            Start Free →
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-text">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-dark-2 border-b border-white/5 p-8 animate-fade-in shadow-2xl">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-medium text-text-muted"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/5" />
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-white">Login</Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="w-full py-4 rounded-2xl bg-saffron text-white text-center font-bold"
            >
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
