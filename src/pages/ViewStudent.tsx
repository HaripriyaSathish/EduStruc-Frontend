import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  User, Phone, Shield, Pencil, Trash2, Mail, MapPin
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface Student {
  id:            number;
  roll_number:   string;
  full_name:     string;
  email:         string;
  phone:         string;
  gender:        string;
  date_of_birth: string;
  class_name:    string;
  section:       string;
  academic_year: string;
  status:        string;
  address:       string;
  parent_name:   string;
  parent_phone:  string;
  created_at:    string;
}

export default function ViewStudent() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const user        = getSession();
  const [activeNav, setActiveNav] = useState('Students');
  const [student, setStudent]     = useState<Student | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/students/${id}/`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) {
          setStudent(await res.json());
        } else {
          setError('Student not found.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student?.full_name}?`)) return;
    try {
      await fetch(`${API_BASE}/api/students/${id}/`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      navigate('/students');
    } catch {
      alert('Delete failed. Try again.');
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/students' },
    { icon: <BookOpen size={16} />,         label: 'Courses',   path: '/courses' },
    { icon: <Calendar size={16} />,         label: 'Schedules', path: '/schedules' },
    { icon: <Settings size={16} />,         label: 'Settings',  path: '/settings' },
  ];

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500, color: '#76777D', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0B1C30', margin: 0, fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
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
        .edit-btn:hover { background: #DCE9FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .delete-btn:hover { background: #FEE2E2 !important; border-color: #EF4444 !important; color: #EF4444 !important; }
        .back-btn:hover { color: #0051D5 !important; }
        .add-btn:hover { background: #003DAA !important; }
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/students')}>Students</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>
              {loading ? 'Loading...' : student?.full_name || 'Student Profile'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Back button */}
          <button className="back-btn" onClick={() => navigate('/students')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Students
          </button>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', flexDirection: 'column' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '14px' }}>Loading student profile...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
              <button onClick={() => navigate('/students')}
                style={{ marginTop: '12px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>
                Back to Students
              </button>
            </div>
          )}

          {/* Student Profile */}
          {student && !loading && (
            <div style={{ maxWidth: '800px' }}>

              {/* Profile header card */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Avatar */}
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0051D5', fontWeight: 700, fontSize: '24px', flexShrink: 0 }}>
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: '0 0 4px' }}>{student.full_name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#76777D' }}>{student.roll_number}</span>
                      <span style={{ background: student.status === 'active' ? '#D1FAE5' : '#F3F4F6', color: student.status === 'active' ? '#009668' : '#6B7280', fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>{student.status}</span>
                      <span style={{ background: '#DCE9FF', color: '#0051D5', fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '999px' }}>{student.class_name} {student.section}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#76777D', fontSize: '12px' }}>
                        <Mail size={12} /> {student.email}
                      </div>
                      {student.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#76777D', fontSize: '12px' }}>
                          <Phone size={12} /> {student.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="edit-btn" onClick={() => navigate(`/students/${id}/edit`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="delete-btn" onClick={handleDelete}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* Personal Info */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<User size={16} />} title="Personal Information" />
                  <InfoRow label="Full Name"     value={student.full_name} />
                  <InfoRow label="Date of Birth" value={student.date_of_birth || '—'} />
                  <InfoRow label="Gender"        value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'} />
                </div>

                {/* Contact */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<Phone size={16} />} title="Contact Details" />
                  <InfoRow label="Email Address" value={student.email} />
                  <InfoRow label="Phone Number"  value={student.phone} />
                  <InfoRow label="Address"       value={student.address} />
                </div>

                {/* Academic */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<GraduationCap size={16} />} title="Academic Placement" />
                  <InfoRow label="Student ID"    value={student.roll_number} />
                  <InfoRow label="Grade Level"   value={`${student.class_name} ${student.section}`} />
                  <InfoRow label="Academic Year" value={student.academic_year} />
                  <InfoRow label="Status"        value={student.status} />
                </div>

                {/* Guardian */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<Shield size={16} />} title="Guardian Information" />
                  <InfoRow label="Guardian Name"  value={student.parent_name} />
                  <InfoRow label="Contact Number" value={student.parent_phone} />
                  <InfoRow label="Registered On"  value={new Date(student.created_at).toLocaleDateString()} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '16px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}