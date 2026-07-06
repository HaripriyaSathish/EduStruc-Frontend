import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, Search, Eye, Pencil,
  GraduationCap, ChevronLeft, ChevronRight, X, Filter, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, getAuthHeader } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';
const API_BASE = import.meta.env.VITE_API_URL;

interface Student {
  id:           number;
  roll_number:  string;
  full_name:    string;
  email:        string;
  class_name:   string;
  section:      string;
  gender:       string;
  status:       string;
  academic_year:string;
  address:      string;
  parent_name:  string;
  parent_phone: string;
}

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

const ITEMS_PER_PAGE = 5;

export default function Students() {
  const navigate = useNavigate();
  const user     = getSession();

  const [students, setStudents]         = useState<Student[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [activeNav, setActiveNav]       = useState('Students');
  const [deleteId, setDeleteId]         = useState<number | null>(null);

  // ── Fetch students from backend ───────────────────────
  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/students/?`;
      if (searchQuery) url += `search=${searchQuery}&`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data: Student[] = await res.json();
        // Filter by status and grade on frontend
        let filtered = data;
        if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);
        if (gradeFilter)  filtered = filtered.filter(s => s.class_name.toLowerCase().includes(gradeFilter.toLowerCase()));
        setTotalCount(filtered.length);
        // Paginate
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        setStudents(filtered.slice(start, start + ITEMS_PER_PAGE));
      }
    } catch (e) {
      console.error('Fetch students error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [searchQuery, statusFilter, gradeFilter, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, gradeFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await fetch(`${API_BASE}/api/students/${id}/`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      fetchStudents();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setGradeFilter('');
    setCurrentPage(1);
  };

 const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <GraduationCap size={16} />,   label: 'Teachers',   path: '/teachers' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];

  // Pagination numbers
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFF4FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .add-btn:hover { background: #003DAA !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.3); }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; color: #fff !important; }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: #F0F7FF !important; }
        .action-btn { transition: all 0.2s ease; border: none; background: none; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .action-btn:hover { background: #DCE9FF !important; }
        .page-btn { transition: all 0.2s ease; border: 1px solid #C6C6CD; background: #fff; borderRadius: 6px; padding: 6px 10px; cursor: pointer; font-size: 13px; color: #45464D; }
        .page-btn:hover { border-color: #0051D5; color: #0051D5; }
        .page-btn-active { background: #0051D5 !important; color: #fff !important; border-color: #0051D5 !important; }
        .filter-chip { transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; cursor: pointer; }
        .filter-chip:hover { opacity: 0.85; }
        .clear-btn:hover { background: #FEE2E2 !important; color: #DC2626 !important; }
        .search-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; outline: none; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{ width: '240px', background: '#EFF4FF', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ background: '#316BF3', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0B1C30', margin: 0 }}>EduStruc SMS</p>
            <p style={{ fontSize: '10px', color: '#76777D', margin: 0, letterSpacing: '0.06em' }}>ADMIN PORTAL</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <div key={i} className={`nav-item ${activeNav === item.label ? 'nav-item-active' : ''}`}
              onClick={() => { setActiveNav(item.label); navigate(item.path); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: activeNav === item.label ? '#fff' : '#45464D', fontSize: '14px', fontWeight: activeNav === item.label ? 600 : 400 }}>
              {item.icon} {item.label}
            </div>
          ))}
          <button className="add-btn" onClick={() => navigate('/students/new')}
            style={{ background: '#0042AA', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #C6C6CD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom" onClick={() => navigate('/support')}>
  <HelpCircle size={15} /> Support
</div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}><LogOut size={15} /> Logout</div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Student Directory</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Manage and track student enrollment and academic records.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="search-input" type="text" placeholder="Search by name, ID or email..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', color: '#45464D', background: '#F8F9FF', width: '240px', transition: 'all 0.2s ease' }} />
            </div>
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Admin'}</p>
                <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{roleLabel[user?.role || 'admin']}</p>
              </div>
              <AvatarCircle size={36} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '28px 32px', flex: 1 }}>
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>

            {/* Filter bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Total chip */}
              <div className="filter-chip" style={{ background: '#DCE9FF', color: '#0051D5', border: '1px solid #B8D0F5' }}>
                All Students: {totalCount}
              </div>

              {/* Grade filter */}
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                style={{ padding: '4px 10px', border: '1px solid #C6C6CD', borderRadius: '999px', fontSize: '12px', fontWeight: 500, color: gradeFilter ? '#0051D5' : '#45464D', background: gradeFilter ? '#DCE9FF' : '#fff', cursor: 'pointer', outline: 'none' }}>
               <option value="">All Grades</option>
  <option value="Kindergarten 1">Kindergarten 1</option>
  <option value="Kindergarten 2">Kindergarten 2</option>
  <option value="1st Grade">1st Grade</option>
  <option value="2nd Grade">2nd Grade</option>
  <option value="3rd Grade">3rd Grade</option>
  <option value="4th Grade">4th Grade</option>
  <option value="5th Grade">5th Grade</option>
  <option value="6th Grade">6th Grade</option>
  <option value="7th Grade">7th Grade</option>
  <option value="8th Grade">8th Grade</option>
  <option value="9th Grade">9th Grade</option>
  <option value="10th Grade">10th Grade</option>
  <option value="11th Grade">11th Grade</option>
  <option value="12th Grade">12th Grade</option>
              </select>

              {/* Status filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '4px 10px', border: '1px solid #C6C6CD', borderRadius: '999px', fontSize: '12px', fontWeight: 500, color: statusFilter ? '#0051D5' : '#45464D', background: statusFilter ? '#DCE9FF' : '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>

              {/* Active filter chips */}
              {gradeFilter && (
                <div className="filter-chip" style={{ background: '#DCE9FF', color: '#0051D5', border: '1px solid #B8D0F5' }}
                  onClick={() => setGradeFilter('')}>
                  Grade: {gradeFilter} <X size={12} />
                </div>
              )}
              {statusFilter && (
                <div className="filter-chip" style={{ background: '#DCE9FF', color: '#0051D5', border: '1px solid #B8D0F5' }}
                  onClick={() => setStatusFilter('')}>
                  Status: {statusFilter} <X size={12} />
                </div>
              )}

              {/* Clear all */}
              {(searchQuery || statusFilter || gradeFilter) && (
                <div className="filter-chip clear-btn" onClick={clearAllFilters}
                  style={{ background: '#F8F9FF', color: '#45464D', border: '1px solid #C6C6CD', marginLeft: 'auto', transition: 'all 0.2s ease' }}>
                  Clear All
                </div>
              )}

              {/* Add button */}
              <button onClick={() => navigate('/students/new')}
                style={{ marginLeft: (searchQuery || statusFilter || gradeFilter) ? '0' : 'auto', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#003DAA')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0051D5')}>
                <Plus size={14} /> Add New Student
              </button>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
                  {['STUDENT NAME', 'STUDENT ID', 'GRADE LEVEL', 'MAJOR', 'STATUS', 'ACTIONS'].map((col, i) => (
                    <th key={i} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#76777D', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#76777D', fontSize: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        Loading students...
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#76777D', fontSize: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Users size={32} color="#C6C6CD" />
                        <p style={{ margin: 0, fontWeight: 500, color: '#45464D' }}>No students found</p>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                          {searchQuery || statusFilter || gradeFilter ? 'Try changing your filters' : 'Add your first student to get started'}
                        </p>
                        {!searchQuery && !statusFilter && !gradeFilter && (
                          <button onClick={() => navigate('/students/new')}
                            style={{ marginTop: '8px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                            + Add New Student
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student, i) => (
                    <tr key={student.id} className="table-row"
                      style={{ borderBottom: i < students.length - 1 ? '1px solid #F0F4FF' : 'none', background: '#fff' }}>
                      {/* Student Name */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0051D5', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#0B1C30' }}>{student.full_name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#76777D' }}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Student ID */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#45464D', fontFamily: 'monospace' }}>
                        {student.roll_number}
                      </td>
                      {/* Grade */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#45464D' }}>
                        {student.class_name} {student.section}
                      </td>
                      {/* Major (using academic_year as placeholder) */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#45464D' }}>
                        {student.academic_year || '—'}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          background: student.status === 'active' ? '#D1FAE5' : student.status === 'graduated' ? '#DCE9FF' : '#F3F4F6',
                          color:      student.status === 'active' ? '#009668' : student.status === 'graduated' ? '#0051D5' : '#6B7280',
                          fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                          textTransform: 'capitalize'
                        }}>
                          {student.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button className="action-btn" title="View student"
                            onClick={() => navigate(`/students/${student.id}`)}>
                            <Eye size={15} color="#45464D" />
                          </button>
                          <button className="action-btn" title="Edit student"
                            onClick={() => navigate(`/students/${student.id}/edit`)}>
                            <Pencil size={15} color="#45464D" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && totalCount > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} students
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Prev */}
                  <button className="page-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '6px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', background: currentPage === 1 ? '#F8F9FF' : '#fff', color: currentPage === 1 ? '#C6C6CD' : '#45464D', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={14} />
                  </button>

                  {/* Page numbers */}
                  {getPages().map((page, i) => (
                    <button key={i}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      style={{ padding: '6px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', background: page === currentPage ? '#0051D5' : '#fff', color: page === currentPage ? '#fff' : page === '...' ? '#C6C6CD' : '#45464D', cursor: page === '...' ? 'default' : 'pointer', fontSize: '13px', fontWeight: page === currentPage ? 600 : 400, minWidth: '32px' }}>
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button className="page-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '6px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', background: currentPage === totalPages ? '#F8F9FF' : '#fff', color: currentPage === totalPages ? '#C6C6CD' : '#45464D', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}