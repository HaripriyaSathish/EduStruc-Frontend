import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Lock, Eye, EyeOff, ShieldCheck, BarChart2 } from 'lucide-react';
import { registerUser } from '../utils/auth';

export default function GetStarted() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [form, setForm] = useState({
    fullName: '', institutionName: '', email: '', password: ''
  });

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!form.fullName || !form.institutionName || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await registerUser({
      full_name: form.fullName,
      institution_name: form.institutionName,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EFF4FF', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        .reg-btn:hover:not(:disabled) { background: #003DAA !important; }
        .reg-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .input-field:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: '#EFF4FF', height: '64px', paddingLeft: '66px', paddingRight: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #C6C6CD' }}>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B' }}>EduStruc</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#374151', textDecoration: 'none' }}>Login</Link>
          <Link to="/login" style={{ background: '#0051D5', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none' }}>Request Demo</Link>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '860px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,81,213,0.12)' }}>

          {/* LEFT PANEL */}
          <div style={{ background: '#0051D5', padding: '48px 36px', width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#FFFFFF', lineHeight: 1.2, marginBottom: '20px' }}>Empowering Institutional Excellence.</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '32px' }}>
                Join hundreds of leading academic institutions worldwide. Manage students, curriculum, and faculty with surgical precision.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <ShieldCheck size={16} />, title: 'Security First', desc: 'Enterprise-grade data encryption.' },
                { icon: <BarChart2 size={16} />, title: 'Live Insights', desc: 'Real-time academic performance tracking.' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', marginTop: 0 }}>{item.title}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ background: '#FFFFFF', flex: 1, padding: '48px 40px' }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#45464D', marginBottom: '8px', marginTop: 0 }}>Create Admin Account</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', marginBottom: '24px' }}>Start your institution's digital transformation today.</p>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#DC2626' }}>⚠</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#059669' }}>✓</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#059669', margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Full Name + Institution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Full Name', icon: <User size={14} />, key: 'fullName', placeholder: 'Jane Doe', type: 'text' },
                { label: 'Institution Name', icon: <Building2 size={14} />, key: 'institutionName', placeholder: 'Global Academy', type: 'text' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }}>{field.icon}</div>
                    <input className="input-field" type={field.type} placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', outline: 'none', boxSizing: 'border-box', background: '#FEFCFF', transition: 'border-color 0.2s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px' }}>Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
                <input className="input-field" type="email" placeholder="jane.doe@institution.edu"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', outline: 'none', boxSizing: 'border-box', background: '#FEFCFF', transition: 'border-color 0.2s ease' }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
                <input className="input-field" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', paddingLeft: '32px', paddingRight: '36px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', outline: 'none', boxSizing: 'border-box', background: '#FEFCFF', transition: 'border-color 0.2s ease' }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', padding: 0 }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#0051D5', cursor: 'pointer', flexShrink: 0 }} />
              <label htmlFor="terms" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', cursor: 'pointer' }}>
                I agree to the <a href="#" style={{ color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a> and <a href="#" style={{ color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>.
              </label>
            </div>

            {/* Register Button */}
            <button className="reg-btn" onClick={handleRegister} disabled={loading}
              style={{ width: '100%', background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', transition: 'background 0.2s ease' }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creating account...
                </>
              ) : <>Register Institution <span style={{ fontSize: '16px' }}>→</span></>}
            </button>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', textAlign: 'center', margin: 0 }}>
              Already have an account? <Link to="/login" style={{ color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>Login here</Link>
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#EFF4FF', borderTop: '1px solid #C6C6CD', padding: '24px 66px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link, i) => (
            <a key={i} href="#" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9CA3AF', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}