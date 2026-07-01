import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Info,
  User, Phone, GraduationCap as AcademicIcon, Shield
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface FormData {
  full_name:        string;
  date_of_birth:    string;
  gender:           string;
  nationality:      string;
  email:            string;
  phone:            string;
  address:          string;
  class_name:       string;
  section:          string;
  academic_year:    string;
  enrollment_date:  string;
  roll_number:      string;
  status:           string;
  parent_name:      string;
  parent_phone:     string;
  relationship:     string;
  alternate_contact:string;
  advisor:          string;
}

export default function CreateStudent() {
  const navigate = useNavigate();
  const user     = getSession();
  const [activeNav, setActiveNav] = useState('Students');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [form, setForm] = useState<FormData>({
    full_name: '', date_of_birth: '', gender: '', nationality: '',
    email: '', phone: '', address: '',
    class_name: '', section: '', academic_year: '2024-2025',
    enrollment_date: '', roll_number: '', status: 'active',
    parent_name: '', parent_phone: '', relationship: '',
    alternate_contact: '', advisor: '',
  });

  const set = (key: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    // Validation
    if (!form.full_name || !form.email || !form.class_name || !form.roll_number) {
      setError('Please fill in all required fields: Full Name, Email, Grade Level, Student ID.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        full_name:        form.full_name,
        email:            form.email,
        phone:            form.phone,
        gender:           form.gender || 'O',
        date_of_birth:    form.date_of_birth || null,
        class_name:       form.class_name,
        section:          form.section,
        academic_year:    form.academic_year,
        roll_number:      form.roll_number,
        status:           form.status,
        address:          form.address,
        parent_name:      form.parent_name,
        parent_phone:     form.parent_phone,
      };
      const res = await fetch('http://127.0.0.1:8000/api/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess('Student registered successfully!');
        setTimeout(() => navigate('/students'), 1500);
      } else {
        const data = await res.json();
        const msg = data.email?.[0] || data.roll_number?.[0] || data.full_name?.[0] || 'Registration failed. Please check the form.';
        setError(msg);
      }
    } catch {
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

  // Reusable input style
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
  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
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
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; outline: none; }
        .cancel-btn:hover { background: #F0F4FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .submit-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .submit-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .add-btn:hover { background: #003DAA !important; }
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/students')}>Students</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Add New Student</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        {/* Form */}
        <main style={{ padding: '28px 32px', flex: 1 }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>

            {/* Page title */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Add New Student</h1>
              <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Define administrative and academic parameters for the student.</p>
            </div>

            {/* Info banner */}
            <div style={{ background: '#EFF4FF', border: '1px solid #B8D0F5', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Info size={16} style={{ color: '#0051D5', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0051D5', margin: 0 }}>
                You are registering a student for the <strong>{form.academic_year}</strong> Academic Year. Please ensure all mandatory fields are completed accurately.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#DC2626', flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#059669' }}>✓</span>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Form card */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '28px' }}>

              {/* ── Personal Information ────────────── */}
              <div style={{ marginBottom: '32px' }}>
                {sectionTitle(<User size={16} />, 'Personal Information')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Jonathan Doe"
                      value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input className="form-input" style={inputStyle} type="date" placeholder="MM/DD/YYYY"
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
                    <label style={labelStyle}>Nationality</label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. United States"
                      value={form.nationality} onChange={e => set('nationality', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ── Contact Details ─────────────────── */}
              <div style={{ marginBottom: '32px' }}>
                {sectionTitle(<Phone size={16} />, 'Contact Details')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Email Address <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} type="email" placeholder="j.doe@example.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input className="form-input" style={inputStyle} placeholder="+1 (555) 000-0000"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Permanent Address</label>
                  <textarea className="form-input" style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                    placeholder="Enter full residential address..."
                    value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>

              {/* ── Academic Placement ──────────────── */}
              <div style={{ marginBottom: '32px' }}>
                {sectionTitle(<AcademicIcon size={16} />, 'Academic Placement')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Grade Level <span style={{ color: '#DC2626' }}>*</span></label>
                    <select className="form-input" style={inputStyle}
                      value={form.class_name} onChange={e => set('class_name', e.target.value)}>
                      <option value="">Select Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                      <option value="11th Grade">11th Grade</option>
                      <option value="12th Grade">12th Grade</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Enrollment Date</label>
                    <input className="form-input" style={inputStyle} type="date"
                      value={form.enrollment_date} onChange={e => set('enrollment_date', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Student ID <span style={{ color: '#DC2626' }}>*</span></label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. STU-2024-001"
                      value={form.roll_number} onChange={e => set('roll_number', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Section</label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. A"
                      value={form.section} onChange={e => set('section', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Major / Department</label>
                    <select className="form-input" style={inputStyle}
                      value={form.academic_year} onChange={e => set('academic_year', e.target.value)}>
                      <option value="2024-2025">2024-2025</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Literature">Literature</option>
                      <option value="Economics">Economics</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="History">History</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Assigned Advisor</label>
                    <input className="form-input" style={inputStyle} placeholder="Search advisor name..."
                      value={form.advisor} onChange={e => set('advisor', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ── Guardian Information ────────────── */}
              <div style={{ marginBottom: '32px' }}>
                {sectionTitle(<Shield size={16} />, 'Guardian Information')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Guardian Full Name</label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Martha Doe"
                      value={form.parent_name} onChange={e => set('parent_name', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Relationship</label>
                    <input className="form-input" style={inputStyle} placeholder="e.g. Mother, Father, Guardian"
                      value={form.relationship} onChange={e => set('relationship', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency Phone</label>
                    <input className="form-input" style={inputStyle} placeholder="+1 (555) 000-8888"
                      value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Alternate Contact</label>
                    <input className="form-input" style={inputStyle} placeholder="Optional phone number"
                      value={form.alternate_contact} onChange={e => set('alternate_contact', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F0F4FF' }}>
                <button className="cancel-btn" onClick={() => navigate('/students')}
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
                      Registering...
                    </>
                  ) : <>✓ Register Student</>}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '16px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Institutional Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'System Status'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}