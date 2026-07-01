import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { loginUser } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword]   = useState(false);
  const [keepSigned, setKeepSigned]       = useState(false);
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await loginUser(email, password, undefined, keepSigned);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        .login-btn:hover { background: #003DAA !important; }
        .login-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .input-field:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: '#F8F9FF', height: '64px', paddingLeft: '66px', paddingRight: '66px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #C6C6CD' }}>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B' }}>EduStruc</span>
      </nav>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #C6C6CD', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,81,213,0.08)' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: '#0051D5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#45464D', textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '32px' }}>Sign in to access your EduStruc dashboard</p>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#DC2626', fontSize: '16px', marginTop: '1px' }}>⚠</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Institutional Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input
                className="input-field"
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Security Password</label>
              <Link to="/forgot-password" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>Forgot Password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input
                className="input-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '40px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', padding: 0, display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Keep signed in */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <input type="checkbox" id="keepSigned" checked={keepSigned} onChange={e => setKeepSigned(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#0051D5', cursor: 'pointer' }} />
            <label htmlFor="keepSigned" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', cursor: 'pointer' }}>Keep me signed in on this device</label>
          </div>

          {/* Login Button */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', transition: 'background 0.2s ease' }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Logging in...
              </>
            ) : (
              <>Login to Portal <span style={{ fontSize: '16px' }}>→</span></>
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#C6C6CD' }}></div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>New to the system?</span>
            <div style={{ flex: 1, height: '1px', background: '#C6C6CD' }}></div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/get-started" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#316BF3', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Create Administrative Account <UserPlus size={15} />
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
          {['Help Center', 'Privacy Policy', 'Accessibility'].map((link, i) => (
            <a key={i} href="#" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#F8F9FF', borderTop: '1px solid #C6C6CD', height: '96px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', textAlign: 'center', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#C6C6CD', textAlign: 'center', margin: 0 }}>Secured by AES-256 Enterprise Encryption.</p>
      </footer>
    </div>
  );
}