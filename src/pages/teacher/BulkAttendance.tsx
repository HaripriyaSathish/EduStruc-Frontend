// src/pages/teacher/BulkAttendance.tsx
// Mark attendance for ALL students in one page — no more one-by-one in Django Admin

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Check,
  CheckCircle, XCircle, Clock, Search, Save
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

const API_BASE = 'http://127.0.0.1:8000';

type AttStatus = 'present' | 'absent' | 'holiday';

interface StudentRow {
  student_id:   number;
  full_name:    string;
  roll_number:  string;
  class_name:   string;
  status:       AttStatus | 'upcoming';
  notes:        string;
  attendance_id: number | null;
}

interface Course { id: number; course_name: string; }

export default function BulkAttendance() {
  const navigate = useNavigate();
  const user     = getSession();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [className,   setClassName]   = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));
  const [eventName,   setEventName]   = useState('Regular School Day');
  const [students,    setStudents]    = useState<StudentRow[]>([]);
  const [marks,       setMarks]       = useState<Record<number, AttStatus>>({});
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [fetched,     setFetched]     = useState(false);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/courses/`).then(r => r.ok ? r.json() : []).then(setCourses);
  }, []);

  // Load all students for the selected class + date
  const loadStudents = async () => {
    if (!className) { setError('Please select a class first.'); return; }
    setLoading(true); setError(''); setFetched(false);
    try {
      const res = await apiFetch(
        `${API_BASE}/api/attendance/bulk/list/?date=${date}&class_name=${encodeURIComponent(className)}`
      );
      if (res.ok) {
        const data = await res.json();
        const rows: StudentRow[] = data.students;
        setStudents(rows);
        // Pre-fill marks from existing attendance records for this date
        const initialMarks: Record<number, AttStatus> = {};
        rows.forEach(s => {
          if (s.status !== 'upcoming') {
            initialMarks[s.student_id] = s.status as AttStatus;
          } else {
            initialMarks[s.student_id] = 'present'; // default all to present
          }
        });
        setMarks(initialMarks);
        setFetched(true);
      } else {
        setError('Could not load students.');
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  // Mark all at once
  const markAll = (status: AttStatus) => {
    const updated: Record<number, AttStatus> = {};
    students.forEach(s => { updated[s.student_id] = status; });
    setMarks(updated);
  };

  // Save all 500 in one API call
  const saveAll = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      const records = students.map(s => ({
        student: s.student_id,
        status:  marks[s.student_id] || 'present',
      }));
      const res = await apiFetch(`${API_BASE}/api/attendance/bulk/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date, event_name: eventName, records }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save attendance.');
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setSaving(false); }
  };

  const filtered = students.filter(s =>
    !search ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(marks).filter(v => v === 'present').length;
  const absentCount  = Object.values(marks).filter(v => v === 'absent').length;
  const holidayCount = Object.values(marks).filter(v => v === 'holiday').length;

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
        .att-btn { border: none; border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .att-btn:hover { opacity: 0.85; transform: scale(1.03); }
        .present-active  { background: #DCFCE7; color: #166534; }
        .absent-active   { background: #FEE2E2; color: #991B1B; }
        .holiday-active  { background: #FEF9C3; color: #854D0E; }
        .present-inactive { background: #F3F4F6; color: #9CA3AF; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .search-input:focus { border-color: #0051D5 !important; outline: none; }
        .table-row:hover { background: #F8FAFF !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}><GraduationCap size={20} color="#fff" /></div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>ADMIN PORTAL</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = window.location.pathname === item.path;
            return <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: active ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>;
          })}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom" onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Bulk Attendance</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Mark attendance for all students in one go — saves to MySQL instantly.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name}</p>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* Config bar */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Class / Course</label>
                <select value={className} onChange={e => setClassName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none' }}>
                  <option value="">Select class...</option>
                  {courses.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Event Name</label>
                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button onClick={loadStudents} disabled={loading}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', height: '40px' }}>
                {loading ? 'Loading...' : 'Load Students'}
              </button>
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '10px 0 0' }}>{error}</p>}
          </div>

          {fetched && students.length > 0 && (
            <>
              {/* Summary + actions bar */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>{presentCount} Present</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="#DC2626" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>{absentCount} Absent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#D97706" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{holidayCount} Holiday</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#76777D' }}>/ {students.length} total</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Quick mark all */}
                  <span style={{ fontSize: '12px', color: '#76777D' }}>Mark all:</span>
                  <button className="att-btn present-active" onClick={() => markAll('present')}>✓ Present</button>
                  <button className="att-btn absent-active"  onClick={() => markAll('absent')}>✕ Absent</button>
                  <button className="att-btn holiday-active" onClick={() => markAll('holiday')}>⚑ Holiday</button>

                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
                    <input className="search-input" placeholder="Search student..."
                      value={search} onChange={e => setSearch(e.target.value)}
                      style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '12px', width: '160px', color: '#45464D' }} />
                  </div>

                  {/* Save */}
                  {saved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                      <Check size={13} /> Saved!
                    </div>
                  )}
                  <button className="save-btn" onClick={saveAll} disabled={saving}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                    {saving ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Saving...</>
                    ) : (
                      <><Save size={13} /> Save All ({students.length})</>
                    )}
                  </button>
                </div>
              </div>

              {/* Student list */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em' }}>#</th>
                      <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em' }}>STUDENT NAME</th>
                      <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em' }}>ROLL NO</th>
                      <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em' }}>ATTENDANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => {
                      const mark = marks[s.student_id] || 'present';
                      return (
                        <tr key={s.student_id} className="table-row" style={{ borderBottom: '1px solid #F0F4FF', background: '#fff', transition: 'background 0.1s ease' }}>
                          <td style={{ padding: '10px 20px', fontSize: '12px', color: '#76777D' }}>{i + 1}</td>
                          <td style={{ padding: '10px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0051D5', flexShrink: 0 }}>
                                {s.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 500, fontSize: '13px', color: '#0B1C30' }}>{s.full_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 20px', fontSize: '12px', color: '#45464D', fontFamily: 'monospace' }}>{s.roll_number}</td>
                          <td style={{ padding: '10px 20px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className={`att-btn ${mark === 'present' ? 'present-active' : 'present-inactive'}`}
                                onClick={() => setMarks(prev => ({ ...prev, [s.student_id]: 'present' }))}>
                                ✓ Present
                              </button>
                              <button className={`att-btn ${mark === 'absent' ? 'absent-active' : 'present-inactive'}`}
                                onClick={() => setMarks(prev => ({ ...prev, [s.student_id]: 'absent' }))}>
                                ✕ Absent
                              </button>
                              <button className={`att-btn ${mark === 'holiday' ? 'holiday-active' : 'present-inactive'}`}
                                onClick={() => setMarks(prev => ({ ...prev, [s.student_id]: 'holiday' }))}>
                                ⚑ Holiday
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {fetched && students.length === 0 && (
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <Users size={36} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: '#45464D', margin: '0 0 6px' }}>No students found for this class</p>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Make sure the class name matches exactly what students are enrolled in.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}