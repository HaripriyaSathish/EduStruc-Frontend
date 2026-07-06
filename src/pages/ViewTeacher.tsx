import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  HelpCircle, LogOut, GraduationCap, ClipboardList, ArrowLeft
} from 'lucide-react';
import { getAuthHeader, logoutUser } from '../utils/auth';
const API_BASE = import.meta.env.VITE_API_URL;

interface SubjectGrade { id: number; subject_name: string; grade_name: string; }
interface TimetableEntry { id: number; day: string; start_time: string; end_time: string; room: string; subject_name: string; grade_name: string; }
interface AttendanceRecord { id: number; date: string; status: string; notes: string; }
interface AttendanceSummary { total_days: number; present_days: number; attendance_percentage: number; }

interface TeacherDetail {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_base64: string | null;
  employee_id: string;
  department: string;
  designation: string;
  date_joined: string | null;
  subject_grades: SubjectGrade[];
  timetable: TimetableEntry[];
  attendance_summary: AttendanceSummary;
  attendance_records: AttendanceRecord[];
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

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ViewTeacher() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/teachers/${id}/`, { headers: { ...getAuthHeader() } });
        if (res.ok) setTeacher(await res.json());
      } catch (e) {
        console.error('Teacher fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; color: #fff !important; }
        .back-link:hover { text-decoration: underline; }
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

        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30 }}>
          <div onClick={() => navigate('/teachers')} className="back-link"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#0051D5', fontSize: '13px', fontWeight: 500 }}>
            <ArrowLeft size={15} /> Back to Teachers
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>
          {loading ? (
            <p style={{ color: '#76777D', fontSize: '14px' }}>Loading teacher profile...</p>
          ) : !teacher ? (
            <p style={{ color: '#76777D', fontSize: '14px' }}>Teacher not found.</p>
          ) : (
            <>
              {/* Profile header */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {teacher.avatar_base64
                    ? <img src={teacher.avatar_base64} alt={teacher.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#0051D5', fontWeight: 700, fontSize: '26px' }}>{teacher.full_name?.charAt(0) || '?'}</span>}
                </div>
                <div>
  <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>{teacher.full_name}</h1>
  <p style={{ fontSize: '13px', color: '#76777D', margin: '2px 0' }}>{teacher.designation || 'Teacher'} · {teacher.department || 'Department not set'}</p>
  <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>{teacher.email} {teacher.phone && `· ${teacher.phone}`}</p>
  <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>
    Employee ID: <strong style={{ color: '#0B1C30' }}>{teacher.employee_id || '—'}</strong>
    {teacher.date_joined && <> · Joined: <strong style={{ color: '#0B1C30' }}>{new Date(teacher.date_joined).toLocaleDateString()}</strong></>}
  </p>
</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Subjects & Grades */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', marginTop: 0, marginBottom: '14px' }}>Subjects & Grades Handled</h3>
                  {teacher.subject_grades.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#76777D' }}>No subjects assigned yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {teacher.subject_grades.map(sg => (
                        <div key={sg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8F9FF', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30' }}>{sg.subject_name}</span>
                          <span style={{ fontSize: '12px', color: '#0051D5', background: '#DCE9FF', padding: '2px 8px', borderRadius: '4px' }}>{sg.grade_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attendance summary */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', marginTop: 0, marginBottom: '14px' }}>Attendance</h3>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#009668', margin: '0 0 4px' }}>
                    {teacher.attendance_summary.attendance_percentage}%
                  </p>
                  <p style={{ fontSize: '13px', color: '#76777D', margin: '0 0 14px' }}>
                    {teacher.attendance_summary.present_days} of {teacher.attendance_summary.total_days} days present
                  </p>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {teacher.attendance_records.map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 10px', background: '#F8F9FF', borderRadius: '6px' }}>
                        <span style={{ color: '#45464D' }}>{r.date}</span>
                        <span style={{ color: r.status === 'present' ? '#009668' : '#EF4444', fontWeight: 600, textTransform: 'capitalize' }}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timetable */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', marginTop: 0, marginBottom: '14px' }}>Timetable</h3>
                {teacher.timetable.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#76777D' }}>No timetable entries yet.</p>
                ) : (
                  DAY_ORDER.map(day => {
                    const entries = teacher.timetable.filter(t => t.day === day);
                    if (entries.length === 0) return null;
                    return (
                      <div key={day} style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0051D5', margin: '0 0 6px' }}>{day}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {entries.map(e => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8F9FF', borderRadius: '8px', fontSize: '13px' }}>
                              <span style={{ color: '#0B1C30', fontWeight: 500 }}>{e.subject_name} · {e.grade_name}</span>
                              <span style={{ color: '#76777D' }}>{e.start_time} – {e.end_time} · Room {e.room}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}