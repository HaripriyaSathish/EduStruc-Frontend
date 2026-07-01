import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  ChevronLeft, ChevronRight, Clock, MapPin,
  BarChart2, Mail, Zap
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Schedule {
  id: number; course_name: string; instructor: string;
  day: string; start_time: string; end_time: string; room: string;
}
interface Course {
  id: number; course_name: string; course_code: string;
}

const DAYS = ['MON','TUE','WED','THU','FRI'];
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

// Map day name to column index
const dayToIndex = (day: string): number => {
  const d = day?.toLowerCase();
  if (d?.includes('mon')) return 0;
  if (d?.includes('tue')) return 1;
  if (d?.includes('wed')) return 2;
  if (d?.includes('thu')) return 3;
  if (d?.includes('fri')) return 4;
  return -1;
};

// Parse "HH:MM" → minutes from 08:00
const toMinutes = (t: string) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h - 8) * 60 + (m || 0);
};

// Block type colors
const BLOCK_COLORS = [
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'Lecture Hours' },
  { bg: '#DCFCE7', border: '#22C55E', text: '#166534', label: 'Office Hours' },
  { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D', label: 'Faculty Meeting' },
  { bg: '#CCFBF1', border: '#14B8A6', text: '#0F766E', label: 'Research Time' },
];

const WEEK_DATES = [11, 12, 13, 14, 15]; // March 11-15

export default function TeacherSchedules() {
  const navigate = useNavigate();
  const user     = getSession();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [viewMode,  setViewMode]  = useState<'week'|'day'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, cRes] = await Promise.all([
          apiFetch('http://127.0.0.1:8000/api/schedules/'),
          apiFetch('http://127.0.0.1:8000/api/courses/'),
        ]);
        if (sRes.ok) setSchedules(await sRes.json());
        if (cRes.ok) setCourses(await cRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Assign each schedule a color type based on index
  const getBlockColor = (idx: number) => BLOCK_COLORS[idx % BLOCK_COLORS.length];

  // Calendar height constants
  const CELL_HEIGHT = 60;  // px per hour
  const TOTAL_HOURS = 11;  // 08:00 to 19:00

  // Filter schedules
  const filteredSchedules = schedules.filter(s =>
    !searchQuery ||
    s.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalSchedules  = schedules.length;
  const teachingHours   = Math.min(20, schedules.length * 1.5);
  const pendingRequests = Math.max(0, courses.length - 2);
  const nextClass       = schedules[0] || null;

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
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side:hover { background: #003DAA !important; }
        .search-input:focus { outline: none; border-color: #0051D5 !important; }
        .view-btn { border: 1px solid #C6C6CD; background: #fff; padding: 6px 14px; font-size: 13px; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s ease; }
        .view-btn:hover { background: #EFF4FF; }
        .view-btn-active { background: #0051D5 !important; color: #fff !important; border-color: #0051D5 !important; }
        .nav-btn:hover { background: #EFF4FF !important; }
        .today-btn:hover { background: #EFF4FF !important; }
        .schedule-block { border-radius: 6px; padding: 6px 8px; overflow: hidden; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; position: absolute; left: 4px; right: 4px; }
        .schedule-block:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10; }
        .stat-card:hover { box-shadow: 0 4px 16px rgba(0,81,213,0.1) !important; }
        .launch-btn:hover { background: #1D4ED8 !important; }
        .review-btn:hover { background: #EFF4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
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
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
            <input className="search-input" placeholder="Search for courses, faculty, or classrooms..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '320px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* Page title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 2px' }}>Weekly Schedule</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
                Managing Semester 2: March {11 + weekOffset * 7} – {15 + weekOffset * 7}, 2024
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                {BLOCK_COLORS.map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.border }}></div>
                    <span style={{ fontSize: '11px', color: '#45464D', fontWeight: 500 }}>{c.label}</span>
                  </div>
                ))}
              </div>
              {/* Week/Day toggle */}
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #C6C6CD' }}>
                <button className={`view-btn ${viewMode === 'week' ? 'view-btn-active' : ''}`}
                  style={{ borderRadius: 0, borderRight: '1px solid #C6C6CD' }}
                  onClick={() => setViewMode('week')}>Week</button>
                <button className={`view-btn ${viewMode === 'day' ? 'view-btn-active' : ''}`}
                  style={{ borderRadius: 0 }}
                  onClick={() => setViewMode('day')}>Day</button>
              </div>
              {/* Prev / Today / Next */}
              <button className="nav-btn" onClick={() => setWeekOffset(w => w - 1)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', transition: 'all 0.15s ease' }}>
                <ChevronLeft size={16} color="#45464D" />
              </button>
              <button className="today-btn" onClick={() => setWeekOffset(0)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#45464D', transition: 'all 0.15s ease' }}>
                Today
              </button>
              <button className="nav-btn" onClick={() => setWeekOffset(w => w + 1)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', transition: 'all 0.15s ease' }}>
                <ChevronRight size={16} color="#45464D" />
              </button>
            </div>
          </div>

          {/* CALENDAR */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ padding: '12px', borderRight: '1px solid #E5E7EB' }}></div>
              {DAYS.map((day, i) => (
                <div key={day} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 4 ? '1px solid #E5E7EB' : 'none', background: i === 1 ? '#EFF4FF' : '#fff' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#76777D', margin: '0 0 2px', letterSpacing: '0.06em' }}>{day}</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: i === 1 ? '#0051D5' : '#0B1C30', margin: 0 }}>
                    {WEEK_DATES[i] + weekOffset * 7}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ color: '#76777D', fontSize: '13px', margin: 0 }}>Loading schedule...</p>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Time rows */}
                <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)' }}>
                  {/* Time labels column */}
                  <div>
                    {HOURS.map(hr => (
                      <div key={hr} style={{ height: `${CELL_HEIGHT}px`, padding: '4px 8px 0', borderBottom: '1px solid #F0F4FF', display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '10px', color: '#C6C6CD', fontWeight: 500 }}>{hr}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {DAYS.map((day, colIdx) => (
                    <div key={day} style={{ position: 'relative', borderLeft: '1px solid #E5E7EB', background: colIdx === 1 ? '#FAFCFF' : '#fff' }}>
                      {/* Hour cells */}
                      {HOURS.map(hr => (
                        <div key={hr} style={{ height: `${CELL_HEIGHT}px`, borderBottom: '1px solid #F0F4FF' }}></div>
                      ))}

                      {/* Schedule blocks */}
                      {filteredSchedules.map((s, idx) => {
                        if (dayToIndex(s.day) !== colIdx) return null;
                        const top    = toMinutes(s.start_time);
                        const bottom = toMinutes(s.end_time);
                        const height = Math.max(30, bottom - top);
                        if (top < 0 || top >= TOTAL_HOURS * 60) return null;
                        const color  = getBlockColor(idx);
                        return (
                          <div key={s.id} className="schedule-block"
                            style={{ top: `${top}px`, height: `${height}px`, background: color.bg, borderLeft: `3px solid ${color.border}` }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: color.text, margin: '0 0 2px', lineHeight: 1.2 }}>
                              {s.start_time} – {s.end_time}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#0B1C30', margin: '0 0 2px', lineHeight: 1.3 }}>
                              {s.course_name}
                            </p>
                            {height > 40 && s.room && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={9} color="#76777D" />
                                <span style={{ fontSize: '10px', color: '#76777D' }}>{s.room}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Red "now" line — on Tuesday column for demo */}
                <div style={{ position: 'absolute', left: '64px', right: 0, top: `${CELL_HEIGHT * 4 + 20}px`, height: '2px', background: '#EF4444', zIndex: 5, pointerEvents: 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', marginTop: '-3px', marginLeft: '-4px' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom stats — 3 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

            {/* Teaching Hours */}
            <div className="stat-card" style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ background: '#DCE9FF', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                  <BarChart2 size={16} color="#0051D5" />
                </div>
                <span style={{ background: '#DCFCE7', color: '#059669', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>ON TRACK</span>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#0B1C30', margin: '0 0 4px' }}>
                {loading ? '...' : `${teachingHours.toFixed(1)} / 20`}
              </p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 10px' }}>Teaching Hours This Week</p>
              <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '999px' }}>
                <div style={{ height: '5px', width: `${(teachingHours / 20) * 100}%`, background: '#0051D5', borderRadius: '999px', transition: 'width 0.6s ease' }}></div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="stat-card" style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ background: '#FEF3C7', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                  <Mail size={16} color="#D97706" />
                </div>
                <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>
                  {loading ? '...' : `${pendingRequests} NEW`}
                </span>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#0B1C30', margin: '0 0 4px' }}>
                {loading ? '...' : `${pendingRequests} Requests`}
              </p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>Pending Office Hour Bookings</p>
              <button className="review-btn"
                style={{ width: '100%', background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#45464D', transition: 'all 0.2s ease' }}>
                Review Slots
              </button>
            </div>

            {/* Next class — dark card */}
            <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '6px', display: 'inline-flex', marginBottom: '12px' }}>
                <Zap size={16} color="#FFD700" />
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', margin: '0 0 4px' }}>
                {loading ? 'Loading...' : (nextClass?.course_name || 'No upcoming class')}
              </p>
              {nextClass && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={11} color="rgba(255,255,255,0.6)" />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{nextClass.room} • Starts in 12m</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                    <Clock size={11} color="rgba(255,255,255,0.6)" />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{nextClass.day} {nextClass.start_time} – {nextClass.end_time}</span>
                  </div>
                </>
              )}
              <button className="launch-btn" onClick={() => navigate('/teacher/classes')}
                style={{ width: '100%', background: '#0051D5', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease' }}>
                Launch Dashboard
              </button>
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
    </div>
  );
}