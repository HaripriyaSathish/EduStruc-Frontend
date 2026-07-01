import { Link } from 'react-router-dom';
import { BarChart3, Calendar, TrendingUp, CheckCircle, GraduationCap, Building2, BookOpen, FlaskConical } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', width: '100%', fontFamily: 'Inter, sans-serif', background: '#FFFFFF' }}>

      <style>{`
        /* Navbar links */
        .nav-login:hover { color: #0051D5 !important; }
        .nav-demo:hover { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .nav-demo { transition: all 0.2s ease !important; }

        /* Hero buttons */
        .btn-primary { transition: all 0.2s ease !important; }
        .btn-primary:hover { background: #003DAA !important; transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,81,213,0.35) !important; }
        .btn-secondary { transition: all 0.2s ease !important; }
        .btn-secondary:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; transform: translateY(-2px) !important; }

        /* Feature cards */
        .feature-card { transition: all 0.25s ease !important; }
        .feature-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,81,213,0.12) !important; border-color: #0051D5 !important; }
        .feature-card:hover .feature-icon { background: #0051D5 !important; }
        .feature-card:hover .feature-icon svg { color: #FFFFFF !important; }

        /* Benefit cards */
        .benefit-card { transition: all 0.25s ease !important; }
        .benefit-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,81,213,0.1) !important; border-color: #0051D5 !important; }

        /* Trust logos */
        .trust-item { transition: all 0.2s ease !important; }
        .trust-item:hover { color: #0051D5 !important; transform: scale(1.05) !important; }

        /* Dark CTA card */
        .dark-cta-btn { transition: all 0.2s ease !important; }
        .dark-cta-btn:hover { background: #003DAA !important; transform: translateY(-2px) !important; box-shadow: 0 6px 16px rgba(0,81,213,0.4) !important; }

        /* Final CTA buttons */
        .cta-primary { transition: all 0.2s ease !important; }
        .cta-primary:hover { background: #003DAA !important; transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,81,213,0.4) !important; }
        .cta-secondary { transition: all 0.2s ease !important; }
        .cta-secondary:hover { background: rgba(255,255,255,0.1) !important; border-color: #FFFFFF !important; transform: translateY(-2px) !important; }

        /* Footer links */
        .footer-link { transition: color 0.15s ease !important; }
        .footer-link:hover { color: #0051D5 !important; }

        /* Scheduling items */
        .schedule-item { transition: all 0.2s ease !important; }
        .schedule-item:hover { border-color: #0051D5 !important; background: #F0F7FF !important; }

        /* Hero dashboard pulse on progress bar */
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .live-bar { animation: pulse-bar 2s ease-in-out infinite; }

        /* Fade in on load */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-text { animation: fadeUp 0.6s ease forwards; }
        .hero-image { animation: fadeUp 0.8s ease 0.2s both; }
        .section-title { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: '#F8F9FF', height: '64px', paddingLeft: '66px', paddingRight: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 0 #C6C6CD' }}>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30' }}>EduStruc</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" className="nav-login" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#45464D', textDecoration: 'none', transition: 'color 0.2s ease' }}>Login</Link>
          <Link to="/login" className="nav-demo" style={{ background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>Request Demo</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ background: '#F8F9FF', paddingTop: '128px', paddingBottom: '96px', paddingLeft: '66px', paddingRight: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px' }}>
        <div className="hero-text" style={{ flex: 1, maxWidth: '560px' }}>
          <span style={{ border: '1px solid #0051D5', color: '#0051D5', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', padding: '4px 12px', borderRadius: '999px', letterSpacing: '0.1em', display: 'inline-block', marginBottom: '24px' }}>
            THE FUTURE OF SMS
          </span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '52px', lineHeight: 1.15, color: '#0B1C30', marginBottom: '20px' }}>
            Institutional Excellence Through{' '}
            <span style={{ color: '#0051D5' }}>Smarter Management</span>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: 1.7, color: '#45464D', marginBottom: '36px', maxWidth: '480px' }}>
            A centralized platform designed to unify administration, empower educators, and accelerate student achievement with data-driven insights.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" className="btn-primary" style={{ background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
              Request Demo
            </Link>
            <button className="btn-secondary" style={{ background: 'transparent', border: '1px solid #C6C6CD', color: '#45464D', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer' }}>
              View Features
            </button>
          </div>
        </div>

        {/* Hero Dashboard */}
        {/* Hero Dashboard - Real Image */}
<div className="hero-image" style={{ flex: 1, maxWidth: '600px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
  <div style={{ transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg)', transformStyle: 'preserve-3d', width: '100%' }}>
    <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,81,213,0.25)', position: 'relative' }}>
      {/* Real dashboard image */}
      <img
        src="/src/assets/dashboard-preview.png"
        alt="EduStruc Dashboard"
        style={{ width: '100%', display: 'block', borderRadius: '16px 16px 0 0' }}
      />
      {/* Analytics card overlay - bottom */}
      
    </div>
  </div>
</div>
      </section>

      {/* TRUST SECTION */}
      <section style={{ background: '#DCE9FF', borderTop: '1px solid #C6C6CD', borderBottom: '1px solid #C6C6CD', paddingTop: '48px', paddingBottom: '48px', paddingLeft: '66px', paddingRight: '66px' }}>
        <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#7C839B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Trusted by Leading Institutions Globally
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
          {[
            { icon: <GraduationCap size={15} />, label: 'UNIVERSITY' },
            { icon: <Building2 size={15} />, label: 'POLYTECH' },
            { icon: <BookOpen size={15} />, label: 'ACADEMY' },
            { icon: <FlaskConical size={15} />, label: 'SCIENCE INST' },
          ].map((item, i) => (
            <div key={i} className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7C839B', cursor: 'default' }}>
              {item.icon}
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', letterSpacing: '0.08em' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section style={{ background: '#F8F9FF', paddingTop: '64px', paddingBottom: '64px', paddingLeft: '66px', paddingRight: '66px' }}>
        <h2 className="section-title" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: '#0B1C30', textAlign: 'center', marginBottom: '12px' }}>
          Precision Tools for Modern Education
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#45464D', textAlign: 'center', maxWidth: '560px', margin: '0 auto 40px' }}>
          Streamline your institutional operations with our comprehensive suite of management modules.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Real-time Analytics */}
          <div className="feature-card" style={{ background: '#FFFFFF', border: '1px solid #C6C6CD', borderRadius: '16px', padding: '32px', cursor: 'default' }}>
            <div className="feature-icon" style={{ background: '#DCE9FF', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'background 0.2s ease' }}>
              <BarChart3 size={20} style={{ color: '#0051D5', transition: 'color 0.2s ease' }} />
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', marginBottom: '10px' }}>Real-time Analytics</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.7, marginBottom: '24px' }}>
              Gain deep visibility into institutional performance. Track retention rates, financial health, and academic progress through interactive dashboards that update as things happen.
            </p>
            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'flex-end', gap: '6px', height: '88px' }}>
              {[
                { h: 28, color: '#0051D520' }, { h: 42, color: '#0051D540' },
                { h: 35, color: '#0051D560' }, { h: 55, color: '#0051D580' },
                { h: 48, color: '#0051D5AA' }, { h: 68, color: '#0051D5CC' },
                { h: 60, color: '#0051D5DD' }, { h: 80, color: '#0051D5' },
              ].map((bar, i) => (
                <div key={i} style={{ flex: 1, height: `${bar.h}%`, borderRadius: '3px 3px 0 0', background: bar.color }}></div>
              ))}
            </div>
          </div>

          {/* Automated Scheduling */}
          <div className="feature-card" style={{ background: '#FFFFFF', border: '1px solid #C6C6CD', borderRadius: '16px', padding: '32px', cursor: 'default' }}>
            <div className="feature-icon" style={{ background: '#DCE9FF', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'background 0.2s ease' }}>
              <Calendar size={20} style={{ color: '#0051D5', transition: 'color 0.2s ease' }} />
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', marginBottom: '10px' }}>Automated Scheduling</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.7, marginBottom: '24px' }}>
              Resolve complex room and faculty conflicts instantly with our AI-powered scheduling engine.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Class 101: Conflict Resolved', 'Room A4: Optimized'].map((item, i) => (
                <div key={i} className="schedule-item" style={{ border: '1px solid #C6C6CD', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0051D5', flexShrink: 0 }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Student Success */}
          <div className="feature-card" style={{ background: '#FFFFFF', border: '1px solid #C6C6CD', borderRadius: '16px', padding: '32px', cursor: 'default' }}>
            <div className="feature-icon" style={{ background: '#DCE9FF', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'background 0.2s ease' }}>
              <TrendingUp size={20} style={{ color: '#0051D5', transition: 'color 0.2s ease' }} />
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', marginBottom: '10px' }}>Student Success Tracking</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.7 }}>
              Identify at-risk students before they fall behind. Personalized intervention plans managed directly in the portal.
            </p>
          </div>

          {/* Dark CTA */}
          <div style={{ background: '#000000', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>Ready to elevate your institution?</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#7C839B', marginBottom: '24px' }}>Join 500+ academies scaling with EduStruc.</p>
            <Link to="/login" className="dark-cta-btn" style={{ background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section style={{ background: '#EFF4FF', paddingTop: '48px', paddingBottom: '48px', paddingLeft: '66px', paddingRight: '66px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { label: 'For Administrators', title: 'Maximized Efficiency', items: ['Reduce administrative overhead by 40% through automation.', 'Centralized compliance and reporting workflows.'] },
            { label: 'For Teachers', title: 'Unprecedented Clarity', items: ['Automated grading and attendance tracking.', 'Personalized feedback tools for better student outcomes.'] },
            { label: 'For Students', title: 'Active Engagement', items: ['Mobile-first portal for assignments and grades.', 'Transparent academic roadmap and milestone tracking.'] },
          ].map((card, i) => (
            <div key={i} className="benefit-card" style={{ background: '#FFFFFF', border: '1px solid #C6C6CD', borderRadius: '16px', padding: '32px', cursor: 'default' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0051D5', marginBottom: '8px' }}>{card.label}</p>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', marginBottom: '20px' }}>{card.title}</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
                {card.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle size={16} style={{ color: '#0051D5', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#000000', height: '312px', paddingLeft: '66px', paddingRight: '66px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: '#FFFFFF', marginBottom: '12px' }}>
          Transform Your Institution Today
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#7C839B', marginBottom: '32px', maxWidth: '520px' }}>
          Experience the power of a unified management system designed for the next generation of academic excellence.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" className="cta-primary" style={{ background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
            Get Started Now
          </Link>
          <button className="cta-secondary" style={{ background: 'transparent', border: '1px solid #4B5563', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer' }}>
            Speak with an Expert
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#E5EEFF', borderTop: '1px solid #C6C6CD', paddingLeft: '66px', paddingRight: '66px', paddingTop: '48px', paddingBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ maxWidth: '280px' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', display: 'block', marginBottom: '8px' }}>EduStruc</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6 }}>
              Empowering educational institutions with smarter tools for a brighter academic future.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '64px' }}>
            {[
              { heading: 'PRODUCT', links: ['Features', 'Pricing', 'Integrations'] },
              { heading: 'COMPANY', links: ['About Us', 'Careers', 'Contact'] },
              { heading: 'SUPPORT', links: ['Documentation', 'Help Center', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#0B1C30', letterSpacing: '0.08em', marginBottom: '12px' }}>{col.heading}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="footer-link" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', textDecoration: 'none' }}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link, i) => (
              <a key={i} href="#" className="footer-link" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}