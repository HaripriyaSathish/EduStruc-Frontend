import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, Search, ChevronRight,
  GraduationCap, BarChart3, UserCheck, X, Bell, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

interface Stats {
  total_students:   number;
  active_courses:   number;
  active_schedules: number;
  faculty_members:  number;
  attendance:       number;
}

interface SearchResult {
  type:  string;
  label: string;
  path:  string;
}

interface NotificationItem {
  id:         number;
  title:      string;
  message:    string;
  type:       string;
  link:       string | null;
  is_read:    boolean;
  created_at: string;
}

const roleLabel: Record<string, string> = {
  admin:   'Super Admin',
  teacher: 'Faculty Member',
  parent:  'Parent',
};

// All searchable pages and actions
const allSearchItems: SearchResult[] = [
  { type: 'Page',   label: 'Dashboard',         path: '/dashboard' },
  { type: 'Page',   label: 'Student Directory',  path: '/students' },
  { type: 'Page',   label: 'Course Management',  path: '/courses' },
  { type: 'Page',   label: 'Academic Schedules', path: '/schedules' },
  { type: 'Page',   label: 'System Settings',    path: '/settings' },
  { type: 'Action', label: 'Add New Student',    path: '/students/new' },
  { type: 'Action', label: 'Create New Course',  path: '/courses/new' },
  { type: 'Action', label: 'Generate Report',    path: '/reports' },
];

const timeAgo = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = getSession();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<Stats>({
    total_students: 0, active_courses: 0,
    active_schedules: 0, faculty_members: 0, attendance: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch]     = useState(false);
  const [activeNav, setActiveNav]       = useState('Dashboard');

  // ── Notifications ─────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/notifications/`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.results);
        setUnreadCount(data.unread_count);
      }
    } catch (e) {
      console.error('Notifications fetch error:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      try {
        await apiFetch(`${API_BASE}/api/notifications/${n.id}/read/`, { method: 'POST' });
        setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, is_read: true } : p));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) { console.error(e); }
    }
    setShowNotifs(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/read-all/`, { method: 'POST' });
      setNotifications(prev => prev.map(p => ({ ...p, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  // ── Fetch real stats ──────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/students/stats/`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error('Stats fetch error:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // ── Live search ───────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allSearchItems.filter(item =>
      item.label.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
    setShowSearch(true);
  }, [searchQuery]);

  // ── Close search / notifications on outside click ────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (path: string) => {
    setSearchQuery('');
    setShowSearch(false);
    navigate(path);
  };

  const handleNavClick = (label: string, path: string) => {
    setActiveNav(label);
    navigate(path);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // ── Stat cards ────────────────────────────────────────
  const statCards = [
    {
      icon: <Users size={20} />, label: 'TOTAL STUDENTS',
      value: loadingStats ? '...' : stats.total_students.toString(),
      extra: <span style={{ background: '#D1FAE5', color: '#009668', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>+Live</span>,
      color: '#0051D5', bg: '#DCE9FF', onClick: () => navigate('/students'),
    },
    {
      icon: <BookOpen size={20} />, label: 'ACTIVE COURSES',
      value: loadingStats ? '...' : stats.active_courses.toString(),
      extra: <span style={{ background: '#DCE9FF', color: '#0051D5', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px' }}>Current Semester</span>,
      color: '#0051D5', bg: '#DCE9FF', onClick: () => navigate('/courses'),
    },
    {
      icon: <UserCheck size={20} />, label: 'AVERAGE ATTENDANCE',
      value: loadingStats ? '...' : `${stats.attendance}%`,
      extra: (
        <div style={{ width: '48px', height: '4px', background: '#E5E7EB', borderRadius: '999px' }}>
          <div style={{ width: `${stats.attendance}%`, height: '4px', background: '#009668', borderRadius: '999px' }}></div>
        </div>
      ),
      color: '#009668', bg: '#D1FAE5', onClick: () => navigate('/schedules'),
    },
    {
      icon: <GraduationCap size={20} />, label: 'FACULTY MEMBERS',
      value: loadingStats ? '...' : stats.faculty_members.toString(),
      extra: null,
      color: '#0051D5', bg: '#DCE9FF', onClick: () => navigate('/settings'),
    },
  ];

  const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];
  const quickActions = [
    { icon: <Users size={16} />,    label: 'Add Student',    path: '/students/new' },
    { icon: <BookOpen size={16} />, label: 'Create Course',  path: '/courses/new' },
    { icon: <BarChart3 size={16} />, label: 'Generate Report', path: '/reports' },
  ];

  const activities = [
    { avatar: '👩', name: 'New Enrollment: Sarah Miller',           desc: 'Enrolled in "Advanced Quantitative Economics" - Group B',               time: '2 mins ago',   tags: ['Verified', 'Academic Year 2024'], action: null,            actionPath: null },
    { avatar: '📅', name: 'Schedule Update: Math 301',              desc: "Classroom shifted from Lab 4 to Auditorium A for tomorrow's lecture.",   time: '45 mins ago',  tags: [],                                 action: null,            actionPath: null },
    { avatar: '👨‍🏫', name: 'Grade Submission: Prof. Arthur Thorne', desc: 'Final grades for "Architectural History" have been submitted for review.', time: '2 hours ago', tags: [],                                 action: 'Approve Grades', actionPath: '/students' },
  ];

  const perfData = [
    { label: 'Eng',  h: 55, color: '#C7D7F8' },
    { label: 'Math', h: 68, color: '#A8BEF0' },
    { label: 'Sci',  h: 88, color: '#0051D5' },
    { label: 'Arts', h: 62, color: '#B8CBF5' },
    { label: 'Hist', h: 72, color: '#9EB8F0' },
    { label: 'Tech', h: 50, color: '#D4E1FA' },
  ];

  const notifIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return '👤';
      case 'schedule':   return '📅';
      case 'grade':      return '📝';
      case 'alert':      return '⚠️';
      default:           return '🔔';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .stat-card { transition: all 0.25s ease; cursor: pointer; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,81,213,0.15) !important; border-color: #0051D5 !important; }
        .action-row { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; }
        .action-row:hover { background: #F0F7FF !important; border-color: #0051D5 !important; }
        .activity-item { transition: background 0.2s ease; border-radius: 8px; }
        .activity-item:hover { background: #F8FAFF !important; }
        .add-btn { transition: all 0.2s ease; }
        .add-btn:hover { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .approve-btn { transition: all 0.2s ease; }
        .approve-btn:hover { background: #0051D5 !important; color: #fff !important; }
        .review-btn { transition: all 0.2s ease; }
        .review-btn:hover { background: rgba(255,255,255,0.25) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; color: #fff !important; }
        .perf-bar { transition: opacity 0.2s ease; cursor: pointer; }
        .perf-bar:hover { opacity: 0.75; }
        .search-result-item:hover { background: #F0F7FF !important; }
        .footer-link:hover { color: #003DAA !important; }
        .view-all:hover { text-decoration: underline !important; }
        .notif-item:hover { background: #F8FAFF !important; }
        .mark-all-link:hover { text-decoration: underline !important; }
        .bell-btn:hover { background: #F0F4FF !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .search-dropdown { animation: fadeIn 0.15s ease; }
        .notif-dropdown { animation: fadeIn 0.15s ease; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0, letterSpacing: '0.06em' }}>ADMIN PORTAL</p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <div key={i}
              className={`nav-item ${activeNav === item.label ? 'nav-item-active' : ''}`}
              onClick={() => handleNavClick(item.label, item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: activeNav === item.label ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: activeNav === item.label ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>
          ))}

          {/* Add New Student button */}
          <button className="add-btn"
            onClick={() => navigate('/students/new')}
            style={{ background: '#0042AA', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>

        {/* Bottom items */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}>
  <HelpCircle size={15} /> Support
</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Nav */}
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Dashboard Overview</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
              Welcome back, {user?.full_name || 'Admin'}. Here's what's happening today.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Live Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', zIndex: 1 }} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearch(true)}
                style={{ paddingLeft: '32px', paddingRight: searchQuery ? '32px' : '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', outline: 'none', width: '220px', transition: 'all 0.2s ease', borderColor: searchQuery ? '#0051D5' : '#C6C6CD' }}
              />
              {/* Clear button */}
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', padding: 0, display: 'flex' }}>
                  <X size={14} />
                </button>
              )}

              {/* Search dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                  {searchResults.map((item, i) => (
                    <div key={i} className="search-result-item"
                      onClick={() => handleSearchSelect(item.path)}
                      style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < searchResults.length - 1 ? '1px solid #F0F4FF' : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#0B1C30', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '11px', color: '#0051D5', background: '#DCE9FF', padding: '2px 8px', borderRadius: '4px' }}>{item.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {showSearch && searchQuery && searchResults.length === 0 && (
                <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, padding: '12px 14px' }}>
                  <p style={{ fontSize: '13px', color: '#76777D', margin: 0, textAlign: 'center' }}>No results for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Notification bell — real dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="bell-btn" onClick={() => setShowNotifs(s => !s)}
                style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', borderRadius: '8px', padding: '6px', display: 'flex', transition: 'background 0.2s ease' }}>
                <Bell size={18} color="#76777D" />
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '2px', right: '2px', minWidth: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></div>
                )}
              </button>

              {showNotifs && (
                <div className="notif-dropdown" style={{ position: 'absolute', top: '100%', right: 0, width: '340px', background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', marginTop: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>Notifications</p>
                    {unreadCount > 0 && (
                      <span className="mark-all-link" onClick={handleMarkAllRead}
                        style={{ fontSize: '12px', color: '#0051D5', cursor: 'pointer' }}>Mark all read</span>
                    )}
                  </div>

                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {loadingNotifs ? (
                      <p style={{ fontSize: '13px', color: '#76777D', textAlign: 'center', padding: '24px' }}>Loading...</p>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <Bell size={24} color="#C6C6CD" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={n.id} className="notif-item"
                          onClick={() => handleNotifClick(n)}
                          style={{ padding: '12px 16px', display: 'flex', gap: '10px', cursor: 'pointer', background: n.is_read ? '#fff' : '#F0F7FF', borderBottom: i < notifications.length - 1 ? '1px solid #F0F4FF' : 'none' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                            {notifIcon(n.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <p style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{n.title}</p>
                              {!n.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0051D5', flexShrink: 0 }}></div>}
                            </div>
                            {n.message && <p style={{ fontSize: '12px', color: '#76777D', margin: '2px 0 4px' }}>{n.message}</p>}
                            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{timeAgo(n.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────────────── */}
        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Stats Row — clickable, real data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
            {statCards.map((s, i) => (
              <div key={i} className="stat-card"
                onClick={s.onClick}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ background: s.bg, borderRadius: '8px', padding: '8px', color: s.color, display: 'flex' }}>{s.icon}</div>
                  {s.extra}
                </div>
                <p style={{ fontSize: '11px', color: '#76777D', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>{s.label}</p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#0B1C30', margin: 0 }}>
                  {loadingStats
                    ? <span style={{ fontSize: '16px', color: '#C6C6CD' }}>Loading...</span>
                    : s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '24px' }}>

            {/* Recent Activity */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Recent Activity</h3>
                <span className="view-all" onClick={() => navigate('/students')}
                  style={{ fontSize: '13px', color: '#0051D5', cursor: 'pointer', textDecoration: 'none' }}>View All</span>
              </div>
              {activities.map((a, i) => (
                <div key={i} className="activity-item"
                  style={{ padding: '14px', display: 'flex', gap: '12px', borderBottom: i < activities.length - 1 ? '1px solid #F0F4FF' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{a.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{a.name}</p>
                      <span style={{ fontSize: '11px', color: '#76777D' }}>{a.time}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 8px' }}>{a.desc}</p>
                    {a.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {a.tags.map((tag, j) => (
                          <span key={j} style={{ background: j === 0 ? '#D1FAE5' : '#DCE9FF', color: j === 0 ? '#009668' : '#0051D5', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {a.action && (
                      <button className="approve-btn"
                        onClick={() => a.actionPath && navigate(a.actionPath)}
                        style={{ background: '#0B1C30', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginTop: '6px', transition: 'all 0.2s ease' }}>
                        {a.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Quick Actions — all navigate */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', marginBottom: '12px', marginTop: 0 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {quickActions.map((qa, i) => (
                    <div key={i} className="action-row"
                      onClick={() => navigate(qa.path)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #C6C6CD', borderRadius: '8px', transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#DCE9FF', borderRadius: '6px', padding: '6px', color: '#0051D5', display: 'flex' }}>{qa.icon}</div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30' }}>{qa.label}</span>
                      </div>
                      <ChevronRight size={14} color="#76777D" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mid-Term Exams */}
              <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '8px', marginTop: 0 }}>Mid-Term Exams</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '16px', marginTop: 0 }}>
                  Starting in 12 days. Ensure all proctor schedules are finalized.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex' }}>
                    {['J','A','M','K'].map((l, i) => (
                      <div key={i} style={{ width: '26px', height: '26px', borderRadius: '50%', background: `hsl(${210+i*20},60%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, marginLeft: i > 0 ? '-6px' : 0, border: '2px solid #0B1C30' }}>{l}</div>
                    ))}
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#316BF3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, marginLeft: '-6px', border: '2px solid #0B1C30' }}>+4</div>
                  </div>
                  <button className="review-btn"
                    onClick={() => navigate('/schedules')}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    Review Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Institutional Performance</h3>
              <div onClick={() => navigate('/reports')}
                style={{ border: '1px solid #C6C6CD', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#45464D', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0051D5'; (e.currentTarget as HTMLDivElement).style.color = '#0051D5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C6C6CD'; (e.currentTarget as HTMLDivElement).style.color = '#45464D'; }}>
                This Quarter <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '120px', paddingBottom: '8px' }}>
              {perfData.map((bar, i) => (
                <div key={i} className="perf-bar"
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${bar.h}%`, background: bar.color, borderRadius: '4px 4px 0 0', transition: 'opacity 0.2s ease' }}></div>
                  <span style={{ fontSize: '12px', color: '#76777D' }}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','Contact Support'].map((l, i) => (
              <a key={i} href="#" className="footer-link"
                style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none', transition: 'color 0.2s ease' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}