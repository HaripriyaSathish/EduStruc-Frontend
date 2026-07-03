import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  FilePlus, FileText, Upload, Trash2
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

interface Course { id: number; course_name: string; course_code: string; }

const ASSIGNMENT_TYPES = ['Homework','Quiz','Lab Report','Project','Exam','Essay','Presentation'];

export default function CreateAssignment() {
  const navigate = useNavigate();
  const user     = getSession();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [file,     setFile]     = useState<File | null>(null);

  const [form, setForm] = useState({
    title:        '',
    type:         'Homework',
    courseId:     '',
    dueDate:      '',
    dueTime:      '23:59',
    maxPoints:    '100',
    instructions: '',
    allowLate:    false,
    visible:      true,
  });

  useEffect(() => {
    apiFetch(`${API_BASE}/api/courses/`)
      .then(r => r.ok ? r.json() : [])
      .then(setCourses)
      .catch(console.error);
  }, []);

  const set = (k: string, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.title)    { setError('Assignment title is required.'); return; }
    if (!form.courseId) { setError('Please select a course.'); return; }
    if (!form.dueDate)  { setError('Due date is required.'); return; }

    setLoading(true);
    try {
      const existing = JSON.parse(localStorage.getItem('edustruc_assignments') || '[]');
      const newItem  = {
        id:           Date.now(),
        title:        form.title,
        type:         form.type,
        courseId:     form.courseId,
        courseName:   courses.find(c => String(c.id) === form.courseId)?.course_name || '',
        dueDate:      form.dueDate,
        dueTime:      form.dueTime,
        maxPoints:    parseInt(form.maxPoints) || 100,
        instructions: form.instructions,
        allowLate:    form.allowLate,
        visible:      form.visible,
        fileName:     file?.name || null,
        created:      new Date().toISOString(),
        createdBy:    user?.full_name || 'Teacher',
      };
      localStorage.setItem('edustruc_assignments', JSON.stringify([...existing, newItem]));
      setSuccess('Assignment created successfully!');
      setTimeout(() => navigate('/teacher/assignments'), 1500);
    } catch {
      setError('Failed to create assignment.');
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
        .add-btn:hover { background: #003DAA !important; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .type-chip { transition: all 0.15s ease; cursor: pointer; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; border: 1px solid #C6C6CD; background: #fff; color: #45464D; }
        .type-chip:hover { border-color: #0051D5; color: #0051D5; background: #F0F7FF; }
        .type-chip-active { background: #0051D5 !important; color: #fff !important; border-color: #0051D5 !important; }
        .cancel-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .submit-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .submit-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .upload-zone:hover { border-color: #0051D5 !important; background: #F0F7FF !important; cursor: pointer; }
        .back-btn:hover { color: #0051D5 !important; }
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
          <button className="add-btn" onClick={() => navigate('/teacher/students/new')}
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Create Assignment</span>
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

          {/* Back button */}
          <button className="back-btn" onClick={() => navigate('/teacher/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Create Assignment</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Set up a new assignment for your students.</p>
            </div>

            {/* Error / Success */}
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

            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Type chips */}
              <div>
                <label style={labelStyle}>Assignment Type</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ASSIGNMENT_TYPES.map(t => (
                    <button key={t} className={`type-chip ${form.type === t ? 'type-chip-active' : ''}`}
                      onClick={() => set('type', t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title + Course */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Assignment Title <span style={{ color: '#DC2626' }}>*</span></label>
                  <input className="form-input" style={inputStyle}
                    placeholder="e.g. Quiz 3: Integration by Parts"
                    value={form.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Course <span style={{ color: '#DC2626' }}>*</span></label>
                  <select className="form-input" style={inputStyle}
                    value={form.courseId} onChange={e => set('courseId', e.target.value)}>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.course_name} ({c.course_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due date + time + points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Due Date <span style={{ color: '#DC2626' }}>*</span></label>
                  <input className="form-input" style={inputStyle} type="date"
                    value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Due Time</label>
                  <input className="form-input" style={inputStyle} type="time"
                    value={form.dueTime} onChange={e => set('dueTime', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Max Points</label>
                  <input className="form-input" style={inputStyle} type="number" min="1" max="1000"
                    value={form.maxPoints} onChange={e => set('maxPoints', e.target.value)} />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label style={labelStyle}>Instructions</label>
                <textarea className="form-input"
                  style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                  placeholder="Describe the assignment, requirements, and grading criteria..."
                  value={form.instructions} onChange={e => set('instructions', e.target.value)} />
              </div>

              {/* File attachment */}
              <div>
                <label style={labelStyle}>Attachment <span style={{ color: '#76777D', fontWeight: 400 }}>(Optional — PDF, DOCX up to 10MB)</span></label>
                {!file ? (
                  <div className="upload-zone" onClick={() => fileRef.current?.click()}
                    style={{ border: '2px dashed #C6C6CD', borderRadius: '10px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#F8F9FF', transition: 'all 0.2s ease' }}>
                    <div style={{ background: '#DCE9FF', borderRadius: '10px', padding: '10px', display: 'flex' }}>
                      <Upload size={20} color="#0051D5" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>Click to upload file</p>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>PDF, DOCX, XLSX up to 10MB</p>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.pptx"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f && f.size <= 10 * 1024 * 1024) setFile(f);
                        else if (f) setError('File must be under 10MB');
                      }} />
                  </div>
                ) : (
                  <div style={{ border: '1px solid #C6C6CD', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F9FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#DCE9FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                        <FileText size={16} color="#0051D5" />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>{file.name}</p>
                        <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{(file.size / 1024).toFixed(1)} KB • Attached</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex', padding: '4px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '32px', padding: '16px 0', borderTop: '1px solid #F0F4FF', borderBottom: '1px solid #F0F4FF' }}>
                {[
                  { label: 'Allow Late Submissions', key: 'allowLate', val: form.allowLate },
                  { label: 'Visible to Students',    key: 'visible',   val: form.visible },
                ].map(toggle => (
                  <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => set(toggle.key, !toggle.val)}
                      style={{ width: '40px', height: '22px', borderRadius: '999px', background: toggle.val ? '#0051D5' : '#C6C6CD', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: toggle.val ? '21px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </button>
                    <span style={{ fontSize: '13px', color: '#45464D', fontWeight: 500 }}>{toggle.label}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="cancel-btn" onClick={() => navigate('/teacher/dashboard')}
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
                  ) : (
                    <><FilePlus size={14} /> Create Assignment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}