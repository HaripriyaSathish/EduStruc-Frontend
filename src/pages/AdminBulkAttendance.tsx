// src/pages/AdminBulkAttendance.tsx
// Admin bulk attendance — mark all students across all grades in one page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  Settings, HelpCircle, LogOut, GraduationCap,
  ClipboardList, Check, CheckCircle, XCircle,
  Clock, Search, Save, Plus, ChevronDown
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';

const API_BASE = import.meta.env.VITE_API_URL;

type AttStatus = 'present' | 'absent' | 'holiday';

interface StudentRow {
  student_id:    number;
  full_name:     string;
  roll_number:   string;
  class_name:    string;
  status:        AttStatus | 'upcoming';
  notes:         string;
  attendance_id: number | null;
}

const GRADES = [
  'Kindergarten 1', 'Kindergarten 2',
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade',
  '9th Grade', '10th Grade', '11th Grade', '12th Grade',
];

export default function AdminBulkAttendance() {
  const navigate = useNavigate();
  const user     = getSession();

  const [className, setClassName] = useState('');
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [eventName, setEventName] = useState('Regular School Day');
  const [students,  setStudents]  = useState<StudentRow[]>([]);
  const [marks,     setMarks]     = useState<Record<number, AttStatus>>({});
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');
  const [fetched,   setFetched]   = useState(false);

  const loadStudents = async () => {
    if (!className) { setError('Please select a grade first.'); return; }
    setLoading(true); setError(''); setFetched(false);
    try {
      const res = await apiFetch(
        `${API_BASE}/api/attendance/bulk/list/?date=${date}&class_name=${encodeURIComponent(className)}`
      );
      if (res.ok) {
        const data = await res.json();
        const rows: StudentRow[] = data.students;
        setStudents(rows);
        const initialMarks: Record<number, AttStatus> = {};
        rows.forEach(s => {
          initialMarks[s.student_id] = s.status !== 'upcoming' ? s.status as AttStatus : 'present';
        });
        setMarks(initialMarks);
        setFetched(true);
      } else {
        setError('Could not load students.');
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const markAll = (status: AttStatus) => {
    const updated: Record<number, AttStatus> = {};
    students.forEach(s => { updated[s.student_id] = status; });
    setMarks(updated);
  };

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
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
    { icon: <GraduationCap size={16} />,   label: 'Teachers',   path: '/teachers' },
    { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
    { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
    { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
    { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 12px; color: #45464D; font-size: 14px; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; color: #316BF3; }
        .nav-item-active { background: #316BF3 !important; color: #fff !important; font-weight: 600 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .att-btn { border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .att-btn:hover { opacity: 0.85; transform: scale(1.03); }
        .present-active   { background: #DCFCE7; color: #166534; }
        .absent-active    { background: #FEE2E2; color: #991B1B; }
        .holiday-active   { background: #FEF9C3; color: #854D0E; }
        .inactive-mark    { background: #F3F4F6; color: #9CA3AF; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .load-btn:hover { background: #003DAA !important; }
        .search-input:focus { border-color: #0051D5 !important; outline: none; }
        .table-row:hover { background: #F8FAFF !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
          <div style={{ background: '#316BF3', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0B1C30', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: '#76777D', margin: 0 }}>ADMIN PORTAL</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = window.location.pathname === item.path;
            return (
              <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}>
                {item.icon} {item.label}
              </div>
            );
          })}
          <button onClick={() => navigate('/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Bulk Attendance</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Mark attendance for an entire grade in one go — saves to MySQL instantly.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Admin</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* Config card */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 16px' }}>
              Select Grade & Date
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Grade</label>
                <select value={className} onChange={e => { setClassName(e.target.value); setFetched(false); }}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select a grade...</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" value={date} onChange={e => { setDate(e.target.value); setFetched(false); }}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Event Name</label>
                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button className="load-btn" onClick={loadStudents} disabled={loading}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '40px', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
                {loading ? 'Loading...' : 'Load Students'}
              </button>
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '12px 0 0' }}>{error}</p>}
          </div>

          {/* Students loaded */}
          {fetched && students.length > 0 && (
            <>
              {/* Summary + actions */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Counts */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#76777D', fontWeight: 500 }}>Mark all:</span>
                    <button className="att-btn present-active" onClick={() => markAll('present')}>✓ All Present</button>
                    <button className="att-btn absent-active"  onClick={() => markAll('absent')}>✕ All Absent</button>
                    <button className="att-btn holiday-active" onClick={() => markAll('holiday')}>⚑ All Holiday</button>

                    <div style={{ position: 'relative' }}>
                      <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
                      <input className="search-input" placeholder="Search student..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '12px', width: '160px', color: '#45464D', outline: 'none' }} />
                    </div>

                    {saved && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                        <Check size={13} /> Saved to MySQL!
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
              </div>

              {/* Table */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
                      {['#', 'STUDENT NAME', 'ROLL NO', 'GRADE', 'ATTENDANCE'].map((col, i) => (
                        <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
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
                          <td style={{ padding: '10px 20px', fontSize: '12px', color: '#76777D' }}>{s.class_name}</td>
                          <td style={{ padding: '10px 20px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className={`att-btn ${mark === 'present' ? 'present-active' : 'inactive-mark'}`}
                                onClick={() => setMarks(prev => ({ ...prev, [s.student_id]: 'present' }))}>
                                ✓ Present
                              </button>
                              <button className={`att-btn ${mark === 'absent' ? 'absent-active' : 'inactive-mark'}`}
                                onClick={() => setMarks(prev => ({ ...prev, [s.student_id]: 'absent' }))}>
                                ✕ Absent
                              </button>
                              <button className={`att-btn ${mark === 'holiday' ? 'holiday-active' : 'inactive-mark'}`}
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
              <p style={{ fontWeight: 600, color: '#45464D', margin: '0 0 6px' }}>No students found for this grade</p>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Make sure students are enrolled with this exact grade level.</p>
            </div>
          )}
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}