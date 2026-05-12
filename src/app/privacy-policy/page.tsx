'use client';

import { useEffect, useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'who-we-are', title: '2. Who We Are' },
  { id: 'information-we-collect', title: '3. Information We Collect' },
  { id: 'how-we-use', title: '4. How We Use Your Information' },
  { id: 'data-storage', title: '5. Data Storage & Security' },
  { id: 'data-sharing', title: '6. Data Sharing' },
  { id: 'customer-data', title: '7. Customer Data' },
  { id: 'cookies', title: '8. Cookies' },
  { id: 'your-rights', title: '9. Your Rights' },
  { id: 'data-retention', title: '10. Data Retention' },
  { id: 'childrens-privacy', title: '11. Children\'s Privacy' },
  { id: 'international-users', title: '12. International Users' },
  { id: 'changes', title: '13. Changes' },
  { id: 'contact', title: '14. Contact' },
];

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl lg:text-7xl font-fraunces font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-text-muted leading-relaxed font-light">
              Last updated: January 1, 2025 · We respect your data and your privacy.
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
            <div id="introduction">
              <h2 className="legal-section-title">1. Introduction</h2>
              <div className="legal-body">
                Welcome to digiRestau ("we", "our", "us"). digiRestau is a digital menu and restaurant order management platform operated as a SaaS product. This Privacy Policy explains how we collect, use, store, and protect information when you use our platform at digirestau.com — whether you are a restaurant owner (our customer) or a customer of a restaurant using our platform. By using digiRestau, you agree to the collection and use of information as described in this policy.
              </div>
            </div>

            <div id="who-we-are">
              <h2 className="legal-section-title">2. Who We Are</h2>
              <div className="legal-body">
                digiRestau is an independent SaaS product built for restaurant owners to create digital menus, manage table-wise QR codes, and handle real-time orders. We serve both Indian and international restaurant businesses.
              </div>
            </div>

            <div id="information-we-collect">
              <h2 className="legal-section-title">3. Information We Collect</h2>
              <div className="legal-body space-y-4">
                <p><strong>A. From Restaurant Owners:</strong> Full name and email address, Restaurant name, slug, and logo, Subscription and billing information, Theme preferences and UI settings, Device, browser, and IP address (for security), Login timestamps and session data.</p>
                <p><strong>B. From End Customers (restaurant visitors):</strong> Customer first name (entered at order placement), Order details (items, quantities, total), Table ID and restaurant ID, Timestamp of order, Device type and browser.</p>
                <p>We do NOT collect: Aadhaar/PAN or government IDs, Financial or card details of customers, Sensitive personal data (religion, health, biometrics), Children's data.</p>
              </div>
            </div>

            <div id="how-we-use">
              <h2 className="legal-section-title">4. How We Use Your Information</h2>
              <div className="legal-body">
                To create and manage your account, display your digital menu, process real-time orders, send service announcements, improve platform performance, prevent fraud, and comply with applicable laws. We do NOT sell or rent your data to any third party.
              </div>
            </div>

            <div id="data-storage">
              <h2 className="legal-section-title">5. Data Storage and Security</h2>
              <div className="legal-body">
                All data stored using Supabase (PostgreSQL with Row-Level Security). Hosted on AWS, SOC 2 Type II compliant. All transmission encrypted via HTTPS/TLS. Passwords hashed, never stored plain text. Restaurant data isolated via RLS policies.
              </div>
            </div>

            <div id="data-sharing">
              <h2 className="legal-section-title">6. Data Sharing</h2>
              <div className="legal-body">
                <table className="legal-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Purpose</th>
                      <th>Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Supabase</td>
                      <td>Database and auth hosting</td>
                      <td>All stored data</td>
                    </tr>
                    <tr>
                      <td>Vercel</td>
                      <td>Platform hosting</td>
                      <td>Request logs</td>
                    </tr>
                    <tr>
                      <td>Razorpay (future)</td>
                      <td>Payment processing</td>
                      <td>Billing info only</td>
                    </tr>
                    <tr>
                      <td>ipapi.co</td>
                      <td>Country detection for pricing</td>
                      <td>IP address only</td>
                    </tr>
                  </tbody>
                </table>
                <p>We do not share with advertisers, data brokers, or commercial third parties.</p>
              </div>
            </div>

            <div id="customer-data">
              <h2 className="legal-section-title">7. Customer Data Belonging to Restaurants</h2>
              <div className="legal-body">
                Restaurant owners are data controllers for their customers' information. digiRestau acts as data processor on their behalf. Restaurant owners are responsible for informing customers about data collection and using customer data only for order fulfilment.
              </div>
            </div>

            <div id="cookies">
              <h2 className="legal-section-title">8. Cookies and Local Storage</h2>
              <div className="legal-body">
                We use localStorage to save language, theme, and currency preferences. Session cookies managed by Supabase Auth. No third-party advertising or tracking cookies used.
              </div>
            </div>

            <div id="your-rights">
              <h2 className="legal-section-title">9. Your Rights</h2>
              <div className="legal-body">
                Access, correct, delete, export your data. For Indian users: Digital Personal Data Protection Act 2023 (DPDPA). For EU/EEA users: GDPR applies. Contact: privacy@digirestau.com
              </div>
            </div>

            <div id="data-retention">
              <h2 className="legal-section-title">10. Data Retention</h2>
              <div className="legal-body">
                Active data retained while account exists. Account deletion: all data permanently deleted within 30 days. Order history older than 12 months may be archived.
              </div>
            </div>

            <div id="childrens-privacy">
              <h2 className="legal-section-title">11. Children's Privacy</h2>
              <div className="legal-body">
                Platform not intended for under 18. We do not knowingly collect minors' data. Contact privacy@digirestau.com to report any such case.
              </div>
            </div>

            <div id="international-users">
              <h2 className="legal-section-title">12. International Users</h2>
              <div className="legal-body">
                Data may be processed in India or AWS-operated locations. By using the platform, international users consent to this transfer.
              </div>
            </div>

            <div id="changes">
              <h2 className="legal-section-title">13. Changes to This Policy</h2>
              <div className="legal-body">
                We will notify via email or in-app notice on significant changes. Continued use after changes = acceptance.
              </div>
            </div>

            <div id="contact">
              <h2 className="legal-section-title">14. Contact Us</h2>
              <div className="legal-body">
                Email: privacy@digirestau.com · Response within 7 business days.
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
