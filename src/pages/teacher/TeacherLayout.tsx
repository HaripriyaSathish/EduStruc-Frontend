// src/components/teacher/TeacherLayout.tsx
// Shared layout for ALL teacher pages — sidebar + header
// Add Attendance here once and it appears everywhere

import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  ClipboardList, Settings, Plus, HelpCircle,
  LogOut, GraduationCap
} from 'lucide-react';
import { getSession, logoutUser } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Props {
  title:       string;
  subtitle?:   string;
  headerRight?: React.ReactNode;
  children:    React.ReactNode;
}

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/teacher/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/teacher/students' },
  { icon: <BookOpen size={16} />,        label: 'Class',      path: '/teacher/classes' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/teacher/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/teacher/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/teacher/settings' },
];

export default function TeacherLayout({ title, subtitle, headerRight, children }: Props) {
  const navigate = useNavigate();
  const user     = getSession();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 12px; font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 400; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; color: #fff; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; color: #fff !important; font-weight: 600 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side { background: #003EA8; border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 16px; width: 100%; transition: all 0.2s ease; }
        .add-btn-side:hover { background: #003DAA !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }}
          onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>TEACHER PORTAL</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item, i) => {
            const active = window.location.pathname === item.path ||
              (item.path !== '/teacher/dashboard' && window.location.pathname.startsWith(item.path));
            return (
              <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}>
                {item.icon} {item.label}
              </div>
            );
          })}
          <button className="add-btn-side" onClick={() => navigate('/teacher/students/new')}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}>
            <HelpCircle size={15} /> Support
          </div>
          <div className="sidebar-bottom logout-btn"
            onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {headerRight}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/teacher/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        {/* Page content */}
        {children}

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}