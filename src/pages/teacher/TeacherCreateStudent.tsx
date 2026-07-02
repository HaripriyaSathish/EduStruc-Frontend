import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Camera,
  ArrowLeft, User2, Phone, BookOpen as BookIcon
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

const API_BASE = import.meta.env.VITE_API_URL;

interface Course {
  id: number; course_name: string; course_code: string;
  max_students: number; semester: string; department: string;
}

const MAJORS = [
  'Theoretical Physics', 'Computer Science', 'Mathematics',
  'Engineering', 'Literature', 'Economics', 'Biology',
  'Chemistry', 'History', 'Arts',
];

export default function TeacherCreateStudent() {
  const navigate  = useNavigate();
  const user      = getSession();
  const photoRef  = useRef<HTMLInputElement>(null);

  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName:    '',
    lastName:     '',
    email:        '',
    studentId:    '',
    major:        'Theoretical Physics',
    enrollType:   'Full-time',
    courseId:     '',
    contactName:  '',
    contactPhone: '',
  });

  useEffect(() => {
    apiFetch(`${API_BASE}/api/courses/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setCourses(data);
        if (data.length > 0) setForm(p => ({ ...p, courseId: String(data[0].id) }));
      })
      .catch(console.error);
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedCourse = courses.find(c => String(c.id) === form.courseId);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.firstName || !form.lastName) { setError('First name and last name are required.'); return; }
    if (!form.email)                        { setError('Institutional email is required.'); return; }
    if (!form.studentId)                    { setError('Student ID number is required.'); return; }

    setLoading(true);
    try {
      const payload = {
        full_name:    `${form.firstName} ${form.lastName}`,
        email:        form.email,
        roll_number:  form.studentId,
        class_name:   selectedCourse?.course_name || form.major,
        section:      form.enrollType === 'Full-time' ? 'A' : 'B',
        academic_year:'2024-2025',
        status:       'active',
        phone:        form.contactPhone,
        address:      '',
        parent_name:  form.contactName,
        parent_phone: form.contactPhone,
        gender:       'O',
      };

      const res = await apiFetch(`${API_BASE}/api/students/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess('Student enrolled successfully!');
        setTimeout(() => navigate('/teacher/students'), 1500);
      } else {
        const data = await res.json();
        const msg  = data.email?.[0] || data.roll_number?.[0] || Object.values(data).flat().join(' ') || 'Enrollment failed.';
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
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
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
        .enroll-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .enroll-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .cancel-link:hover { color: #0051D5 !important; }
        .photo-wrap:hover .photo-overlay { opacity: 1 !important; }
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/students')}>Students</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Add New Student</span>
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

          {/* Back */}
          <button className="cancel-link" onClick={() => navigate('/teacher/students')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '16px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Students
          </button>

          {/* Info banner */}
          <div style={{ background: '#EFF4FF', border: '1px solid #B8D0F5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0051D5', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>i</span>
            </div>
            <p style={{ fontSize: '13px', color: '#0051D5', margin: 0 }}>
              You are registering a new student for the <strong>2024-2025</strong> Academic Year. Please ensure all mandatory fields are completed accurately.
            </p>
          </div>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
            <span style={{ color: '#C6C6CD', fontSize: '12px' }}>›</span>
            <span style={{ fontSize: '12px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/classes')}>Classes</span>
            <span style={{ color: '#C6C6CD', fontSize: '12px' }}>›</span>
            <span style={{ fontSize: '12px', color: '#0051D5', fontWeight: 500 }}>Add Student</span>
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: '0 0 4px' }}>New Student Registration</h2>
          <p style={{ fontSize: '13px', color: '#76777D', margin: '0 0 20px' }}>
            Enroll a new student into{' '}
            <span style={{ color: '#0051D5', fontWeight: 500 }}>{selectedCourse?.course_name || 'your class'}</span>.
            Ensure all primary fields are completed for institutional record-keeping.
          </p>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

            {/* LEFT — Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Personal Details */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <User2 size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Personal Details</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>First Name <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Julian"
                      value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Thorne"
                      value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Institutional Email <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} type="email" placeholder="j.thorne@university.edu"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Student ID Number <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="ID-2024-0891"
                      value={form.studentId} onChange={e => set('studentId', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Academic Background */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <BookIcon size={16} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Academic Background</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Major / Program</label>
                    <select className="form-input" style={inputStyle}
                      value={form.major} onChange={e => set('major', e.target.value)}>
                      {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Enrollment Type <span style={{ color: '#DC2626' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                      {['Full-time','Part-time'].map(type => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <div onClick={() => set('enrollType', type)}
                            style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${form.enrollType === type ? '#0051D5' : '#C6C6CD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                            {form.enrollType === type && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0051D5' }}></div>}
                          </div>
                          <span style={{ fontSize: '13px', color: '#45464D' }}>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ background: '#ECFDF5', borderRadius: '6px', padding: '6px', display: 'flex' }}>
                    <Phone size={14} color="#059669" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>Emergency Contact Information</h3>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Optional but recommended for laboratory-based courses.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
                  <div>
                    <label style={labelStyle}>Contact Name</label>
                    <input className="form-input" style={inputStyle} placeholder="Contact Name"
                      value={form.contactName} onChange={e => set('contactName', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input className="form-input" style={inputStyle} placeholder="Phone Number"
                      value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Photo + Class Confirmation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Profile Photo */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px' }}>PROFILE IDENTIFICATION</p>

                <div className="photo-wrap" onClick={() => photoRef.current?.click()}
                  style={{ width: '120px', height: '140px', border: '2px dashed #C6C6CD', borderRadius: '10px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: '#F8F9FF', transition: 'all 0.2s ease' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Camera size={24} color="#C6C6CD" />
                    </div>
                  )}
                  <div className="photo-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,81,213,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', borderRadius: '8px' }}>
                    <Camera size={20} color="#fff" />
                  </div>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <p style={{ fontSize: '12px', color: '#76777D', margin: 0, lineHeight: 1.5 }}>Upload a high-resolution portrait for the ID card system.</p>
              </div>

              {/* Class Confirmation */}
              <div style={{ background: '#0051D5', borderRadius: '12px', padding: '20px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 16px' }}>Class Confirmation</p>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '2px' }}>Course:</label>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFD700', margin: 0 }}>
                    {selectedCourse?.course_code || 'No Course'}
                  </p>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '2px' }}>Semester:</label>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
                    {selectedCourse?.semester?.split(' ').slice(0, 2).join(' ') || 'Fall 2024'}
                  </p>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Current Count:</label>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                      {selectedCourse ? `${Math.floor(selectedCourse.max_students * 0.8)} / ${selectedCourse.max_students}` : '0 / 0'}
                    </span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px' }}>
                    <div style={{ height: '5px', width: '80%', background: '#4EDEA3', borderRadius: '999px' }}></div>
                  </div>
                </div>

                {/* Course selector */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '6px' }}>Select Course:</label>
                  <select value={form.courseId} onChange={e => set('courseId', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', fontSize: '13px', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none', cursor: 'pointer' }}>
                    {courses.map(c => <option key={c.id} value={String(c.id)} style={{ background: '#0051D5', color: '#fff' }}>{c.course_name}</option>)}
                  </select>
                </div>

                <button className="enroll-btn" onClick={handleSubmit} disabled={loading}
                  style={{ width: '100%', background: '#fff', color: '#0051D5', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', transition: 'all 0.2s ease' }}>
                  {loading ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(0,81,213,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#0051D5" strokeWidth="3" strokeLinecap="round"/></svg>Enrolling...</>
                  ) : <>✓ Complete Enrollment</>}
                </button>
                <button onClick={() => navigate('/teacher/students')}
                  style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer', padding: '8px', transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
                  Cancel & Return
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Institutional Systems. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','System Status'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}