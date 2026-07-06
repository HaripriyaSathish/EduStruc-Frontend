import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  Eye, MessageSquare, MoreVertical, TrendingUp,
  BarChart2, AlertTriangle, ChevronLeft, ChevronRight,
  Pencil, X, Check
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';
import StudentAvatar from '../../components/StudentAvatar';

interface Student {
  id: number; full_name: string; email: string;
  roll_number: string; class_name: string; section: string;
  status: string; phone: string;
  avatar_url?: string | null;
}
interface Course {
  id: number; course_name: string; course_code: string;
  max_students: number; semester: string;
}
interface GradeRecord {
  id: number; student: number; course: number; course_name: string;
  score: number; max_score: number; percentage: number; grade_letter: string;
  assessment_type: string; assessment_name: string; date: string; remarks: string;
}
interface AttendanceStats {
  total: number; present: number; absent: number; holiday: number; score: number; missed: number;
}

const GRADE_COLORS: Record<string, { bg: string; color: string }> = {
  A:  { bg: '#DCFCE7', color: '#166534' },
  'B+': { bg: '#DBEAFE', color: '#1E40AF' },
  B:  { bg: '#DBEAFE', color: '#1E40AF' },
  C:  { bg: '#FEF9C3', color: '#854D0E' },
  D:  { bg: '#FEE2E2', color: '#991B1B' },
  F:  { bg: '#FEE2E2', color: '#7F1D1D' },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#DCFCE7', color: '#166534', label: 'Active' },
  inactive:  { bg: '#F0F4FF', color: '#45464D', label: 'Inactive' },
  probation: { bg: '#FEE2E2', color: '#991B1B', label: 'Probation' },
  graduated: { bg: '#DBEAFE', color: '#1E40AF', label: 'Graduated' },
};

const ASSESSMENT_TYPES = ['Quiz', 'Lab', 'Essay', 'Exam', 'Homework', 'Project', 'Midterm', 'Final'];

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1; // 1-12
const CURRENT_YEAR  = now.getFullYear();

const ITEMS_PER_PAGE = 5;
const API_BASE = import.meta.env.VITE_API_URL;

export default function TeacherStudents() {
  const navigate = useNavigate();
  const user     = getSession();

  const [students,       setStudents]       = useState<Student[]>([]);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedGrade,  setSelectedGrade]  = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('All Students');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [openMenu,       setOpenMenu]       = useState<number | null>(null);

  // Real data pulled straight from the live grades/attendance apps
  const [latestGrades,      setLatestGrades]      = useState<Record<number, GradeRecord>>({});
  const [attendanceScores,  setAttendanceScores]  = useState<Record<number, number>>({});
  const [dataLoading,       setDataLoading]       = useState(true);

  // Add-grade modal
  const [gradeModal, setGradeModal] = useState<{ student: Student | null }>({ student: null });
  const [gradeForm,  setGradeForm]  = useState({
    course: '', assessment_type: 'Quiz', assessment_name: '',
    score: '', max_score: '100', date: new Date().toISOString().slice(0, 10), remarks: '',
  });
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeSaved,  setGradeSaved]  = useState(false);
  const [gradeError,  setGradeError]  = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, cRes] = await Promise.all([
          apiFetch(`${API_BASE}/api/students/`),
          apiFetch(`${API_BASE}/api/courses/`),
        ]);
        const studentList: Student[] = sRes.ok ? await sRes.json() : [];
        if (cRes.ok) setCourses(await cRes.json());
        setStudents(studentList);
        setLoading(false);

        // After we know the students, pull real grade + attendance data for each
        await loadGradesAndAttendance(studentList);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setDataLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Pull each student's most recent grade and current-month attendance score from the real API
  const loadGradesAndAttendance = async (studentList: Student[]) => {
    setDataLoading(true);
    const gradesMap: Record<number, GradeRecord> = {};
    const attMap: Record<number, number> = {};

    await Promise.all(studentList.map(async (s) => {
      try {
        // Most recent grade — endpoint already orders by -date, so first item is latest
        const gRes = await apiFetch(`${API_BASE}/api/grades/?student=${s.id}`);
        if (gRes.ok) {
          const grades: GradeRecord[] = await gRes.json();
          if (grades.length > 0) gradesMap[s.id] = grades[0];
        }
      } catch {}

      try {
        // Current month attendance score
        const aRes = await apiFetch(`${API_BASE}/api/attendance/${s.id}/?month=${CURRENT_MONTH}&year=${CURRENT_YEAR}`);
        if (aRes.ok) {
          const data = await aRes.json();
          const stats: AttendanceStats = data.stats;
          if (stats && stats.total > 0) attMap[s.id] = stats.score;
        }
      } catch {}
    }));

    setLatestGrades(gradesMap);
    setAttendanceScores(attMap);
    setDataLoading(false);
  };

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── Add a real grade record via the live API ──
  const openGradeModal = (student: Student) => {
    setGradeModal({ student });
    setGradeForm({
      course: courses[0] ? String(courses[0].id) : '',
      assessment_type: 'Quiz', assessment_name: '',
      score: '', max_score: '100', date: new Date().toISOString().slice(0, 10), remarks: '',
    });
    setGradeError('');
    setGradeSaved(false);
  };

  const saveGrade = async () => {
    if (!gradeModal.student) return;
    setGradeError('');
    if (!gradeForm.course)          { setGradeError('Select a course.'); return; }
    if (!gradeForm.assessment_name) { setGradeError('Enter an assessment name.'); return; }
    if (gradeForm.score === '')     { setGradeError('Enter a score.'); return; }

    setSavingGrade(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/grades/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          student:         gradeModal.student.id,
          course:          parseInt(gradeForm.course),
          score:           parseFloat(gradeForm.score),
          max_score:       parseFloat(gradeForm.max_score) || 100,
          assessment_type: gradeForm.assessment_type,
          assessment_name: gradeForm.assessment_name,
          date:            gradeForm.date,
          remarks:         gradeForm.remarks,
        }),
      });
      if (res.ok) {
        const newGrade: GradeRecord = await res.json();
        setLatestGrades(prev => ({ ...prev, [gradeModal.student!.id]: newGrade }));
        setGradeSaved(true);
        setTimeout(() => {
          setGradeModal({ student: null });
          setGradeSaved(false);
        }, 1200);
      } else {
        const d = await res.json();
        setGradeError(Object.values(d).flat().join(' ') || 'Failed to save grade.');
      }
    } catch {
      setGradeError('Cannot connect to server.');
    } finally {
      setSavingGrade(false);
    }
  };

  // Distinct grades/classes derived from the real student list (e.g. "10th Grade")
  const availableGrades = Array.from(
    new Set(students.map(s => s.class_name).filter(Boolean))
  ).sort();

  const filtered = students.filter(s => {
    const matchSearch = !searchQuery ||
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All Students' ||
      s.status.toLowerCase() === statusFilter.toLowerCase();
    const matchGrade = selectedGrade === 'all' || s.class_name === selectedGrade;
    return matchSearch && matchStatus && matchGrade;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Real aggregate stats — computed from the FILTERED (currently selected grade) students only,
  // so switching the grade filter updates Avg Attendance / Class Average accordingly.
  const recordedAttendances = filtered
    .map(s => attendanceScores[s.id])
    .filter((v): v is number => v !== undefined);
  const avgAttendance = recordedAttendances.length > 0
    ? Math.round(recordedAttendances.reduce((a, v) => a + v, 0) / recordedAttendances.length)
    : null;

  const recordedGrades = filtered
    .map(s => latestGrades[s.id])
    .filter((g): g is GradeRecord => g !== undefined)
    .map(g => g.percentage);
  const classAvgScore = recordedGrades.length > 0
    ? Math.round(recordedGrades.reduce((a, v) => a + v, 0) / recordedGrades.length)
    : null;
  const classAvgLetter = (() => {
    if (classAvgScore === null) return null;
    if (classAvgScore >= 90) return 'A';
    if (classAvgScore >= 80) return 'B+';
    if (classAvgScore >= 70) return 'B';
    if (classAvgScore >= 60) return 'C';
    if (classAvgScore >= 50) return 'D';
    return 'F';
  })();

  const belowThreshold = filtered.filter(s => {
    const att = attendanceScores[s.id];
    return att !== undefined && att < 70;
  });
  const notActiveCount = filtered.filter(s => s.status !== 'active').length;
  const ungradedCount  = filtered.filter(s => latestGrades[s.id] === undefined).length;

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
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side:hover { background: #003DAA !important; }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: #F0F7FF !important; }
        .action-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 6px; display: flex; color: #76777D; transition: all 0.2s ease; }
        .action-btn:hover { background: #DCE9FF !important; color: #0051D5 !important; }
        .grade-edit-btn { background: none; border: 1px solid #E5E7EB; cursor: pointer; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; color: #45464D; font-size: 12px; transition: all 0.2s ease; }
        .grade-edit-btn:hover { border-color: #0051D5 !important; color: #0051D5 !important; background: #EFF4FF !important; }
        .add-student-btn:hover { background: #003DAA !important; }
        .search-input:focus { border-color: #0051D5 !important; outline: none; }
        .page-btn { border: 1px solid #C6C6CD; background: #fff; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 13px; color: #45464D; transition: all 0.2s ease; }
        .page-btn:hover { border-color: #0051D5; color: #0051D5; }
        .menu-item:hover { background: #F0F4FF !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 88vh; overflow-y: auto; }
        .form-input:focus { border-color: #0051D5 !important; }
        .save-grade-btn:hover { background: #003DAA !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>
          <div style={{ background: '#316BF3', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0B1C30', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: '#76777D', margin: 0 }}>ADMIN PORTAL</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const active = window.location.pathname === item.path;
            return (
              <div key={i} className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: active ? '#fff' : '#45464D', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
                {item.icon} {item.label}
              </div>
            );
          })}
          <button className="add-btn-side" onClick={() => navigate('/teacher/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Student Directory</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage and track student enrollment and academic records.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="search-input" type="text" placeholder="Search by name, ID or email..."
                value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '240px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* Roster card */}
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>

            {/* Roster header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
                  <span style={{ color: '#C6C6CD' }}>›</span>
                  <span style={{ fontSize: '12px', color: '#0051D5', fontWeight: 500 }}>Class List</span>
                </div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: 0 }}>Student Roster</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '7px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="all">All Courses</option>
                  {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '7px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  {['All Students','Active','Inactive','Probation','Graduated'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="add-student-btn" onClick={() => navigate('/teacher/students/new')}
                  style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                  <Plus size={14} /> Add Student
                </button>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
                  {['STUDENT NAME','STUDENT ID','ATTENDANCE % (THIS MONTH)','CURRENT GRADE','STATUS','ACTIONS'].map((col, i) => (
                    <th key={i} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        <p style={{ color: '#76777D', fontSize: '13px', margin: 0 }}>Loading students...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                      <Users size={32} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontWeight: 500, color: '#45464D', fontSize: '14px' }}>No students found</p>
                    </td>
                  </tr>
                ) : paginated.map((student) => {
                  const grade       = latestGrades[student.id];
                  const att         = attendanceScores[student.id];
                  const hasAtt      = att !== undefined;
                  const lowAtt      = hasAtt && att < 70;
                  const statusInfo  = STATUS_STYLE[student.status?.toLowerCase()] || STATUS_STYLE.active;
                  const gradeColors = grade ? (GRADE_COLORS[grade.grade_letter] || GRADE_COLORS['B']) : null;

                  return (
                    <tr key={student.id} className="table-row" style={{ borderBottom: '1px solid #F0F4FF', background: '#fff' }}>

                      {/* Name */}
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <StudentAvatar
  studentId={student.id}
  fullName={student.full_name}
  avatarUrl={student.avatar_url}
  size={34}
/>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#0B1C30' }}>{student.full_name}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#76777D' }}>{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#45464D', fontFamily: 'monospace' }}>
                        {student.roll_number || `ST-${String(student.id).padStart(5, '0')}`}
                      </td>

                      {/* Attendance — REAL, this month, from /api/attendance/<id>/?month=&year= */}
                      <td style={{ padding: '13px 20px' }}>
                        {dataLoading ? (
                          <span style={{ fontSize: '12px', color: '#C6C6CD' }}>Loading...</span>
                        ) : hasAtt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', background: '#E5E7EB', borderRadius: '999px', flexShrink: 0 }}>
                              <div style={{ width: `${att}%`, height: '4px', background: lowAtt ? '#DC2626' : att >= 90 ? '#009668' : '#0051D5', borderRadius: '999px' }}></div>
                            </div>
                            <span style={{ fontSize: '13px', color: lowAtt ? '#DC2626' : '#0B1C30', fontWeight: 600 }}>{att}%</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#C6C6CD' }}>No records this month</span>
                        )}
                      </td>

                      {/* Current Grade — REAL, most recent assessment from /api/grades/?student= */}
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {dataLoading ? (
                            <span style={{ fontSize: '12px', color: '#C6C6CD' }}>Loading...</span>
                          ) : grade ? (
                            <>
                              <span style={{ background: gradeColors!.bg, color: gradeColors!.color, fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }} title={`${grade.assessment_name} (${grade.assessment_type}) — ${grade.score}/${grade.max_score}`}>
                                {grade.grade_letter}
                              </span>
                              <span style={{ fontSize: '11px', color: '#76777D' }}>({grade.percentage}%)</span>
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#C6C6CD' }}>Not graded</span>
                          )}
                          <button className="grade-edit-btn" onClick={() => openGradeModal(student)} title="Add a new grade">
                            <Pencil size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', display: 'inline-block' }}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                          <button className="action-btn" title="View" onClick={() => navigate(`/teacher/students/${student.id}`)}><Eye size={15} /></button>
                          <button className="action-btn" title="Message"><MessageSquare size={15} /></button>
                          <button className="action-btn" title="More"
                            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === student.id ? null : student.id); }}>
                            <MoreVertical size={15} />
                          </button>
                          {openMenu === student.id && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '160px', overflow: 'hidden', animation: 'fadeIn 0.15s ease' }}>
                              <div className="menu-item" onClick={() => navigate(`/teacher/students/${student.id}`)}
                                style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>View Profile</div>
                              <div className="menu-item" onClick={() => navigate(`/teacher/students/${student.id}/edit`)}
                                style={{ padding: '10px 14px', fontSize: '13px', color: '#0B1C30', cursor: 'pointer' }}>Edit Student</div>
                              <div className="menu-item" onClick={() => openGradeModal(student)}
                                style={{ padding: '10px 14px', fontSize: '13px', color: '#0051D5', cursor: 'pointer', fontWeight: 500 }}>✏ Add Grade</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
                  Showing {Math.min(filtered.length, (currentPage-1)*ITEMS_PER_PAGE+1)} - {Math.min(currentPage*ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
                </p>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
                    style={{ padding: '5px 8px', border: '1px solid #C6C6CD', borderRadius: '6px', background: currentPage===1?'#F8F9FF':'#fff', color: currentPage===1?'#C6C6CD':'#45464D', cursor: currentPage===1?'not-allowed':'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      style={{ padding: '5px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', background: p===currentPage?'#0051D5':'#fff', color: p===currentPage?'#fff':'#45464D', cursor: 'pointer', fontSize: '13px', fontWeight: p===currentPage?600:400, minWidth: '32px', transition: 'all 0.15s ease' }}>
                      {p}
                    </button>
                  ))}
                  <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0}
                    style={{ padding: '5px 8px', border: '1px solid #C6C6CD', borderRadius: '6px', background: currentPage===totalPages?'#F8F9FF':'#fff', color: currentPage===totalPages?'#C6C6CD':'#45464D', cursor: currentPage===totalPages?'not-allowed':'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats bottom row — Figma layout, real data, scoped to the selected grade filter */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

            {/* Avg Attendance — real, this month, for the currently filtered grade */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#76777D', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVG. ATTENDANCE (THIS MONTH)</p>
                <div style={{ background: '#DCFCE7', borderRadius: '6px', padding: '4px', display: 'flex' }}>
                  <TrendingUp size={14} color="#059669" />
                </div>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: '#0B1C30', margin: '0 0 10px' }}>
                {dataLoading ? '...' : avgAttendance !== null ? `${avgAttendance}%` : '—'}
              </p>
              <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
                <div style={{ height: '6px', width: avgAttendance !== null ? `${avgAttendance}%` : '0%', background: (avgAttendance ?? 0) >= 80 ? '#009668' : '#DC2626', borderRadius: '999px', transition: 'width 0.6s ease' }}></div>
              </div>
              <p style={{ fontSize: '11px', color: '#76777D', margin: '8px 0 0' }}>
                {recordedAttendances.length} of {filtered.length} students with records
              </p>
            </div>

            {/* Class Average — real, from most recent grade per student, for the currently filtered grade */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#76777D', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLASS AVERAGE</p>
                <div style={{ background: '#DCE9FF', borderRadius: '6px', padding: '4px', display: 'flex' }}><BarChart2 size={14} color="#0051D5" /></div>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: classAvgLetter ? (GRADE_COLORS[classAvgLetter]?.color || '#0B1C30') : '#0B1C30', margin: '0 0 4px' }}>
                {dataLoading ? '...' : classAvgLetter || '—'}
              </p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>
                {classAvgScore !== null ? `Avg Score: ${classAvgScore}%` : `${ungradedCount} students not graded yet`}
              </p>
            </div>

            {/* Action Required — scoped to the currently filtered grade */}
            <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="#FCD34D" />
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>Action Required</p>
              </div>
              <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {belowThreshold.length > 0 && (
                  <li style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#FCD34D', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{belowThreshold.length} student{belowThreshold.length>1?'s':''} below 70% attendance this month.</span>
                  </li>
                )}
                {notActiveCount > 0 && (
                  <li style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#FCD34D', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{notActiveCount} student{notActiveCount>1?'s':''} not marked Active.</span>
                  </li>
                )}
                {ungradedCount > 0 && (
                  <li style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#FCD34D', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{ungradedCount} student{ungradedCount>1?'s':''} have no grades yet.</span>
                  </li>
                )}
                {belowThreshold.length === 0 && notActiveCount === 0 && ungradedCount === 0 && !dataLoading && (
                  <li style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#4ADE80', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Everything looks good. No alerts.</span>
                  </li>
                )}
              </ul>
              <button onClick={() => { setStatusFilter('All Students'); setSearchQuery(''); document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                Review All Alerts
              </button>
            </div>
          </div>
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 2px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
        </footer>
      </div>

      {/* ── ADD GRADE MODAL — posts a real assessment row via /api/grades/ ─────── */}
      {gradeModal.student && (
        <div className="modal-overlay" onClick={() => setGradeModal({ student: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: 0 }}>Add Grade</h3>
              <button onClick={() => setGradeModal({ student: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8F9FF', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#0051D5', flexShrink: 0 }}>
                {gradeModal.student.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>{gradeModal.student.full_name}</p>
                <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{gradeModal.student.roll_number || gradeModal.student.email}</p>
              </div>
            </div>

            {gradeError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>{gradeError}</div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Course</label>
              <select className="form-input" style={inputStyle} value={gradeForm.course}
                onChange={e => setGradeForm(p => ({ ...p, course: e.target.value }))}>
                {courses.map(c => <option key={c.id} value={String(c.id)}>{c.course_name}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Assessment Type</label>
                <select className="form-input" style={inputStyle} value={gradeForm.assessment_type}
                  onChange={e => setGradeForm(p => ({ ...p, assessment_type: e.target.value }))}>
                  {ASSESSMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input className="form-input" style={inputStyle} type="date" value={gradeForm.date}
                  onChange={e => setGradeForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Assessment Name</label>
              <input className="form-input" style={inputStyle} placeholder="e.g. Calculus Quiz 3"
                value={gradeForm.assessment_name}
                onChange={e => setGradeForm(p => ({ ...p, assessment_name: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Score</label>
                <input className="form-input" style={inputStyle} type="number" placeholder="e.g. 85"
                  value={gradeForm.score}
                  onChange={e => setGradeForm(p => ({ ...p, score: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Max Score</label>
                <input className="form-input" style={inputStyle} type="number" value={gradeForm.max_score}
                  onChange={e => setGradeForm(p => ({ ...p, max_score: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Remarks (optional)</label>
              <textarea className="form-input" style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
                value={gradeForm.remarks}
                onChange={e => setGradeForm(p => ({ ...p, remarks: e.target.value }))} />
            </div>

            {gradeSaved && (
              <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Check size={15} color="#059669" />
                <span style={{ fontSize: '13px', color: '#059669', fontWeight: 500 }}>Grade saved!</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setGradeModal({ student: null })}
                style={{ flex: 1, background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button className="save-grade-btn" onClick={saveGrade} disabled={savingGrade || gradeSaved}
                style={{ flex: 2, background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {savingGrade ? 'Saving...' : gradeSaved ? '✓ Saved!' : 'Save Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}