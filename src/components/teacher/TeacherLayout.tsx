// src/components/teacher/TeacherLayout.tsx
// Shared layout for ALL teacher pages — sidebar + header with live avatar
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Camera
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
const API_BASE = import.meta.env.VITE_API_URL;

interface TeacherLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export default function TeacherLayout({ children, title, subtitle, headerRight }: TeacherLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = getSession();
  const photoRef  = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fullName,  setFullName]  = useState<string>(user?.full_name || '');

  // ── Load avatar from localStorage + API ───────
  useEffect(() => {
    // First load from localStorage for instant display
    const saved = localStorage.getItem('edustruc_avatar');
    if (saved) setAvatarUrl(saved);

    // Then fetch from API for latest
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/auth/profile/`);
        if (res.ok) {
          const data = await res.json();
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
            localStorage.setItem('edustruc_avatar', data.avatar_url);
          }
          if (data.full_name) setFullName(data.full_name);
        }
      } catch { /* use cached */ }
    };
    fetchProfile();

    // Listen for avatar changes (when settings page updates it)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'edustruc_avatar') setAvatarUrl(e.newValue || '');
      if (e.key === 'edustruc_name')   setFullName(e.newValue || '');
    };
    window.addEventListener('storage', onStorage);

    // Also poll localStorage every 2s for same-tab updates
    const interval = setInterval(() => {
      const cur = localStorage.getItem('edustruc_avatar');
      if (cur && cur !== avatarUrl) setAvatarUrl(cur);
      const name = localStorage.getItem('edustruc_name');
      if (name && name !== fullName) setFullName(name);
    }, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  // ── Quick avatar upload from header ───────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    localStorage.setItem('edustruc_avatar', localUrl);
    // Upload to server
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await apiFetch(`${API_BASE}/api/auth/avatar/`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        const url  = data.avatar_url || localUrl;
        setAvatarUrl(url);
        localStorage.setItem('edustruc_avatar', url);
      }
    } catch { /* keep local preview */ }
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side:hover { background: #003DAA !important; }
        .avatar-wrap { position: relative; cursor: pointer; border-radius: 50%; overflow: hidden; }
        .avatar-overlay { position: absolute; inset: 0; background: rgba(0,81,213,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease; border-radius: 50%; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────── */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }}
          onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: '#316BF3', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0B1C30', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: '#76777D', margin: 0 }}>ADMIN PORTAL</p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = location.pathname === item.path ||
              (item.path !== '/teacher/dashboard' && location.pathname.startsWith(item.path));
            return (
              <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: active ? '#fff' : '#45464D', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
                {item.icon} {item.label}
              </div>
            );
          })}

          <button className="add-btn-side" onClick={() => navigate('/teacher/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>

        {/* Bottom links */}
        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}>
            <HelpCircle size={15} /> Support
          </div>
          <div className="sidebar-bottom logout-btn"
            onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────── */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>

          {/* Left — title or custom content */}
          <div>
            {title && (
              <>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '19px', color: '#0B1C30', margin: 0 }}>{title}</h1>
                {subtitle && <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{subtitle}</p>}
              </>
            )}
          </div>

          {/* Right — custom content + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {headerRight}

            {/* Avatar — click to upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{fullName || user?.full_name || 'Teacher'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
              </div>

              {/* Avatar circle — real photo or initial */}
              <div className="avatar-wrap"
                style={{ width: '38px', height: '38px', background: avatarUrl ? 'transparent' : '#0051D5', border: avatarUrl ? '2px solid #DCE9FF' : 'none' }}
                onClick={() => photoRef.current?.click()}
                title="Click to change profile photo">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile"
                    style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                ) : (
                  <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#0051D5' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                      {(fullName || user?.full_name || 'T').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="avatar-overlay">
                  <Camera size={14} color="#fff" />
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 2px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}