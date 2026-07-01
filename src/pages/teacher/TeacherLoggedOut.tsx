import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, Shield } from 'lucide-react';

export default function TeacherLoggedOut() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#E8EFFD',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>

      <style>{`
        .return-card:hover {
          border-color: #0051D5 !important;
          background: #F0F7FF !important;
          cursor: pointer;
        }
        .return-card { transition: all 0.2s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeUp 0.45s ease both; }
      `}</style>

      {/* CENTER WRAPPER */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* OUTER GROUP — fixed width matching Figma proportions */}
        <div className="fade" style={{ width: '700px' }}>

          {/* TOP ROW — split card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            marginBottom: '12px',
          }}>

            {/* LEFT — dark */}
            <div style={{
              background: '#0B1C30',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '240px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Watermark checkmark */}
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                right: '-16px',
                opacity: 0.07,
              }}>
                <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                  <path d="M20 80 L60 120 L140 40"
                    stroke="#fff" strokeWidth="18"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Logo */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '6px',
                    display: 'flex',
                  }}>
                    <GraduationCap size={18} color="#fff" />
                  </div>
                  <span style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700, fontSize: '16px', color: '#fff',
                  }}>EduStruc</span>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: '200px',
                }}>
                  Empowering educators through secure, institutional-grade academic management.
                </p>
              </div>

              {/* Session Secured badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(0,120,80,0.25)',
                border: '1px solid rgba(111,255,190,0.35)',
                borderRadius: '999px',
                padding: '7px 14px',
                width: 'fit-content',
                marginTop: '24px',
              }}>
                <div style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%', background: '#6FFBBE',
                }}></div>
                <span style={{
                  fontSize: '12px', fontWeight: 600, color: '#6FFBBE',
                }}>Session Secured</span>
              </div>
            </div>

            {/* RIGHT — white */}
            <div style={{
              background: '#fff',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              {/* Logout icon box */}
              <div style={{
                width: '52px', height: '52px',
                background: '#EFF4FF',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#0051D5" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>

              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700, fontSize: '20px',
                color: '#0B1C30',
                margin: '0 0 12px',
              }}>
                Logged Out Securely
              </h2>

              <p style={{
                fontSize: '13px',
                color: '#45464D',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '230px',
              }}>
                You have been successfully signed out of the{' '}
                <strong style={{ color: '#0B1C30' }}>EduStruc Portal</strong>.
                {' '}Your active session data has been cleared from this browser.
              </p>
            </div>
          </div>

          {/* BOTTOM ROW — two cards same total width as top */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>

            {/* Return to Portal */}
            <div className="return-card"
              onClick={() => navigate('/teacher/login')}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}>
              <div style={{
                background: '#EFF4FF',
                borderRadius: '10px',
                padding: '8px',
                display: 'flex',
                flexShrink: 0,
              }}>
                <LogIn size={18} color="#0051D5" />
              </div>
              <div>
                <p style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700, fontSize: '14px',
                  color: '#0B1C30', margin: '0 0 3px',
                }}>Return to Portal</p>
                <p style={{
                  fontSize: '12px', color: '#76777D', margin: 0,
                }}>Sign back in as an educator</p>
              </div>
            </div>

            {/* Security Tip */}
            <div style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}>
              <div style={{
                background: '#F4F5F7',
                borderRadius: '10px',
                padding: '8px',
                display: 'flex',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <Shield size={16} color="#45464D" />
              </div>
              <div>
                <p style={{
                  fontSize: '10px', fontWeight: 700,
                  color: '#76777D', letterSpacing: '0.08em',
                  textTransform: 'uppercase', margin: '0 0 5px',
                }}>Security Tip</p>
                <p style={{
                  fontSize: '12px', color: '#45464D',
                  margin: 0, lineHeight: 1.6,
                }}>
                  If you are using a shared or public computer, we recommend closing all browser windows to fully protect your student data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        padding: '16px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '20px', marginBottom: '6px',
        }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((l, i) => (
            <a key={i} href="#" style={{
              fontSize: '12px', color: '#0051D5', textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#45464D', margin: 0 }}>
          © 2024 EduStruc Academic Systems. All rights reserved.
        </p>
      </footer>
    </div>
  );
}