import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  ChevronLeft, ChevronRight, AlertTriangle, RefreshCw,
  Monitor, Users2, Printer, MoreHorizontal, Check, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface Schedule {
  id:           number;
  course_name:  string;
  instructor:   string;
  day:          string;
  start_time:   string;
  end_time:     string;
  room:         string;
  academic_year:string;
  semester:     string;
}

// Exact color palette from Figma course blocks
const BLOCK_COLORS = [
  { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8', room: '#1E40AF' },  // blue - Quantum Physics
  { bg: '#DCFCE7', border: '#16A34A', text: '#166534', room: '#14532D' },  // green - Advanced Math
  { bg: '#FEF9C3', border: '#CA8A04', text: '#92400E', room: '#78350F' },  // yellow - History
  { bg: '#F3E8FF', border: '#9333EA', text: '#7E22CE', room: '#581C87' },  // purple
  { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', room: '#881337' },  // red
  { bg: '#CFFAFE', border: '#0891B2', text: '#164E63', room: '#0C4A6E' },  // cyan
  { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', room: '#7F1D1D' },  // red2
  { bg: '#FDF4FF', border: '#A855F7', text: '#7E22CE', room: '#581C87' },  // light purple
];

const DAYS_SHORT = ['MON','TUE','WED','THU','FRI'];
const HOURS = ['08 AM','09 AM','10 AM','11 AM','12 PM','01 PM','02 PM','03 PM'];

const DEPT_COLORS = ['#0051D5','#009668','#D97706','#9333EA'];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getWeekDates(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Schedules() {
  const navigate = useNavigate();
  const user     = getSession();

  const [activeNav, setActiveNav]         = useState('Schedules');
  const [schedules, setSchedules]         = useState<Schedule[]>([]);
  const [loading, setLoading]             = useState(true);
  const [viewMode, setViewMode]           = useState<'Week'|'Day'|'Month'>('Week');
  const [weekOffset, setWeekOffset]       = useState(0);
  const [searchQuery, setSearchQuery]     = useState('');
  const [perspective, setPerspective]     = useState('Classrooms');
  const [checkedDepts, setCheckedDepts]   = useState([true,true,false,true]);
  const [currentMonth, setCurrentMonth]   = useState(new Date());

  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE}/api/schedules/`);
        if (res.ok) setSchedules(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  // Assign color per course name
  const courseColors: Record<string, typeof BLOCK_COLORS[0]> = {};
  [...new Set(schedules.map(s => s.course_name))].forEach((name, i) => {
    courseColors[name] = BLOCK_COLORS[i % BLOCK_COLORS.length];
  });

  const filtered = schedules.filter(s =>
    !searchQuery ||
    s.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSchedulesForDay = (day: string) =>
    filtered.filter(s => s.day?.toUpperCase().startsWith(day.slice(0,3)));

  // Stats
  const activeRooms  = new Set(schedules.map(s => s.room).filter(Boolean)).size;
  const totalRooms   = Math.max(45, activeRooms);
  const facultyCount = new Set(schedules.map(s => s.instructor)).size;
  const utilPct      = facultyCount > 0 ? Math.min(100, Math.round((facultyCount / 20) * 100)) : 88;

  // Mini calendar
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay    = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];

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
        .create-btn:hover { background: #003DAA !important; transform: translateY(-1px); }
        .view-tab { cursor: pointer; padding: 5px 14px; font-size: 13px; font-weight: 500; transition: all 0.15s ease; border: none; background: none; }
        .nav-arrow:hover { background: #F0F4FF !important; }
        .schedule-block { transition: all 0.2s ease; cursor: pointer; }
        .schedule-block:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; transform: scale(1.01); z-index: 5 !important; }
        .dept-row:hover { background: #F0F7FF !important; border-radius: 6px; }
        .search-input:focus { border-color: #0051D5 !important; outline: none; }
        .stat-card:hover { box-shadow: 0 4px 12px rgba(0,81,213,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
            <input className="search-input" type="text" placeholder="Search for courses, faculty, or classrooms..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '100%', transition: 'all 0.2s ease' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
            </div>
           <AvatarCircle size={36} />
          </div>
        </header>

        {/* Page header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Academic Schedules</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage institutional time slots, faculty allocations, and venue availability.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Week/Day/Month tabs */}
            <div style={{ background: '#F0F4FF', borderRadius: '8px', padding: '3px', display: 'flex', gap: '2px' }}>
              {(['Week','Day','Month'] as const).map(v => (
                <button key={v} className="view-tab"
                  onClick={() => setViewMode(v)}
                  style={{ borderRadius: '6px', background: viewMode === v ? '#fff' : 'transparent', color: viewMode === v ? '#0051D5' : '#76777D', boxShadow: viewMode === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === v ? 600 : 400 }}>
                  {v}
                </button>
              ))}
            </div>
            <button className="create-btn" onClick={() => navigate('/schedules/new')}
              style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
              <Plus size={14} /> Create New Schedule
            </button>
          </div>
        </div>

        {/* Content */}
        <main style={{ padding: '16px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Calendar card */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>

            {/* LEFT PANEL */}
            <div style={{ width: '185px', flexShrink: 0, borderRight: '1px solid #E5E7EB', padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* View Perspective */}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#76777D', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>View Perspective</p>

                {/* Classrooms — blue pill */}
                <div onClick={() => setPerspective('Classrooms')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: perspective === 'Classrooms' ? '#0051D5' : 'transparent', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.15s ease' }}>
                  <Monitor size={13} color={perspective === 'Classrooms' ? '#fff' : '#45464D'} />
                  <span style={{ fontSize: '13px', color: perspective === 'Classrooms' ? '#fff' : '#45464D', fontWeight: perspective === 'Classrooms' ? 600 : 400 }}>Classrooms</span>
                  {perspective === 'Classrooms' && (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div>
                    </div>
                  )}
                </div>

                {/* Faculty Members — radio */}
                {[
                  { label: 'Faculty Members', icon: <Users2 size={13} /> },
                  { label: 'Student Groups', icon: <GraduationCap size={13} /> },
                ].map((item, i) => (
                  <div key={i} onClick={() => setPerspective(item.label)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer', marginBottom: '4px', borderRadius: '8px', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F0F7FF'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                    <div style={{ color: '#76777D' }}>{item.icon}</div>
                    <span style={{ fontSize: '13px', color: '#45464D', flex: 1 }}>{item.label}</span>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${perspective === item.label ? '#0051D5' : '#C6C6CD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {perspective === item.label && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0051D5' }}></div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Departments */}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#76777D', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Departments</p>
                {['Physical Sciences','Engineering','Arts & Humanities','Medicine'].map((dept, i) => (
                  <div key={i} className="dept-row"
                    onClick={() => setCheckedDepts(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', cursor: 'pointer', marginBottom: '4px', transition: 'all 0.15s ease' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: checkedDepts[i] ? DEPT_COLORS[i] : '#fff', border: `2px solid ${DEPT_COLORS[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease' }}>
                      {checkedDepts[i] && <Check size={9} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: DEPT_COLORS[i], flexShrink: 0 }}></div>
                    <span style={{ fontSize: '12px', color: '#45464D' }}>{dept}</span>
                  </div>
                ))}
              </div>

              {/* Mini Calendar */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', padding: '2px', display: 'flex' }}>
                    <ChevronLeft size={13} />
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0B1C30' }}>
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', padding: '2px', display: 'flex' }}>
                    <ChevronRight size={13} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '10px', color: '#76777D', textAlign: 'center', fontWeight: 600, paddingBottom: '4px' }}>{d}</div>
                  ))}
                  {Array.from({ length: getFirstDay(currentMonth) }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1).map(day => {
                    const today = new Date();
                    const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                    return (
                      <div key={day} style={{ fontSize: '11px', textAlign: 'center', padding: '3px 1px', borderRadius: '50%', background: isToday ? '#0051D5' : 'transparent', color: isToday ? '#fff' : '#45464D', cursor: 'pointer', fontWeight: isToday ? 700 : 400, lineHeight: '16px' }}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — Calendar grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Calendar toolbar */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="nav-arrow" onClick={() => setWeekOffset(w => w - 1)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1C30', padding: '0 8px' }}>
                    Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button className="nav-arrow" onClick={() => setWeekOffset(w => w + 1)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}>
                    <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setWeekOffset(0)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: '#45464D', marginLeft: '4px' }}>
                    Today
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', padding: '4px', display: 'flex' }}><Printer size={15} /></button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', padding: '4px', display: 'flex' }}><MoreHorizontal size={15} /></button>
                </div>
              </div>

              {/* Grid */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    <p style={{ color: '#76777D', fontSize: '13px' }}>Loading schedules...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', minWidth: '500px' }}>
                    {/* Time labels */}
                    <div style={{ width: '52px', flexShrink: 0, paddingTop: '36px' }}>
                      {HOURS.map(h => (
                        <div key={h} style={{ height: '60px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: '8px', paddingTop: '2px' }}>
                          <span style={{ fontSize: '10px', color: '#76777D', whiteSpace: 'nowrap' }}>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDates.map((date, di) => {
                      const dayName = DAYS_SHORT[di];
                      const daySchedules = getSchedulesForDay(dayName);
                      const today  = new Date();
                      const isToday = date.toDateString() === today.toDateString();
                      return (
                        <div key={di} style={{ flex: 1, borderLeft: '1px solid #F0F4FF', minWidth: '80px' }}>
                          {/* Day header */}
                          <div style={{ height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E5E7EB', background: isToday ? '#F0F7FF' : '#fff' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dayName}</span>
                            <span style={{ fontSize: '13px', fontWeight: isToday ? 700 : 500, color: isToday ? '#0051D5' : '#0B1C30', lineHeight: 1 }}>
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ','\n')}
                            </span>
                          </div>

                          {/* Time slots */}
                          <div style={{ position: 'relative' }}>
                            {HOURS.map((h, hi) => (
                              <div key={h} style={{ height: '60px', borderBottom: '1px solid #F4F7FF', borderRight: '1px solid #F4F7FF' }}></div>
                            ))}

                            {/* Lunch break - WED column */}
                            {di === 2 && (
                              <div style={{ position: 'absolute', top: `${4 * 60}px`, left: 0, right: 0, height: '24px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', zIndex: 2 }}>
                                <span style={{ fontSize: '10px', color: '#76777D' }}>🍽</span>
                                <span style={{ fontSize: '10px', color: '#76777D' }}>Campus-wide Lunch Break Period</span>
                              </div>
                            )}

                            {/* Schedule blocks */}
                            {daySchedules.map((s, si) => {
                              const color = courseColors[s.course_name] || BLOCK_COLORS[0];
                              const [sh, sm] = (s.start_time || '08:00').split(':').map(Number);
                              const [eh, em] = (s.end_time   || '09:00').split(':').map(Number);
                              const top    = ((sh - 8) * 60 + (sm || 0)) / 60 * 60;
                              const height = Math.max(((eh - sh) * 60 + ((em || 0) - (sm || 0))) / 60 * 60 - 2, 28);
                              return (
                                <div key={si} className="schedule-block"
                                  onClick={() => navigate('/schedules')}
                                  style={{ position: 'absolute', top: `${top}px`, left: '2px', right: '2px', height: `${height}px`, background: color.bg, borderLeft: `3px solid ${color.border}`, borderRadius: '0 6px 6px 0', padding: '4px 6px', overflow: 'hidden', zIndex: 3, cursor: 'pointer' }}>
                                  {s.room && <p style={{ fontSize: '9px', fontWeight: 600, color: color.room, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.room}</p>}
                                  <p style={{ fontSize: '11px', fontWeight: 700, color: color.text, margin: '0 0 1px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.course_name}</p>
                                  <p style={{ fontSize: '10px', color: color.text, margin: 0, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.instructor}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {!loading && schedules.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', gap: '10px' }}>
                    <Calendar size={36} color="#C6C6CD" />
                    <p style={{ fontWeight: 500, color: '#45464D', margin: 0, fontSize: '14px' }}>No schedules yet</p>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Create a schedule to see it on the calendar</p>
                    <button onClick={() => navigate('/schedules/new')}
                      style={{ marginTop: '6px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                      + Create New Schedule
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[
              { icon: <Monitor size={18} />, iconBg: '#1D4ED8', label: 'Active Classrooms', value: `${activeRooms} / ${totalRooms}`, sub: null, subColor: '' },
              { icon: <Users2 size={18} />,  iconBg: '#065F46', label: 'Faculty Utilization', value: `${utilPct}%`, sub: null, subColor: '' },
              { icon: <AlertTriangle size={18} />, iconBg: '#7C3AED', label: 'Schedule Conflicts', value: '0', sub: '✓ Optimized', subColor: '#059669' },
              { icon: <RefreshCw size={18} />, iconBg: '#374151', label: 'Next Term Sync', value: 'In 12 Days', sub: 'Status: Draft Phase', subColor: '#76777D' },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'all 0.2s ease' }}>
                <div style={{ background: stat.iconBg, borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                  {/* Icon with white color */}
                  <div style={{ color: '#fff', display: 'flex' }}>{stat.icon}</div>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#76777D', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{stat.label}</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0, lineHeight: 1 }}>{stat.value}</p>
                  {stat.sub && <p style={{ fontSize: '11px', color: stat.subColor, margin: '4px 0 0', fontWeight: 500 }}>{stat.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 2px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}