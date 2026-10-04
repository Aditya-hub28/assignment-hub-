import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { NotificationBell } from '../components/NotificationBell';

// Dataset aligned with Stitch Screen 303be452a5684a22ad716eaa66b36904
const INITIAL_INQUIRIES = [
  {
    id: 'REQ-1024',
    title: 'Assignment Deadline Question',
    requestNumber: '#REQ-1024',
    requestTitle: 'Engineering Mathematics Assignment',
    status: 'open',
    quote: '“Can I get this assignment delivered one day earlier? My professor moved the submission deadline to Friday morning at 10 AM instead of Saturday.”',
    messagesCount: 2,
    updatedAt: 'Updated 2h ago',
    category: 'Request Question',
    coordinator: 'Dr. Banerjee (Academic Reviewer)',
    createdAt: '26 Sep 2026, 10:30 AM',
    lastActivity: '26 Sep 2026, 11:40 AM',
    keywords: 'Assignment Deadline Question #REQ-1024 Engineering Mathematics earlier professor Friday',
    thread: [
      {
        id: 'msg-1',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '26 Sep 2026 • 10:30 AM',
        text: 'Can I get this assignment delivered one day earlier? My professor moved the submission deadline to Friday morning at 10 AM instead of Saturday.',
        attachment: {
          name: 'revised_schedule_notice.pdf',
          size: '850 KB'
        }
      },
      {
        id: 'msg-2',
        sender: 'coordinator',
        senderName: 'Dr. Banerjee',
        badge: 'Academic Coordinator',
        time: '26 Sep 2026 • 11:05 AM',
        text: 'Hello Aditya, we have coordinated with your assigned subject specialist. Since the mathematical proofs are already 70% completed, we can expedite the final review and deliver by Thursday, 9:00 PM without compromising academic integrity standards.'
      },
      {
        id: 'msg-3',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '26 Sep 2026 • 11:40 AM',
        text: 'That works wonderfully! Please proceed with the expedited Thursday timeline. Thank you for the quick turnaround.'
      }
    ]
  },
  {
    id: 'REQ-1018',
    title: 'Clarification on Dataset & Chart Requirements',
    requestNumber: '#REQ-1018',
    requestTitle: 'IoT Smart Weather Station Simulation',
    status: 'awaiting',
    requiresStudentInput: true,
    quote: '“Assignment Hub: We have reviewed your initial schematic. Could you please confirm if Python 3.11 is mandatory or if 3.10 is acceptable for the test scripts?”',
    messagesCount: 4,
    updatedAt: 'Updated 45m ago',
    category: 'Technical Specification',
    coordinator: 'Eng. Vikram Rao (Technical Mentor)',
    createdAt: '25 Sep 2026, 03:15 PM',
    lastActivity: '26 Sep 2026, 01:10 PM',
    keywords: 'Clarification on Dataset Chart Requirements #REQ-1018 IoT Smart Weather Station Simulation Python 3.11 3.10',
    thread: [
      {
        id: 'msg-101',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '25 Sep 2026 • 03:15 PM',
        text: 'Attached the circuit simulator guidelines from university portal for IoT Smart Weather Station.'
      },
      {
        id: 'msg-102',
        sender: 'coordinator',
        senderName: 'Eng. Vikram Rao',
        badge: 'Technical Mentor',
        time: '25 Sep 2026 • 04:30 PM',
        text: 'Thanks Aditya. The schematics and sensor arrays look good. Are you running the visualization script on Linux or Windows host?'
      },
      {
        id: 'msg-103',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '26 Sep 2026 • 09:20 AM',
        text: 'We are demonstrating it on a Windows laptop with VS Code.'
      },
      {
        id: 'msg-104',
        sender: 'coordinator',
        senderName: 'Eng. Vikram Rao',
        badge: 'Technical Mentor',
        time: '26 Sep 2026 • 01:10 PM',
        text: 'Understood. We have reviewed your initial schematic. Could you please confirm if Python 3.11 is mandatory or if 3.10 is acceptable for the test scripts?'
      }
    ]
  },
  {
    id: 'REQ-1028',
    title: 'Citation Format: APA 7th vs IEEE for Project Report',
    requestNumber: '#REQ-1028',
    requestTitle: 'Data Structures & Algorithms Lab File',
    status: 'open',
    quote: '“The department handbook mentions APA 7th for literature reviews but IEEE for code citations. Should the final bibliography combine both?”',
    messagesCount: 1,
    updatedAt: 'Updated 4h ago',
    category: 'Formatting Guidelines',
    coordinator: 'Prof. Ananya Sen (Review Coordinator)',
    createdAt: '26 Sep 2026, 08:30 AM',
    lastActivity: '26 Sep 2026, 08:30 AM',
    keywords: 'Citation Format APA 7th vs IEEE Project Report #REQ-1028 Data Structures Algorithms Lab File bibliography',
    thread: [
      {
        id: 'msg-201',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '26 Sep 2026 • 08:30 AM',
        text: 'The department handbook mentions APA 7th for literature reviews but IEEE for code citations. Should the final bibliography combine both?'
      }
    ]
  },
  {
    id: 'REQ-1009',
    title: 'Request for Additional Appendix in Physics Record',
    requestNumber: '#REQ-1009',
    requestTitle: 'Physics Practical Lab File',
    status: 'resolved',
    quote: '“Assignment Hub: The additional observation table has been appended to Section 4. Deliverable updated on your My Requests page.”',
    messagesCount: 3,
    updatedAt: 'Resolved on 25 Sep 2026',
    category: 'Revision & Addendum',
    coordinator: 'Dr. Mukherjee (Physics Specialist)',
    createdAt: '24 Sep 2026, 11:00 AM',
    lastActivity: '25 Sep 2026, 04:45 PM',
    keywords: 'Request for Additional Appendix Physics Record #REQ-1009 Physics Practical Lab File observation table Section 4',
    thread: [
      {
        id: 'msg-301',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '24 Sep 2026 • 11:00 AM',
        text: 'Could you please include the second observation table for error analysis in Experiment 4?'
      },
      {
        id: 'msg-302',
        sender: 'coordinator',
        senderName: 'Dr. Mukherjee',
        badge: 'Physics Specialist',
        time: '24 Sep 2026 • 02:15 PM',
        text: 'Certainly! We are generating the residual error curve and adding the second table into Section 4.'
      },
      {
        id: 'msg-303',
        sender: 'coordinator',
        senderName: 'Dr. Mukherjee',
        badge: 'Physics Specialist',
        time: '25 Sep 2026 • 04:45 PM',
        text: 'The additional observation table has been appended to Section 4. Deliverable updated on your My Requests page.'
      }
    ]
  },
  {
    id: 'GEN-1001',
    title: 'General Question on Presentation Speaker Notes',
    requestNumber: 'General Inquiry',
    requestTitle: 'No Request Linked',
    status: 'resolved',
    quote: '“Student: Thank you, the speaker notes format provided matches university guidelines perfectly!”',
    messagesCount: 2,
    updatedAt: 'Resolved on 22 Sep 2026',
    category: 'General Question',
    coordinator: 'Academic Advising Desk',
    createdAt: '22 Sep 2026, 09:10 AM',
    lastActivity: '22 Sep 2026, 02:30 PM',
    keywords: 'General Question Presentation Speaker Notes General Inquiry No Request Linked university guidelines',
    thread: [
      {
        id: 'msg-401',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '22 Sep 2026 • 09:10 AM',
        text: 'What format do your specialists follow for speaker notes in presentation decks?'
      },
      {
        id: 'msg-402',
        sender: 'coordinator',
        senderName: 'Academic Advising Desk',
        badge: 'Advising Lead',
        time: '22 Sep 2026 • 10:15 AM',
        text: 'We provide structured 3-part presenter cues: 1. Hook/Intro, 2. Key Data Point Explanation, 3. Anticipated Viva/Audience Question with sample answer.'
      },
      {
        id: 'msg-403',
        sender: 'student',
        senderName: 'Aditya K. (You)',
        badge: 'Student',
        time: '22 Sep 2026 • 02:30 PM',
        text: 'Thank you, the speaker notes format provided matches university guidelines perfectly!'
      }
    ]
  }
];

export function InquiriesPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [currentFilter, setCurrentFilter] = useState('all'); // all | open | awaiting | resolved
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest'); // latest | oldest

  // Handle open inquiry passed via navigation state (e.g. from notification bell on other pages)
  useEffect(() => {
    if (location.state?.openInquiryId) {
      const match = inquiries.find(i => i.id === location.state.openInquiryId);
      if (match) {
        setSelectedInquiry(match);
        setDrawerMobileTab('chat');
      }
    }
  }, [location.state?.openInquiryId, inquiries]);

  // Modals & Panels
  const [newInquiryModalOpen, setNewInquiryModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [drawerMobileTab, setDrawerMobileTab] = useState('chat'); // 'chat' | 'details'
  const [replyText, setReplyText] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // New inquiry form state
  const [formSubject, setFormSubject] = useState('');
  const [formRequest, setFormRequest] = useState('');
  const [formCategory, setFormCategory] = useState('Request Question');
  const [formMessage, setFormMessage] = useState('');
  const [formAttachment, setFormAttachment] = useState('syllabus_clause_revision.pdf (1.2 MB)');

  const userDropdownRef = useRef(null);
  const threadEndRef = useRef(null);

  // Auto scroll in conversation drawer
  useEffect(() => {
    if (selectedInquiry && threadEndRef.current && drawerMobileTab === 'chat') {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedInquiry, selectedInquiry?.thread, drawerMobileTab]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute stat counts
  const statCounts = useMemo(() => {
    const total = inquiries.length;
    const open = inquiries.filter(i => i.status === 'open').length;
    const awaiting = inquiries.filter(i => i.status === 'awaiting').length;
    const resolved = inquiries.filter(i => i.status === 'resolved').length;
    return { total, open, awaiting, resolved };
  }, [inquiries]);

  // Filtered and sorted inquiries
  const filteredInquiries = useMemo(() => {
    let result = inquiries.filter(inq => {
      const matchesFilter = (currentFilter === 'all') || (inq.status === currentFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || inq.title.toLowerCase().includes(q) ||
        inq.requestNumber.toLowerCase().includes(q) ||
        inq.requestTitle.toLowerCase().includes(q) ||
        inq.keywords?.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });

    if (sortOrder === 'oldest') {
      return [...result].reverse();
    }
    return result;
  }, [inquiries, currentFilter, searchQuery, sortOrder]);

  // Handle send reply in conversation drawer
  const handleSendReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedInquiry) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      senderName: `${user?.name || 'Aditya K.'} (You)`,
      badge: 'Student',
      time: 'Just now',
      text
    };

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return {
          ...inq,
          status: inq.status === 'awaiting' ? 'open' : inq.status,
          messagesCount: inq.messagesCount + 1,
          updatedAt: 'Updated just now',
          thread: [...inq.thread, newMsg]
        };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    const updatedCurrent = updatedInquiries.find(i => i.id === selectedInquiry.id);
    setSelectedInquiry(updatedCurrent);
    setReplyText('');
    showToast('Reply sent to academic coordinator', 'success');
  };

  // Toggle resolve status
  const handleToggleResolve = () => {
    if (!selectedInquiry) return;
    const isNowResolved = selectedInquiry.status !== 'resolved';
    const newStatus = isNowResolved ? 'resolved' : 'open';

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return {
          ...inq,
          status: newStatus,
          updatedAt: isNowResolved ? 'Resolved just now' : 'Reopened just now'
        };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: isNowResolved ? 'Resolved just now' : 'Reopened just now'
    }));

    showToast(
      isNowResolved ? 'Inquiry marked as resolved' : 'Inquiry reopened for discussion',
      'info'
    );
  };

  // Handle new inquiry submission
  const handleSubmitNewInquiry = (e) => {
    e.preventDefault();
    if (!formSubject.trim() || !formMessage.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const newInquiry = {
      id: `INQ-${Date.now().toString().slice(-4)}`,
      title: formSubject,
      requestNumber: formRequest || 'General Inquiry',
      requestTitle: formRequest ? 'Linked Academic Request' : 'No Request Linked',
      status: 'open',
      quote: `“${formMessage}”`,
      messagesCount: 1,
      updatedAt: 'Updated just now',
      category: formCategory,
      coordinator: 'Assignment Hub Academic Coordinator',
      createdAt: 'Just now',
      lastActivity: 'Just now',
      keywords: `${formSubject} ${formRequest} ${formCategory} ${formMessage}`,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'student',
          senderName: `${user?.name || 'Aditya K.'} (You)`,
          badge: 'Student',
          time: 'Just now',
          text: formMessage,
          attachment: formAttachment ? { name: formAttachment, size: 'Uploaded file' } : null
        }
      ]
    };

    setInquiries([newInquiry, ...inquiries]);
    setNewInquiryModalOpen(false);
    setFormSubject('');
    setFormRequest('');
    setFormMessage('');
    showToast('Your inquiry has been submitted! Our academic mentor team will get back to you shortly.', 'success');
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed flex flex-col relative">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (Fixed Claymorphic & Mobile-Optimized)
      ────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-40 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/50">
        <div className="h-16 sm:h-20 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Workspace Pill */}
          <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3.5 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-primary/20 clay-card shrink-0">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-[22px] text-on-surface tracking-tight">
                Assignment<span className="text-primary">Hub</span>
              </span>
              <span className="hidden md:inline-block px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs uppercase tracking-wider font-bold">
                Student Workspace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container-low shadow-[inset_1px_1px_2px_rgba(37,35,58,0.04)]">
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              Services
            </Link>
            <Link
              to="/my-requests"
              className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              My Requests
            </Link>
            <Link
              to="/inquiries"
              className="px-5 py-2 rounded-full text-sm font-bold bg-surface-container-highest text-primary shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(108,99,255,0.12)] transition-all"
            >
              Inquiries
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* New Request Button */}
            <Link
              to="/request-assignment"
              className="hidden sm:flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-[6px_10px_20px_rgba(108,99,255,0.35)] hover:bg-primary-container hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Request</span>
            </Link>

            {/* ── Notification Bell with Claymorphic Popup Dropdown ── */}
            <NotificationBell
              onSelectInquiry={(inqId) => {
                const match = inquiries.find(i => i.id === inqId);
                if (match) {
                  setSelectedInquiry(match);
                  setDrawerMobileTab('chat');
                }
              }}
            />

            {/* Profile Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <div
                onClick={() => setUserDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pr-3 rounded-full bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white text-[11px] sm:text-xs font-bold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AK'}
                </div>
                <span className="hidden md:inline text-xs sm:text-sm font-semibold text-on-surface">
                  {user?.name || 'Aditya K.'}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] sm:text-[18px]">expand_more</span>
              </div>

              {userDropdownOpen && (
                <div className="absolute right-0 top-11 sm:top-12 w-48 rounded-2xl bg-surface-container-lowest shadow-[12px_16px_32px_rgba(37,35,58,0.15)] p-2 z-50 border border-surface-container">
                  <div className="px-3 py-2 border-b border-surface-container">
                    <p className="text-xs font-bold text-on-surface">{user?.name || 'Aditya K.'}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{user?.email || 'aditya@student.edu'}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    to="/my-requests"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    My Requests
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-error-container/30 rounded-xl transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Responsive Margins & Paddings)
      ────────────────────────────────────────────────────────────── */}
      <main className="w-full pt-20 sm:pt-28 pb-24 lg:pb-16 px-3.5 sm:px-8 lg:px-12 max-w-7xl mx-auto flex-1 flex flex-col gap-6 sm:gap-10">
        {/* 1. PAGE HEADER */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-1 sm:pb-2">
          <div className="flex flex-col gap-1.5 sm:gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(77,65,223,0.08)]">
              <span className="text-[13px] sm:text-[14px]">💬</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-primary font-bold">
                Academic Support &amp; Clarification
              </span>
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight">
              Inquiries
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant leading-relaxed">
              Get help with your requests, services, and academic work directly from mentors &amp; coordinators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              type="button"
              id="btn-open-demo"
              onClick={() => {
                setSelectedInquiry(inquiries[0]);
                setDrawerMobileTab('chat');
              }}
              className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-surface-container-lowest text-primary text-xs sm:text-sm font-bold shadow-[8px_12px_24px_rgba(108,99,255,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)] hover:shadow-[12px_18px_30px_rgba(108,99,255,0.18)] hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-primary transition-transform group-hover:scale-110">
                chat
              </span>
              <span>Quick Demo: Open Conversation</span>
            </button>
            <button
              type="button"
              id="btn-open-modal"
              onClick={() => setNewInquiryModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-[6px_10px_20px_rgba(108,99,255,0.35)] hover:bg-primary-container hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add</span>
              <span>New Inquiry</span>
            </button>
          </div>
        </section>

        {/* 2. QUICK METRIC STAT CARDS (2x2 Grid on Mobile, 4 Cols on Desktop) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {/* Total Inquiries */}
          <div
            onClick={() => setCurrentFilter('all')}
            className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[8px_12px_24px_rgba(108,99,255,0.06),-6px_-6px_18px_rgba(255,255,255,0.9)] flex items-center justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all cursor-pointer ${
              currentFilter === 'all' ? 'ring-2 ring-primary/40' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5 sm:gap-1 z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                Total Inquiries
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{statCounts.total}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
                Active conversations
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(77,65,223,0.1)] shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">forum</span>
            </div>
          </div>

          {/* Open */}
          <div
            onClick={() => setCurrentFilter('open')}
            className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[8px_12px_24px_rgba(108,99,255,0.06),-6px_-6px_18px_rgba(255,255,255,0.9)] flex items-center justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all cursor-pointer ${
              currentFilter === 'open' ? 'ring-2 ring-tertiary-fixed-dim/60' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5 sm:gap-1 z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-tertiary font-bold">Open</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{statCounts.open}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
                Waiting coordinator
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(160,105,0,0.15)] shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">hourglass_top</span>
            </div>
          </div>

          {/* Awaiting Reply */}
          <div
            onClick={() => setCurrentFilter('awaiting')}
            className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[8px_12px_24px_rgba(108,99,255,0.06),-6px_-6px_18px_rgba(255,255,255,0.9)] flex items-center justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all cursor-pointer ${
              currentFilter === 'awaiting' ? 'ring-2 ring-primary/40' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5 sm:gap-1 z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-primary font-bold">
                Awaiting Reply
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">{statCounts.awaiting}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
                Your input needed
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(77,65,223,0.15)] shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">notifications_active</span>
            </div>
          </div>

          {/* Resolved */}
          <div
            onClick={() => setCurrentFilter('resolved')}
            className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[8px_12px_24px_rgba(108,99,255,0.06),-6px_-6px_18px_rgba(255,255,255,0.9)] flex items-center justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all cursor-pointer ${
              currentFilter === 'resolved' ? 'ring-2 ring-outline/40' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5 sm:gap-1 z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                Resolved
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{statCounts.resolved}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
                Completed &amp; closed
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(77,65,223,0.08)] shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">check_circle</span>
            </div>
          </div>
        </section>

        {/* 3. STATUS FILTERS & SEARCH + SORT BAR */}
        <section className="flex flex-col gap-3 sm:gap-4">
          {/* Scrollable Tabs */}
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-surface-container-low max-w-fit shadow-[inset_2px_2px_4px_rgba(37,35,58,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <button
                type="button"
                onClick={() => setCurrentFilter('all')}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  currentFilter === 'all'
                    ? 'text-primary bg-surface-container-lowest shadow-[4px_6px_14px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All ({statCounts.total})
              </button>
              <button
                type="button"
                onClick={() => setCurrentFilter('open')}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  currentFilter === 'open'
                    ? 'text-primary bg-surface-container-lowest shadow-[4px_6px_14px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Open ({statCounts.open})
              </button>
              <button
                type="button"
                onClick={() => setCurrentFilter('awaiting')}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  currentFilter === 'awaiting'
                    ? 'text-primary bg-surface-container-lowest shadow-[4px_6px_14px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Awaiting Reply ({statCounts.awaiting})
              </button>
              <button
                type="button"
                onClick={() => setCurrentFilter('resolved')}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  currentFilter === 'resolved'
                    ? 'text-primary bg-surface-container-lowest shadow-[4px_6px_14px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Resolved ({statCounts.resolved})
              </button>
            </div>
          </div>

          {/* Search & Sort Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-xl">
              <span className="material-symbols-outlined absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] sm:text-[20px]">
                search
              </span>
              <input
                type="text"
                id="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by subject, request ID or keyword..."
                className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-xs sm:text-sm shadow-[inset_3px_3px_6px_rgba(37,35,58,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:outline-none focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 justify-between md:justify-end">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant">Sort:</span>
                <div className="relative">
                  <select
                    id="sort-select"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="appearance-none pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-full bg-surface-container-lowest text-on-surface text-[11px] sm:text-xs font-bold shadow-[4px_6px_12px_rgba(108,99,255,0.08),inset_1px_1px_2px_rgba(255,255,255,0.9)] focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] sm:text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] sm:text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>
                  {filteredInquiries.length} conversation{filteredInquiries.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. INQUIRY CARDS CONTAINER */}
        <section className="flex flex-col gap-3.5 sm:gap-5" id="inquiry-list">
          {filteredInquiries.length === 0 ? (
            /* Empty State */
            <div
              id="empty-state"
              className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[12px_16px_32px_rgba(108,99,255,0.06)] flex flex-col items-center justify-center text-center gap-3 sm:gap-4"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(77,65,223,0.1)]">
                <span className="material-symbols-outlined text-[24px] sm:text-[32px]">drafts</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-on-surface">No Inquiries Found</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
                There are no conversations matching your selected filter or search terms.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCurrentFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-[4px_6px_14px_rgba(108,99,255,0.3)] hover:bg-primary-container transition-all"
              >
                Show All Inquiries
              </button>
            </div>
          ) : (
            filteredInquiries.map(inq => (
              <article
                key={inq.id}
                className={`inquiry-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[12px_16px_32px_rgba(108,99,255,0.08),-8px_-8px_24px_rgba(255,255,255,0.95)] hover:shadow-[18px_24px_40px_rgba(108,99,255,0.13)] transition-all flex flex-col gap-3.5 sm:gap-5 relative group ${
                  inq.status === 'resolved' ? 'opacity-90 hover:opacity-100' : ''
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(77,65,223,0.12)] ${
                        inq.status === 'awaiting'
                          ? 'bg-primary-fixed text-primary'
                          : inq.status === 'open'
                          ? inq.id === 'REQ-1028'
                            ? 'bg-secondary-fixed text-secondary'
                            : 'bg-surface-variant text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                        {inq.status === 'awaiting'
                          ? 'notifications'
                          : inq.status === 'resolved'
                          ? 'task_alt'
                          : inq.id === 'REQ-1028'
                          ? 'help'
                          : 'chat_bubble'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setDrawerMobileTab('chat');
                          }}
                          className="font-bold text-base sm:text-lg sm:text-xl text-on-surface tracking-tight group-hover:text-primary transition-colors cursor-pointer leading-tight"
                        >
                          {inq.title}
                        </h2>
                        {inq.requiresStudentInput && inq.status === 'awaiting' && (
                          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] sm:text-[11px] font-bold animate-pulse whitespace-nowrap">
                            ⚡ Requires student input
                          </span>
                        )}
                      </div>

                      {inq.requestNumber !== 'General Inquiry' ? (
                        <Link
                          to="/my-requests"
                          className="text-[11px] sm:text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span className="truncate">Regarding: {inq.requestNumber} — {inq.requestTitle}</span>
                          <span className="material-symbols-outlined text-[12px] sm:text-[14px] shrink-0">arrow_outward</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span>General Inquiry (No Request Linked)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-center shrink-0">
                    {inq.status === 'open' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] sm:text-xs font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(160,105,0,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span>Open</span>
                      </span>
                    )}
                    {inq.status === 'awaiting' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] sm:text-xs font-bold shadow-[4px_6px_12px_rgba(113,97,227,0.25)]">
                        <span className="w-2 h-2 rounded-full bg-surface-bright"></span>
                        <span>Awaiting Your Reply</span>
                      </span>
                    )}
                    {inq.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-surface-container-high text-on-surface text-[11px] sm:text-xs font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px]">check</span>
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quote Box */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface-variant text-xs sm:text-sm shadow-[inset_2px_2px_5px_rgba(37,35,58,0.04),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] italic leading-relaxed">
                  {inq.quote}
                </div>

                {/* Footer Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-on-surface-variant text-[11px] sm:text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] sm:text-[16px]">forum</span>
                      {inq.messagesCount} {inq.messagesCount === 1 ? 'Message' : 'Messages'}
                    </span>
                    <span>•</span>
                    <span
                      className={`flex items-center gap-1 ${
                        inq.status === 'awaiting' ? 'text-primary font-bold' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                        {inq.status === 'resolved' ? 'done_all' : 'schedule'}
                      </span>
                      {inq.updatedAt}
                    </span>
                  </div>

                  {inq.status === 'awaiting' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setDrawerMobileTab('chat');
                      }}
                      className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-[4px_6px_14px_rgba(108,99,255,0.3)] hover:bg-primary-container transition-all flex items-center gap-1.5"
                    >
                      <span>Reply Now</span>
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px]">reply</span>
                    </button>
                  ) : inq.status === 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setDrawerMobileTab('chat');
                      }}
                      className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-all flex items-center gap-1.5"
                    >
                      <span>View Archive</span>
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px]">history</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setDrawerMobileTab('chat');
                      }}
                      className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-surface-container-high text-primary text-xs font-bold shadow-[4px_6px_14px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)] hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <span>View Inquiry</span>
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        {/* 5. ACADEMIC INTEGRITY & STRICT HONOR CODE GUARANTEE BANNER */}
        <section className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-low shadow-[12px_16px_32px_rgba(108,99,255,0.06),-8px_-8px_24px_rgba(255,255,255,0.9)] flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl bg-primary text-white flex items-center justify-center shadow-[6px_10px_20px_rgba(108,99,255,0.3)]">
            <span className="material-symbols-outlined text-[24px] sm:text-[30px]">verified_user</span>
          </div>
          <div className="flex flex-col gap-1 text-center md:text-left flex-1">
            <h4 className="font-bold text-base sm:text-lg text-on-surface">
              Academic Integrity &amp; Strict Honor Code Guarantee
            </h4>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              All discussions, files, and queries exchanged with Assignment Hub subject coordinators remain strictly
              encrypted, private, and bound by institutional academic integrity benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-surface-container-lowest text-primary text-[11px] sm:text-xs font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)] shrink-0">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">lock</span>
            <span>End-to-End Private</span>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. NEW INQUIRY MODAL DIALOG (Mobile-Safe Bottom Sheet)
      ────────────────────────────────────────────────────────────── */}
      {newInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-inverse-surface/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-[24px_32px_60px_rgba(37,35,58,0.25),-12px_-12px_32px_rgba(255,255,255,0.9)] flex flex-col gap-5 sm:gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-none">
              <div>
                <h2 className="font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">New Inquiry</h2>
                <p className="text-xs text-on-surface-variant">
                  Tell us what you need help with. A coordinator will review within 2 hours.
                </p>
              </div>
              <button
                type="button"
                id="modal-close"
                onClick={() => setNewInquiryModalOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNewInquiry} className="flex flex-col gap-4 sm:gap-5">
              {/* Field 1: Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface" htmlFor="inquiry-subject">
                  Subject *
                </label>
                <input
                  type="text"
                  id="inquiry-subject"
                  required
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="Enter inquiry subject (e.g. Deadline question, revision query)"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-xs sm:text-sm shadow-[inset_3px_3px_6px_rgba(37,35,58,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:outline-none focus:bg-surface-container-lowest"
                />
              </div>

              {/* Field 2 & 3: Related Request & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="inquiry-request">
                    Related Request
                  </label>
                  <div className="relative">
                    <select
                      id="inquiry-request"
                      value={formRequest}
                      onChange={e => setFormRequest(e.target.value)}
                      className="w-full appearance-none pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface text-xs sm:text-sm shadow-[inset_3px_3px_6px_rgba(37,35,58,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:outline-none focus:bg-surface-container-lowest cursor-pointer"
                    >
                      <option value="">Select a request (Optional)</option>
                      <option value="#REQ-1024">#REQ-1024 — Engineering Mathematics</option>
                      <option value="#REQ-1028">#REQ-1028 — DSA Lab File</option>
                      <option value="#REQ-1018">#REQ-1018 — IoT Weather Simulation</option>
                      <option value="none">No Related Request (General Question)</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] sm:text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="inquiry-category">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="inquiry-category"
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full appearance-none pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface text-xs sm:text-sm shadow-[inset_3px_3px_6px_rgba(37,35,58,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:outline-none focus:bg-surface-container-lowest cursor-pointer"
                    >
                      <option value="Request Question">Request Question</option>
                      <option value="Service Question">Service Question</option>
                      <option value="Delivery Question">Delivery Question</option>
                      <option value="Revision Question">Revision Question</option>
                      <option value="General Question">General Question</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] sm:text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Field 4: Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface" htmlFor="inquiry-message">
                  Message *
                </label>
                <textarea
                  id="inquiry-message"
                  required
                  rows={3}
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-xs sm:text-sm shadow-[inset_3px_3px_6px_rgba(37,35,58,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:outline-none focus:bg-surface-container-lowest"
                />
              </div>

              {/* Field 5: Attachment Dropzone */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-on-surface">Attachments (Optional)</span>
                <label className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-container-low/70 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:bg-surface-container transition-colors shadow-[inset_2px_2px_4px_rgba(37,35,58,0.04)]">
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setFormAttachment(`${e.target.files[0].name} (${(e.target.files[0].size / 1024 / 1024).toFixed(1)} MB)`);
                      }
                    }}
                  />
                  <span className="material-symbols-outlined text-[24px] sm:text-[28px] text-primary">cloud_upload</span>
                  <span className="text-[11px] sm:text-xs font-bold text-primary">+ Add Attachment (PDF, DOCX, PNG up to 25MB)</span>
                  <span className="text-[10px] sm:text-[11px] text-on-surface-variant">Drop relevant syllabi, project sheets, or screenshots</span>
                </label>

                {formAttachment && (
                  <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">description</span>
                      <span className="font-semibold text-xs truncate">{formAttachment}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormAttachment('')}
                      className="text-on-surface-variant hover:text-error transition-colors flex items-center shrink-0 ml-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  id="modal-cancel"
                  onClick={() => setNewInquiryModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant text-xs sm:text-sm font-bold hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-[6px_10px_20px_rgba(108,99,255,0.35)] hover:bg-primary-container transition-all"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. INQUIRY CONVERSATION DETAIL SLIDE-OUT DRAWER (Mobile Tabs)
      ────────────────────────────────────────────────────────────── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="w-full lg:max-w-4xl bg-surface h-full shadow-[-20px_0_40px_rgba(37,35,58,0.2)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Top Bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-container-low flex items-center justify-between gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  id="detail-back"
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 sm:p-2 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-[2px_4px_8px_rgba(108,99,255,0.08)] shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">arrow_back</span>
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-lg text-on-surface truncate max-w-[200px] sm:max-w-md">
                      {selectedInquiry.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${
                        selectedInquiry.status === 'open'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : selectedInquiry.status === 'awaiting'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      ● {selectedInquiry.status === 'awaiting' ? 'Awaiting Reply' : selectedInquiry.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-primary truncate">
                    {selectedInquiry.requestNumber} — {selectedInquiry.requestTitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="detail-close-btn"
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface shrink-0"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
              </button>
            </div>

            {/* Mobile Tab Bar (Visible on mobile/tablet < lg) */}
            <div className="flex lg:hidden items-center justify-center gap-2 p-2 bg-surface-container-low border-b border-surface-container shrink-0">
              <button
                type="button"
                onClick={() => setDrawerMobileTab('chat')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  drawerMobileTab === 'chat'
                    ? 'bg-primary text-white shadow-[2px_4px_8px_rgba(108,99,255,0.25)]'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">forum</span>
                <span>Chat ({selectedInquiry.thread?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerMobileTab('details')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  drawerMobileTab === 'details'
                    ? 'bg-primary text-white shadow-[2px_4px_8px_rgba(108,99,255,0.25)]'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Details &amp; Status</span>
              </button>
            </div>

            {/* Main Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Support Conversation Feed (Left 8 cols) */}
              <div
                className={`lg:col-span-8 flex flex-col h-full overflow-hidden ${
                  drawerMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                {/* Scrollable message thread */}
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 overflow-y-auto lg:bg-surface-container-lowest/30">
                  {/* Notice Banner */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-surface-container-high flex items-start sm:items-center gap-2.5 sm:gap-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                    <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px] shrink-0 mt-0.5 sm:mt-0">info</span>
                    <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-snug">
                      ⚡ Inquiry assigned to coordinator <span className="font-bold text-on-surface">{selectedInquiry.coordinator}</span>.
                    </p>
                  </div>

                  {/* Messages Thread */}
                  {selectedInquiry.thread?.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1.5 sm:gap-2 ${
                        msg.sender === 'coordinator' ? 'ml-3 sm:ml-8' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs ${
                              msg.sender === 'coordinator'
                                ? 'bg-secondary text-white'
                                : 'bg-primary text-white'
                            }`}
                          >
                            {msg.sender === 'coordinator' ? 'DB' : 'AK'}
                          </div>
                          <span className="text-xs font-bold text-on-surface">{msg.senderName}</span>
                          {msg.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${
                                msg.sender === 'coordinator'
                                  ? 'bg-primary-fixed text-on-primary-fixed'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              {msg.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-on-surface-variant">{msg.time}</span>
                      </div>

                      <div
                        className={`p-3.5 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.sender === 'coordinator'
                            ? 'bg-surface-container-lowest text-on-surface shadow-[6px_10px_20px_rgba(108,99,255,0.08),inset_1px_1px_2px_rgba(255,255,255,0.9)] flex flex-col gap-2'
                            : 'bg-surface-container-low text-on-surface shadow-[4px_6px_16px_rgba(108,99,255,0.06),inset_1px_1px_2px_rgba(255,255,255,0.9)] flex flex-col gap-2'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.attachment && (
                          <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-surface-container-lowest w-fit shadow-[2px_3px_8px_rgba(0,0,0,0.04)] text-on-surface text-[11px] sm:text-xs font-semibold">
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">attach_file</span>
                            <span>
                              {msg.attachment.name} ({msg.attachment.size})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={threadEndRef} />
                </div>

                {/* Sticky Message Composer */}
                <div className="p-3 sm:p-4 bg-surface border-t border-surface-container shrink-0">
                  <form
                    onSubmit={handleSendReply}
                    className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-surface-container-lowest shadow-[8px_12px_28px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.95)] flex items-center gap-1.5 sm:gap-2"
                  >
                    <label
                      aria-label="Add file"
                      className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                    >
                      <input type="file" className="hidden" onChange={() => showToast('File attached', 'info')} />
                      <span className="material-symbols-outlined text-[20px] sm:text-[22px]">attach_file</span>
                    </label>
                    <input
                      type="text"
                      id="reply-text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply or question..."
                      className="flex-1 min-w-0 bg-transparent px-2 py-1 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary text-white text-xs font-bold shadow-[4px_6px_12px_rgba(108,99,255,0.3)] hover:bg-primary-container transition-all shrink-0"
                    >
                      <span>Send</span>
                      <span className="material-symbols-outlined text-[16px] sm:text-[18px]">send</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Inquiry Details Sidebar (Right 4 cols) */}
              <aside
                className={`lg:col-span-4 p-4 sm:p-6 md:p-8 bg-surface-container-low/60 flex flex-col gap-5 sm:gap-6 border-t lg:border-t-0 lg:border-l border-surface-container overflow-y-auto ${
                  drawerMobileTab === 'details' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                <h4 className="font-bold text-sm sm:text-base text-on-surface">Inquiry Details</h4>

                <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest shadow-[6px_8px_18px_rgba(108,99,255,0.05)] flex flex-col gap-3.5 sm:gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedInquiry.status === 'open'
                            ? 'bg-tertiary'
                            : selectedInquiry.status === 'awaiting'
                            ? 'bg-primary animate-pulse'
                            : 'bg-outline'
                        }`}
                      ></span>
                      <span className="text-xs font-bold text-on-surface">
                        {selectedInquiry.status === 'open'
                          ? 'Open — In Discussion'
                          : selectedInquiry.status === 'awaiting'
                          ? 'Awaiting Your Input'
                          : 'Resolved & Archived'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Category
                    </span>
                    <span className="text-xs text-on-surface font-medium">{selectedInquiry.category}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Related Request
                    </span>
                    {selectedInquiry.requestNumber !== 'General Inquiry' ? (
                      <Link
                        to="/my-requests"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{selectedInquiry.requestNumber} (View Order)</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-on-surface font-medium">None (General Inquiry)</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Assigned Coordinator
                    </span>
                    <span className="text-xs text-on-surface font-medium">{selectedInquiry.coordinator}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Timestamps
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Created: {selectedInquiry.createdAt}</span>
                    <span className="text-[11px] text-on-surface-variant">Last activity: {selectedInquiry.lastActivity}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    id="resolve-toggle-btn"
                    onClick={handleToggleResolve}
                    className={`w-full py-2.5 sm:py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[2px_4px_10px_rgba(0,0,0,0.03)] ${
                      selectedInquiry.status === 'resolved'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {selectedInquiry.status === 'resolved' ? 'refresh' : 'check_circle'}
                    </span>
                    <span>{selectedInquiry.status === 'resolved' ? 'Reopen Inquiry' : 'Mark as Resolved'}</span>
                  </button>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant text-center">
                    Closing an inquiry automatically stores it in your resolved archive.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-surface-container-low py-8 sm:py-10 mt-auto border-t border-surface-container">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs sm:text-sm font-bold text-on-surface">Assignment Hub © 2026.</p>
            <p className="text-[11px] sm:text-xs text-on-surface-variant">You give us your work — we take care of the rest.</p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/about" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Contact
            </Link>
            <Link to="/support" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Support
            </Link>
            <Link to="/privacy-policy" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          6. MOBILE BOTTOM NAVIGATION (Visible only on mobile/tablet)
      ────────────────────────────────────────────────────────────── */}
      <MobileBottomNav activeTab="inquiries" />
    </div>
  );
}

export default InquiriesPage;
