'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Check, X, ArrowRight, HelpCircle, Shield, Sparkles, Flame } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<{ symbol: string; code: string }>({ symbol: '₹', code: 'INR' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Offline locale/timezone based currency detection (avoids client-side CORS/ad-blocker Failed to fetch errors)
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userLocale = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
      
      const isIndia = userTimeZone === 'Asia/Kolkata' || userLocale.toLowerCase().includes('in');
      if (!isIndia) {
        setCurrency({ symbol: '$', code: 'USD' });
      }
    } catch (e) {
      console.warn('Currency detection fallback:', e);
    }

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

  const getPrice = (plan: 'starter' | 'pro' | 'max') => {
    const isINR = currency.code === 'INR';
    const prices = {
      starter: { monthly: '0', yearly: '0' },
      pro: { monthly: isINR ? '499' : '12', yearly: isINR ? '4,790' : '115' },
      max: { monthly: isINR ? '999' : '25', yearly: isINR ? '9,590' : '240' },
    };
    return billingPeriod === 'monthly' ? prices[plan].monthly : prices[plan].yearly;
  };

  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any point from your dashboard. If you upgrade, the new pricing will be pro-rated immediately. If you downgrade or cancel, you will have access to your current features until the end of your billing cycle."
    },
    {
      q: "Is there any setup fee or hidden charges?",
      a: "No, there are absolutely no setup fees or hidden charges. The prices you see above are all-inclusive of our standard platform services. High-volume SMS notifications or custom integrations may carry additional carrier charges if selected."
    },
    {
      q: "What happens if I go over my plan limits?",
      a: "Our plans are designed to be flexible. If you are on the Starter plan and start receiving customer orders, we will notify you to upgrade to the Pro plan. We will never shut down your menu dynamically without giving you ample time to transition."
    },
    {
      q: "How does the 14-day money-back guarantee work?",
      a: "If you are not satisfied with DigiRestau Pro or Max plans, you can contact our support team within 14 days of your initial purchase for a full refund, no questions asked."
    }
  ];

  return (
    <div className="min-h-screen font-outfit selection:bg-saffron selection:text-white relative overflow-hidden" style={{ backgroundColor: '#120D0A', color: '#F5EDE8' }}>
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-saffron/10 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-saffron-light/5 rounded-full blur-[100px] animate-drift" style={{ animationDelay: '-2s' }} />
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      <LandingNavbar />

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="reveal text-center mb-16 flex flex-col items-center">
            <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron" /> Transparent Pricing
            </span>
            <h1 className="text-5xl lg:text-[72px] font-fraunces font-bold mb-6 leading-tight">
              Simple plans for <br />
              every <span className="text-saffron italic font-light">restaurant size</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              Choose the plan that matches your business scale. No credit card required to start with our free tier.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center gap-4 bg-dark-3 p-1 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${billingPeriod === 'monthly' ? 'bg-saffron text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${billingPeriod === 'yearly' ? 'bg-saffron text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
              >
                Yearly
              </button>
            </div>
            
            {billingPeriod === 'yearly' && (
              <div className="mt-4 animate-bounce">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                  🔥 Save 20% on Yearly Billing
                </span>
              </div>
            )}
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-28">
            
            {/* STARTER Plan */}
            <div 
              className="reveal bg-dark-2 rounded-[40px] p-8 border border-white/10 flex flex-col h-full hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              style={{ background: '#1E1510' }}
            >
              <div className="mb-10 text-left">
                <h3 className="text-2xl font-fraunces font-bold mb-2 text-white/95">Starter</h3>
                <div className="text-4xl font-bold flex items-baseline gap-1 text-white">
                  Free
                </div>
                <p className="text-xs text-text-muted mt-2">Perfect for digital menus & viewing</p>
              </div>

              <ul className="space-y-4 mb-12 flex-1 text-left text-sm text-text-muted">
                {[
                  { label: 'QR Menu Generation', check: true },
                  { label: '10+ Premium Templates', check: true },
                  { label: 'Unlimited Items & Tables', check: true },
                  { label: 'View-only access', check: true },
                  { label: 'Customer Orders', check: false },
                  { label: 'Live Notifications', check: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 ${!item.check ? 'opacity-40 line-through' : ''}`}>
                    {item.check ? (
                      <Check className="w-5 h-5 text-green-400 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup?plan=starter"
                className="w-full py-4 rounded-2xl border border-white/10 font-bold text-center text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                Choose Starter
              </Link>
            </div>

            {/* PRO Plan */}
            <div 
              className="reveal reveal-delay-1 bg-dark-2 rounded-[40px] p-8 border-2 border-saffron flex flex-col h-full relative shadow-[0_30px_60px_rgba(244,98,42,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              style={{ background: '#251912' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-4 right-6">
                <span className="px-3 py-1 bg-saffron text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> Popular
                </span>
              </div>

              <div className="mb-10 text-left">
                <h3 className="text-2xl font-fraunces font-bold mb-2 text-white">Pro Plan</h3>
                <div className="text-4xl font-bold flex items-baseline gap-1 text-white">
                  {currency.symbol}{getPrice('pro')}
                  <span className="text-sm font-medium text-text-muted">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Complete interactive ordering system</p>
              </div>

              <ul className="space-y-4 mb-12 flex-1 text-left text-sm text-white/90">
                {[
                  { label: 'Everything in Starter', check: true },
                  { label: 'Accept Live Orders', check: true },
                  { label: 'Sound Notifications', check: true },
                  { label: 'Order Management', check: true },
                  { label: 'Table Status Tracking', check: true },
                  { label: 'Priority Support', check: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup?plan=pro"
                className="w-full py-4 rounded-2xl bg-saffron text-white font-bold text-center shadow-xl shadow-saffron/30 hover:bg-saffron-light transition-all duration-300 flex items-center justify-center gap-2"
              >
                Choose Pro <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* MAX Plan */}
            <div 
              className="reveal reveal-delay-2 bg-dark-2 rounded-[40px] p-8 border border-white/10 flex flex-col h-full hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              style={{ background: '#1E1510' }}
            >
              <div className="mb-10 text-left">
                <h3 className="text-2xl font-fraunces font-bold mb-2 text-white/95">Max Plan</h3>
                <div className="text-4xl font-bold flex items-baseline gap-1 text-white">
                  {currency.symbol}{getPrice('max')}
                  <span className="text-sm font-medium text-text-muted">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Unlimited locations & custom brand styling</p>
              </div>

              <ul className="space-y-4 mb-12 flex-1 text-left text-sm text-text-muted">
                {[
                  { label: 'Everything in Pro', check: true },
                  { label: 'Unlimited Tables & Items', check: true },
                  { label: 'Advanced Analytics', check: true },
                  { label: 'Custom Branding & Logo', check: true },
                  { label: '24/7 Dedicated Support', check: true },
                  { label: 'Future Features Access', check: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup?plan=max"
                className="w-full py-4 rounded-2xl border border-white/10 font-bold text-center text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                Choose Max
              </Link>
            </div>
          </div>

          {/* Detailed Features Comparison Matrix */}
          <div className="reveal max-w-5xl mx-auto mb-28">
            <h2 className="text-3xl font-fraunces font-bold text-center mb-12">Detailed Feature Comparison</h2>
            
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-dark-2" style={{ background: '#1E1510' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-6 text-sm font-bold uppercase tracking-wider text-text-muted">Feature</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-wider text-white">Starter</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-wider text-saffron">Pro</th>
                    <th className="p-6 text-sm font-bold uppercase tracking-wider text-white">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  <tr>
                    <td className="p-6 font-medium text-white/90">QR Menu Customization</td>
                    <td className="p-6 text-text-muted">Basic</td>
                    <td className="p-6 text-white">Advanced Templates</td>
                    <td className="p-6 text-white">Fully Custom & Branding</td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium text-white/90">Order Flow</td>
                    <td className="p-6 text-text-muted">View Only Menu</td>
                    <td className="p-6 text-white">Interactive Ordering</td>
                    <td className="p-6 text-white">Interactive Ordering</td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium text-white/90">Staff Dashboard Accounts</td>
                    <td className="p-6 text-text-muted">1 User</td>
                    <td className="p-6 text-white">Up to 5 Users</td>
                    <td className="p-6 text-white">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium text-white/90">Live Notifications</td>
                    <td className="p-6 text-red-400">✕ None</td>
                    <td className="p-6 text-green-400">✓ Sound & Panel Alerts</td>
                    <td className="p-6 text-green-400">✓ SMS, Sound, & Panel</td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium text-white/90">Analytics</td>
                    <td className="p-6 text-red-400">✕ None</td>
                    <td className="p-6 text-white">Basic Metrics</td>
                    <td className="p-6 text-white">Detailed Insights & Export</td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium text-white/90">Support</td>
                    <td className="p-6 text-text-muted">Email Support</td>
                    <td className="p-6 text-white">Priority Email/Chat</td>
                    <td className="p-6 text-white">Dedicated WhatsApp & 24/7 Phone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="reveal max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <HelpCircle className="w-12 h-12 text-saffron mx-auto mb-4" />
              <h2 className="text-4xl font-fraunces font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-text-muted font-light leading-relaxed">
                Have questions about pricing, setup, or features? Find answers below.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="p-8 rounded-3xl border border-white/5"
                  style={{ background: '#1E1510' }}
                >
                  <h4 className="text-lg font-bold mb-3 text-white">{faq.q}</h4>
                  <p className="text-sm text-text-muted font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <LandingFooter />

      {/* Custom Styles for Fraunces/Outfit fallback if fonts fail to load */}
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6, .font-fraunces {
          font-family: var(--font-fraunces), serif;
        }
        body, .font-outfit {
          font-family: var(--font-outfit), sans-serif;
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
