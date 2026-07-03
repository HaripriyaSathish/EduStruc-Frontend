import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Bell,
  Shield, Camera, Save, ChevronRight, AlertTriangle,
  Check, X, Eye, EyeOff, Clock
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
const API_BASE = import.meta.env.VITE_API_URL;

interface UserProfile {
  full_name: string; email: string; job_title: string;
  phone: string; timezone: string; avatar_url: string;
}

export default function TeacherSettings() {
  const navigate  = useNavigate();
  const user      = getSession();
  const photoRef  = useRef<HTMLInputElement>(null);
  const pwRef     = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile,     setProfile]     = useState<UserProfile>({ full_name: '', email: '', job_title: '', phone: '', timezone: '', avatar_url: '' });
  const [avatarUrl,   setAvatarUrl]   = useState<string>('');
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [saveErr,     setSaveErr]     = useState('');

  // Visual Interface
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('edustruc_dark_mode') === 'true');
  const [compactRow,  setCompactRow]  = useState(false);
  const [accentColor, setAccentColor] = useState('#0051D5');

  // Notifications
  const [notif, setNotif] = useState({ assignments: true, messages: true, system: false });

  // Password modal
  const [pwModal,     setPwModal]     = useState(false);
  const [pwForm,      setPwForm]      = useState({ current: '', newPw: '', confirm: '' });
  const [showPw,      setShowPw]      = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwMsg,       setPwMsg]       = useState('');
  const [pwErr,       setPwErr]       = useState('');

  // 2FA
  const [twoFA,       setTwoFA]       = useState(false);
  const [twoFASaving, setTwoFASaving] = useState(false);
  const [twoFAMsg,    setTwoFAMsg]    = useState('');

  // Deactivate modal
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [deactivating,    setDeactivating]    = useState(false);

  // Last update timestamp
  const [lastUpdate, setLastUpdate] = useState('');

  // ── Theme (drives dark mode for this page) ────────
  const theme = darkMode ? {
    pageBg:    '#0B1220',
    cardBg:    '#131B2E',
    border:    '#2A3550',
    text:      '#F1F5F9',
    textMuted: '#94A3B8',
    inputBg:   '#0F172A',
    headerBg:  '#131B2E',
  } : {
    pageBg:    '#F8F9FF',
    cardBg:    '#FFFFFF',
    border:    '#C6C6CD',
    text:      '#0B1C30',
    textMuted: '#76777D',
    inputBg:   '#FFFFFF',
    headerBg:  '#FFFFFF',
  };

  // ── Toggle + persist dark mode ────────────────────
  const handleToggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('edustruc_dark_mode', String(next));
      return next;
    });
  };

  // ── Load profile ─────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/auth/profile/`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            full_name: data.full_name || '',
            email:     data.email     || '',
            job_title: data.job_title || '',
            phone:     data.phone     || '',
            timezone:  data.timezone  || 'UTC',
            avatar_url:data.avatar_url|| '',
          });
          setAvatarUrl(data.avatar_url || '');
          setTwoFA(data.two_fa_enabled || false);
          setLastUpdate(data.last_login || new Date().toISOString());
          // Persist avatar globally
          if (data.avatar_url) localStorage.setItem('edustruc_avatar', data.avatar_url);
        }
      } catch (e) { console.error(e); }
    };
    fetchProfile();
    const saved = localStorage.getItem('edustruc_avatar');
    if (saved) setAvatarUrl(saved);
  }, []);

  // ── Upload avatar ────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    localStorage.setItem('edustruc_avatar', localUrl);
    window.dispatchEvent(new CustomEvent('avatarChanged', { detail: localUrl }));
    // Upload to server
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/avatar/`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        const url  = data.avatar_url || localUrl;
        setAvatarUrl(url);
        localStorage.setItem('edustruc_avatar', url);
        window.dispatchEvent(new CustomEvent('avatarChanged', { detail: url }));
      }
    } catch { /* keep local preview */ }
  };

  // ── Save profile ─────────────────────────────────
  const handleSaveProfile = async () => {
    setSaveMsg(''); setSaveErr('');
    if (!profile.full_name || !profile.email) { setSaveErr('Full name and email are required.'); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/profile/`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ full_name: profile.full_name, email: profile.email, job_title: profile.job_title, phone: profile.phone, timezone: profile.timezone }),
      });
      if (res.ok) {
        setSaveMsg('Settings saved successfully!');
        setLastUpdate(new Date().toISOString());
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const d = await res.json();
        setSaveErr(Object.values(d).flat().join(' ') || 'Failed to save.');
      }
    } catch { setSaveErr('Cannot connect to server.'); }
    finally { setSaving(false); }
  };

  // ── Change password ──────────────────────────────
  const handleChangePassword = async () => {
    setPwMsg(''); setPwErr('');
    if (!pwForm.current)            { setPwErr('Current password is required.'); return; }
    if (pwForm.newPw.length < 8)    { setPwErr('New password must be at least 8 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwErr('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/change-password/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ current_password: pwForm.current, new_password: pwForm.newPw }),
      });
      if (res.ok) {
        setPwMsg('Password changed successfully!');
        setPwForm({ current: '', newPw: '', confirm: '' });
        setTimeout(() => { setPwModal(false); setPwMsg(''); }, 1800);
      } else {
        const d = await res.json();
        setPwErr(d.current_password?.[0] || d.new_password?.[0] || Object.values(d).flat().join(' ') || 'Failed to change password.');
      }
    } catch { setPwErr('Cannot connect to server.'); }
    finally { setPwSaving(false); }
  };

  // ── Toggle 2FA ───────────────────────────────────
  const handleToggle2FA = async () => {
    setTwoFASaving(true); setTwoFAMsg('');
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/toggle-2fa/`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setTwoFA(d.two_fa_enabled);
        setTwoFAMsg(d.two_fa_enabled ? '2FA enabled successfully.' : '2FA disabled.');
        setTimeout(() => setTwoFAMsg(''), 2500);
      }
    } catch { setTwoFAMsg('Failed to toggle 2FA.'); }
    finally { setTwoFASaving(false); }
  };

  // ── Deactivate portal ────────────────────────────
  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/deactivate/`, { method: 'POST' });
      if (res.ok) { logoutUser(); navigate('/teacher/logged-out'); }
    } catch { console.error('Deactivate failed'); }
    finally { setDeactivating(false); }
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: `1px solid ${theme.border}`,
    borderRadius: '8px', fontSize: '13px', color: theme.text,
    background: theme.inputBg, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s ease',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500, color: theme.textMuted,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };
  const cardStyle: React.CSSProperties = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: '12px',
  };

  const Toggle = ({ on, onToggle, loading }: { on: boolean; onToggle: () => void; loading?: boolean }) => (
    <button onClick={onToggle} disabled={loading}
      style={{ width: '44px', height: '24px', borderRadius: '999px', background: on ? '#0051D5' : '#C6C6CD', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0, opacity: loading ? 0.7 : 1 }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.pageBg, fontFamily: 'Inter, sans-serif', transition: 'background 0.2s ease' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side:hover { background: #003DAA !important; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .discard-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .pw-btn:hover { filter: brightness(0.97); }
        .deact-btn:hover { background: #FEE2E2 !important; border-color: #DC2626 !important; }
        .photo-wrap:hover .photo-overlay { opacity: 1 !important; }
        .color-swatch:hover { transform: scale(1.15); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal-box { border-radius: 16px; padding: 28px; width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>ADMIN PORTAL</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = window.location.pathname === item.path;
            return (
              <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: active ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
                {item.icon} {item.label}
              </div>
            );
          })}
          <button className="add-btn-side" onClick={() => navigate('/teacher/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}`, padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, transition: 'background 0.2s ease' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: theme.text, margin: 0 }}>System Settings</h1>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Manage your administrative profile, institution details, and system preferences.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: theme.text, margin: 0 }}>{profile.full_name || user?.full_name || 'Teacher'}</p>
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0 }}>Teacher</p>
            </div>
            {/* Avatar shown in header */}
            <div onClick={() => photoRef.current?.click()}
              className="photo-wrap"
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{(profile.full_name || user?.full_name || 'T').charAt(0).toUpperCase()}</span>}
              <div className="photo-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,81,213,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }}>
                <Camera size={14} color="#fff" />
              </div>
            </div>
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* ── PORTAL SETTINGS ───────────────────── */}
          <div style={{ ...cardStyle, padding: '28px', marginBottom: '20px', transition: 'background 0.2s ease, border-color 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: theme.text, margin: '0 0 4px' }}>Portal Settings</h2>
                <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>Manage your professional profile, notification triggers, and the aesthetic layout of your academic dashboard.</p>
              </div>
              <button className="save-btn" onClick={handleSaveProfile} disabled={saving}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', flexShrink: 0 }}>
                {saving
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Saving...</>
                  : <><Save size={14} /> Save All Changes</>}
              </button>
            </div>

            {/* Alerts */}
            {saveMsg && <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#059669', display: 'flex', gap: '8px' }}><Check size={14} />{saveMsg}</div>}
            {saveErr && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', display: 'flex', gap: '8px' }}><X size={14} />{saveErr}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>

              {/* Left — Profile form */}
              <div>
                {/* Avatar row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div className="photo-wrap" onClick={() => photoRef.current?.click()}
                    style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', flexShrink: 0, border: `3px solid ${theme.cardBg}` }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '24px', fontWeight: 700, color: '#0051D5' }}>{(profile.full_name || 'T').charAt(0).toUpperCase()}</span>}
                    <div className="photo-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,81,213,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }}>
                      <Camera size={18} color="#fff" />
                    </div>
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: theme.text, margin: '0 0 4px' }}>{profile.full_name || 'Your Name'}</p>
                    <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px' }}>Click photo to upload a new picture</p>
                    <button onClick={() => photoRef.current?.click()}
                      style={{ background: '#EFF4FF', border: '1px solid #DCE9FF', color: '#0051D5', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Profile fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input className="form-input" style={inputStyle} value={profile.full_name}
                      onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Academic Email</label>
                    <input className="form-input" style={inputStyle} type="email" value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <input className="form-input" style={inputStyle} value={profile.job_title}
                      placeholder="e.g. Advanced Physics & Quantum Mechanics"
                      onChange={e => setProfile(p => ({ ...p, job_title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Office Hours</label>
                    <input className="form-input" style={inputStyle} value={profile.phone}
                      placeholder="e.g. Mon, Wed 14:00 – 16:00"
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Right — Visual Interface dark card (this actually drives the page theme now) */}
              <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '20px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 8px' }}>Visual Interface</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Customize your portal density and color scheme to reduce eye strain during long grading sessions.
                </p>

                {/* Dark Mode — now functional */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Dark Mode</span>
                  <Toggle on={darkMode} onToggle={handleToggleDarkMode} />
                </div>

                {/* Compact Row Density */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Compact Row Density</span>
                  <Toggle on={compactRow} onToggle={() => setCompactRow(d => !d)} />
                </div>

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#0051D5','#009668','#DC2626'].map(c => (
                    <button key={c} className="color-swatch"
                      onClick={() => setAccentColor(c)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: accentColor === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease', outline: accentColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── NOTIFICATIONS + SECURITY ──────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* Notification Triggers */}
            <div style={{ ...cardStyle, padding: '24px', transition: 'background 0.2s ease, border-color 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: theme.text, margin: 0 }}>Notification Triggers</h3>
                </div>
                <span style={{ background: '#DCFCE7', color: '#059669', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>
                  {Object.values(notif).filter(Boolean).length * 3} Subscriptions Active
                </span>
              </div>
              {[
                { key: 'assignments', icon: '⭐', color: '#FEF3C7', label: 'Assignment Submissions', desc: 'Notify when 10+ students have submitted a pending task.' },
                { key: 'messages',   icon: '💬', color: '#DCFCE7',  label: 'Student Direct Messages', desc: 'Instant push notifications for urgent academic queries.' },
                { key: 'system',    icon: '⚙',  color: '#F0F4FF',  label: 'System & Curriculum Updates', desc: 'Stay informed about portal maintenance and school news.' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                    <div style={{ background: item.color, borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px', color: theme.text, margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                  <input type="checkbox"
                    checked={notif[item.key as keyof typeof notif]}
                    onChange={e => setNotif(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#0051D5', cursor: 'pointer', flexShrink: 0, marginTop: '4px' }} />
                </div>
              ))}
            </div>

            {/* Security Context */}
            <div style={{ ...cardStyle, padding: '24px', transition: 'background 0.2s ease, border-color 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Shield size={16} color="#0051D5" />
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: theme.text, margin: 0 }}>Security Context</h3>
              </div>

              {/* Change Password */}
              <button className="pw-btn" onClick={() => { setPwModal(true); setPwErr(''); setPwMsg(''); }}
                style={{ width: '100%', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#DCE9FF', borderRadius: '6px', padding: '6px', display: 'flex' }}>
                    <Shield size={14} color="#0051D5" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>Change Portal Password</span>
                </div>
                <ChevronRight size={16} color={theme.textMuted} />
              </button>

              {/* 2FA */}
              <div style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: twoFA ? '#DCFCE7' : '#F0F4FF', borderRadius: '6px', padding: '6px', display: 'flex' }}>
                    <Shield size={14} color={twoFA ? '#059669' : '#0051D5'} />
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text }}>Two-Factor Auth (2FA)</span>
                    {twoFAMsg && <p style={{ fontSize: '11px', color: '#059669', margin: '2px 0 0' }}>{twoFAMsg}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: twoFA ? '#DCFCE7' : '#FEE2E2', color: twoFA ? '#059669' : '#DC2626', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>
                    {twoFA ? 'Active' : 'Inactive'}
                  </span>
                  <Toggle on={twoFA} onToggle={handleToggle2FA} loading={twoFASaving} />
                </div>
              </div>

              {/* Dangerous Action */}
              <div style={{ background: darkMode ? '#2A1214' : '#FFF5F5', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={16} color="#DC2626" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: '#DC2626', margin: '0 0 2px' }}>Dangerous Action</p>
                    <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Delete Academic Portal Account</p>
                  </div>
                </div>
                <button onClick={() => setDeactivateModal(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '12px', fontWeight: 700, textDecoration: 'underline' }}>
                  Request Deletion
                </button>
              </div>
            </div>
          </div>

          {/* ── LAST UPDATE + ACTION BUTTONS ─────── */}
          <div style={{ ...cardStyle, padding: '16px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s ease, border-color 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textMuted }}>
              <Clock size={14} />
              <span style={{ fontSize: '12px' }}>
                Last account update: {lastUpdate ? new Date(lastUpdate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="discard-btn" onClick={() => window.location.reload()}
                style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                Discard
              </button>
              <button className="save-btn" onClick={handleSaveProfile} disabled={saving}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                {saving ? 'Saving...' : 'Update Settings'}
              </button>
            </div>
          </div>

          {/* ── ACCOUNT SECURITY MANAGEMENT ──────── */}
          <div style={{ background: theme.cardBg, border: '1px solid #FECACA', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#DC2626" />
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: theme.text, margin: '0 0 2px' }}>Account Security Management</p>
                <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>Manage higher-risk account permissions or deactivate administrative access.</p>
              </div>
            </div>
            <button className="deact-btn" onClick={() => setDeactivateModal(true)}
              style={{ background: theme.cardBg, border: '1px solid #DC2626', color: '#DC2626', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
              Deactivate Portal
            </button>
          </div>
        </main>

        <footer style={{ background: darkMode ? '#0F1830' : '#D3E4FE', borderTop: `1px solid ${theme.border}`, padding: '14px 48px', textAlign: 'center', transition: 'background 0.2s ease' }}>
          <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 2px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      {/* ── CHANGE PASSWORD MODAL ───────────────── */}
      {pwModal && (
        <div className="modal-overlay" onClick={() => setPwModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ background: theme.cardBg }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: theme.text, margin: 0 }}>Change Password</h3>
              <button onClick={() => setPwModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted }}><X size={18} /></button>
            </div>
            {pwMsg && <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '13px', color: '#059669', display: 'flex', gap: '6px' }}><Check size={14} />{pwMsg}</div>}
            {pwErr && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '13px', color: '#DC2626', display: 'flex', gap: '6px' }}><X size={14} />{pwErr}</div>}
            {[
              { label: 'Current Password', key: 'current', val: pwForm.current },
              { label: 'New Password',     key: 'newPw',   val: pwForm.newPw },
              { label: 'Confirm Password', key: 'confirm', val: pwForm.confirm },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px', position: 'relative' }}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type={showPw[f.key as keyof typeof showPw] ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '38px' }}
                  value={f.val}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  ref={f.key === 'current' ? pwRef : undefined}
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
                <button onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key as keyof typeof p] }))}
                  style={{ position: 'absolute', right: '10px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}>
                  {showPw[f.key as keyof typeof showPw] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setPwModal(false)}
                style={{ flex: 1, background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleChangePassword} disabled={pwSaving}
                style={{ flex: 2, background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {pwSaving
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Saving...</>
                  : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEACTIVATE MODAL ────────────────────── */}
      {deactivateModal && (
        <div className="modal-overlay" onClick={() => setDeactivateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ background: theme.cardBg }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#FEE2E2', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle size={24} color="#DC2626" />
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: theme.text, margin: '0 0 8px' }}>Deactivate Portal Access</h3>
              <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
                This will permanently deactivate your academic portal account. All your class data, grades, and schedules will be archived. This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeactivateModal(false)}
                style={{ flex: 1, background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeactivate} disabled={deactivating}
                style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {deactivating
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Deactivating...</>
                  : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}