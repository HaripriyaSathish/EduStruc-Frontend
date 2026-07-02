import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  Mail, Phone, Shield, User, Pencil, Trash2,
  TrendingUp, BookMarked, CheckCircle
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

interface Student {
  id: number; roll_number: string; full_name: string; email: string;
  phone: string; gender: string; date_of_birth: string; class_name: string;
  section: string; academic_year: string; status: string; address: string;
  parent_name: string; parent_phone: string; created_at: string;
}

const getGrade = (id: number) => {
  const att = Math.min(100, 60 + (id % 41));
  if (att >= 95) return { grade: 'A',  score: '94.2', color: '#166534', bg: '#DCFCE7' };
  if (att >= 85) return { grade: 'B+', score: '88.5', color: '#1E40AF', bg: '#DBEAFE' };
  if (att >= 75) return { grade: 'B',  score: '82.1', color: '#1E40AF', bg: '#DBEAFE' };
  if (att >= 65) return { grade: 'C',  score: '72.0', color: '#854D0E', bg: '#FEF9C3' };
  return { grade: 'D', score: '62.1', color: '#991B1B', bg: '#FEE2E2' };
};

const getAttendance = (id: number) => Math.min(100, 60 + (id % 41));

export default function TeacherViewStudent() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/students/${id}/`);
        if (res.ok) setStudent(await res.json());
        else setError('Student not found.');
      } catch { setError('Cannot connect to server.'); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${student?.full_name}?`)) return;
    await apiFetch(`${API_BASE}/api/students/${id}/`, { method: 'DELETE' });
    navigate('/teacher/students');
  };

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '11px', fontWeight: 500, color: '#76777D', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: '#0B1C30', margin: 0, fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F0F4FF' }}>
      <div style={{ color: '#0051D5' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>{title}</h3>
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
        .edit-btn:hover { background: #DCE9FF !important; border-color: #0051D5 !important; color: #0051D5 !important; }
        .del-btn:hover { background: #FEE2E2 !important; border-color: #EF4444 !important; color: #EF4444 !important; }
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
            const active = window.location.pathname.startsWith(item.path) && item.path !== '/teacher/dashboard';
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
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>
              {loading ? 'Loading...' : student?.full_name || 'Student Profile'}
            </span>
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
          <button className="back-btn" onClick={() => navigate('/teacher/students')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Students
          </button>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '14px', margin: 0 }}>Loading student profile...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: '14px', margin: '0 0 12px' }}>{error}</p>
              <button onClick={() => navigate('/teacher/students')}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>
                Back to Students
              </button>
            </div>
          )}

          {/* Profile */}
          {student && !loading && (() => {
            const att  = getAttendance(student.id);
            const gInfo = getGrade(student.id);
            const isLow = att < 70;
            return (
              <div style={{ maxWidth: '900px' }}>

                {/* Profile header */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      {/* Avatar */}
                      <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: isLow ? '#FEE2E2' : '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: isLow ? '#DC2626' : '#0051D5', flexShrink: 0 }}>
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: '0 0 6px' }}>{student.full_name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#76777D', background: '#F8F9FF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>{student.roll_number}</span>
                          <span style={{ background: student.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: student.status === 'active' ? '#166534' : '#991B1B', fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>{isLow && student.status === 'active' ? 'Probation' : student.status}</span>
                          <span style={{ background: gInfo.bg, color: gInfo.color, fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '6px' }}>Grade: {gInfo.grade}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
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
                      <button className="edit-btn" onClick={() => navigate(`/teacher/students/${id}/edit`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="del-btn" onClick={handleDelete}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Attendance + Grade bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0F4FF' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#76777D', fontWeight: 500 }}>Attendance</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: isLow ? '#DC2626' : '#059669' }}>{att}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
                        <div style={{ height: '6px', width: `${att}%`, background: isLow ? '#DC2626' : '#009668', borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#76777D', fontWeight: 500 }}>Current Score</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: gInfo.color }}>{gInfo.score}/100</span>
                      </div>
                      <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
                        <div style={{ height: '6px', width: `${gInfo.score}%`, background: gInfo.color, borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                  {/* Personal Info */}
                  <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                    <SectionTitle icon={<User size={15} />} title="Personal Information" />
                    <InfoRow label="Full Name"     value={student.full_name} />
                    <InfoRow label="Date of Birth" value={student.date_of_birth || '—'} />
                    <InfoRow label="Gender"        value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'} />
                  </div>

                  {/* Contact */}
                  <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                    <SectionTitle icon={<Phone size={15} />} title="Contact Details" />
                    <InfoRow label="Email"   value={student.email} />
                    <InfoRow label="Phone"   value={student.phone || '—'} />
                    <InfoRow label="Address" value={student.address || '—'} />
                  </div>

                  {/* Academic */}
                  <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                    <SectionTitle icon={<BookMarked size={15} />} title="Academic Info" />
                    <InfoRow label="Student ID"    value={student.roll_number} />
                    <InfoRow label="Class"         value={`${student.class_name} ${student.section}`} />
                    <InfoRow label="Academic Year" value={student.academic_year} />
                    <InfoRow label="Status"        value={student.status} />
                  </div>

                  {/* Guardian */}
                  <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
                    <SectionTitle icon={<Shield size={15} />} title="Guardian Information" />
                    <InfoRow label="Guardian Name"  value={student.parent_name || '—'} />
                    <InfoRow label="Contact Number" value={student.parent_phone || '—'} />
                    <InfoRow label="Enrolled On"    value={student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'} />
                  </div>
                </div>
              </div>
            );
          })()}
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '14px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}