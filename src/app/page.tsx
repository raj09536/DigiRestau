'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Star, Bell, UtensilsCrossed, QrCode, Monitor, Check, X, Send, ArrowRight, MousePointer2 } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';


export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please fill out all fields.');
      return;
    }
    setSubmittingContact(true);
    setContactError(null);
    setContactSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      setContactError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmittingContact(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Scroll reveal observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const elem = document.getElementById(targetId);
    if (elem) {
      const topOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen font-outfit selection:bg-saffron selection:text-white" style={{ backgroundColor: '#120D0A', color: '#F5EDE8' }}>
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-saffron/10 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-saffron-light/5 rounded-full blur-[100px] animate-drift" style={{ animationDelay: '-2s' }} />
        {/* Noise Texture Overaly */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      <LandingNavbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="reveal flex flex-col items-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 text-sm font-medium text-text-muted backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-custom" />
              🇮🇳 Built for Indian Restaurants
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-[88px] leading-[1.05] font-fraunces font-bold mb-8 max-w-5xl">
              Your Restaurant's <br />
              <span className="italic font-light" style={{ color: '#F4622A' }}>Digital Command</span> Centre
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              Digital menu, real-time orders, table QR codes — everything in one place. 
              Start free, no app download needed.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-saffron text-white font-bold text-lg shadow-2xl shadow-saffron/30 hover:bg-saffron-light hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Start Now <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={(e) => scrollToSection(e, '#how-it-works')}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all"
              >
                See How It Works
              </button>
            </div>

            {/* Trust markers */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-muted mb-24 opacity-60">
              <span className="flex items-center gap-2">✓ Professional QR Menus</span>
              <span className="flex items-center gap-2">✓ No credit card</span>
              <span className="flex items-center gap-2">✓ Setup in 5 minutes</span>
            </div>
          </div>

          {/* Mockup */}
          <div className="reveal reveal-delay-2 relative max-w-6xl mx-auto px-4 lg:px-0">
            {/* Dashboard Container */}
            <div className="bg-dark-2 rounded-3xl border border-white/10 p-4 lg:p-6 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-6 opacity-40">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 h-6 px-4 rounded-full bg-white/5 max-w-[200px] w-full" />
              </div>

              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Orders', val: '24', color: 'bg-saffron/10 text-saffron' },
                  { label: 'Today Revenue', val: '₹8,240', color: 'bg-green/10 text-green' },
                  { label: 'Active Tables', val: '06', color: 'bg-gold/10 text-gold' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                    <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">{stat.label}</div>
                    <div className={`text-xl lg:text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.val}</div>
                  </div>
                ))}
              </div>

              {/* Order Rows */}
              <div className="space-y-3">
                {[
                  { id: '124', name: 'Raj Kumar', table: '4', status: 'Pending', statusColor: 'text-gold bg-gold/10' },
                  { id: '123', name: 'Sneha Rao', table: '2', status: 'Preparing', statusColor: 'text-saffron bg-saffron/10' },
                  { id: '122', name: 'Amit Shah', table: '8', status: 'Ready', statusColor: 'text-green bg-green/10' },
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-dark-3 flex items-center justify-center font-bold text-xs">#{order.id}</div>
                      <div>
                        <div className="text-sm font-bold">{order.name}</div>
                        <div className="text-[10px] text-text-muted">Table {order.table}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.statusColor}`}>
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Notification */}
            <div className="absolute -top-10 -right-4 lg:-right-10 z-20 animate-notif-bounce">
              <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-4 border-2 border-saffron/20 max-w-[280px]">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">🛎️</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-dark mb-0.5">New Order!</div>
                  <div className="text-[11px] text-gray-500">Table 4 · Raj Kumar · ₹480</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEMS SECTION ===== */}
      <section className="bg-dark-2 py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="reveal mb-20 text-center flex flex-col items-center">
            <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">The Truth</span>
            <h2 className="text-4xl lg:text-6xl font-fraunces font-bold mb-6">Every restaurant faces these issues</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center border border-white/10 rounded-[40px] overflow-hidden">
            {/* Left — Problems */}
            <div className="p-10 lg:p-20 bg-dark text-left">
              <h3 className="text-2xl font-fraunces font-bold mb-12 flex items-center gap-3 text-red-500/80">
                ❌ Without digiRestau
              </h3>
              <div className="space-y-12">
                {[
                  { icon: '📄', title: 'Expensive Paper Menus', desc: 'Printing menus is costly and they go outdated fast. Changing a price means reprinting everything.' },
                  { icon: '📢', title: 'Missed Orders', desc: 'Busy hours mean waiters forget orders. Customer waits, gets angry, and leaves bad review.' },
                  { icon: '❌', title: 'Wrong Orders', desc: 'Communication gap between waiter and kitchen leads to wrong food on the table. Pure loss.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/5">{item.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-white/90">{item.title}</h4>
                      <p className="text-text-muted leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle divider */}
            <div className="hidden lg:block w-px h-[60%] bg-white/10 absolute left-1/2 -translate-x-1/2 z-10" />

            {/* Right — Solutions */}
            <div className="p-10 lg:p-20 bg-dark-2 text-left">
              <h3 className="text-2xl font-fraunces font-bold mb-12 flex items-center gap-3 text-green">
                ✓ With digiRestau
              </h3>
              <div className="space-y-12">
                {[
                  { icon: '✨', title: 'Digital Menu & Analytics', desc: 'Update prices and items in 1 click. See which items are popular and manage inventory better.' },
                  { icon: '🔔', title: 'Real-time Alerts', desc: 'Instant sound notifications for every new order. No delay, no forgetfulness, just efficiency.' },
                  { icon: '📱', title: 'Customer Self-Order', desc: 'Customers scan QR and order directly. Waiter only serves food. Zero errors, faster table turnover.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-saffron/10 flex items-center justify-center text-3xl border border-saffron/10">{item.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-white">{item.title}</h4>
                      <p className="text-text-muted leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 lg:py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-20 text-center flex flex-col items-center">
            <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">Command Center</span>
            <h2 className="text-4xl lg:text-6xl font-fraunces font-bold mb-6">Everything your restaurant needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Grid layout using col-span */}
            <div className="reveal md:col-span-2 bg-dark-2 rounded-[32px] p-10 border border-white/5 hover:border-saffron/30 hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center gap-4 mb-20 text-text-muted font-bold text-xs uppercase tracking-widest">
                  <span className="px-3 py-1 bg-saffron/20 text-saffron rounded-full">Live Updates</span>
                  <span>Real-time</span>
                </div>
                <div>
                  <div className="text-6xl mb-8 group-hover:scale-110 transition-transform w-fit">⚡</div>
                  <h3 className="text-3xl font-fraunces font-bold mb-4">Real-time Orders</h3>
                  <p className="text-text-muted max-w-sm font-light leading-relaxed">
                    Instant order notifications with sound alert. Manage your kitchen queue efficiently with active order tracking.
                  </p>
                </div>
              </div>
              <div className="absolute right-[-5%] bottom-[-5%] w-[40%] h-[40%] bg-saffron/5 rounded-full blur-[60px]" />
            </div>

            <div className="reveal reveal-delay-1 bg-dark-2 rounded-[32px] p-10 border border-white/5 hover:border-saffron/30 hover:-translate-y-1 transition-all group">
               <div className="text-5xl mb-12 group-hover:rotate-12 transition-transform w-fit">🍽️</div>
               <h3 className="text-2xl font-fraunces font-bold mb-4">Digital Menu Builder</h3>
               <p className="text-text-muted font-light leading-relaxed text-sm">
                 Add items, categories, and photos in minutes. Full control over your visual menu.
               </p>
            </div>

            <div className="reveal reveal-delay-2 bg-dark-2 rounded-[32px] p-10 border border-white/5 hover:border-saffron/30 hover:-translate-y-1 transition-all group">
               <div className="text-5xl mb-12 group-hover:scale-110 transition-transform w-fit">📱</div>
               <h3 className="text-2xl font-fraunces font-bold mb-4">Table QR Codes</h3>
               <p className="text-text-muted font-light leading-relaxed text-sm">
                 Generate unique QR for each table. Customers scan and start ordering instantly.
               </p>
            </div>

            <div className="reveal bg-dark-2 rounded-[32px] p-10 border border-white/5 hover:border-saffron/30 hover:-translate-y-1 transition-all group">
               <div className="text-5xl mb-12 group-hover:-translate-y-2 transition-transform w-fit">📊</div>
               <h3 className="text-2xl font-fraunces font-bold mb-4">Order Status Tracking</h3>
               <p className="text-text-muted font-light leading-relaxed text-sm">
                 Monitor orders from Pending to Preparing to Ready. Full transparency for staff.
               </p>
            </div>

            <div className="reveal reveal-delay-1 md:col-span-2 bg-dark-2 rounded-[32px] p-10 border border-white/5 hover:border-saffron/30 hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center gap-4 mb-20 text-text-muted font-bold text-xs uppercase tracking-widest">
                  <span className="px-3 py-1 bg-gold/20 text-gold rounded-full">Pro Feature</span>
                  <span>Branding</span>
                </div>
                <div>
                  <div className="text-6xl mb-8 group-hover:rotate-45 transition-transform w-fit">🎨</div>
                  <h3 className="text-3xl font-fraunces font-bold mb-4">Custom Theme Colors</h3>
                  <p className="text-text-muted max-w-sm font-light leading-relaxed">
                    Make the digital menu truly yours. Customize colors and upload your restaurant logo to match your brand style.
                  </p>
                </div>
              </div>
              <div className="absolute right-[-5%] bottom-[-5%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[60px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="bg-dark-2 py-24 lg:py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-20 text-center flex flex-col items-center">
            <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">The Process</span>
            <h2 className="text-4xl lg:text-6xl font-fraunces font-bold mb-6">Up and running in 3 simple steps</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-0 border border-white/5 rounded-[40px] bg-dark">
            {[
              { icon: '🖥️', step: '1', title: 'Create Your Menu', desc: 'Sign up free, add your restaurant details, categories, and dishes. No app download needed.' },
              { icon: '📱', step: '2', title: 'Print Table QR Codes', desc: 'Download your unique table QR codes. Print them and paste on individual tables for customers.' },
              { icon: '💰', step: '3', title: 'Start Receiving Orders', desc: 'Customers scan, select food, and order. You get notified on your dashboard instantly.' },
            ].map((item, i) => (
              <div key={i} className={`p-10 lg:p-16 flex flex-col items-center text-center relative ${i < 2 ? 'lg:border-r lg:border-white/5' : ''}`}>
                <div className="text-6xl mb-12 drop-shadow-2xl">{item.icon}</div>
                <div className="w-10 h-10 rounded-full bg-saffron/10 border border-saffron/20 flex items-center justify-center text-saffron font-bold text-lg mb-6 shadow-glow shadow-saffron/5">
                  {item.step}
                </div>
                <h3 className="text-2xl font-fraunces font-bold mb-4">{item.title}</h3>
                <p className="text-text-muted font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 lg:py-48 px-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div className="reveal">
              <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">Our Mission</span>
              <h2 className="text-4xl lg:text-7xl font-fraunces font-bold mb-12">Restaurant success made simple</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Setup Time', val: '5 min' },
                  { label: 'Entry Cost', val: '₹0' },
                  { label: 'Platform', val: '100% Browser' },
                  { label: 'Support', val: '24/7' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                    <div className="text-2xl font-bold text-saffron mb-1">{stat.val}</div>
                    <div className="text-xs text-text-muted uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal reveal-delay-2 space-y-8 text-lg font-light leading-relaxed text-text-muted">
              <p>
                DigiRestau was born out of a simple observation: restaurants in India are the heart of our culture, but most of them are still using outdated tools to manage their most important interaction—taking orders.
              </p>
              <p>
                Our mission is to democratize digital tools for every dhabba, cafe, and fine-dining restaurant owner. We believe technology should not be expensive or complicated.
              </p>
              <p>
                By digitizing the menu and ordering process, we help owners reduce errors, cut down on printing costs, and provide a modern experience to their tech-savvy customers.
              </p>
              <p>
                We are proud to build in India, for India. Join over 200+ restaurants already using digiRestau to scale their business and delight their customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="bg-dark-2 py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="reveal">
              <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">Contact</span>
              <h2 className="text-4xl lg:text-6xl font-fraunces font-bold mb-8">Ready to transform? Let's talk.</h2>
              <p className="text-text-muted mb-12 text-lg font-light">
                Have questions about the Pro plan or need help setting up your menu? Our team is always ready to help you grow.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron border border-saffron/10">📧</div>
                  <div className="text-lg">hello@digirestau.com</div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center text-green border border-green/10">💬</div>
                  <div className="text-lg">WhatsApp Support Available</div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/10">⏱️</div>
                  <div className="text-lg">Response within 24 hours</div>
                </div>
              </div>
            </div>

            <div className="reveal reveal-delay-2">
              <form onSubmit={handleContactSubmit} className="bg-dark p-8 lg:p-12 rounded-[40px] border border-white/5 space-y-6">
                {contactSuccess && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    🎉 Thank you! Your message has been sent successfully. We will get back to you shortly.
                  </div>
                )}
                
                {contactError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    ⚠️ {contactError}
                  </div>
                )}

                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Full Name</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Rajat Verma" 
                     value={contactName}
                     onChange={(e) => setContactName(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-saffron transition-all text-text-main text-sm font-medium" 
                     required
                   />
                </div>
                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Email Address</label>
                   <input 
                     type="email" 
                     placeholder="rajat@restaurant.com" 
                     value={contactEmail}
                     onChange={(e) => setContactEmail(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-saffron transition-all text-text-main text-sm font-medium" 
                     required
                   />
                </div>
                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Message</label>
                   <textarea 
                     rows={4} 
                     placeholder="How can we help you?" 
                     value={contactMessage}
                     onChange={(e) => setContactMessage(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-saffron transition-all resize-none text-text-main text-sm font-medium" 
                     required
                   />
                </div>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-5 rounded-2xl bg-saffron text-white font-bold text-lg hover:bg-saffron-light transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingContact ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Custom Styles for Fraunces/Outfit fallback if fonts fail to load */}
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6, .font-fraunces {
          font-family: var(--font-fraunces), serif;
        }
        body, .font-outfit {
          font-family: var(--font-outfit), sans-serif;
        }
      `}</style>
    </div>
  );
}
