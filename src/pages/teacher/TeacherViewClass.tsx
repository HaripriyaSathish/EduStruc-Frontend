import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, ArrowLeft,
  Users2, Clock, MapPin, FileText, Upload, Trash2,
  Check, X, Pencil, ChevronUp, ChevronDown, Download as DownloadIcon
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Course {
  id: number; course_name: string; course_code: string;
  instructor: string; max_students: number; status: string;
  department: string; semester: string; description: string; credits: number;
}
interface Student {
  id: number; full_name: string; email: string;
  roll_number: string; status: string;
}
interface FileItem {
  id: string; name: string; size: string; type: string; date: string;
  dataUrl?: string; // base64 for real download
}

type Tab = 'gradebook' | 'materials' | 'overview';

// scoreToGrade — single source of truth for grade letters
const scoreToGrade = (score: number) => {
  if (score >= 90) return { grade: 'A',  color: '#166534', bg: '#DCFCE7' };
  if (score >= 80) return { grade: 'B+', color: '#1E40AF', bg: '#DBEAFE' };
  if (score >= 70) return { grade: 'B',  color: '#1E40AF', bg: '#DBEAFE' };
  if (score >= 60) return { grade: 'C',  color: '#854D0E', bg: '#FEF9C3' };
  if (score >= 50) return { grade: 'D',  color: '#991B1B', bg: '#FEE2E2' };
  return                  { grade: 'F',  color: '#7F1D1D', bg: '#FEE2E2' };
};

export default function TeacherViewClass() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const user     = getSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course,      setCourse]      = useState<Course | null>(null);
  const [students,    setStudents]    = useState<Student[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState<Tab>('gradebook');

  // Real grade storage — keyed by student id, persisted to localStorage per class
  const [grades,      setGrades]      = useState<Record<number, { score: number; status: string }>>({});
  const [editScores,  setEditScores]  = useState<Record<number, string>>({});
  const [saved,       setSaved]       = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [files,       setFiles]       = useState<FileItem[]>([]);
  const [sortDir,     setSortDir]     = useState<'asc'|'desc'>('desc');

  const storageKey = `edustruc_grades_class_${id}`;
  const filesKey   = `edustruc_files_class_${id}`;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, sRes] = await Promise.all([
          apiFetch(`http://127.0.0.1:8000/api/courses/${id}/`),
          apiFetch('http://127.0.0.1:8000/api/students/'),
        ]);
        if (cRes.ok) setCourse(await cRes.json());
        else setError('Course not found.');
        if (sRes.ok) {
          const studentList: Student[] = await sRes.json();
          setStudents(studentList);

          // Load saved grades, or initialize with real defaults (NOT random)
          const savedGrades = localStorage.getItem(storageKey);
          if (savedGrades) {
            setGrades(JSON.parse(savedGrades));
          } else {
            // Default: no score yet = 0 attendance, status = same as student record
            const initial: Record<number, { score: number; status: string }> = {};
            studentList.forEach(s => {
              initial[s.id] = { score: 0, status: s.status || 'active' };
            });
            setGrades(initial);
          }
        }
      } catch { setError('Cannot connect to server.'); }
      finally { setLoading(false); }
    };
    fetchAll();

    // Load saved files
    const savedFiles = localStorage.getItem(filesKey);
    if (savedFiles) setFiles(JSON.parse(savedFiles));
  }, [id]);

  // Save grades whenever they change
  const persistGrades = (updated: Record<number, { score: number; status: string }>) => {
    setGrades(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const persistFiles = (updated: FileItem[]) => {
    setFiles(updated);
    localStorage.setItem(filesKey, JSON.stringify(updated));
  };

  const handleSaveGrades = () => {
    // Commit all pending edits into grades
    const updated = { ...grades };
    Object.entries(editScores).forEach(([sid, val]) => {
      if (val !== '') {
        const score = Math.min(100, Math.max(0, parseInt(val) || 0));
        updated[Number(sid)] = { ...updated[Number(sid)], score };
      }
    });
    persistGrades(updated);
    setEditScores({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleStatusChange = (studentId: number, newStatus: string) => {
    const updated = { ...grades, [studentId]: { ...grades[studentId], status: newStatus } };
    persistGrades(updated);
  };

  // ── File upload with REAL base64 storage (so download works) ──
  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileItem = {
          id:      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name:    f.name,
          size:    `${(f.size / 1024).toFixed(0)} KB`,
          type:    f.name.split('.').pop() || 'file',
          date:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dataUrl: reader.result as string,
        };
        setFiles(prev => {
          const updated = [...prev, newFile];
          localStorage.setItem(filesKey, JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(f);
    });
  };

  const handleDownload = (file: FileItem) => {
    if (!file.dataUrl) {
      alert('This file has no stored content (sample data). Upload a real file to enable download.');
      return;
    }
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  const handleDeleteFile = (fileId: string) => {
    const updated = files.filter(f => f.id !== fileId);
    persistFiles(updated);
  };

  const sortedStudents = [...students].sort((a, b) => {
    const scoreA = grades[a.id]?.score || 0;
    const scoreB = grades[b.id]?.score || 0;
    return sortDir === 'desc' ? scoreB - scoreA : scoreA - scoreB;
  });

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; padding: 10px 20px; border: none; background: none; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; margin-bottom: -1px; color: #76777D; }
        .tab-btn:hover { color: #0051D5; }
        .tab-active { color: #0051D5 !important; border-bottom-color: #0051D5 !important; font-weight: 600 !important; }
        .table-row:hover { background: #F0F7FF !important; }
        .grade-input { border: 2px solid #E5E7EB; border-radius: 6px; padding: 5px 8px; width: 64px; font-size: 13px; text-align: center; outline: none; }
        .grade-input:focus { border-color: #0051D5; }
        .upload-zone:hover { border-color: #0051D5 !important; background: #F0F7FF !important; cursor: pointer; }
        .file-row:hover { background: #F8FAFF !important; }
        .save-btn:hover { background: #003DAA !important; }
        .dl-btn:hover { background: #DCE9FF !important; }
        .del-btn:hover { color: #DC2626 !important; }
        .status-select { border: 1px solid #C6C6CD; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; outline: none; }
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
          <button onClick={() => navigate('/teacher/students/new')}
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', marginTop: '16px', width: '100%' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/teacher/support')}><HelpCircle size={15} /> Support</div>
          <div className="sidebar-bottom" onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/classes')}>Classes</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>{loading ? 'Loading...' : (course?.course_name || 'Class Detail')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name}</p>
            <AvatarCircle size={36} />
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>
          <button onClick={() => navigate('/teacher/classes')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '20px', padding: 0 }}>
            <ArrowLeft size={15} /> Back to Classes
          </button>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
          )}

          {error && !loading && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', margin: '0 0 12px' }}>{error}</p>
              <button onClick={() => navigate('/teacher/classes')} style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>Back</button>
            </div>
          )}

          {course && !loading && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0051D5 100%)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{course.course_code}</span>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', margin: '10px 0 4px' }}>{course.course_name}</h2>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>{course.department} • {course.credits} Credits</p>
                  </div>
                  <button onClick={() => navigate(`/teacher/classes/${id}/edit`)}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: 'fit-content' }}>
                    <Pencil size={13} /> Edit Class
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users2 size={14} color="rgba(255,255,255,0.8)" /><span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{students.length} Students</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color="rgba(255,255,255,0.8)" /><span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{course.semester}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="rgba(255,255,255,0.8)" /><span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Max {course.max_students}</span></div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ borderBottom: '1px solid #E5E7EB', display: 'flex', padding: '0 20px' }}>
                  {[{ key: 'gradebook', label: '📊 Gradebook' }, { key: 'materials', label: '📁 Class Materials' }, { key: 'overview', label: '📋 Overview' }].map(tab => (
                    <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.key as Tab)}>{tab.label}</button>
                  ))}
                </div>

                {/* ── GRADEBOOK — real data, status dropdown, fixed logic ── */}
                {activeTab === 'gradebook' && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: '0 0 2px' }}>Gradebook</h3>
                        <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Enter a score in SCORE column to set the grade. Change STATUS using the dropdown.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {saved && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}><Check size={13} /> Saved!</div>}
                        <button className="save-btn" onClick={handleSaveGrades}
                          style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                          Save All Grades
                        </button>
                      </div>
                    </div>

                    {students.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px', color: '#76777D' }}>
                        <Users2 size={36} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 12px' }} />
                        <p>No students enrolled yet</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                          <thead>
                            <tr style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D' }}>STUDENT NAME</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D' }}>STUDENT ID</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', cursor: 'pointer' }} onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>SCORE {sortDir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />}</div>
                              </th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D' }}>GRADE</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D' }}>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedStudents.map(student => {
                              const stored = grades[student.id] || { score: 0, status: 'active' };
                              const pending = editScores[student.id];
                              const currentScore = pending !== undefined && pending !== ''
                                ? Math.min(100, Math.max(0, parseInt(pending) || 0))
                                : stored.score;
                              const gradeInfo = scoreToGrade(currentScore);
                              const hasUnsaved = pending !== undefined && pending !== '' && parseInt(pending) !== stored.score;

                              return (
                                <tr key={student.id} className="table-row" style={{ borderBottom: '1px solid #F0F4FF', background: hasUnsaved ? '#FFFBF0' : '#fff' }}>
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0051D5' }}>{student.full_name.charAt(0).toUpperCase()}</div>
                                      <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#0B1C30' }}>{student.full_name}</p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#76777D' }}>{student.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#45464D', fontFamily: 'monospace' }}>{student.roll_number || `ST-${String(student.id).padStart(5, '0')}`}</td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <input className="grade-input" type="number" min="0" max="100"
                                      placeholder="Enter score"
                                      value={pending !== undefined ? pending : (stored.score || '')}
                                      onChange={e => setEditScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                                      style={{ borderColor: hasUnsaved ? '#F59E0B' : '#E5E7EB' }} />
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <span style={{ background: gradeInfo.bg, color: gradeInfo.color, fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: '6px' }}>{gradeInfo.grade}</span>
                                    <span style={{ fontSize: '11px', color: '#76777D', marginLeft: '6px' }}>{currentScore}/100</span>
                                    {hasUnsaved && <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#D97706', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>UNSAVED</span>}
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <select className="status-select" value={stored.status} onChange={e => handleStatusChange(student.id, e.target.value)}
                                      style={{ background: stored.status === 'active' ? '#DCFCE7' : stored.status === 'probation' ? '#FEE2E2' : '#F0F4FF', color: stored.status === 'active' ? '#166534' : stored.status === 'probation' ? '#991B1B' : '#45464D' }}>
                                      <option value="active">Active</option>
                                      <option value="probation">Probation</option>
                                      <option value="excused">Excused</option>
                                      <option value="withdrawn">Withdrawn</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CLASS MATERIALS — real upload/download/delete ── */}
                {activeTab === 'materials' && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: '0 0 2px' }}>Class Materials</h3>
                      <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>{files.length} files</p>
                    </div>

                    <div className="upload-zone"
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: `2px dashed ${dragOver ? '#0051D5' : '#C6C6CD'}`, borderRadius: '10px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: dragOver ? '#F0F7FF' : '#F8F9FF', marginBottom: '16px' }}>
                      <div style={{ background: '#DCE9FF', borderRadius: '10px', padding: '10px', display: 'flex' }}><Upload size={20} color="#0051D5" /></div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>Drop files here or click to upload</p>
                      <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>PDF, DOCX, PPTX, XLSX up to 50MB</p>
                      <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple
                        onChange={e => { if (e.target.files) handleFiles(e.target.files); }} />
                    </div>

                    {files.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#76777D', fontSize: '13px', padding: '20px' }}>No files uploaded yet. Upload your first class material above.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {files.map(file => (
                          <div key={file.id} className="file-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ background: file.type === 'pdf' ? '#FEE2E2' : file.type === 'docx' ? '#DBEAFE' : '#DCFCE7', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                                <FileText size={16} color={file.type === 'pdf' ? '#DC2626' : file.type === 'docx' ? '#1D4ED8' : '#059669'} />
                              </div>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: '0 0 2px' }}>{file.name}</p>
                                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{file.size} • Uploaded {file.date}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="dl-btn" onClick={() => handleDownload(file)}
                                style={{ background: '#F0F4FF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: '#0051D5', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <DownloadIcon size={12} /> Download
                              </button>
                              <button className="del-btn" onClick={() => handleDeleteFile(file.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', padding: '6px', display: 'flex' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 12px' }}>Course Information</h3>
                        {[
                          { label: 'Course Name', value: course.course_name },
                          { label: 'Course Code', value: course.course_code },
                          { label: 'Department',  value: course.department },
                          { label: 'Credits',     value: `${course.credits} Credits` },
                          { label: 'Max Students',value: String(course.max_students) },
                          { label: 'Status',      value: course.status },
                          { label: 'Semester',    value: course.semester },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F4FF' }}>
                            <span style={{ fontSize: '13px', color: '#76777D' }}>{row.label}</span>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', textTransform: 'capitalize' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 12px' }}>Description</h3>
                        <p style={{ fontSize: '14px', color: '#45464D', lineHeight: 1.7, margin: '0 0 20px' }}>{course.description || 'No description provided.'}</p>
                        <div style={{ background: '#F8F9FF', borderRadius: '10px', padding: '16px' }}>
                          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 10px' }}>Quick Stats</p>
                          {[
                            { label: 'Total Students', value: String(students.length) },
                            { label: 'Active',         value: String(Object.values(grades).filter(g => g.status === 'active').length) },
                            { label: 'Avg Score',      value: students.length > 0 ? `${Math.round(Object.values(grades).reduce((a, g) => a + (g?.score || 0), 0) / students.length)}` : '0' },
                          ].map(stat => (
                            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#76777D' }}>{stat.label}</span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0B1C30' }}>{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}