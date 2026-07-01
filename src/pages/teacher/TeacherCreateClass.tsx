import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  Zap, Eye, Users2, CheckCircle, AlertCircle
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Course { id: number; course_name: string; department: string; max_students: number; }

const SUBJECTS = [
  'Mathematics','Physics','Computer Science','Economics','Literature',
  'Biology','Chemistry','History','Arts','Engineering','Psychology',
];
const GRADE_LEVELS = [
  'Undergraduate Year 1','Undergraduate Year 2','Undergraduate Year 3',
  'Undergraduate Year 4','Graduate Level','PhD Level',
];
const SEMESTERS = ['Fall 2024','Spring 2025','Summer 2025','Winter 2025'];

export default function TeacherCreateClass() {
  const navigate = useNavigate();
  const user     = getSession();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [discoverable, setDiscoverable] = useState(true);
  const [autoEnroll,  setAutoEnroll]  = useState(false);

  const [form, setForm] = useState({
    className:   '',
    subject:     'Mathematics',
    gradeLevel:  'Undergraduate Year 1',
    semester:    'Fall 2024',
    description: '',
  });

  // Load existing courses to show department capacity
  useEffect(() => {
    apiFetch('http://127.0.0.1:8000/api/courses/')
      .then(r => r.ok ? r.json() : [])
      .then(setCourses)
      .catch(console.error);
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Department capacity — count courses with same subject
  const deptCount   = courses.filter(c =>
    c.department?.toLowerCase().includes(form.subject.toLowerCase())
  ).length;
  const deptCapacity = 20;
  const deptPct      = Math.min(100, Math.round((deptCount / deptCapacity) * 100));
  const isHighAvail  = deptCount < deptCapacity * 0.8;

  const handleCreate = async () => {
    setError('');
    if (!form.className.trim()) { setError('Class name is required.'); return; }

    setLoading(true);
    try {
      // Generate course code from class name + semester
      const words    = form.className.trim().split(' ');
      const code     = words.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 3) +
                       '-' + Math.floor(100 + Math.random() * 900);

      const payload = {
        course_name:  form.className.trim(),
        course_code:  code,
        credits:      3,
        department:   form.subject,
        instructor:   user?.full_name || 'Teacher',
        max_students: 40,
        status:       'active',
        academic_year:'2024-2025',
        semester:     `${form.semester} — ${form.gradeLevel}`,
        description:  form.description.trim(),
      };

      const res = await apiFetch('http://127.0.0.1:8000/api/courses/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess('Class created successfully!');
        setTimeout(() => navigate('/teacher/classes'), 1500);
      } else {
        const data = await res.json();
        const msg  = data.course_code?.[0] || data.course_name?.[0] ||
          Object.values(data).flat().join(' ') || 'Failed to create class.';
        setError(msg);
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontSize: '13px', color: '#45464D',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s ease',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500, color: '#45464D',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };

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
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .sem-chip { transition: all 0.15s ease; cursor: pointer; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; border: 1px solid #C6C6CD; background: #fff; color: #45464D; }
        .sem-chip:hover { border-color: #0051D5; color: #0051D5; }
        .sem-chip-active { background: #0051D5 !important; color: #fff !important; border-color: #0051D5 !important; }
        .draft-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .create-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .create-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .back-btn:hover { color: #0051D5 !important; }
        .template-btn:hover { background: rgba(255,255,255,0.2) !important; }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/classes')}>
              ← Courses
            </span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Create New Course</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Back */}
          <button className="back-btn" onClick={() => navigate('/teacher/classes')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '16px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Classes
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            {['Dashboard','Classes','New Class'].map((b, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: i === 2 ? '#0051D5' : '#76777D', fontWeight: i === 2 ? 500 : 400, cursor: i < 2 ? 'pointer' : 'default' }}
                  onClick={() => { if (i === 0) navigate('/teacher/dashboard'); if (i === 1) navigate('/teacher/classes'); }}>
                  {b}
                </span>
                {i < 2 && <span style={{ color: '#C6C6CD', fontSize: '12px' }}>›</span>}
              </span>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', display: 'flex', gap: '8px' }}>
              <span>⚠</span><p style={{ margin: 0 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#059669', display: 'flex', gap: '8px' }}>
              <span>✓</span><p style={{ margin: 0 }}>{success}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

            {/* LEFT — Form */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: '0 0 4px' }}>Create New Class</h2>
              <p style={{ fontSize: '13px', color: '#76777D', margin: '0 0 24px' }}>Set up a new academic module and invite your students to begin.</p>

              {/* Class Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Class Name <span style={{ color: '#DC2626' }}>*</span></label>
                <input className="form-input" style={inputStyle}
                  placeholder="e.g. Advanced Macroeconomics"
                  value={form.className} onChange={e => set('className', e.target.value)} />
              </div>

              {/* Subject + Grade Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Subject Area</label>
                  <select className="form-input" style={inputStyle}
                    value={form.subject} onChange={e => set('subject', e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Grade Level / Year</label>
                  <select className="form-input" style={inputStyle}
                    value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}>
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Academic Semester chips */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Academic Semester</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SEMESTERS.map(s => (
                    <button key={s} className={`sem-chip ${form.semester === s ? 'sem-chip-active' : ''}`}
                      onClick={() => set('semester', s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Course Description <span style={{ color: '#76777D', fontWeight: 400 }}>(Optional)</span></label>
                <textarea className="form-input"
                  style={{ ...inputStyle, height: '110px', resize: 'vertical' }}
                  placeholder="Briefly outline the course objectives..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="draft-btn" onClick={() => navigate('/teacher/classes')}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  Save as Draft
                </button>
                <button className="create-btn" onClick={handleCreate} disabled={loading}
                  style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                  {loading ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Creating...</>
                  ) : 'Create Class'}
                </button>
              </div>
            </div>

            {/* RIGHT — Quick Template + Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Quick Template */}
              <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Zap size={16} color="#FFD700" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0 }}>Quick Template</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Use pre-filled curriculum data for standard institutional courses.
                </p>
                <button className="template-btn"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                  Browse Templates →
                </button>
              </div>

              {/* Visibility & Access */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Eye size={15} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>Visibility & Access</h3>
                </div>

                {[
                  { label: 'Discoverable', desc: 'Students can find this class', state: discoverable, set: setDiscoverable },
                  { label: 'Auto-enrollment', desc: 'These settings can be modified later in the Class Settings panel.', state: autoEnroll, set: setAutoEnroll },
                ].map((toggle, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: i === 0 ? '14px' : 0, paddingBottom: i === 0 ? '14px' : 0, borderBottom: i === 0 ? '1px solid #F0F4FF' : 'none' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>{toggle.label}</p>
                      {i === 1 && <p style={{ fontSize: '11px', color: '#76777D', margin: 0, lineHeight: 1.4 }}>{toggle.desc}</p>}
                    </div>
                    <button onClick={() => toggle.set(!toggle.state)}
                      style={{ width: '40px', height: '22px', borderRadius: '999px', background: toggle.state ? '#0051D5' : '#C6C6CD', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: toggle.state ? '21px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Department Capacity */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Users2 size={15} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>Department Capacity</h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#45464D', fontWeight: 500 }}>{form.subject} Dept.</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0B1C30' }}>{deptCount}/{deptCapacity} Classes</span>
                </div>
                <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px', marginBottom: '10px' }}>
                  <div style={{ height: '6px', width: `${deptPct}%`, background: isHighAvail ? '#009668' : '#DC2626', borderRadius: '999px', transition: 'width 0.6s ease' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isHighAvail
                    ? <CheckCircle size={13} color="#059669" />
                    : <AlertCircle size={13} color="#DC2626" />}
                  <span style={{ fontSize: '12px', color: isHighAvail ? '#059669' : '#DC2626', fontWeight: 500 }}>
                    {isHighAvail ? 'Room availability is currently high.' : 'Department is near capacity.'}
                  </span>
                </div>
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