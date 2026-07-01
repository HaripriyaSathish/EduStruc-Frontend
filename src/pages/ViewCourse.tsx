import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  Pencil, Trash2, User2, Clock, BookMarked, FileText, Info
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface Course {
  id:           number;
  course_code:  string;
  course_name:  string;
  description:  string;
  instructor:   string;
  credits:      number;
  max_students: number;
  status:       string;
  academic_year:string;
  semester:     string;
  department:   string;
  created_at:   string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'In Progress', bg: '#DCFCE7', color: '#005236' },
  inactive:  { label: 'Upcoming',    bg: '#FEF9C3', color: '#854D0E' },
  completed: { label: 'Completed',   bg: '#FEE2E2', color: '#93000A' },
};

export default function ViewCourse() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();
  const [activeNav, setActiveNav] = useState('Courses');
  const [course, setCourse]       = useState<Course | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/courses/${id}/`);
        if (res.ok) {
          setCourse(await res.json());
        } else {
          setError('Course not found.');
        }
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${course?.course_name}"?`)) return;
    await apiFetch(`http://127.0.0.1:8000/api/courses/${id}/`, { method: 'DELETE' });
    navigate('/courses');
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
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/courses')}>Courses</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>
              {loading ? 'Loading...' : course?.course_name || 'Course Details'}
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

          {/* Back */}
          <button className="back-btn" onClick={() => navigate('/courses')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Courses
          </button>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', flexDirection: 'column' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: '#76777D', fontSize: '14px' }}>Loading course details...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
              <button onClick={() => navigate('/courses')}
                style={{ marginTop: '12px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>
                Back to Courses
              </button>
            </div>
          )}

          {/* Course detail */}
          {course && !loading && (
            <div style={{ maxWidth: '900px' }}>

              {/* Header card */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Icon */}
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={24} color="#0051D5" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>{course.course_name}</h2>
                        <span style={{
                          background: statusConfig[course.status]?.bg || '#F3F4F6',
                          color: statusConfig[course.status]?.color || '#6B7280',
                          fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px'
                        }}>{statusConfig[course.status]?.label || course.status}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#76777D', background: '#F8F9FF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>{course.course_code}</span>
                        <span style={{ fontSize: '13px', color: '#76777D' }}>{course.credits} Credits</span>
                        <span style={{ fontSize: '13px', color: '#76777D' }}>{course.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="edit-btn" onClick={() => navigate(`/courses/${id}/edit`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="delete-btn" onClick={handleDelete}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C6C6CD', borderRadius: '8px', background: '#fff', color: '#45464D', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Enrollment bar */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0F4FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#76777D', fontWeight: 500 }}>Enrollment Capacity</span>
                    <span style={{ fontSize: '12px', color: '#0B1C30', fontWeight: 600 }}>0 / {course.max_students} students</span>
                  </div>
                  <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
                    <div style={{ height: '6px', width: '0%', background: '#0051D5', borderRadius: '999px' }}></div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* Course Basics */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<Info size={16} />} title="Course Basics" />
                  <InfoRow label="Course Title"   value={course.course_name} />
                  <InfoRow label="Course Code"    value={course.course_code} />
                  <InfoRow label="Credit Hours"   value={`${course.credits} Credits`} />
                  <InfoRow label="Department"     value={course.department} />
                  <InfoRow label="Academic Year"  value={course.academic_year} />
                </div>

                {/* Faculty */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<User2 size={16} />} title="Faculty" />
                  <InfoRow label="Primary Instructor" value={course.instructor} />
                  <InfoRow label="Status"             value={course.status} />
                  <InfoRow label="Max Capacity"       value={`${course.max_students} students`} />
                  <InfoRow label="Created On"         value={new Date(course.created_at).toLocaleDateString()} />
                </div>

                {/* Schedule */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<Clock size={16} />} title="Schedule & Location" />
                  <InfoRow label="Semester / Schedule" value={course.semester} />
                </div>

                {/* Description */}
                <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
                  <SectionTitle icon={<FileText size={16} />} title="Course Overview" />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.7, margin: 0 }}>
                    {course.description || 'No description provided.'}
                  </p>
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