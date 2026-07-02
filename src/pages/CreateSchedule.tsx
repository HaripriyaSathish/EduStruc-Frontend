import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  Clock, MapPin, BookOpen as BookIcon, User2
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function CreateSchedule() {
  const navigate = useNavigate();
  const user     = getSession();
  const [activeNav, setActiveNav] = useState('Schedules');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [form, setForm] = useState({
    course_name:  '',
    instructor:   '',
    day:          'Monday',
    start_time:   '09:00',
    end_time:     '10:30',
    room:         '',
    academic_year:'2024-2025',
    semester:     'Fall 2024',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.course_name || !form.instructor || !form.day) {
      setError('Please fill in Course Name, Instructor and Day.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/schedules/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Schedule created successfully!');
        setTimeout(() => navigate('/schedules'), 1500);
      } else {
        const data = await res.json();
        const msg = Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)?v[0]:v}`).join(' | ');
        setError(msg || 'Failed to create schedule.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s ease',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px',
    color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/students' },
    { icon: <BookOpen size={16} />,         label: 'Courses',   path: '/courses' },
    { icon: <Calendar size={16} />,         label: 'Schedules', path: '/schedules' },
    { icon: <Settings size={16} />,         label: 'Settings',  path: '/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .cancel-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .submit-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .submit-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .add-btn:hover { background: #003DAA !important; }
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
          <div className="sidebar-bottom"><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom" style={{ cursor: 'pointer' }} onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/schedules')}>Schedules</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Create New Schedule</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>
          <button onClick={() => navigate('/schedules')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0051D5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
            <ArrowLeft size={15} /> Back to Schedules
          </button>

          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Create New Schedule</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Define time slots, faculty, and venue for a course.</p>
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#DC2626' }}>⚠</span>
                <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#059669' }}>✓</span>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0 }}>{success}</p>
              </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Course & Instructor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
                  <BookIcon size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Course Information</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Course Name <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Quantum Physics II"
                      value={form.course_name} onChange={e => set('course_name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Instructor <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Prof. Aria Thorne"
                      value={form.instructor} onChange={e => set('instructor', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
                  <Clock size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Schedule</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Day <span style={{ color: '#DC2626' }}>*</span></label>
                    <select className="form-input" style={inputStyle} value={form.day} onChange={e => set('day', e.target.value)}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input className="form-input" style={inputStyle} type="time"
                      value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input className="form-input" style={inputStyle} type="time"
                      value={form.end_time} onChange={e => set('end_time', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
                  <MapPin size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Location & Term</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Room / Venue</label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Physics Hall 402"
                      value={form.room} onChange={e => set('room', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Semester</label>
                    <select className="form-input" style={inputStyle} value={form.semester} onChange={e => set('semester', e.target.value)}>
                      {['Fall 2024','Spring 2025','Summer 2025','Fall 2025'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Academic Year</label>
                    <select className="form-input" style={inputStyle} value={form.academic_year} onChange={e => set('academic_year', e.target.value)}>
                      {['2023-2024','2024-2025','2025-2026'].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px', borderTop: '1px solid #F0F4FF' }}>
                <button className="cancel-btn" onClick={() => navigate('/schedules')}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}
                  style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                  {loading ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Creating...
                    </>
                  ) : '✓ Create Schedule'}
                </button>
              </div>
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