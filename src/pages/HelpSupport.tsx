import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  Plus, HelpCircle, LogOut, GraduationCap, Search,
  MessageSquare, Ticket as TicketIcon, BookMarked, ChevronDown, ChevronRight,
  Phone, Send, X, Check, ClipboardList
} from 'lucide-react';
import { getSession, logoutUser, apiFetch } from '../utils/auth';
import AvatarCircle from '../components/AvatarCircle';

const roleLabel: Record<string, string> = {
  admin: 'Super Admin', teacher: 'Faculty Member', parent: 'Parent',
};

const FAQS = [
  {
    q: 'How do I reset a student password?',
    a: 'Go to Student Directory → find the student → click View → click Edit. Scroll to the account section and click "Reset Password". A temporary password will be sent to the student\'s registered email.'
  },
  {
    q: 'Can I export attendance reports to CSV?',
    a: 'Yes! Go to Academic Schedules → select the class → click "Generate Report" in Quick Actions. Choose the date range and select CSV format. The file will download automatically.'
  },
  {
    q: 'What are the system requirements for the portal?',
    a: 'EduStruc works on any modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). Minimum screen resolution of 1024×768 is recommended. No additional software installation is required.'
  },
  {
    q: 'How do I schedule a holiday for the entire institution?',
    a: 'Go to Academic Schedules → click "Create New Schedule" → select all departments → choose the date and mark it as "Holiday / Institution Closure". This will block that day across all class calendars.'
  },
];

interface Ticket {
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
  raised_by_name:    string;
  raised_by_email:   string;
  raised_by_role:    string;
}

const statusLabel: Record<string, { label: string; bg: string; color: string }> = {
  open:        { label: 'Open',        bg: '#DCE9FF', color: '#0051D5' },
  in_progress: { label: 'In Progress', bg: '#FEF9C3', color: '#854D0E' },
  resolved:    { label: 'Resolved',    bg: '#D1FAE5', color: '#059669' },
};

export default function HelpSupport() {
  const navigate  = useNavigate();
  const user      = getSession();
  const isAdmin   = user?.role === 'admin';

  const [activeNav, setActiveNav]     = useState('Support');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showChatModal, setShowChatModal]     = useState(false);
  const [ticketSuccess, setTicketSuccess]     = useState(false);
  const [chatMsg, setChatMsg]         = useState('');
  const [chatHistory, setChatHistory] = useState<{role:'user'|'support', text:string}[]>([
    { role: 'support', text: 'Hi! I\'m the EduStruc support team. How can I help you today?' }
  ]);

  const [ticket, setTicket] = useState({
    subject: '', category: 'Technical Issue', priority: 'Medium', message: ''
  });

  // ── Real tickets from backend ──────────────────────────
  const [tickets, setTickets]           = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [responseText, setResponseText]     = useState<Record<number, string>>({});
  const [respondingId, setRespondingId]     = useState<number | null>(null);
  const [resolvingId, setResolvingId]       = useState<number | null>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await apiFetch('http://127.0.0.1:8000/api/support-tickets/');
      if (res.ok) setTickets(await res.json());
    } catch (e) {
      console.error('Ticket fetch error:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmitTicket = async () => {
    if (!ticket.subject || !ticket.message) return;
    try {
      const res = await apiFetch('http://127.0.0.1:8000/api/support-tickets/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(ticket),
      });
      if (res.ok) {
        setTicketSuccess(true);
        setTicket({ subject: '', category: 'Technical Issue', priority: 'Medium', message: '' });
        fetchTickets();
        setTimeout(() => { setTicketSuccess(false); setShowTicketModal(false); }, 2000);
      }
    } catch (e) {
      console.error('Ticket submit error:', e);
    }
  };

  const handleRespond = async (id: number) => {
    const text = (responseText[id] || '').trim();
    if (!text) return;
    setRespondingId(id);
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/support-tickets/${id}/respond/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ response: text }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
        setResponseText(prev => ({ ...prev, [id]: '' }));
      }
    } catch (e) { console.error(e); }
    finally { setRespondingId(null); }
  };

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/support-tickets/${id}/resolve/`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (e) { console.error(e); }
    finally { setResolvingId(null); }
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMsg('');
    // Auto response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'support',
        text: `Thank you for your message! Our team will respond within 5 minutes. Your query: "${userMsg}" has been noted.`
      }]);
    }, 1000);
  };

  const filteredFaqs = FAQS.filter(faq =>
    !searchQuery || faq.q.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',  path: '/dashboard' },
  { icon: <Users size={16} />,           label: 'Students',   path: '/students' },
  { icon: <BookOpen size={16} />,        label: 'Courses',    path: '/courses' },
  { icon: <Calendar size={16} />,        label: 'Schedules',  path: '/schedules' },
  { icon: <ClipboardList size={16} />,   label: 'Attendance', path: '/attendance/bulk' },
  { icon: <Settings size={16} />,        label: 'Settings',   path: '/settings' },
];


  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', background: '#fff', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px',
    color: '#45464D', letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        .nav-item { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.15) !important; }
        .nav-item-active { background: rgba(255,255,255,0.2) !important; }
        .sidebar-bottom { transition: all 0.2s ease; border-radius: 8px; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px; }
        .sidebar-bottom:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .sidebar-support-active { background: #0051D5 !important; color: #fff !important; border-radius: 8px; }
        .logout-btn:hover { background: rgba(255,80,80,0.2) !important; }
        .add-btn:hover { background: #003DAA !important; }
        .support-card { transition: all 0.25s ease; cursor: pointer; }
        .support-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,81,213,0.12) !important; border-color: #0051D5 !important; }
        .faq-row { transition: all 0.2s ease; cursor: pointer; }
        .faq-row:hover { background: #F0F7FF !important; }
        .search-input:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; outline: none; }
        .chat-send:hover { background: #003DAA !important; }
        .forum-btn:hover { background: #003DAA !important; }
        .ticket-row { transition: all 0.2s ease; cursor: pointer; }
        .ticket-row:hover { background: #F8FAFF !important; }
        .resolve-btn:hover:not(:disabled) { background: #003DAA !important; }
        .respond-btn:hover:not(:disabled) { background: #003DAA !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .chat-msg { animation: fadeIn 0.3s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', background: '#0051D5', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
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
            style={{ background: '#003EA8', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '16px', width: '100%', transition: 'all 0.2s ease' }}>
            <Plus size={15} /> Add New Student
          </button>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="sidebar-bottom sidebar-support-active" style={{ color: '#fff', fontWeight: 600 }}>
            <HelpCircle size={15} /> Support
          </div>
          <div className="sidebar-bottom logout-btn" onClick={() => { logoutUser(); navigate('/logged-out'); }}>
            <LogOut size={15} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#0B1C30', margin: 0 }}>Help & Support</h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Find answers, get support, and connect with our team.</p>
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
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Hero search */}
          <div style={{ background: 'linear-gradient(135deg, #EFF4FF 0%, #DCE9FF 100%)', padding: '48px 48px 40px', textAlign: 'center', borderBottom: '1px solid #C6C6CD' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', color: '#0B1C30', margin: '0 0 8px' }}>How can we help you today?</h2>
            <p style={{ fontSize: '14px', color: '#45464D', margin: '0 0 24px' }}>Search our documentation for instant answers or reach out to our support team.</p>
            <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
              <input className="search-input" type="text" placeholder="Search for guides, tutorials, and FAQs..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '13px 16px 13px 42px', border: '1px solid #C6C6CD', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', background: '#fff', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
            </div>
          </div>

          <div style={{ padding: '32px 48px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Support Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Live Chat */}
                <div className="support-card" onClick={() => setShowChatModal(true)}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#EFF4FF', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <MessageSquare size={20} color="#0051D5" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 6px' }}>Live Chat</h3>
                  <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 16px', lineHeight: 1.5 }}>Average response time: &lt; 5 minutes</p>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#0051D5', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Start Conversation <ChevronRight size={13} />
                  </button>
                </div>

                {/* Open a Ticket */}
                <div className="support-card" onClick={() => setShowTicketModal(true)}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#ECFDF5', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <TicketIcon size={20} color="#059669" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 6px' }}>Open a Ticket</h3>
                  <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 16px', lineHeight: 1.5 }}>Best for complex technical issues</p>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#059669', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Submit Request <ChevronRight size={13} />
                  </button>
                </div>

                {/* Documentation */}
                <div className="support-card" onClick={() => window.open('https://docs.edustruc.com', '_blank')}
                  style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#FFF7ED', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <BookMarked size={20} color="#EA580C" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 6px' }}>Documentation</h3>
                  <p style={{ fontSize: '12px', color: '#76777D', margin: '0 0 16px', lineHeight: 1.5 }}>Browse our comprehensive guides</p>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#EA580C', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Explore Wiki <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* FAQ */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#0B1C30', margin: 0 }}>Frequently Asked Questions</h3>
                </div>
                {filteredFaqs.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#76777D' }}>No results for "{searchQuery}"</div>
                ) : (
                  filteredFaqs.map((faq, i) => (
                    <div key={i} style={{ borderBottom: i < filteredFaqs.length - 1 ? '1px solid #F0F4FF' : 'none' }}>
                      <div className="faq-row"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', transition: 'background 0.15s ease' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#0B1C30' }}>{faq.q}</span>
                        <div style={{ transition: 'transform 0.2s ease', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>
                          <ChevronDown size={16} color="#76777D" />
                        </div>
                      </div>
                      {openFaq === i && (
                        <div style={{ padding: '0 24px 18px', borderTop: '1px solid #F0F4FF' }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', margin: 0, lineHeight: 1.7 }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* ── Tickets list (admins see ALL, others see their own) ── */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#0B1C30', margin: 0 }}>
                    {isAdmin ? 'All Support Tickets' : 'My Tickets'}
                  </h3>
                  {!loadingTickets && <span style={{ fontSize: '12px', color: '#76777D' }}>{tickets.length} total</span>}
                </div>

                {loadingTickets ? (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #DCE9FF', borderTopColor: '#0051D5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#76777D', fontSize: '13px' }}>No tickets yet.</div>
                ) : (
                  tickets.map((t, i) => (
                    <div key={t.id} style={{ borderBottom: i < tickets.length - 1 ? '1px solid #F0F4FF' : 'none' }}>
                      <div className="ticket-row"
                        onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)}
                        style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: 0 }}>{t.subject}</p>
                            <span style={{ background: statusLabel[t.status].bg, color: statusLabel[t.status].color, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{statusLabel[t.status].label}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>
                            {isAdmin && <>{t.raised_by_name} ({t.raised_by_role}) • </>}
                            {t.category} • {t.priority} priority • {new Date(t.created_at).toLocaleString()}
                          </p>
                        </div>
                        <ChevronDown size={16} color="#76777D" style={{ transform: expandedTicket === t.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
                      </div>

                      {expandedTicket === t.id && (
                        <div style={{ padding: '0 24px 20px' }}>
                          <div style={{ background: '#F8F9FF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Message</p>
                            <p style={{ fontSize: '13px', color: '#45464D', margin: 0, lineHeight: 1.6 }}>{t.message}</p>
                          </div>

                          {t.admin_response && (
                            <div style={{ background: '#EFF4FF', border: '1px solid #DCE9FF', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px' }}>
                              <p style={{ fontSize: '11px', fontWeight: 600, color: '#0051D5', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                                Response{t.responded_by_name ? ` from ${t.responded_by_name}` : ''}
                              </p>
                              <p style={{ fontSize: '13px', color: '#0B1C30', margin: 0, lineHeight: 1.6 }}>{t.admin_response}</p>
                            </div>
                          )}

                          {isAdmin && t.status !== 'resolved' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <textarea
                                placeholder="Write a response to this ticket..."
                                value={responseText[t.id] || ''}
                                onChange={e => setResponseText(prev => ({ ...prev, [t.id]: e.target.value }))}
                                style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
                              />
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button className="resolve-btn" onClick={() => handleResolve(t.id)} disabled={resolvingId === t.id}
                                  style={{ background: '#fff', border: '1px solid #059669', color: '#059669', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                  {resolvingId === t.id ? 'Resolving...' : 'Mark Resolved'}
                                </button>
                                <button className="respond-btn" onClick={() => handleRespond(t.id)} disabled={respondingId === t.id}
                                  style={{ background: '#0051D5', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                  {respondingId === t.id ? 'Sending...' : 'Send Response'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Community Support */}
              <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 16px 12px' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 12px' }}>Community Support</h3>
                </div>
                {/* Community image */}
                <img src="/src/assets/community.png" alt="Community"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '14px 16px 16px' }}>
                  <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 14px', lineHeight: 1.6 }}>
                    Join our administrator community to share tips and best practices with other EduStruc users.
                  </p>
                  <button className="forum-btn"
                    style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    Visit Forum
                  </button>
                </div>
              </div>

              {/* Priority Support */}
              <div style={{ background: '#0B1C30', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: '#059669', borderRadius: '50%', width: '8px', height: '8px' }}></div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0 }}>Priority Support</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Institutional accounts have access to 24/7 emergency phone support. Please use your priority PIN.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#DCE9FF" />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff' }}>1-800-EDUSTRUC-911</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#D3E4FE', borderTop: '1px solid #C6C6CD', padding: '16px 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#45464D', margin: '0 0 4px' }}>© 2024 EduStruc Academic Systems. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['Privacy Policy','Terms of Service','Contact Support'].map((l, i) => (
              <a key={i} href="#" style={{ fontSize: '12px', color: '#0051D5', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      {/* ── TICKET MODAL ─────────────────────────────── */}
      {showTicketModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0B1C30', margin: 0 }}>Open a Support Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', display: 'flex' }}><X size={18} /></button>
            </div>

            {ticketSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ background: '#D1FAE5', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={24} color="#059669" />
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#059669', margin: '0 0 6px' }}>Ticket Submitted!</p>
                <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>Our team will respond within 24 hours.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Subject <span style={{ color: '#DC2626' }}>*</span></label>
                  <input style={inputStyle} placeholder="Brief description of your issue"
                    value={ticket.subject} onChange={e => setTicket(prev => ({ ...prev, subject: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={ticket.category} onChange={e => setTicket(prev => ({ ...prev, category: e.target.value }))}>
                      {['Technical Issue','Account Access','Data & Reports','Feature Request','Billing','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Priority</label>
                    <select style={inputStyle} value={ticket.priority} onChange={e => setTicket(prev => ({ ...prev, priority: e.target.value }))}>
                      {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Message <span style={{ color: '#DC2626' }}>*</span></label>
                  <textarea style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                    placeholder="Describe your issue in detail..."
                    value={ticket.message} onChange={e => setTicket(prev => ({ ...prev, message: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setShowTicketModal(false)}
                    style={{ background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSubmitTicket}
                    style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Submit Ticket
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── LIVE CHAT MODAL ───────────────────────────── */}
      {showChatModal && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, width: '360px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', border: '1px solid #C6C6CD' }}>
            {/* Chat header */}
            <div style={{ background: '#0051D5', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DCE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={15} color="#0051D5" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>EduStruc Support</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80' }}></div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Online · Avg 5 min response</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex' }}><X size={16} /></button>
            </div>

            {/* Messages */}
            <div style={{ height: '280px', overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8F9FF' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} className="chat-msg" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: msg.role === 'user' ? '#0051D5' : '#fff', color: msg.role === 'user' ? '#fff' : '#0B1C30', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', maxWidth: '80%', fontSize: '13px', lineHeight: 1.5, border: msg.role === 'support' ? '1px solid #E5E7EB' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '8px', background: '#fff' }}>
              <input type="text" placeholder="Type your message..."
                value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', outline: 'none' }} />
              <button className="chat-send" onClick={handleSendChat}
                style={{ background: '#0051D5', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}>
                <Send size={15} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}