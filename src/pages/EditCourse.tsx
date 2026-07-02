import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Info,
  Clock, Users2, BookMarked, FileText, Upload, X, Trash2
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function EditCourse() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [activeNav, setActiveNav]         = useState('Courses');
  const [pageLoading, setPageLoading]     = useState(true);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [courseTitle, setCourseTitle]     = useState('');
  const [courseCode, setCourseCode]       = useState('');
  const [creditHours, setCreditHours]     = useState('3.0');
  const [department, setDepartment]       = useState('');
  const [instructor, setInstructor]       = useState('');
  const [taInput, setTaInput]             = useState('');
  const [tas, setTas]                     = useState<string[]>([]);
  const [semester, setSemester]           = useState('');
  const [room, setRoom]                   = useState('');
  const [selectedDays, setSelectedDays]   = useState<string[]>([]);
  const [startTime, setStartTime]         = useState('09:00');
  const [endTime, setEndTime]             = useState('10:30');
  const [maxCapacity, setMaxCapacity]     = useState('45');
  const [waitlist, setWaitlist]           = useState(true);
  const [prerequisites, setPrerequisites] = useState('');
  const [overview, setOverview]           = useState('');
  const [status, setStatus]               = useState('active');
  const [academicYear, setAcademicYear]   = useState('2024-2025');
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [dragOver, setDragOver]           = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/courses/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.course_name || '');
          setCourseCode(data.course_code || '');
          setCreditHours(data.credits != null ? String(data.credits) : '3.0');
          setDepartment(data.department || '');
          setInstructor(data.instructor || '');
          setMaxCapacity(data.max_students != null ? String(data.max_students) : '45');
          setOverview(data.description || '');
          setSemester(data.semester || '');
          setStatus(data.status || 'active');
          setAcademicYear(data.academic_year || '2024-2025');
        } else {
          setError('Course not found.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleDay = (day: string) =>
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const addTA = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taInput.trim()) {
      setTas(prev => [...prev, taInput.trim()]);
      setTaInput('');
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setError('Only PDF and DOCX files are allowed.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return; }
    setError('');
    setUploadedFile(file);
  };

  const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleSubmit = async () => {
    setError('');

    if (!courseTitle.trim()) { setError('Course Title is required.'); return; }
    if (!courseCode.trim())  { setError('Course Code is required.'); return; }
    if (!department.trim())  { setError('Department is required.'); return; }
    if (!instructor.trim())  { setError('Primary Instructor is required.'); return; }

    setLoading(true);
    try {
      // If new days/room were picked, rebuild the schedule string; otherwise keep the existing value
      const daysStr     = selectedDays.length ? selectedDays.join('/') : '';
      const scheduleStr = daysStr
        ? `${daysStr} ${startTime} - ${endTime}${room ? ' — ' + room : ''}`
        : `${semester}${room && !semester.includes(room) ? ' — ' + room : ''}`;

      const payload = {
        course_name:  courseTitle.trim(),
        course_code:  courseCode.trim(),
        credits:      parseFloat(creditHours) || 3.0,
        department:   department.trim(),
        instructor:   instructor.trim(),
        max_students: parseInt(maxCapacity) || 45,
        status,
        academic_year: academicYear,
        semester:     scheduleStr || semester,
        description:  overview.trim(),
      };

      console.log('Sending payload:', payload); // debug

      const res = await apiFetch(`${API_BASE}/api/courses/${id}/`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Response:', res.status, data); // debug

      if (res.ok) {
        setSuccess('Course updated successfully! Redirecting...');
        setTimeout(() => navigate(`/courses/${id}`), 1500);
      } else {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(' | ');
        setError(msg || 'Failed to update course.');
      }
    } catch (e) {
      console.error('Submit error:', e);
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/students' },
    { icon: <BookOpen size={16} />,         label: 'Courses',   path: '/courses' },
    { icon: <Calendar size={16} />,         label: 'Schedules', path: '/schedules' },
    { icon: <Settings size={16} />,         label: 'Settings',  path: '/settings' },
  ];

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
  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      <div style={{ color: '#0051D5' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .day-btn { transition: all 0.15s ease; cursor: pointer; border: 1px solid #C6C6CD; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: 600; background: #fff; color: #45464D; }
        .day-btn:hover { border-color: #0051D5; color: #0051D5; }
        .day-btn-active { background: #0051D5 !important; color: #fff !important; border-color: #0051D5 !important; }
        .cancel-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .save-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .add-btn:hover { background: #003DAA !important; }
        .upload-zone:hover { border-color: #0051D5 !important; background: #F0F7FF !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
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
            style={{ background: '#0042AA', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom"><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/courses')}>Courses</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate(`/courses/${id}`)}>{courseTitle || 'Course'}</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Edit Course</span>
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

          {pageLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', flexDirection: 'column' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '14px' }}>Loading course details...</p>
            </div>
          ) : error && !courseTitle ? (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
              <button onClick={() => navigate('/courses')}
                style={{ marginTop: '12px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>
                Back to Courses
              </button>
            </div>
          ) : (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Edit Course</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Update administrative and academic parameters for this course.</p>
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#DC2626', flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#059669' }}>✓</span>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Course Basics + Faculty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* Course Basics */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <SectionTitle icon={<Info size={16} />} title="Course Basics" />
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Course Title <span style={{ color: '#DC2626' }}>*</span></label>
                  <input className="form-input" style={inputStyle} placeholder="e.g. Advanced Structural Engineering"
                    value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Course Code <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. CIV-402"
                      value={courseCode} onChange={e => setCourseCode(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Credit Hours</label>
                    <select className="form-input" style={inputStyle} value={creditHours} onChange={e => setCreditHours(e.target.value)}>
                      {['1.0','2.0','3.0','4.0','5.0','6.0'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Department <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Faculty of Civil Engineering"
                      value={department} onChange={e => setDepartment(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select className="form-input" style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="active">In Progress</option>
                      <option value="inactive">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Faculty */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <SectionTitle icon={<Users2 size={16} />} title="Faculty" />
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Primary Instructor <span style={{ color: '#DC2626' }}>*</span></label>
                  <input className="form-input" style={inputStyle} placeholder="e.g. Dr. Elena Rosetti"
                    value={instructor} onChange={e => setInstructor(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Teaching Assistants</label>
                  <div style={{ minHeight: '44px', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: '#fff' }}>
                    {tas.map((ta, i) => (
                      <span key={i} style={{ background: '#DCE9FF', color: '#0051D5', fontSize: '12px', fontWeight: 500, padding: '3px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {ta}
                        <button onClick={() => setTas(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5', padding: 0, display: 'flex' }}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input placeholder="Add TA... (press Enter)" value={taInput}
                      onChange={e => setTaInput(e.target.value)} onKeyDown={addTA}
                      style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#45464D', flex: 1, minWidth: '80px', background: 'transparent' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#76777D', margin: '4px 0 0' }}>Press Enter to add each TA</p>
                </div>
              </div>
            </div>

            {/* Schedule + Enrollment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* Schedule */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <SectionTitle icon={<Clock size={16} />} title="Schedule & Location" />
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Semester / Schedule</label>
                  <input className="form-input" style={inputStyle} placeholder="e.g. Fall 2024 — Engineering Hall 302"
                    value={semester} onChange={e => setSemester(e.target.value)} />
                  <p style={{ fontSize: '11px', color: '#76777D', margin: '4px 0 0' }}>Current stored value — edit directly, or pick days/times below to regenerate it.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Room / Lab Assignment</label>
                  <input className="form-input" style={inputStyle} placeholder="e.g. Engineering Hall 302"
                    value={room} onChange={e => setRoom(e.target.value)} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Days of the Week <span style={{ color: '#76777D', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — regenerates schedule above)</span></label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {DAYS.map(day => (
                      <button key={day} className={`day-btn ${selectedDays.includes(day) ? 'day-btn-active' : ''}`}
                        onClick={() => toggleDay(day)}>{day}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input className="form-input" style={inputStyle} type="time"
                      value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input className="form-input" style={inputStyle} type="time"
                      value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Enrollment */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                <SectionTitle icon={<BookMarked size={16} />} title="Enrollment" />
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Maximum Capacity</label>
                  <input className="form-input" style={inputStyle} type="number" min="1" placeholder="45"
                    value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '12px 0', borderTop: '1px solid #F0F4FF', borderBottom: '1px solid #F0F4FF' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>Enable Waitlist</p>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Allow students to join waitlist when full</p>
                  </div>
                  <button onClick={() => setWaitlist(w => !w)}
                    style={{ width: '44px', height: '24px', borderRadius: '999px', background: waitlist ? '#0051D5' : '#C6C6CD', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: waitlist ? '23px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </button>
                </div>
                <div>
                  <label style={labelStyle}>Prerequisites</label>
                  <textarea className="form-input" style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                    placeholder="List course codes..." value={prerequisites} onChange={e => setPrerequisites(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Syllabus & Description */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Syllabus & Description" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Course Overview</label>
                  <textarea className="form-input" style={{ ...inputStyle, height: '180px', resize: 'vertical' }}
                    placeholder="Enter course description, learning objectives, and curriculum overview..."
                    value={overview} onChange={e => setOverview(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Syllabus Document <span style={{ color: '#76777D', fontWeight: 400 }}>(PDF/DOCX, max 10MB)</span></label>
                  {!uploadedFile ? (
                    <div className="upload-zone"
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                      onClick={() => fileRef.current?.click()}
                      style={{ border: `2px dashed ${dragOver ? '#0051D5' : '#C6C6CD'}`, borderRadius: '10px', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', background: dragOver ? '#F0F7FF' : '#F8F9FF', transition: 'all 0.2s ease', height: '180px', justifyContent: 'center' }}>
                      <div style={{ background: '#DCE9FF', borderRadius: '10px', padding: '12px', display: 'flex' }}>
                        <Upload size={20} color="#0051D5" />
                      </div>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>Click to upload syllabus</p>
                      <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>PDF, DOCX up to 10MB</p>
                      <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                        onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #C6C6CD', borderRadius: '10px', overflow: 'hidden', height: '180px', display: 'flex', flexDirection: 'column' }}>
                      <div className="upload-zone"
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}
                        style={{ flex: 1, border: `2px dashed ${dragOver ? '#0051D5' : '#C6C6CD'}`, borderRadius: '8px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', background: '#F8F9FF' }}>
                        <Upload size={16} color="#76777D" />
                        <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Drop to replace file</p>
                        <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                          onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                      </div>
                      <div style={{ padding: '10px 14px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F9FF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#DCE9FF', borderRadius: '6px', padding: '6px', display: 'flex' }}>
                            <FileText size={14} color="#0051D5" />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>{uploadedFile.name}</p>
                            <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{formatFileSize(uploadedFile.size)} • UPLOADED</p>
                          </div>
                        </div>
                        <button onClick={() => setUploadedFile(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="cancel-btn" onClick={() => navigate(`/courses/${id}`)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSubmit} disabled={loading}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
          )}
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '16px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
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