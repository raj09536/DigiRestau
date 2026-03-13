'use client';

import { useEffect, useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

const sections = [
  { id: 'general', title: '1. General Disclaimer' },
  { id: 'uptime', title: '2. Uptime & Availability' },
  { id: 'responsibilities', title: '3. Restaurant Owner Responsibilities' },
  { id: 'advice', title: '4. No Financial Advice' },
  { id: 'third-party', title: '5. Third-Party Services' },
  { id: 'content', title: '6. Content Disclaimer' },
  { id: 'liability', title: '7. Limitation of Liability' },
  { id: 'law', title: '8. Governing Law' },
  { id: 'changes', title: '9. Changes' },
  { id: 'contact', title: '10. Contact' },
];

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen font-outfit selection:bg-saffron selection:text-white" style={{ backgroundColor: '#120D0A', color: '#F5EDE8' }}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-start">
            <span className="text-saffron text-sm font-bold uppercase tracking-[0.2em] mb-4">Legal</span>
            <h1 className="text-4xl lg:text-7xl font-fraunces font-bold mb-6">Disclaimer</h1>
            <p className="text-xl text-text-muted leading-relaxed font-light">
              Please read this carefully before using digiRestau.
            </p>
            <div className="w-20 h-1 bg-saffron mt-12 rounded-full" />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6 bg-dark">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="legal-sidebar">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 ml-4">In this page</div>
              <div className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => scrollToSection(e, s.id)}
                    className={`sidebar-link ${activeSection === s.id ? 'active' : ''}`}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            <div id="general">
              <h2 className="legal-section-title">1. General Disclaimer</h2>
              <div className="legal-body">
                digiRestau is provided on an "as is" and "as available" basis without warranties of any kind. We make no express or implied warranties regarding the platform's fitness for a particular purpose.
              </div>
            </div>

            <div id="uptime">
              <h2 className="legal-section-title">2. No Guarantee of Uptime</h2>
              <div className="legal-body">
                We strive for 99%+ availability but do not guarantee uninterrupted service. Downtime may occur due to scheduled maintenance, third-party service failures (Supabase, Vercel), or force majeure events. We are not liable for loss of orders or revenue during downtime.
              </div>
            </div>

            <div id="responsibilities">
              <h2 className="legal-section-title">3. Restaurant Owner Responsibilities</h2>
              <div className="legal-body">
                Restaurant owners are solely responsible for: accuracy of menu items, prices and descriptions, timely order fulfilment, disputes with customers regarding food quality or service, compliance with FSSAI regulations and local tax laws, order cancellation policies. digiRestau is not a party to any transaction between restaurant and customers.
              </div>
            </div>

            <div id="advice">
              <h2 className="legal-section-title">4. No Financial or Business Advice</h2>
              <div className="legal-body">
                Any revenue estimates or business strategy mentioned on our platform are illustrative only. digiRestau makes no guarantee of increased revenue or operational efficiency from using the platform.
              </div>
            </div>

            <div id="third-party">
              <h2 className="legal-section-title">5. Third-Party Links and Services</h2>
              <div className="legal-body">
                digiRestau integrates with Razorpay, Supabase, and others. We are not responsible for their content, privacy practices, or reliability. Use of third-party services is subject to their own terms.
              </div>
            </div>

            <div id="content">
              <h2 className="legal-section-title">6. Image and Content Disclaimer</h2>
              <div className="legal-body">
                Restaurant owners are solely responsible for all uploaded content including menu images, logos, and descriptions. Images must be owned or properly licensed. digiRestau does not verify content legality. Copyright infringement claims are the restaurant owner's sole responsibility.
              </div>
            </div>

            <div id="liability">
              <h2 className="legal-section-title">7. Limitation of Liability</h2>
              <div className="legal-body">
                To the maximum extent permitted by law, digiRestau shall not be liable for: indirect or consequential damages, loss of data or revenue, unauthorized account access, or any claim exceeding the amount paid to digiRestau in the last 3 months.
              </div>
            </div>

            <div id="law">
              <h2 className="legal-section-title">8. Governing Law</h2>
              <div className="legal-body">
                This Disclaimer is governed by the laws of India. Disputes subject to exclusive jurisdiction of Indian courts.
              </div>
            </div>

            <div id="changes">
              <h2 className="legal-section-title">9. Changes</h2>
              <div className="legal-body">
                We may modify this Disclaimer at any time. Changes effective immediately upon posting.
              </div>
            </div>

            <div id="contact">
              <h2 className="legal-section-title">10. Contact Us</h2>
              <div className="legal-body">
                Email: legal@digirestau.com
              </div>
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
