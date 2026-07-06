import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginUser } from '../../utils/auth';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const result = await loginUser(email, password, 'teacher');
      if (result.success) {
        if (remember) localStorage.setItem('edustruc_remember', 'true');
        navigate('/teacher/dashboard');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; outline: none; }
        .signin-btn { transition: all 0.2s ease; }
        .signin-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,81,213,0.35); }
        .signin-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .request-btn { transition: all 0.2s ease; }
        .request-btn:hover { background: #EFF4FF !important; border-color: #0051D5 !important; }
        .footer-link { transition: color 0.15s ease; }
        .footer-link:hover { color: #0051D5 !important; }
        .forgot-link:hover { color: #003DAA !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .card { animation: fadeUp 0.4s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Navbar */}
      <nav style={{ height: '60px', padding: '0 48px', display: 'flex', alignItems: 'center', background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ background: '#0051D5', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#0B1C30' }}>EduStruc</span>
        </Link>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="card" style={{ background: '#fff', borderRadius: '16px', padding: '36px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,81,213,0.10)', border: '1px solid #E5E7EB' }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#0051D5', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={26} color="#fff" />
            </div>
          </div>

          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', textAlign: 'center', margin: '0 0 6px' }}>Teacher Login</h1>
          <p style={{ fontSize: '13px', color: '#76777D', textAlign: 'center', margin: '0 0 28px' }}>Welcome back, please sign in to your portal.</p>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="form-input" type="email"
                placeholder="e.g., prof.name@edustruc.edu"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', background: '#F8F9FF', boxSizing: 'border-box', transition: 'all 0.2s ease' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <Link to="/teacher/forgot-password" className="forgot-link" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s ease' }}>
                 Forgot?
               </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="form-input" type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '10px 36px 10px 34px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', background: '#F8F9FF', boxSizing: 'border-box', transition: 'all 0.2s ease' }} />
              <button onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', display: 'flex', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div onClick={() => setRemember(v => !v)}
              style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${remember ? '#0051D5' : '#C6C6CD'}`, background: remember ? '#0051D5' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}>
              {remember && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: '13px', color: '#45464D', cursor: 'pointer', userSelect: 'none' }} onClick={() => setRemember(v => !v)}>
              Stay signed in on this device
            </span>
          </div>

          {/* Sign in button */}
          <button className="signin-btn" onClick={handleLogin} disabled={loading}
            style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', transition: 'all 0.2s ease' }}>
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in...
              </>
            ) : (
              <>Sign into Portal <ArrowRight size={15} /></>
            )}
          </button>

          {/* Divider */}
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#76777D', marginBottom: '12px' }}>
            Don't have an account?
          </div>

          {/* Request Access */}
          <button className="request-btn"
            onClick={() => navigate('/get-started')}
            style={{ width: '100%', background: '#fff', border: '1px solid #0051D5', color: '#0051D5', borderRadius: '8px', padding: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            Request Access
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '20px 48px', textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '6px' }}>
          {['Help Center', 'Privacy Policy', 'Accessibility'].map((l, i) => (
            <a key={i} href="#" className="footer-link"
              style={{ fontSize: '13px', color: '#45464D', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>
          © 2024 EduStruc Academic Systems. All rights reserved.
        </p>
        <p style={{ fontSize: '11px', color: '#C6C6CD', margin: '4px 0 0' }}>
          Secured by AES-256 Enterprise Encryption
        </p>
      </footer>
    </div>
  );
}