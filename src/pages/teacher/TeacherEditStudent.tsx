import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  User, Phone, Shield
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';
import StudentAvatarUpload from '../../components/StudentAvatarUpload';
const API_BASE = import.meta.env.VITE_API_URL;

interface FormData {
  full_name: string; date_of_birth: string; gender: string;
  email: string; phone: string; address: string;
  class_name: string; section: string; academic_year: string;
  roll_number: string; status: string;
  parent_name: string; parent_phone: string;
}

export default function TeacherEditStudent() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const [form, setForm] = useState<FormData>({
    full_name: '', date_of_birth: '', gender: '',
    email: '', phone: '', address: '',
    class_name: '', section: '', academic_year: '',
    roll_number: '', status: 'active',
    parent_name: '', parent_phone: '',
  });

  // Load existing student data
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/students/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            full_name:     data.full_name     || '',
            date_of_birth: data.date_of_birth || '',
            gender:        data.gender        || '',
            email:         data.email         || '',
            phone:         data.phone         || '',
            address:       data.address       || '',
            class_name:    data.class_name    || '',
            section:       data.section       || '',
            academic_year: data.academic_year || '',
            roll_number:   data.roll_number   || '',
            status:        data.status        || 'active',
    
            parent_name:   data.parent_name   || '',
            parent_phone:  data.parent_phone  || '',
          });
          setAvatarUrl(data.avatar_url || '');
        } else {
          setError('Student not found.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  const set = (k: keyof FormData, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleUpdate = async () => {
    setError('');
    if (!form.full_name || !form.email || !form.roll_number) {
      setError('Full Name, Email and Student ID are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/students/${id}/`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Student updated successfully!');
        setTimeout(() => navigate(`/teacher/students/${id}`), 1500);
      } else {
        const data = await res.json();
        const msg  = data.email?.[0] || data.roll_number?.[0] ||
          Object.values(data).flat().join(' ') || 'Update failed.';
        setError(msg);
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setSaving(false);
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
      <div style={{ color: '#0051D5' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>{title}</h3>
    </div>
  );

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
        .cancel-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .save-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .save-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
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
            const active = window.location.pathname.startsWith('/teacher/students');
            const isThis = item.label === 'Students' && active;
            return (
              <div key={i} className={`nav-item ${isThis ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: isThis ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: isThis ? 600 : 400 }}>
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate(`/teacher/students/${id}`)}>
              {form.full_name || 'Student'}
            </span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Edit</span>
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
          <button className="back-btn" onClick={() => navigate(`/teacher/students/${id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Student Profile
          </button>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '14px', margin: 0 }}>Loading student data...</p>
            </div>
          )}

          {!loading && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Edit Student</h1>
                <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Update student information and academic records.</p>
              </div>

              {/* Alerts */}
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

              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px' }}>
                {/* Student Photo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #F0F4FF' }}>
                  <StudentAvatarUpload
                    studentId={Number(id)}
                    currentAvatar={avatarUrl}
                    studentName={form.full_name || 'Student'}
                    onUploadDone={(url) => setAvatarUrl(url)}
                  />
                </div>
                {/* Personal Information */}
                <div style={{ marginBottom: '28px' }}>
                  <SectionTitle icon={<User size={16} />} title="Personal Information" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                      <input className="form-input" style={inputStyle}
                        value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth</label>
                      <input className="form-input" style={inputStyle} type="date"
                        value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Gender</label>
                      <select className="form-input" style={inputStyle}
                        value={form.gender} onChange={e => set('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Status</label>
                      <select className="form-input" style={inputStyle}
                        value={form.status} onChange={e => set('status', e.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={{ marginBottom: '28px' }}>
                  <SectionTitle icon={<Phone size={16} />} title="Contact Details" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Email Address <span style={{ color: '#DC2626' }}>*</span></label>
                      <input className="form-input" style={inputStyle} type="email"
                        value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input className="form-input" style={inputStyle}
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <textarea className="form-input" style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                      value={form.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>

                {/* Academic Placement */}
                <div style={{ marginBottom: '28px' }}>
                  <SectionTitle icon={<BookOpen size={16} />} title="Academic Placement" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Grade Level <span style={{ color: '#DC2626' }}>*</span></label>
                      <select className="form-input" style={inputStyle}
                        value={form.class_name} onChange={e => set('class_name', e.target.value)}>
                        <option value="">Select Grade</option>
                        {['9th Grade','10th Grade','11th Grade','12th Grade'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Student ID <span style={{ color: '#DC2626' }}>*</span></label>
                      <input className="form-input" style={inputStyle}
                        value={form.roll_number} onChange={e => set('roll_number', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Section</label>
                      <input className="form-input" style={inputStyle} placeholder="e.g. A"
                        value={form.section} onChange={e => set('section', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Academic Year</label>
                      <input className="form-input" style={inputStyle}
                        value={form.academic_year} onChange={e => set('academic_year', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div style={{ marginBottom: '28px' }}>
                  <SectionTitle icon={<Shield size={16} />} title="Guardian Information" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Guardian Full Name</label>
                      <input className="form-input" style={inputStyle}
                        value={form.parent_name} onChange={e => set('parent_name', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Emergency Phone</label>
                      <input className="form-input" style={inputStyle}
                        value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F0F4FF' }}>
                  <button className="cancel-btn" onClick={() => navigate(`/teacher/students/${id}`)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleUpdate} disabled={saving}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                    {saving ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </>
                    ) : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}