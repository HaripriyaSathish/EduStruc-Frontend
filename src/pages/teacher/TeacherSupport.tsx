import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  ChevronRight, CheckCircle, Upload, Monitor, RefreshCw,
  Clock, Ticket, X, Check, Users2, Download, ExternalLink, ChevronDown
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';
import communityImg from '../../assets/Educator_community.png';
const API_BASE = import.meta.env.VITE_API_URL;

interface SupportTicket {
  id:                number;
  subject:           string;
  category:          string;
  priority:          string;
  message:           string;
  status:            'open' | 'in_progress' | 'resolved';
  admin_response:    string;
  responded_by_name: string | null;
  created_at:        string;
  updated_at:        string;
  resolved_at:       string | null;
}

const INQUIRY_TYPES = [
  'Technical Issue', 'Account Access', 'Data & Reports',
  'Feature Request', 'Billing', 'Other',
];

const statusLabel: Record<string, { label: string; bg: string; color: string }> = {
  open:        { label: 'Open',        bg: '#DBEAFE', color: '#1E40AF' },
  in_progress: { label: 'In Progress', bg: '#FEF3C7', color: '#92400E' },
  resolved:    { label: 'Resolved',    bg: '#DCFCE7', color: '#166534' },
};

export default function TeacherSupport() {
  const navigate = useNavigate();
  const user     = getSession();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [inquiryType,  setInquiryType]  = useState('Technical Issue');
  const [subject,      setSubject]      = useState('');
  const [description,  setDescription]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitMsg,    setSubmitMsg]    = useState('');
  const [submitErr,    setSubmitErr]    = useState('');
  const [myTickets,    setMyTickets]    = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showTickets,  setShowTickets]  = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/support-tickets/`);
      if (res.ok) setMyTickets(await res.json());
    } catch (e) {
      console.error('Ticket fetch error:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async () => {
    setSubmitErr(''); setSubmitMsg('');
    if (!subject.trim())     { setSubmitErr('Please enter a subject.'); return; }
    if (!description.trim()) { setSubmitErr('Please describe your issue.'); return; }
    setSubmitting(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/support-tickets/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          subject:  subject.trim(),
          category: inquiryType,
          priority: 'Medium',
          message:  description.trim(),
        }),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setSubmitMsg(`Ticket #${newTicket.id} submitted! Average response time: 2 hours.`);
        setSubject('');
        setDescription('');
        setShowTickets(true);
        fetchTickets();
        setTimeout(() => setSubmitMsg(''), 5000);
      } else {
        setSubmitErr('Failed to submit ticket. Please try again.');
      }
    } catch (e) {
      console.error('Ticket submit error:', e);
      setSubmitErr('Cannot connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const GUIDES = [
    { title: 'Gradebook Configuration',      path: '/teacher/support/gradebook',   desc: 'Master weighted averages and custom grading scales for your courses.' },
    { title: 'Parent-Teacher Communication', path: '/teacher/support/parent-comm', desc: 'Setup automated weekly progress reports for parents and guardians.' },
    { title: 'Attendance Automation',        path: '/teacher/support/attendance',  desc: 'Use QR codes or biometric integration for seamless morning roll-call.' },
    { title: 'Security & Data Privacy',      path: '/teacher/support/security',    desc: 'Understanding FERPA compliance within the EduStruc ecosystem.' },
  ];

  const filteredGuides = GUIDES.filter(g =>
    !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <Users size={16} />,           label: 'Students',  path: '/teacher/students' },
    { icon: <BookOpen size={16} />,        label: 'Class',     path: '/teacher/classes' },
    { icon: <Calendar size={16} />,        label: 'Schedules', path: '/teacher/schedules' },
    { icon: <Settings size={16} />,        label: 'Settings',  path: '/teacher/settings' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontSize: '13px', color: '#45464D',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(49,107,243,0.08) !important; }
        .nav-item-active { background: #316BF3 !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: #45464D; font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(49,107,243,0.08); color: #316BF3; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn-side:hover { background: #003DAA !important; }
        .guide-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px; }
        .guide-card:hover { border-color: #0051D5 !important; background: #F8FCFF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,81,213,0.08); }
        .quick-card { transition: all 0.2s ease; background: #fff; border: 1px solid #C6C6CD; border-radius: 12px; padding: 20px; }
        .quick-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .submit-btn:hover:not(:disabled) { background: #003DAA !important; transform: translateY(-1px); }
        .submit-btn:disabled { background: #93B4E8 !important; cursor: not-allowed; }
        .form-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.08) !important; }
        .search-input:focus { border-color: #0051D5 !important; outline: none; box-shadow: 0 0 0 3px rgba(0,81,213,0.08); }
        .link-btn { color: #0051D5; font-size: 13px; font-weight: 500; cursor: pointer; background: none; border: none; padding: 0; transition: color 0.15s ease; display: inline-flex; align-items: center; gap: 4px; }
        .link-btn:hover { color: #003DAA; text-decoration: underline; }
        .ticket-row { transition: background 0.15s ease; cursor: pointer; padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 8px; }
        .ticket-row:hover { background: #F8FAFF !important; }
        .community-btn:hover { background: #003DAA !important; transform: translateY(-1px); }
        @keyframes spin { to { transform: rotate(360deg); } }
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
          <div className="sidebar-bottom" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <HelpCircle size={15} /> Support
          </div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/teacher/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>Dashboard</span>
            <span style={{ color: '#C6C6CD' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Help & Support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
              <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>Teacher</p>
            </div>
            <AvatarCircle size={36} />
          </div>
        </header>

        {/* Hero */}
        <div style={{ background: '#EFF4FF', padding: '48px 28px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#0B1C30', margin: '0 0 8px' }}>
            How can we help you today?
          </h1>
          <p style={{ fontSize: '14px', color: '#45464D', margin: '0 0 24px' }}>
            Search our documentation for instant answers or reach out to our support team.
          </p>
          <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
            <input className="search-input"
              placeholder="Search for guides, tutorials, and FAQs..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '42px', paddingTop: '13px', paddingBottom: '13px', borderRadius: '10px', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,81,213,0.08)' }} />
          </div>
        </div>

        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Section title */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: '0 0 6px' }}>Support & Resources</h2>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
              Find answers to common questions about classroom management, student grading, and institutional tools, or connect directly with our technical team.
            </p>
          </div>

          {/* Documentation Library + Direct Inquiry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>

            {/* Documentation Library */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#0051D5" />
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Documentation Library</h3>
                </div>
                <button className="link-btn" onClick={() => navigate('/teacher/support/guides')}>
                  View All Guides <ChevronRight size={13} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {filteredGuides.map((guide, i) => (
                  <div key={i} className="guide-card" onClick={() => navigate(guide.path)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0051D5', margin: 0, lineHeight: 1.4 }}>{guide.title}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#76777D', margin: 0, lineHeight: 1.5 }}>{guide.desc}</p>
                  </div>
                ))}
                {filteredGuides.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px', color: '#76777D' }}>
                    <p style={{ margin: 0 }}>No guides match "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Inquiry */}
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <HelpCircle size={18} color="#0051D5" />
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: 0 }}>Direct Inquiry</h3>
              </div>

              {submitMsg && (
                <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', display: 'flex', gap: '8px' }}>
                  <Check size={14} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>{submitMsg}</p>
                </div>
              )}
              {submitErr && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', display: 'flex', gap: '8px' }}>
                  <X size={14} color="#DC2626" />
                  <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{submitErr}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Inquiry Type</label>
                  <select className="form-input" style={inputStyle}
                    value={inquiryType} onChange={e => setInquiryType(e.target.value)}>
                    {INQUIRY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Subject</label>
                  <input className="form-input" style={inputStyle} placeholder="Summary of the issue"
                    value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
                  <textarea className="form-input" style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                    placeholder="How can we help you?"
                    value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={submitting}
                  style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                  {submitting ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Submitting...</>
                  ) : <><Ticket size={14} /> Submit Ticket</>}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>
                    Average response time: <strong style={{ color: '#0051D5' }}>2 hours</strong>
                  </p>
                  {!loadingTickets && myTickets.length > 0 && (
                    <button className="link-btn" onClick={() => setShowTickets(t => !t)}>
                      My Tickets ({myTickets.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My Tickets */}
          {showTickets && myTickets.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>My Support Tickets</h3>
                <button className="link-btn" onClick={() => setShowTickets(false)}>Hide</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myTickets.map(t => (
                  <div key={t.id} className="ticket-row" onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0051D5', fontWeight: 600, background: '#EFF4FF', padding: '3px 8px', borderRadius: '4px' }}>TKT-{t.id}</span>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>{t.subject}</p>
                          <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{t.category} • {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: statusLabel[t.status].bg, color: statusLabel[t.status].color, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>
                          {statusLabel[t.status].label}
                        </span>
                        <ChevronDown size={14} color="#76777D" style={{ transform: expandedTicket === t.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                      </div>
                    </div>

                    {expandedTicket === t.id && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F0F4FF' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Your message</p>
                        <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 10px', lineHeight: 1.6 }}>{t.message}</p>
                        {t.admin_response ? (
                          <div style={{ background: '#EFF4FF', border: '1px solid #DCE9FF', borderRadius: '8px', padding: '10px 12px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#0051D5', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                              Response{t.responded_by_name ? ` from ${t.responded_by_name}` : ''}
                            </p>
                            <p style={{ fontSize: '13px', color: '#0B1C30', margin: 0, lineHeight: 1.6 }}>{t.admin_response}</p>
                          </div>
                        ) : (
                          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, fontStyle: 'italic' }}>Waiting on a response from the admin team.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Status — no badges */}
          <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '18px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={22} color="#4ADE80" />
              <div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', margin: '0 0 2px' }}>System Status: Operational</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> Last check: 4 minutes ago
                </p>
              </div>
            </div>
          </div>

          {/* Quick Help Cards — all with real navigation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>

            {/* Resetting Credentials */}
            <div className="quick-card">
              <div style={{ background: '#EFF4FF', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <RefreshCw size={18} color="#0051D5" />
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 8px' }}>Resetting Credentials</p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 14px', lineHeight: 1.6 }}>
                Can't log in? Click 'Forgot Password' at the login screen or contact your administrator for SSO resets.
              </p>
              <button className="link-btn" onClick={() => navigate('/teacher/support/reset-credentials')}>
                Learn More <ExternalLink size={11} />
              </button>
            </div>

            {/* Bulk Student Upload */}
            <div className="quick-card">
              <div style={{ background: '#ECFDF5', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Upload size={18} color="#059669" />
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 8px' }}>Bulk Student Upload</p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 14px', lineHeight: 1.6 }}>
                Use our standardized CSV template to import student rosters. Headers must strictly follow the schema provided.
              </p>
              <button className="link-btn" onClick={() => navigate('/teacher/support/bulk-upload')}>
                Download Template <Download size={11} />
              </button>
            </div>

            {/* Virtual Classroom Integration */}
            <div className="quick-card">
              <div style={{ background: '#F3E8FF', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Monitor size={18} color="#7C3AED" />
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 8px' }}>Virtual Classroom Integration</p>
              <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 14px', lineHeight: 1.6 }}>
                Connect Zoom or Microsoft Teams directly to your schedule to auto-generate session links for students.
              </p>
              <button className="link-btn" onClick={() => navigate('/teacher/support/virtual-classroom')}>
                Setup Guide <ExternalLink size={11} />
              </button>
            </div>
          </div>

          {/* Join Educator Network — real image as background with overlay */}
          <div style={{
            borderRadius: '16px', overflow: 'hidden', position: 'relative',
            minHeight: '200px', marginBottom: '20px',
            backgroundImage: `url(${communityImg})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            {/* Blue overlay blend */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(0,81,213,0.88) 0%, rgba(0,81,213,0.65) 50%, rgba(0,81,213,0.2) 100%)',
            }}></div>
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, padding: '40px 36px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff', margin: '0 0 10px' }}>
                Join the Educator Network
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 24px', maxWidth: '440px', lineHeight: 1.7 }}>
                Connect with 15,000+ teachers using EduStruc to share lesson plans, custom grading rubrics, and platform best practices.
              </p>
              <button className="community-btn"
                onClick={() => navigate('/teacher/support/community')}
                style={{ background: '#fff', color: '#0051D5', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                <Users2 size={16} /> Explore Community
              </button>
            </div>
          </div>
        </main>

        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '20px 48px', textAlign: 'center' }}>
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