import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ChevronRight,
  Shield, Bell, AlertTriangle, Upload, User, Building,
  Check, Eye, EyeOff, X, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
import { broadcastAvatarChange } from '../hooks/useAvatar';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

const TIMEZONES = [
  'Eastern Standard Time (GMT-5)',
  'Central Standard Time (GMT-6)',
  'Mountain Standard Time (GMT-7)',
  'Pacific Standard Time (GMT-8)',
  'UTC (GMT+0)',
  'Indian Standard Time (GMT+5:30)',
  'China Standard Time (GMT+8)',
];

export default function SystemSettings() {
  const navigate  = useNavigate();
  const user      = getSession();
  const logoRef   = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [activeNav, setActiveNav]       = useState('Settings');
  const [saving, setSaving]             = useState(false);
  const [savedMsg, setSavedMsg]         = useState('');
  const [errorMsg, setErrorMsg]         = useState('');
  const [twoFA, setTwoFA]               = useState(false);
  const [togglingFA, setTogglingFA]     = useState(false);
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showPwModal, setShowPwModal]   = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [profile, setProfile] = useState({
    fullName:    user?.full_name        || '',
    email:       user?.email            || '',
    phone:       user?.phone            || '',
    jobTitle:    '',
    institution: user?.institution_name || '',
    timezone:    'Eastern Standard Time (GMT-5)',
  });

  const [notifications, setNotifications] = useState({
    enrollmentAlerts:  true,
    gradeSubmissions:  false,
    systemMaintenance: true,
    scheduleConflicts: true,
  });

  // Password change state
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Deactivate state
  const [deactivatePass, setDeactivatePass]     = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError]   = useState('');

  // Load profile from backend on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/auth/profile/`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullName:    data.full_name        || '',
            email:       data.email            || '',
            phone:       data.phone            || '',
            jobTitle:    data.job_title        || '',
            institution: data.institution_name || '',
            timezone:    data.timezone         || 'Eastern Standard Time (GMT-5)',
          });
          setTwoFA(data.two_fa_enabled || false);
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
            // Keep the shared avatar broadcast in sync on load too, in case
            // it drifted (e.g. uploaded from a different device/session).
            broadcastAvatarChange(data.avatar_url);
          }
        }
      } catch (e) { console.error('Load profile error:', e); }
    };
    loadProfile();
  }, []);

  const setP = (k: string, v: string) => setProfile(prev => ({ ...prev, [k]: v }));

  // ── Save Profile ──────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/profile/`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          full_name:        profile.fullName,
          email:            profile.email,
          phone:            profile.phone,
          job_title:        profile.jobTitle,
          institution_name: profile.institution,
          timezone:         profile.timezone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update localStorage session
        const currentSession = getSession();
        if (currentSession) {
          localStorage.setItem('edustruc_user', JSON.stringify({ ...currentSession, ...data.user }));
        }
        setSavedMsg('Profile saved successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
      } else {
        const err = await res.json();
        setErrorMsg(Object.values(err).flat().join(' ') || 'Failed to save.');
      }
    } catch {
      setErrorMsg('Cannot connect to server.');
    } finally {
      setSaving(false);
    }
  };

  // ── Upload Avatar ─────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrorMsg('Avatar must be under 2MB'); return; }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiFetch(`${API_BASE}/api/auth/avatar/`, {
        method: 'POST',
        body:   formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatar_url);
        // Update session with new avatar
        const currentSession = getSession();
        if (currentSession) {
          localStorage.setItem('edustruc_user', JSON.stringify({ ...currentSession, avatar_url: data.avatar_url }));
        }
        // Broadcast to every page using <AvatarCircle /> (sidebar, headers, etc.)
        broadcastAvatarChange(data.avatar_url);
        setSavedMsg('Avatar updated!');
        setTimeout(() => setSavedMsg(''), 2000);
      } else {
        setErrorMsg('Failed to upload avatar.');
      }
    } catch {
      setErrorMsg('Cannot connect to server.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Toggle 2FA ────────────────────────────────────────
  const handleToggle2FA = async () => {
    setTogglingFA(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/toggle-2fa/`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTwoFA(data.two_fa_enabled);
        setSavedMsg(data.message);
        setTimeout(() => setSavedMsg(''), 2000);
      }
    } catch {
      setErrorMsg('Failed to toggle 2FA.');
    } finally {
      setTogglingFA(false);
    }
  };

  // ── Change Password ───────────────────────────────────
  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    if (!pw.current || !pw.newPw) { setPwError('Fill in all fields.'); return; }
    if (pw.newPw !== pw.confirm)  { setPwError('Passwords do not match.'); return; }
    if (pw.newPw.length < 6)      { setPwError('New password must be at least 6 characters.'); return; }

    setPwLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/change-password/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ current_password: pw.current, new_password: pw.newPw }),
      });
      if (res.ok) {
        setPwSuccess('Password changed successfully!');
        setPw({ current: '', newPw: '', confirm: '' });
        setTimeout(() => { setShowPwModal(false); setPwSuccess(''); }, 2000);
      } else {
        const data = await res.json();
        setPwError(data.error || 'Failed to change password.');
      }
    } catch {
      setPwError('Cannot connect to server.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Deactivate Account ────────────────────────────────
  const handleDeactivate = async () => {
    setDeactivateError('');
    if (!deactivatePass) { setDeactivateError('Enter your password to confirm.'); return; }
    setDeactivateLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/deactivate/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: deactivatePass }),
      });
      if (res.ok) {
        logoutUser();
        navigate('/login');
      } else {
        const data = await res.json();
        setDeactivateError(data.error || 'Failed to deactivate.');
      }
    } catch {
      setDeactivateError('Cannot connect to server.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const toggleNotif = (k: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [k]: !prev[k] }));

  const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s ease',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px',
    color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn:hover { background: #003DAA !important; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .save-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .security-row { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; padding: 10px 12px; }
        .security-row:hover { background: #F0F7FF !important; }
        .notif-row { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; padding: 10px 4px; display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
        .notif-row:hover { background: #F8FAFF; }
        .upload-zone { transition: all 0.2s ease; }
        .upload-zone:hover { border-color: #0051D5 !important; background: #F0F7FF !important; cursor: pointer; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .deactivate-btn:hover { background: #BA1A1A !important; color: #fff !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .toast { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0, letterSpacing: '0.06em' }}>ADMIN PORTAL</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <div key={i} className={`nav-item ${activeNav === item.label ? 'nav-item-active' : ''}`}
              onClick={() => { setActiveNav(item.label); navigate(item.path); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: activeNav === item.label ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: activeNav === item.label ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>
          ))}
          <button className="add-btn" onClick={() => navigate('/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}>
  <HelpCircle size={15} /> Support
</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>System Settings</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage your administrative profile, institution details, and system preferences.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{profile.fullName || user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        {/* Toasts */}
        {savedMsg && (
          <div className="toast" style={{ margin: '12px 32px 0', background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={15} color="#059669" />
            <p style={{ fontSize: '13px', color: '#059669', margin: 0, fontWeight: 500 }}>{savedMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="toast" style={{ margin: '12px 32px 0', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="#DC2626" />
            <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 0, display: 'flex' }}><X size={14} /></button>
          </div>
        )}

        {/* Content */}
        <main style={{ padding: '20px 32px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Profile Settings */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#0051D5" />
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Profile Settings</h2>
                  </div>
                  <button className="save-btn" onClick={handleSave} disabled={saving}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                    {saving ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Saving...</>
                    ) : 'Save Changes'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div className="avatar-wrap" style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }} onClick={() => avatarRef.current?.click()}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#0051D5' }}>
                          {(profile.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: 'rgba(0,81,213,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }}>
                        {avatarUploading ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
                        ) : <Upload size={18} color="#fff" />}
                      </div>
                    </div>
                    <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    <button onClick={() => avatarRef.current?.click()}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#0051D5', fontWeight: 500, padding: 0, textDecoration: 'underline' }}>
                      Change Avatar
                    </button>
                  </div>

                  {/* Fields */}
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input className="form-input" style={inputStyle} value={profile.fullName} onChange={e => setP('fullName', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input className="form-input" style={inputStyle} type="email" value={profile.email} onChange={e => setP('email', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input className="form-input" style={inputStyle} value={profile.phone} onChange={e => setP('phone', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Job Title</label>
                      <input className="form-input" style={inputStyle} value={profile.jobTitle} onChange={e => setP('jobTitle', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Institution Preferences */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Building size={16} color="#0051D5" />
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Institution Preferences</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Institution Name</label>
                      <input className="form-input" style={inputStyle} value={profile.institution} onChange={e => setP('institution', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Primary Timezone</label>
                      <select className="form-input" style={inputStyle} value={profile.timezone} onChange={e => setP('timezone', e.target.value)}>
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Institution Logo <span style={{ color: '#76777D', fontWeight: 400 }}>(PNG/SVG, max 2MB)</span></label>
                    <div className="upload-zone" onClick={() => logoRef.current?.click()}
                      style={{ border: '2px dashed #C6C6CD', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '110px', transition: 'all 0.2s ease', background: '#F8F9FF' }}>
                      {logoFile ? (
                        <>
                          <div style={{ background: '#DCE9FF', borderRadius: '8px', padding: '8px', display: 'flex' }}><Building size={18} color="#0051D5" /></div>
                          <p style={{ fontSize: '12px', fontWeight: 500, color: '#0B1C30', margin: 0, textAlign: 'center', wordBreak: 'break-all' }}>{logoFile.name}</p>
                          <p style={{ fontSize: '11px', color: '#059669', margin: 0 }}>✓ Uploaded</p>
                        </>
                      ) : (
                        <>
                          <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}><Upload size={18} color="#76777D" /></div>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>Click to upload brand logo</p>
                          <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>PNG or SVG, Max 2MB</p>
                        </>
                      )}
                      <input ref={logoRef} type="file" accept=".png,.svg" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 2*1024*1024) setLogoFile(f); else if (f) setErrorMsg('Logo must be under 2MB'); }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security Warning */}
              <div style={{ background: '#FFF8F8', border: '1px solid #FECACA', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <AlertTriangle size={18} color="#BA1A1A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#BA1A1A', margin: '0 0 2px' }}>Account Security Management</p>
                    <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>Manage higher-risk account permissions or deactivate administrative access.</p>
                  </div>
                </div>
                <button className="deactivate-btn" onClick={() => setShowDeactivateModal(true)}
                  style={{ background: '#fff', border: '1px solid #BA1A1A', color: '#BA1A1A', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease', flexShrink: 0 }}>
                  Deactivate Portal
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Security */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Shield size={16} color="#0051D5" />
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Security</h2>
                </div>

                {/* Change Password row */}
                <div className="security-row" onClick={() => setShowPwModal(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                      <Shield size={14} color="#0051D5" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>Change Password</p>
                      <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Last changed 4 months ago</p>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#76777D" />
                </div>

                {/* 2FA */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#DCE9FF', borderRadius: '6px', padding: '6px', display: 'flex' }}>
                        <Shield size={13} color="#0051D5" />
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>2FA Authentication</p>
                    </div>
                    {/* Real toggle */}
                    <button onClick={handleToggle2FA} disabled={togglingFA}
                      style={{ width: '40px', height: '22px', borderRadius: '999px', background: twoFA ? '#0051D5' : '#C6C6CD', border: 'none', cursor: togglingFA ? 'not-allowed' : 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0, opacity: togglingFA ? 0.7 : 1 }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: twoFA ? '21px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#76777D', margin: 0, lineHeight: 1.5 }}>
                    Two-factor authentication adds an extra layer of security to your admin account.
                  </p>
                  {twoFA && <p style={{ fontSize: '11px', color: '#059669', margin: '6px 0 0', fontWeight: 500 }}>✓ 2FA is currently enabled</p>}
                </div>
              </div>

              {/* Notifications */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Bell size={16} color="#0051D5" />
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Notifications</h2>
                </div>
                {[
                  { key: 'enrollmentAlerts',  label: 'Enrollment Alerts',   desc: 'Notify when a new student enrolls' },
                  { key: 'gradeSubmissions',  label: 'Grade Submissions',    desc: 'Weekly digest of student performance' },
                  { key: 'systemMaintenance', label: 'System Maintenance',   desc: 'Critical platform updates and downtime' },
                  { key: 'scheduleConflicts', label: 'Schedule Conflicts',   desc: 'Real-time alerts for faculty overlaps' },
                ].map((item) => (
                  <div key={item.key} className="notif-row" onClick={() => toggleNotif(item.key as keyof typeof notifications)}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{item.desc}</p>
                    </div>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: notifications[item.key as keyof typeof notifications] ? '#0051D5' : '#fff', border: `2px solid ${notifications[item.key as keyof typeof notifications] ? '#0051D5' : '#C6C6CD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease', marginTop: '2px' }}>
                      {notifications[item.key as keyof typeof notifications] && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 2px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      {/* ── CHANGE PASSWORD MODAL ─────────────────────── */}
      {showPwModal && (
        <div className="modal-overlay" onClick={() => setShowPwModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: 0 }}>Change Password</h3>
              <button onClick={() => setShowPwModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex' }}><X size={18} /></button>
            </div>

            {pwError   && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>{pwError}</div>}
            {pwSuccess && <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#059669' }}>{pwSuccess}</div>}

            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password',     key: 'newPw' },
              { label: 'Confirm Password', key: 'confirm' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw[field.key as keyof typeof showPw] ? 'text' : 'password'}
                    className="form-input"
                    value={pw[field.key as keyof typeof pw]}
                    onChange={e => setPw(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: '36px' }} placeholder="••••••••" />
                  <button onClick={() => setShowPw(prev => ({ ...prev, [field.key]: !prev[field.key as keyof typeof showPw] }))}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', display: 'flex', padding: 0 }}>
                    {showPw[field.key as keyof typeof showPw] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => setShowPwModal(false)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleChangePassword} disabled={pwLoading}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: pwLoading ? 0.7 : 1 }}>
                {pwLoading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEACTIVATE MODAL ─────────────────────────── */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FEE2E2', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <AlertTriangle size={18} color="#BA1A1A" />
                </div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#BA1A1A', margin: 0 }}>Deactivate Portal</h3>
              </div>
              <button onClick={() => setShowDeactivateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: '#45464D', marginBottom: '20px', lineHeight: 1.6 }}>
              This will <strong>deactivate your admin account</strong> and log you out immediately. This action cannot be undone without contacting system support.
            </p>

            {deactivateError && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>{deactivateError}</div>}

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Enter your password to confirm</label>
              <input type="password" className="form-input" style={inputStyle} placeholder="••••••••"
                value={deactivatePass} onChange={e => setDeactivatePass(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeactivateModal(false)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeactivate} disabled={deactivateLoading}
                style={{ background: '#BA1A1A', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: deactivateLoading ? 0.7 : 1 }}>
                {deactivateLoading ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}