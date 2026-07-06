import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  HelpCircle, LogOut, GraduationCap, ClipboardList, Search
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader } from '../utils/auth';
const API_BASE = import.meta.env.VITE_API_URL;

interface TeacherListItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_base64: string | null;
  employee_id: string;
  department: string;
  designation: string;
  subjects_count: number;
  grades_handled: string[];
}

const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <GraduationCap size={16} />,   label: 'Teachers',   path: '/teachers' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];

export default function Teachers() {
  const navigate = useNavigate();
  const user = getSession();
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/teachers/`, { headers: { ...getAuthHeader() } });
        if (res.ok) setTeachers(await res.json());
      } catch (e) {
        console.error('Teachers fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filtered = teachers.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; color: #fff !important; }
        .teacher-card { transition: all 0.25s ease; cursor: pointer; }
        .teacher-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,81,213,0.15) !important; border-color: #0051D5 !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
          <div style={{ background: '#316BF3', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0B1C30', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: '#76777D', margin: 0, letterSpacing: '0.06em' }}>ADMIN PORTAL</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <div key={i}
              className={`nav-item ${item.label === 'Teachers' ? 'nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: item.label === 'Teachers' ? '#fff' : '#45464D', fontSize: '14px', fontWeight: item.label === 'Teachers' ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}>
            <HelpCircle size={15} /> Support
          </div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Teachers</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>All faculty members in your institution</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', outline: 'none', width: '240px' }}
            />
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>
          {loading ? (
            <p style={{ color: '#76777D', fontSize: '14px' }}>Loading teachers...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#76777D', fontSize: '14px' }}>No teachers found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filtered.map(t => (
                <div key={t.id} className="teacher-card"
                  onClick={() => navigate(`/teachers/${t.id}`)}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {t.avatar_base64
                        ? <img src={t.avatar_base64} alt={t.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: '#0051D5', fontWeight: 700, fontSize: '16px' }}>{t.full_name?.charAt(0) || '?'}</span>}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>{t.full_name}</p>
                      <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{t.designation || 'Teacher'}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#45464D', margin: '0 0 8px' }}>{t.department || 'Department not set'}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#DCE9FF', color: '#0051D5', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px' }}>
                      {t.subjects_count} subject{t.subjects_count === 1 ? '' : 's'}
                    </span>
                    {t.grades_handled.slice(0, 3).map((g, i) => (
                      <span key={i} style={{ background: '#D1FAE5', color: '#009668', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px' }}>{g}</span>
                    ))}
                    {t.grades_handled.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#76777D' }}>+{t.grades_handled.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}