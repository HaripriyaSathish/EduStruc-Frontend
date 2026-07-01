import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Download,
  FileText, Users2, BarChart2, Clock, CheckCircle, ArrowLeft
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

interface Course  { id: number; course_name: string; course_code: string; }
interface Student { id: number; full_name: string; class_name: string; status: string; }

export default function Reports() {
  const navigate = useNavigate();
  const user     = getSession();

  const [activeNav, setActiveNav] = useState('Dashboard');
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [students,  setStudents]  = useState<Student[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported,  setExported]  = useState<string[]>([]);

  const [form, setForm] = useState({
    reportType: 'student-performance',
    courseId:   'all',
    dateFrom:   '',
    dateTo:     '',
    format:     'csv',
  });

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [cRes, sRes] = await Promise.all([
          apiFetch('http://127.0.0.1:8000/api/courses/'),
          apiFetch('http://127.0.0.1:8000/api/students/'),
        ]);
        if (cRes.ok)  setCourses(await cRes.json());
        if (sRes.ok) setStudents(await sRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const handleExport = async (type: string) => {
    setExporting(type);
    // Simulate export — build CSV from real data
    await new Promise(r => setTimeout(r, 1200));

    let csvContent = '';
    let filename   = '';

    if (type === 'students') {
      csvContent = 'Roll Number,Full Name,Class,Status\n' +
        students.map(s => `${s.id},${s.full_name},${s.class_name},${s.status}`).join('\n');
      filename = 'students_report.csv';
    } else if (type === 'courses') {
      csvContent = 'Course Code,Course Name\n' +
        courses.map(c => `${c.course_code},${c.course_name}`).join('\n');
      filename = 'courses_report.csv';
    } else {
      csvContent = `Report Type: ${form.reportType}\nGenerated: ${new Date().toLocaleString()}\nTotal Students: ${students.length}\nTotal Courses: ${courses.length}`;
      filename = `${form.reportType}_report.${form.format}`;
    }

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(null);
    setExported(prev => [...prev, type]);
    setTimeout(() => setExported(prev => prev.filter(e => e !== type)), 3000);
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
    borderRadius: '8px', fontSize: '13px', color: '#45464D',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500, color: '#45464D',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };

  const REPORT_TYPES = [
    { id: 'students', icon: <Users2 size={20} color="#0051D5" />, bg: '#DCE9FF', label: 'Student List', desc: `Export all ${students.length} students as CSV` },
    { id: 'courses',  icon: <BookOpen size={20} color="#059669" />, bg: '#DCFCE7', label: 'Course List', desc: `Export all ${courses.length} courses as CSV` },
    { id: 'performance', icon: <BarChart2 size={20} color="#7C3AED" />, bg: '#F3E8FF', label: 'Performance Report', desc: 'Grade averages and trends' },
    { id: 'attendance',  icon: <Clock size={20} color="#EA580C" />, bg: '#FFF7ED', label: 'Attendance Report', desc: 'Attendance records by class' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn:hover { background: #003DAA !important; }
        .report-card { transition: all 0.2s ease; cursor: pointer; }
        .report-card:hover { border-color: #0051D5 !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,81,213,0.1) !important; }
        .export-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .export-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .back-btn:hover { color: #0051D5 !important; }
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
          <div className="sidebar-bottom" onClick={() => navigate('/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Reports</span>
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
          <button className="back-btn" onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', fontWeight: 500, marginBottom: '20px', padding: 0, transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>Reports</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
              {loading ? 'Loading data...' : 'Download real data reports across students and courses.'}
            </p>
          </div>

          {/* Quick export cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {REPORT_TYPES.map(rt => (
              <div key={rt.id} className="report-card"
                onClick={() => handleExport(rt.id)}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s ease' }}>
                <div style={{ background: rt.bg, borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {rt.icon}
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 4px' }}>{rt.label}</p>
                  <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{rt.desc}</p>
                </div>
                <button disabled={exporting === rt.id}
                  style={{ background: exported.includes(rt.id) ? '#D1FAE5' : '#0051D5', color: exported.includes(rt.id) ? '#059669' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                  {exporting === rt.id ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Exporting...</>
                  ) : exported.includes(rt.id) ? (
                    <><CheckCircle size={12} /> Downloaded!</>
                  ) : (
                    <><Download size={12} /> Export CSV</>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Custom report form */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <FileText size={16} color="#0051D5" />
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Custom Report</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Report Type</label>
                <select className="form-input" style={inputStyle}
                  value={form.reportType} onChange={e => setForm(p => ({ ...p, reportType: e.target.value }))}>
                  <option value="student-performance">Student Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="grades">Grade Summary</option>
                  <option value="enrollment">Enrollment</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Course</label>
                <select className="form-input" style={inputStyle}
                  value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="all">All Courses</option>
                  {courses.map(c => <option key={c.id} value={String(c.id)}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>From Date</label>
                <input className="form-input" style={inputStyle} type="date"
                  value={form.dateFrom} onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>To Date</label>
                <input className="form-input" style={inputStyle} type="date"
                  value={form.dateTo} onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['csv','pdf','xlsx'].map(fmt => (
                  <button key={fmt} onClick={() => setForm(p => ({ ...p, format: fmt }))}
                    style={{ padding: '6px 16px', border: `1px solid ${form.format === fmt ? '#0051D5' : '#C6C6CD'}`, borderRadius: '6px', background: form.format === fmt ? '#DCE9FF' : '#fff', color: form.format === fmt ? '#0051D5' : '#45464D', fontWeight: form.format === fmt ? 600 : 400, fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s ease' }}>
                    .{fmt}
                  </button>
                ))}
              </div>
              <button className="export-btn" onClick={() => handleExport('custom')} disabled={exporting === 'custom'}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                {exporting === 'custom'
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Generating...</>
                  : <><Download size={14} /> Generate Report</>}
              </button>
            </div>
          </div>
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