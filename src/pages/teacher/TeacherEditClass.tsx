import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface FormData {
  course_name: string; course_code: string; department: string;
  credits: string; max_students: string; status: string;
  semester: string; description: string;
}

export default function TeacherEditClass() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<FormData>({
    course_name: '', course_code: '', department: '',
    credits: '3', max_students: '40', status: 'active',
    semester: '', description: '',
  });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/courses/${id}/`);
        if (res.ok) {
          const d = await res.json();
          setForm({
            course_name:  d.course_name  || '',
            course_code:  d.course_code  || '',
            department:   d.department   || '',
            credits:      String(d.credits || 3),
            max_students: String(d.max_students || 40),
            status:       d.status       || 'active',
            semester:     d.semester     || '',
            description:  d.description  || '',
          });
        } else setError('Class not found.');
      } catch { setError('Cannot connect to server.'); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [id]);

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!form.course_name || !form.course_code) { setError('Class name and code are required.'); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/courses/${id}/`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          course_name:  form.course_name,
          course_code:  form.course_code,
          department:   form.department,
          credits:      parseInt(form.credits) || 3,
          max_students: parseInt(form.max_students) || 40,
          status:       form.status,
          semester:     form.semester,
          description:  form.description,
          instructor:   user?.full_name || 'Teacher',
          academic_year:'2024-2025',
        }),
      });
      if (res.ok) {
        setSuccess('Class updated successfully!');
        setTimeout(() => navigate(`/teacher/classes/${id}`), 1200);
      } else {
        const d = await res.json();
        setError(Object.values(d).flat().join(' ') || 'Failed to update class.');
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setSaving(false); }
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
    background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500, color: '#45464D',
    letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .form-input:focus { border-color: #0051D5 !important; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; }
        .cancel-btn:hover { background: #F0F4FF !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <aside style={{ width: '240px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}><GraduationCap size={20} color="#fff" /></div>
          <div><p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc SMS</p><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>ADMIN PORTAL</p></div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = item.path === '/teacher/classes';
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

      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/classes')}>Classes</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Edit Class</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name}</p>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1 }}>
          <button onClick={() => navigate(`/teacher/classes/${id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '20px', padding: 0 }}>
            <ArrowLeft size={15} /> Back to Class
          </button>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{ width: '30px', height: '30px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
          ) : (
            <div style={{ maxWidth: '700px' }}>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 20px' }}>Edit Class</h1>

              {error   && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>{error}</div>}
              {success && <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#059669' }}>{success}</div>}

              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={labelStyle}>Class Name</label><input className="form-input" style={inputStyle} value={form.course_name} onChange={e => set('course_name', e.target.value)} /></div>
                  <div><label style={labelStyle}>Course Code</label><input className="form-input" style={inputStyle} value={form.course_code} onChange={e => set('course_code', e.target.value)} /></div>
                  <div><label style={labelStyle}>Department</label><input className="form-input" style={inputStyle} value={form.department} onChange={e => set('department', e.target.value)} /></div>
                  <div><label style={labelStyle}>Credits</label><input className="form-input" style={inputStyle} type="number" value={form.credits} onChange={e => set('credits', e.target.value)} /></div>
                  <div><label style={labelStyle}>Max Students</label><input className="form-input" style={inputStyle} type="number" value={form.max_students} onChange={e => set('max_students', e.target.value)} /></div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select className="form-input" style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Semester</label>
                  <input className="form-input" style={inputStyle} value={form.semester} onChange={e => set('semester', e.target.value)} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea className="form-input" style={{ ...inputStyle, height: '90px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="cancel-btn" onClick={() => navigate(`/teacher/classes/${id}`)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                  <button className="save-btn" onClick={handleSave} disabled={saving}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}