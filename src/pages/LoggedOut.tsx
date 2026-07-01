import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle, Lock, RefreshCw, Activity } from 'lucide-react';

export default function LoggedOut() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', background: '#DCE9FF',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0',
    }}>

      <style>{`
        .login-btn { transition: all 0.2s ease; }
        .login-btn:hover { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,81,213,0.35); }
        .help-btn { transition: all 0.2s ease; }
        .help-btn:hover { background: #EFF4FF !important; color: #0051D5 !important; border-color: #0051D5 !important; transform: translateY(-1px); }
        .footer-link { transition: color 0.15s ease; }
        .footer-link:hover { color: #0051D5 !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
        .scale-in { animation: scaleIn 0.4s ease 0.2s both; }
      `}</style>

      {/* Top spacer */}
      <div style={{ flex: 1 }} />

      {/* Main content */}
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ background: '#0051D5', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30' }}>EduStruc</span>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '48px 48px 40px',
          maxWidth: '440px', width: '100%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,81,213,0.10)',
          border: '1px solid rgba(0,81,213,0.08)',
        }}>

          {/* Check icon */}
          <div className="scale-in" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#EFF4FF', border: '2px solid #DCE9FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={32} color="#0051D5" strokeWidth={2} />
            </div>
          </div>

          <h1 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px',
            color: '#0B1C30', margin: '0 0 12px',
          }}>
            You've safely logged out.
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D',
            lineHeight: 1.7, margin: '0 0 32px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            Thank you for your session. All academic data and administrative changes have been securely saved and synced.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="login-btn" onClick={() => navigate('/login')}
              style={{
                background: '#0051D5', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '11px 24px',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                letterSpacing: '0.04em',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              LOG BACK IN
            </button>
            <button className="help-btn" onClick={() => navigate('/login')}
              style={{
                background: '#fff', color: '#45464D',
                border: '1px solid #C6C6CD',
                borderRadius: '8px', padding: '11px 24px',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                letterSpacing: '0.04em',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              NEED HELP?
            </button>
          </div>
        </div>

        {/* Security badges */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '40px',
          marginTop: '36px', padding: '0 16px',
        }}>
          {[
            { icon: <Lock size={18} />,       label: 'ENCRYPTED' },
            { icon: <RefreshCw size={18} />,  label: 'DATA SYNCED' },
            { icon: <Activity size={18} />,   label: 'ACTIVITY LOGGED' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ color: '#C6C6CD' }}>{item.icon}</div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px',
                color: '#C6C6CD', letterSpacing: '0.08em',
              }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <footer style={{ width: '100%', padding: '20px 48px', textAlign: 'center', borderTop: '1px solid rgba(0,81,213,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '8px' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((l, i) => (
            <a key={i} href="#" className="footer-link"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', textDecoration: 'none' }}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>
          © 2024 EduStruc Academic Systems. All rights reserved.
        </p>
      </footer>
    </div>
  );
}