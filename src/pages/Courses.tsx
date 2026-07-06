import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  MoreVertical, User2, Clock, MapPin, Grid, List, SlidersHorizontal, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface Course {
  id:           number;
  course_code:  string;
  course_name:  string;
  description:  string;
  instructor:   string;
  credits:      number;
  max_students: number;
  status:       string;
  academic_year:string;
  semester:     string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  active:    { label: 'In Progress', bg: '#DCFCE7', color: '#005236', dot: '#16A34A' },
  inactive:  { label: 'Upcoming',    bg: '#FEF9C3', color: '#854D0E', dot: '#CA8A04' },
  completed: { label: 'Full',        bg: '#FEE2E2', color: '#93000A', dot: '#DC2626' },
};

export default function Courses() {
  const navigate = useNavigate();
  const user     = getSession();
  const [activeNav, setActiveNav]     = useState('Courses');
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab]     = useState<'current' | 'archive'>('current');
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid');
  const [openMenu, setOpenMenu]       = useState<number | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/courses/`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data: Course[] = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error('Fetch courses error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await fetch(`${API_BASE}/api/courses/${id}/`, {
      method: 'DELETE', headers: { ...getAuthHeader() },
    });
    fetchCourses();
  };

  // Filter by search and tab
  const filtered = courses.filter(c => {
    const matchSearch = !searchQuery ||
      c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = activeTab === 'current'
      ? c.status !== 'completed'
      : c.status === 'completed';
    return matchSearch && matchTab;
  });

  const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <GraduationCap size={16} />,   label: 'Teachers',   path: '/teachers' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];

  // Enrollment progress bar color
  const getEnrollColor = (enrolled: number, max: number) => {
    const pct = enrolled / max;
    if (pct >= 1)   return '#DC2626';
    if (pct >= 0.8) return '#CA8A04';
    return '#0051D5';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn:hover { background: #003DAA !important; transform: translateY(-1px); }
        .course-card { transition: all 0.25s ease; }
        .course-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,81,213,0.12) !important; border-color: #0051D5 !important; }
        .manage-btn { transition: all 0.2s ease; }
        .manage-btn:hover { background: #0051D5 !important; color: #fff !important; }
        .add-course-card { transition: all 0.25s ease; cursor: pointer; }
        .add-course-card:hover { border-color: #0051D5 !important; background: #F0F7FF !important; }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .menu-item:hover { background: #F0F4FF !important; }
        .menu-delete:hover { background: #FEE2E2 !important; color: #DC2626 !important; }
        .search-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; outline: none; }
        .view-toggle:hover { background: #DCE9FF !important; color: #0051D5 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .menu-dropdown { animation: fadeIn 0.15s ease; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
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
            <div key={i} className={`nav-item ${activeNav === item.label ? 'nav-item-active' : ''}`}
              onClick={() => { setActiveNav(item.label); navigate(item.path); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: activeNav === item.label ? '#fff' : '#45464D', fontSize: '14px', fontWeight: activeNav === item.label ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>
          ))}
          <button className="add-btn" onClick={() => navigate('/students/new')}
            style={{ background: '#0042AA', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}>
  <HelpCircle size={15} /> Support
</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Course Management</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage academic programs, faculty assignments, and enrollment quotas.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="search-input" type="text" placeholder="Search courses..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '200px', transition: 'all 0.2s ease' }} />
            </div>
            {/* Create course button */}
            <button onClick={() => navigate('/courses/new')}
              style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#003DAA')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0051D5')}>
              <Plus size={15} /> Create New Course
            </button>
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Course Directory header */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>

            {/* Title row */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: '0 0 2px' }}>Course Directory</h2>
                <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage academic programs, faculty assignments, and enrollment quotas.</p>
              </div>
              {/* View toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="view-toggle" onClick={() => setViewMode('grid')}
                  style={{ padding: '6px', border: '1px solid #C6C6CD', borderRadius: '6px', background: viewMode === 'grid' ? '#DCE9FF' : '#fff', color: viewMode === 'grid' ? '#0051D5' : '#45464D', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}>
                  <Grid size={16} />
                </button>
                <button className="view-toggle" onClick={() => setViewMode('list')}
                  style={{ padding: '6px', border: '1px solid #C6C6CD', borderRadius: '6px', background: viewMode === 'list' ? '#DCE9FF' : '#fff', color: viewMode === 'list' ? '#0051D5' : '#45464D', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}>
                  <List size={16} />
                </button>
                <button style={{ padding: '6px', border: '1px solid #C6C6CD', borderRadius: '6px', background: '#fff', color: '#45464D', cursor: 'pointer', display: 'flex' }}>
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '0' }}>
              {(['current', 'archive'] as const).map(tab => (
                <button key={tab} className="tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#0051D5' : '#76777D', borderBottom: activeTab === tab ? '2px solid #0051D5' : '2px solid transparent', transition: 'all 0.2s ease', marginBottom: '-1px', textTransform: 'capitalize' }}>
                  {tab === 'current' ? 'Current Semester' : 'Archive'}
                </button>
              ))}
            </div>

            {/* Course grid / list */}
            <div style={{ padding: '24px' }}>

              {/* Loading */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  <p style={{ color: '#76777D', fontSize: '14px' }}>Loading courses...</p>
                </div>
              )}

              {/* Grid view */}
              {!loading && viewMode === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {filtered.map(course => {
                    const cfg     = statusConfig[course.status] || statusConfig.inactive;
                    const enrolled = Math.floor(Math.random() * course.max_students);
                    const enrollPct = Math.min(100, Math.round((enrolled / course.max_students) * 100));
                    const barColor  = getEnrollColor(enrolled, course.max_students);
                    return (
                      <div key={course.id} className="course-card"
                        style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        {/* Top row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}></span>
                            {cfg.label}
                          </span>
                          {/* 3-dot menu */}
                          <div style={{ position: 'relative' }}>
                            <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === course.id ? null : course.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#76777D', display: 'flex' }}>
                              <MoreVertical size={16} />
                            </button>
                            {openMenu === course.id && (
                              <div className="menu-dropdown" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '140px', overflow: 'hidden' }}>
                                <div className="menu-item" onClick={() => navigate(`/courses/${course.id}`)}
                                  style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>View Details</div>
                                <div className="menu-item" onClick={() => navigate(`/courses/${course.id}/edit`)}
                                  style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>Edit Course</div>
                                <div className="menu-delete menu-item" onClick={() => handleDelete(course.id, course.course_name)}
                                  style={{ padding: '10px 14px', fontSize: '13px', color: '#DC2626', cursor: 'pointer', borderTop: '1px solid #F0F4FF' }}>Delete</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Course name */}
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#0B1C30', margin: '0 0 6px', lineHeight: 1.3 }}>{course.course_name}</h3>
                        {/* Instructor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
                          <User2 size={12} color="#76777D" />
                          <span style={{ fontSize: '12px', color: '#76777D' }}>{course.instructor}</span>
                        </div>

                        {/* Enrollment */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Enrolled</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0B1C30' }}>{enrolled}/{course.max_students}</span>
                          </div>
                          <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '999px' }}>
                            <div style={{ height: '4px', width: `${enrollPct}%`, background: barColor, borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={12} color="#76777D" />
                            <span style={{ fontSize: '12px', color: '#76777D' }}>{course.semester}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={12} color="#76777D" />
                            <span style={{ fontSize: '12px', color: '#76777D' }}>{course.course_code}</span>
                          </div>
                        </div>

                        {/* Manage button */}
                        <button className="manage-btn"
                          onClick={() => navigate(`/courses/${course.id}`)}
                          style={{ width: '100%', background: '#fff', border: '1px solid #C6C6CD', color: '#0B1C30', borderRadius: '8px', padding: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                          Manage Course
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Course card */}
                  <div className="add-course-card"
                    onClick={() => navigate('/courses/new')}
                    style={{ background: '#F8F9FF', border: '2px dashed #C6C6CD', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '10px' }}>
                    <div style={{ background: '#DCE9FF', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color="#0051D5" />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>Add Course</p>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0, textAlign: 'center' }}>Click to define a new curriculum</p>
                  </div>

                  {/* Empty state */}
                  {filtered.length === 0 && !loading && (
                    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px' }}>
                      <BookOpen size={36} color="#C6C6CD" />
                      <p style={{ fontWeight: 500, color: '#45464D', margin: 0 }}>No courses found</p>
                      <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
                        {searchQuery ? 'Try a different search term' : 'Create your first course to get started'}
                      </p>
                      {!searchQuery && (
                        <button onClick={() => navigate('/courses/new')}
                          style={{ marginTop: '8px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                          + Create New Course
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* List view */}
              {!loading && viewMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filtered.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', gap: '12px' }}>
                      <BookOpen size={36} color="#C6C6CD" />
                      <p style={{ fontWeight: 500, color: '#45464D', margin: 0 }}>No courses found</p>
                    </div>
                  ) : filtered.map(course => {
                    const cfg = statusConfig[course.status] || statusConfig.inactive;
                    return (
                      <div key={course.id}
                        style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0051D5'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,81,213,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C6C6CD'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div style={{ background: '#DCE9FF', borderRadius: '8px', padding: '10px', display: 'flex', flexShrink: 0 }}>
                            <BookOpen size={16} color="#0051D5" />
                          </div>
                          <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 2px' }}>{course.course_name}</p>
                            <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{course.course_code} • {course.instructor}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <span style={{ background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>{cfg.label}</span>
                          <span style={{ fontSize: '13px', color: '#45464D' }}>{course.max_students} max</span>
                          <button className="manage-btn" onClick={() => navigate(`/courses/${course.id}`)}
                            style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#0B1C30', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                            Manage Course
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {/* Add course row */}
                  <div onClick={() => navigate('/courses/new')}
                    style={{ background: '#F8F9FF', border: '2px dashed #C6C6CD', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0051D5'; (e.currentTarget as HTMLDivElement).style.background = '#F0F7FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C6C6CD'; (e.currentTarget as HTMLDivElement).style.background = '#F8F9FF'; }}>
                    <Plus size={16} color="#0051D5" />
                    <p style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500, margin: 0 }}>Add New Course</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
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