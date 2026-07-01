import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  Users2, Clock, MapPin, TrendingUp, BookMarked,
  MoreVertical, Info, RefreshCw
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Course {
  id: number; course_name: string; course_code: string;
  instructor: string; max_students: number; status: string;
  department: string; semester: string; description: string;
  credits: number;
}
interface Schedule {
  id: number; course_name: string; day: string;
  start_time: string; end_time: string; room: string;
}
interface Student { id: number; status: string; }

// Gradient colors per card index
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1D4ED8 0%, #0051D5 100%)',
  'linear-gradient(135deg, #0B1C30 0%, #1E3A5F 100%)',
  'linear-gradient(135deg, #0D7377 0%, #009668 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
  'linear-gradient(135deg, #B45309 0%, #92400E 100%)',
  'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
];

const SYLLABUS_PCT = [72, 45, 90, 60, 35, 80];

export default function TeacherClasses() {
  const navigate = useNavigate();
  const user     = getSession();

  const [courses,   setCourses]   = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students,  setStudents]  = useState<Student[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [openMenu,  setOpenMenu]  = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, sRes, stRes] = await Promise.all([
          apiFetch('http://127.0.0.1:8000/api/courses/'),
          apiFetch('http://127.0.0.1:8000/api/schedules/'),
          apiFetch('http://127.0.0.1:8000/api/students/'),
        ]);
        if (cRes.ok)  setCourses(await cRes.json());
        if (sRes.ok)  setSchedules(await sRes.json());
        if (stRes.ok) setStudents(await stRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // Get next session for a course
  const getNextSession = (courseName: string) => {
    const s = schedules.find(sc =>
      sc.course_name.toLowerCase().includes(courseName.toLowerCase().split(' ')[0])
    );
    if (!s) return null;
    return { day: s.day, time: s.start_time, room: s.room };
  };

  // Format next session day
  const formatDay = (day: string) => {
    const days: Record<string, string> = {
      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
      thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
    };
    return days[day?.toLowerCase()] || day;
  };

  const filtered = courses.filter(c =>
    !searchQuery ||
    c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalClasses  = courses.length;
  const totalStudents = students.length;
  const activeStudents= students.filter(s => s.status === 'active').length;
  const avgAttendance = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

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
        .course-card { transition: all 0.25s ease; }
        .course-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .gradebook-btn { transition: all 0.2s ease; cursor: pointer; }
        .gradebook-btn:hover { background: rgba(255,255,255,0.3) !important; }
        .materials-btn { transition: all 0.2s ease; cursor: pointer; }
        .materials-btn:hover { background: #0051D5 !important; color: #fff !important; }
        .create-btn:hover { background: #003DAA !important; transform: translateY(-1px); }
        .search-input:focus { border-color: #0051D5 !important; outline: none; }
        .menu-item:hover { background: #F0F4FF !important; }
        .menu-del:hover { background: #FEE2E2 !important; color: #DC2626 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .menu-drop { animation: fadeIn 0.15s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeUp 0.4s ease both; }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '19px', color: '#0B1C30', margin: 0 }}>My Classes</h1>
              <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Manage your current academic course load and student materials.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="search-input" placeholder="Search courses..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '30px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '200px' }} />
            </div>
            <button className="create-btn" onClick={() => navigate('/teacher/classes/new')}
              style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
              <Plus size={14} /> Create New Class
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '13px', margin: 0 }}>Loading classes...</p>
            </div>
          )}

          {/* Course Cards Grid */}
          {!loading && (
            <>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '12px', border: '1px solid #C6C6CD' }}>
                  <BookOpen size={40} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: '#45464D', fontSize: '16px', margin: '0 0 8px' }}>No classes yet</p>
                  <p style={{ color: '#76777D', fontSize: '13px', margin: '0 0 20px' }}>Create your first class to get started</p>
                  <button onClick={() => navigate('/teacher/classes/new')}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    + Create New Class
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  {filtered.map((course, i) => {
                    const gradient    = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                    const syllabusPct = SYLLABUS_PCT[i % SYLLABUS_PCT.length];
                    const nextSession = getNextSession(course.course_name);
                    const enrolled    = Math.min(course.max_students, Math.round(course.max_students * 0.75) + i * 3);

                    return (
                      <div key={course.id} className="course-card"
                        style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

                        {/* Colored header */}
                        <div style={{ background: gradient, padding: '20px', position: 'relative' }}>
                          {/* Course code badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                              {course.course_code}
                            </span>
                            {/* 3-dot menu */}
                            <div style={{ position: 'relative' }}>
                              <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === course.id ? null : course.id); }}
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', color: '#fff', display: 'flex' }}>
                                <MoreVertical size={15} />
                              </button>
                              {openMenu === course.id && (
                                <div className="menu-drop" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '150px', overflow: 'hidden', marginTop: '4px' }}>
                                  <div className="menu-item" onClick={() => navigate(`/teacher/classes/${course.id}`)}
                                    style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>View Details</div>
                                  <div className="menu-item" onClick={() => navigate(`/teacher/classes/${course.id}/edit`)}
                                    style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>Edit Class</div>
                                  <div className="menu-item"
                                    style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>View Gradebook</div>
                                  <div className="menu-del menu-item"
                                    style={{ padding: '10px 14px', fontSize: '13px', color: '#DC2626', cursor: 'pointer', borderTop: '1px solid #F0F4FF' }}>Archive</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', margin: '12px 0 0', lineHeight: 1.3 }}>
                            {course.course_name}
                          </h3>
                        </div>

                        {/* Card body */}
                        <div style={{ padding: '16px' }}>
                          {/* Students enrolled */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users2 size={13} color="#76777D" />
                              <span style={{ fontSize: '12px', color: '#76777D' }}>{enrolled} Students Enrolled</span>
                            </div>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', display: 'flex', padding: 0 }}
                              onClick={() => navigate(`/teacher/classes/${course.id}`)}>
                              <RefreshCw size={13} />
                            </button>
                          </div>

                          {/* Next session */}
                          {nextSession ? (
                            <>
                              <div style={{ marginBottom: '6px' }}>
                                <p style={{ fontSize: '10px', color: '#76777D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Next Session</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} color="#0051D5" />
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1C30' }}>
                                    {formatDay(nextSession.day)}, {nextSession.time}
                                  </span>
                                </div>
                              </div>
                              <div style={{ marginBottom: '14px' }}>
                                <p style={{ fontSize: '10px', color: '#76777D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Classroom</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={11} color="#76777D" />
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1C30' }}>{nextSession.room || 'TBD'}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div style={{ marginBottom: '14px' }}>
                              <p style={{ fontSize: '12px', color: '#C6C6CD', margin: '0 0 8px' }}>No schedule set</p>
                            </div>
                          )}

                          {/* Syllabus progress */}
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Syllabus Progress</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0B1C30' }}>{syllabusPct}%</span>
                            </div>
                            <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '999px' }}>
                              <div style={{ height: '5px', width: `${syllabusPct}%`, background: '#0051D5', borderRadius: '999px', transition: 'width 0.6s ease' }}></div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button className="gradebook-btn"
                              onClick={() => navigate(`/teacher/classes/${course.id}`)}
                              style={{ background: '#F0F4FF', color: '#0051D5', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                              Gradebook
                            </button>
                            <button className="materials-btn"
                              onClick={() => navigate(`/teacher/classes/${course.id}`)}
                              style={{ background: '#fff', color: '#0B1C30', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                              Class Materials
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats bar */}
              {!loading && courses.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Total Classes */}
                  <div style={{ display: 'flex', align: 'center', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#76777D', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Total Classes</p>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#0B1C30', margin: 0, lineHeight: 1 }}>
                        {String(totalClasses).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '48px', background: '#E5E7EB' }}></div>

                  {/* Total Students */}
                  <div>
                    <p style={{ fontSize: '11px', color: '#76777D', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Total Students</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#0B1C30', margin: 0, lineHeight: 1 }}>{totalStudents}</p>
                  </div>

                  <div style={{ width: '1px', height: '48px', background: '#E5E7EB' }}></div>

                  {/* Avg Attendance */}
                  <div>
                    <p style={{ fontSize: '11px', color: '#76777D', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Avg. Attendance</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#009668', margin: 0, lineHeight: 1 }}>{avgAttendance}%</p>
                  </div>

                  <div style={{ width: '1px', height: '48px', background: '#E5E7EB' }}></div>

                  {/* Top students */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex' }}>
                      {['#0051D5','#009668','#7C3AED'].map((c, i) => (
                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? '-8px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px', zIndex: 3 - i }}>
                          {['A','B','C'][i]}
                        </div>
                      ))}
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0F4FF', border: '2px solid #fff', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0051D5', fontWeight: 700, fontSize: '10px' }}>
                        +{Math.max(0, totalStudents - 3)}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Top performing students this week</p>
                  </div>
                </div>
              )}
            </>
          )}
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