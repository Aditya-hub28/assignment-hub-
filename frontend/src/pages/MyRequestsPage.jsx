import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Default mock request data matching the Stitch design
const INITIAL_REQUESTS = [
  {
    id: 'REQ-1024',
    service: 'Assignment Writing',
    icon: 'description',
    title: 'Engineering Mathematics Assignment',
    desc: 'Multi-variable calculus sets, Laplace transformations, and step-by-step verified proofs.',
    detailedDesc: "Solve problem sets 1 through 8 from Prof. Henderson's Advanced Calculus syllabus. Ensure every step has inline geometric explanations and proper LaTeX formatted formulas.",
    status: 'in-progress',
    statusLabel: 'In Progress',
    statusBg: 'bg-secondary-fixed text-on-secondary-fixed',
    date: '2026-09-24',
    submittedDate: '24 Sep 2026',
    submittedTime: '24 Sep 2026, 10:14 AM',
    deadline: '2026-09-27',
    dueDate: '27 Sep 2026',
    progress: 70,
    allocated: 'Dr. Banerjee',
    subject: 'Engineering Mathematics',
    wordCount: '12 Pages',
    referencing: 'IEEE Format',
    software: 'MATLAB / Sympy',
    canCancel: false,
    uploadedFiles: [
      { name: 'assignment_questions.pdf', size: '2.4 MB', date: '24 Sep' },
      { name: 'reference_material.pdf', size: '1.8 MB', date: '24 Sep' }
    ],
    timeline: [
      { step: 1, title: 'Request Submitted', desc: '24 Sep 2026, 10:14 AM — Brief & instructions uploaded', state: 'completed' },
      { step: 2, title: 'Mentor Assigned & Verified', desc: '24 Sep 2026, 01:30 PM — Dr. Banerjee accepted task', state: 'completed' },
      { step: 3, title: 'Drafting & Proofing in Progress (70%)', desc: 'Currently finalizing Section 4 Laplace Transform derivations.', state: 'current' },
      { step: 4, title: 'Final Quality Check & Delivery', desc: 'Plagiarism check and complete solution file pack.', state: 'upcoming' }
    ]
  },
  {
    id: 'REQ-1028',
    service: 'Practical Files & Viva',
    icon: 'science',
    title: 'Data Structures & Algorithms Lab File',
    desc: '15 balanced binary search tree & graph traversal programs with manual dry-run traces.',
    detailedDesc: '15 lab experiments including AVL rotation algorithms, BFS/DFS traversal logs, and complete dry-run recursion trees formatted as an IEEE academic lab journal.',
    status: 'pending',
    statusLabel: 'Pending Review',
    statusBg: 'bg-tertiary-fixed-dim text-on-tertiary-fixed',
    date: '2026-09-26',
    submittedDate: '26 Sep 2026',
    submittedTime: '26 Sep 2026, 03:45 PM',
    deadline: '2026-09-30',
    dueDate: '30 Sep 2026',
    progress: 10,
    allocated: 'Matching in progress...',
    subject: 'Data Structures & Algorithms',
    wordCount: '25 Programs',
    referencing: 'Standard Lab Manual',
    software: 'C++ / GCC 11',
    canCancel: true,
    notice: 'Academic mentor matching is in progress. Estimate arrives in < 2 hrs.',
    subNotice: 'Awaiting price quote approval',
    uploadedFiles: [
      { name: 'lab_experiments_list.pdf', size: '1.2 MB', date: '26 Sep' }
    ],
    timeline: [
      { step: 1, title: 'Request Submitted', desc: '26 Sep 2026, 03:45 PM — Lab list & problem set uploaded', state: 'completed' },
      { step: 2, title: 'Mentor Review & Allocation', desc: 'Analyzing program complexity & assigning lab specialist', state: 'current' },
      { step: 3, title: 'Code Implementation & Dry Run', desc: 'Compiling source programs & step tracing', state: 'upcoming' },
      { step: 4, title: 'Printable Lab Journal PDF', desc: 'Final index & viva questions bundle generation', state: 'upcoming' }
    ]
  },
  {
    id: 'REQ-1018',
    service: 'Coding & Technical',
    icon: 'terminal',
    title: 'IoT Smart Weather Station Simulation',
    desc: 'ESP32 micro-controller code in C++ with MQTT telemetry dashboard configuration.',
    detailedDesc: 'Full ESP32 firmware in C++ with Wokwi simulator setup link, live MQTT broker telemetry dashboard, and complete 25-page project documentation.',
    status: 'completed',
    statusLabel: 'Completed',
    statusBg: 'bg-surface-container-high text-primary',
    date: '2026-09-18',
    submittedDate: '18 Sep 2026',
    submittedTime: '18 Sep 2026, 09:20 AM',
    deadline: '2026-09-22',
    dueDate: 'Delivered: 22 Sep 2026',
    progress: 100,
    allocated: 'Eng. Vikram Rao',
    subject: 'Internet of Things (IoT)',
    wordCount: '25-Page Report + C++',
    referencing: 'IEEE Sensors Standard',
    software: 'ESP-IDF / Wokwi / Node-RED',
    canCancel: false,
    deliverableInfo: 'Deliverable Ready (ZIP & PDF)',
    deliverableSize: '14.2 MB',
    rating: '5.0',
    deliveredFiles: {
      name: 'final_solution_bundle_req1018.zip',
      size: '14.2 MB',
      desc: 'Code, Schematic & 100% Plagiarism Report',
      turnitinScore: '0%'
    },
    uploadedFiles: [
      { name: 'weather_station_specs.pdf', size: '3.1 MB', date: '18 Sep' }
    ],
    timeline: [
      { step: 1, title: 'Request Submitted', desc: '18 Sep 2026, 09:20 AM — Requirements logged', state: 'completed' },
      { step: 2, title: 'Mentor Assigned', desc: '18 Sep 2026, 11:00 AM — Eng. Vikram Rao accepted', state: 'completed' },
      { step: 3, title: 'Code Simulation & Documentation', desc: '21 Sep 2026 — Firmware tested with zero build errors', state: 'completed' },
      { step: 4, title: 'Solution Ready & Verified', desc: '22 Sep 2026 — Verified deliverable bundle generated', state: 'completed' }
    ]
  },
  {
    id: 'REQ-1012',
    service: 'PPT & Presentation',
    icon: 'slideshow',
    title: 'Renewable Energy Seminar Slides',
    desc: '20-slide keynote deck on offshore wind turbine aerodynamics with speaker notes.',
    detailedDesc: '20-slide keynote deck covering modern horizontal-axis offshore wind turbines. Order was cancelled by student due to changed seminar guidelines.',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusBg: 'bg-surface-container text-on-surface-variant',
    date: '2026-09-12',
    submittedDate: '12 Sep 2026',
    submittedTime: '12 Sep 2026, 11:30 AM',
    deadline: '2026-09-16',
    dueDate: 'Cancelled: 13 Sep 2026',
    progress: 0,
    allocated: 'None',
    subject: 'Mechanical / Renewable Energy',
    wordCount: '20 Slides + Notes',
    referencing: 'APA Style',
    software: 'Microsoft PowerPoint / Keynote',
    canCancel: false,
    notice: 'Cancelled by student. Full token credit returned to balance.',
    subNotice: 'Refunded to Wallet',
    uploadedFiles: [
      { name: 'seminar_topic_guidelines.pdf', size: '850 KB', date: '12 Sep' }
    ],
    timeline: [
      { step: 1, title: 'Request Submitted', desc: '12 Sep 2026, 11:30 AM — Seminar brief uploaded', state: 'completed' },
      { step: 2, title: 'Order Cancelled by Student', desc: '13 Sep 2026, 02:15 PM — Refund credited back to wallet', state: 'cancelled' }
    ]
  }
];

export function MyRequestsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Requests state
  const [requestsList, setRequestsList] = useState(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Detail Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState('REQ-1024');

  // Modals state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guaranteeModalOpen, setGuaranteeModalOpen] = useState(false);

  // New Request Form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('Assignment Writing');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqFormat, setReqFormat] = useState('Digital PDF / Docs');
  const [reqNotes, setReqNotes] = useState('');

  // Profile Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editCollege, setEditCollege] = useState(user?.college || '');
  const [editCourse, setEditCourse] = useState(user?.course || '');

  // Derived user values
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';
  const email = user?.email || 'student@university.edu';

  // Find currently selected request for the drawer
  const activeRequest = useMemo(() => {
    return requestsList.find((r) => r.id === selectedReqId) || requestsList[0];
  }, [requestsList, selectedReqId]);

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    let result = requestsList.filter((r) => {
      const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const deadA = new Date(a.deadline).getTime();
      const deadB = new Date(b.deadline).getTime();

      if (sortBy === 'latest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'nearest') return deadA - deadB;
      if (sortBy === 'farthest') return deadB - deadA;
      return 0;
    });

    return result;
  }, [requestsList, activeFilter, searchQuery, sortBy]);

  // Counts for tabs & bento cards
  const stats = useMemo(() => {
    const total = requestsList.length;
    const inProgress = requestsList.filter((r) => r.status === 'in-progress').length;
    const pending = requestsList.filter((r) => r.status === 'pending').length;
    const completed = requestsList.filter((r) => r.status === 'completed').length;
    const cancelled = requestsList.filter((r) => r.status === 'cancelled').length;
    return { total, inProgress, pending, completed, cancelled };
  }, [requestsList]);

  // Drawer handlers
  const handleOpenDrawer = (reqId) => {
    setSelectedReqId(reqId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleDrawerStateChange = (targetStatus) => {
    const found = requestsList.find((r) => r.status === targetStatus);
    if (found) {
      setSelectedReqId(found.id);
    }
  };

  // Cancel Request Action
  const handleCancelRequest = (reqId) => {
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'cancelled',
              statusLabel: 'Cancelled',
              statusBg: 'bg-surface-container text-on-surface-variant',
              progress: 0,
              canCancel: false,
              notice: 'Cancelled by student. Full token credit returned to balance.',
              subNotice: 'Refunded to Wallet',
              dueDate: `Cancelled: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            }
          : r
      )
    );
    showToast(`Request #${reqId} has been cancelled and refunded to your wallet.`, 'info');
  };

  // New Request Submission
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!reqTitle || !reqDeadline) {
      showToast('Please provide a title and deadline.', 'error');
      return;
    }

    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedDeadline = new Date(reqDeadline).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const newReq = {
      id: newId,
      service: reqType,
      icon: 'edit_document',
      title: reqTitle,
      desc: reqNotes || `${reqType} deliverable prepared according to student guidelines.`,
      detailedDesc: reqNotes || `Specific requirement instructions provided for ${reqTitle}.`,
      status: 'pending',
      statusLabel: 'Pending Review',
      statusBg: 'bg-tertiary-fixed-dim text-on-tertiary-fixed',
      date: new Date().toISOString().split('T')[0],
      submittedDate: formattedDate,
      submittedTime: `${formattedDate}, just now`,
      deadline: reqDeadline,
      dueDate: formattedDeadline,
      progress: 5,
      allocated: 'Matching in progress...',
      subject: reqType,
      wordCount: reqFormat,
      referencing: 'Academic Standard',
      software: 'Default Workspace',
      canCancel: true,
      notice: 'Academic mentor matching is in progress. Estimate arrives in < 2 hrs.',
      subNotice: 'Awaiting coordinator confirmation',
      uploadedFiles: [
        { name: 'brief_instructions.pdf', size: '1.5 MB', date: formattedDate }
      ],
      timeline: [
        { step: 1, title: 'Request Submitted', desc: `${formattedDate} — Brief & instructions uploaded`, state: 'completed' },
        { step: 2, title: 'Mentor Assignment', desc: 'Evaluating syllabus & matching specialist', state: 'current' },
        { step: 3, title: 'Work in Progress', desc: 'Drafting coursework deliverables', state: 'upcoming' },
        { step: 4, title: 'Quality Review & Handover', desc: 'Plagiarism check & verified bundle release', state: 'upcoming' }
      ]
    };

    setRequestsList([newReq, ...requestsList]);
    setRequestModalOpen(false);
    setReqTitle('');
    setReqDeadline('');
    setReqNotes('');
    showToast(`Request #${newId} created successfully! Matching mentor now.`, 'success');
    setSelectedReqId(newId);
    setDrawerOpen(true);
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: editName,
      college: editCollege,
      course: editCourse
    });
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setProfileModalOpen(false);
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    showToast('Logged out successfully.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] flex flex-col selection:bg-[#6C63FF]/20 selection:text-[#4D41DF]">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION HEADER (Matching Stitch system)       */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FCF8FF]/90 backdrop-blur-xl border-b border-[#E4DFFE]/40 shadow-[0_12px_28px_rgba(108,99,255,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]">
        <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Student Workspace Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1X7S3rvjHLD2T2ZSwRsAwkZbxRDZ3YNIAMeXlPmZ5YGr9s0jmRhVDu9igu3_DdKtupdlp3mEkDiN7knq6FeOvbUtMAJIxKxPM0Q5vKgd3Crfg46CCu6JcYx8-YzIi8xpHxqy7Z-cdIxtXmLNNbaKoSgetaOV7FNhBRQvSqqts2tOh2Oo8VRN_QNKn7MrlxXMtvopLUFksqqXbuO-7ckIfqhBG5mccZLghWmgFvfefJGR8ffAM9YKkdxAT-P"
                alt="Assignment Hub Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="hidden sm:inline-block text-xl font-extrabold text-[#1B192F] tracking-tight">
                Assignment Hub
              </span>
            </Link>
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-semibold clay-pill-inset">
              Student Workspace
            </span>
          </div>

          {/* Centered Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F1FF] rounded-full clay-pill-inset">
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Services
            </Link>
            <span
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#DCD6FF] text-[#4D41DF] shadow-sm cursor-default"
            >
              My Requests
            </span>
            <Link
              to="/inquiries"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Inquiries
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Request</span>
            </button>

            {/* Notification Bell with Badge '2' */}
            <button
              onClick={() => showToast('You have 2 updates on your active submissions.', 'info')}
              aria-label="Notifications"
              className="relative p-2 rounded-full bg-white text-[#464555] hover:text-[#4D41DF] transition-all clay-card cursor-pointer border border-white"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB951] text-[#291800] text-[10px] font-extrabold ring-2 ring-white">
                2
              </span>
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white clay-card hover:bg-[#F6F1FF] transition-all cursor-pointer border border-white"
              >
                <div className="w-8 h-8 rounded-full bg-[#4D41DF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {initial}
                </div>
                <span className="hidden md:inline-block text-sm text-[#1B192F] font-semibold max-w-[120px] truncate">
                  {firstName}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#464555]">expand_more</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 z-50 clay-card shadow-2xl border border-white">
                  <div className="px-3 py-2 border-b border-[#E4DFFE] mb-1">
                    <p className="text-xs text-[#464555] font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-[#1B192F] truncate">{email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">person</span>
                    <span>My Profile</span>
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">dashboard</span>
                    <span>Student Dashboard</span>
                  </Link>
                  <Link
                    to="/services"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">category</span>
                    <span>Academic Services</span>
                  </Link>
                  <div className="my-1 h-px bg-[#E4DFFE]"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT (MATCHING STITCH SCREEN c72408057cfa)     */}
      {/* ======================================================== */}
      <main className="w-full pt-24 pb-24 md:pb-16 bg-[#FCF8FF] min-h-[calc(100vh-200px)] flex-grow">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 w-full space-y-8">
          
          {/* Header Section with tactile Clay CTA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#F0EBFF] text-[#4D41DF] text-xs font-bold clay-pill-inset">
                <span className="material-symbols-outlined text-[16px]">folder_special</span>
                Academic Tracker
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1B192F] tracking-tight">
                My Requests
              </h1>
              <p className="text-sm sm:text-base text-[#464555] max-w-xl font-medium leading-relaxed">
                Track, review milestones, and download verified deliverables across all your enrolled coursework tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenDrawer('REQ-1024')}
                className="px-5 py-3 rounded-full bg-white text-sm font-bold text-[#4D41DF] clay-card hover:bg-[#F6F1FF] transition-all flex items-center gap-2 cursor-pointer border border-white"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span>Sample Detail Drawer</span>
              </button>
              <button
                onClick={() => setRequestModalOpen(true)}
                className="px-6 py-3 rounded-full bg-[#4D41DF] text-sm font-bold text-white clay-btn-primary flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform cursor-pointer shadow-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>New Request</span>
              </button>
            </div>
          </div>

          {/* Stats Snapshot Bento Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bento Card 1: Total */}
            <div className="p-5 rounded-3xl bg-white clay-card flex flex-col justify-between border border-white/80">
              <div className="flex items-center justify-between text-[#464555]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Submissions</span>
                <span className="w-8 h-8 rounded-full bg-[#F0EBFF] flex items-center justify-center text-[#4D41DF]">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1B192F]">{stats.total}</span>
                <span className="text-xs font-medium text-[#464555]">Fall '26 Term</span>
              </div>
            </div>

            {/* Bento Card 2: Active / In Progress */}
            <div className="p-5 rounded-3xl bg-white clay-card flex flex-col justify-between border border-white/80">
              <div className="flex items-center justify-between text-[#5846C8]">
                <span className="text-xs font-bold uppercase tracking-wider">Active / In Progress</span>
                <span className="w-8 h-8 rounded-full bg-[#E4DFFE] flex items-center justify-center text-[#5846C8]">
                  <span className="material-symbols-outlined text-[18px]">engineering</span>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#5846C8]">{stats.inProgress}</span>
                <span className="text-xs font-medium text-[#464555]">Math 301</span>
              </div>
            </div>

            {/* Bento Card 3: Awaiting Review */}
            <div className="p-5 rounded-3xl bg-white clay-card flex flex-col justify-between border border-white/80">
              <div className="flex items-center justify-between text-[#7F5300]">
                <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
                <span className="w-8 h-8 rounded-full bg-[#FFDDB3] flex items-center justify-center text-[#7F5300]">
                  <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#7F5300]">{stats.pending}</span>
                <span className="text-xs font-medium text-[#464555]">DSA Lab</span>
              </div>
            </div>

            {/* Bento Card 4: Completed */}
            <div className="p-5 rounded-3xl bg-white clay-card flex flex-col justify-between border border-white/80">
              <div className="flex items-center justify-between text-[#4D41DF]">
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                <span className="w-8 h-8 rounded-full bg-[#E4DFFE] flex items-center justify-center text-[#4D41DF]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#4D41DF]">{stats.completed}</span>
                <span className="text-xs font-medium text-[#464555]">Ready for download</span>
              </div>
            </div>
          </div>

          {/* Filter Pills + Search & Sort Controls */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <nav aria-label="Status Filters" className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F6F1FF] rounded-2xl clay-pill-inset">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                      : 'text-[#464555] hover:text-[#1B192F] font-semibold'
                  }`}
                >
                  All{' '}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === 'all'
                        ? 'bg-[#F0EBFF] text-[#4D41DF]'
                        : 'bg-[#E4DFFE] text-[#464555]'
                    }`}
                  >
                    {stats.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('in-progress')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'in-progress'
                      ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                      : 'text-[#464555] hover:text-[#1B192F] font-semibold'
                  }`}
                >
                  In Progress{' '}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === 'in-progress'
                        ? 'bg-[#F0EBFF] text-[#4D41DF]'
                        : 'bg-[#E4DFFE] text-[#464555]'
                    }`}
                  >
                    {stats.inProgress}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'pending'
                      ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                      : 'text-[#464555] hover:text-[#1B192F] font-semibold'
                  }`}
                >
                  Pending{' '}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === 'pending'
                        ? 'bg-[#F0EBFF] text-[#4D41DF]'
                        : 'bg-[#E4DFFE] text-[#464555]'
                    }`}
                  >
                    {stats.pending}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('completed')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'completed'
                      ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                      : 'text-[#464555] hover:text-[#1B192F] font-semibold'
                  }`}
                >
                  Completed{' '}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === 'completed'
                        ? 'bg-[#F0EBFF] text-[#4D41DF]'
                        : 'bg-[#E4DFFE] text-[#464555]'
                    }`}
                  >
                    {stats.completed}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('cancelled')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'cancelled'
                      ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                      : 'text-[#464555] hover:text-[#1B192F] font-semibold'
                  }`}
                >
                  Cancelled{' '}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === 'cancelled'
                        ? 'bg-[#F0EBFF] text-[#4D41DF]'
                        : 'bg-[#E4DFFE] text-[#464555]'
                    }`}
                  >
                    {stats.cancelled}
                  </span>
                </button>
              </nav>

              {/* Count Summary Indicator */}
              <div className="hidden xl:flex items-center gap-2 text-[#464555] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4D41DF] animate-pulse"></span>
                <span>
                  Showing {filteredRequests.length} request{filteredRequests.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Search Box & Sort Selection */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests by title or request ID (e.g. REQ-1024)..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] placeholder:text-[#464555] text-sm clay-pill-inset focus:bg-white focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#464555] hover:text-[#1B192F]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="md:col-span-4 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px]">
                  sort
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-12 pr-10 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm font-semibold clay-pill-inset focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="latest">Sort by: Latest</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="nearest">Deadline: Nearest</option>
                  <option value="farthest">Deadline: Farthest</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((req) => (
                <article
                  key={req.id}
                  className={`p-6 md:p-7 rounded-3xl bg-white clay-card flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all border border-white/80 ${
                    req.status === 'cancelled' ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Service Badge + ID + Status Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center clay-pill-inset ${
                            req.status === 'in-progress'
                              ? 'bg-[#EAE5FF] text-[#4D41DF]'
                              : req.status === 'pending'
                              ? 'bg-[#FFDDB3] text-[#7F5300]'
                              : req.status === 'completed'
                              ? 'bg-[#E4DFFE] text-[#4D41DF]'
                              : 'bg-[#F0EBFF] text-[#464555]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {req.icon || 'description'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#464555]">{req.service}</p>
                          <span className="text-[11px] font-extrabold text-[#4D41DF] bg-[#F0EBFF] px-2 py-0.5 rounded-full inline-block mt-0.5">
                            #{req.id}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      {req.status === 'in-progress' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFE] text-[#170065] text-xs font-bold clay-pill-inset">
                          <span className="w-2 h-2 rounded-full bg-[#5846C8] animate-ping"></span>
                          In Progress
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB951] text-[#291800] text-xs font-bold clay-pill-inset">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          Pending Review
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5FF] text-[#4D41DF] text-xs font-bold clay-pill-inset">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Completed
                        </span>
                      )}
                      {req.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-bold clay-pill-inset">
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
                          Cancelled
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#1B192F] tracking-tight">
                        {req.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#464555] mt-1 line-clamp-2">
                        {req.desc}
                      </p>
                    </div>

                    {/* Dates Pill Box */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F6F1FF] text-xs text-[#464555]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span>
                          Sub: <strong className="text-[#1B192F] font-semibold">{req.submittedDate}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            req.status === 'completed'
                              ? 'text-[#4D41DF]'
                              : req.status === 'cancelled'
                              ? 'text-[#BA1A1A]'
                              : 'text-[#7F5300]'
                          }`}
                        >
                          {req.status === 'completed'
                            ? 'done_all'
                            : req.status === 'cancelled'
                            ? 'event_busy'
                            : 'schedule'}
                        </span>
                        <span>
                          {req.status === 'completed' ? 'Delivered: ' : req.status === 'cancelled' ? 'Cancelled: ' : 'Due: '}
                          <strong className="text-[#1B192F] font-semibold">
                            {req.dueDate?.replace('Delivered: ', '')?.replace('Cancelled: ', '') || req.deadline}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar or Status Note */}
                    {req.status === 'in-progress' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-[#464555]">Milestone Progress</span>
                          <span className="text-[#4D41DF] font-bold">{req.progress}% Completed</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#EAE5FF] overflow-hidden clay-pill-inset p-0.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#4D41DF] to-[#7161E3] transition-all duration-700"
                            style={{ width: `${req.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="p-3 rounded-2xl bg-[#F0EBFF] text-xs text-[#464555] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#7F5300]">info</span>
                        <span>{req.notice || 'Academic mentor matching is in progress. Estimate arrives in < 2 hrs.'}</span>
                      </div>
                    )}

                    {req.status === 'completed' && (
                      <div className="p-3 rounded-2xl bg-[#EAE5FF] text-xs text-[#1B192F] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-[#4D41DF]">archive</span>
                          <span className="font-semibold text-[#4D41DF]">Deliverable Ready (ZIP & PDF)</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#464555]">{req.deliverableSize || '14.2 MB'}</span>
                      </div>
                    )}

                    {req.status === 'cancelled' && (
                      <div className="p-3 rounded-2xl bg-[#F0EBFF] text-xs text-[#464555] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#777587]">info</span>
                        <span>{req.notice || 'Cancelled by student. Full token credit returned to balance.'}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0EBFF]">
                    <div className="flex items-center gap-1.5 text-[#464555] text-xs">
                      {req.status === 'in-progress' && (
                        <>
                          <span className="material-symbols-outlined text-[16px] text-[#4D41DF]">person_check</span>
                          <span>Allocated: {req.allocated}</span>
                        </>
                      )}
                      {req.status === 'pending' && (
                        <span>{req.subNotice || 'Awaiting price quote approval'}</span>
                      )}
                      {req.status === 'completed' && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-[#4D41DF]">star</span>
                          <span>Rated 5.0 by student</span>
                        </div>
                      )}
                      {req.status === 'cancelled' && (
                        <span>Refunded to Wallet</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(req.id)}
                      className="px-4 py-2 rounded-full bg-[#F0EBFF] text-xs font-bold text-[#4D41DF] hover:bg-[#E4DFFE] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {req.status === 'completed'
                          ? 'View & Download'
                          : req.status === 'cancelled'
                          ? 'View Log'
                          : 'View Request'}
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Container */
            <div className="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl bg-white clay-card text-center space-y-4 border border-white">
              <div className="w-20 h-20 rounded-full bg-[#EAE5FF] flex items-center justify-center text-[#4D41DF] clay-pill-inset">
                <span className="material-symbols-outlined text-[40px]">
                  {activeFilter === 'pending'
                    ? 'hourglass_empty'
                    : activeFilter === 'in-progress'
                    ? 'pending_actions'
                    : activeFilter === 'completed'
                    ? 'assignment_turned_in'
                    : activeFilter === 'cancelled'
                    ? 'block'
                    : 'post_add'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#1B192F]">
                  {activeFilter === 'all'
                    ? 'No Requests Found'
                    : `No ${activeFilter.replace('-', ' ')} Requests`}
                </h3>
                <p className="text-sm text-[#464555] max-w-md">
                  {searchQuery
                    ? `No academic requests matched "${searchQuery}". Try a different keyword.`
                    : 'No requests currently in this category.'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-[#F0EBFF] text-[#4D41DF] text-xs font-bold clay-card cursor-pointer hover:bg-[#E4DFFE]"
                >
                  Submit New Request
                </button>
              </div>
            </div>
          )}

          {/* Student Support & Policy Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#F0EBFF] to-[#EAE5FF] clay-card flex flex-col md:flex-row items-center justify-between gap-6 border border-white/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#4D41DF] flex items-center justify-center clay-card shrink-0">
                <span className="material-symbols-outlined text-[32px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-[#1B192F]">
                  Guaranteed Academic Integrity & Strict Confidentiality
                </h4>
                <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                  All files are processed on secure encrypted servers with plagiarism and AI authenticity reports included.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setGuaranteeModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-white text-[#1B192F] text-xs font-bold clay-card hover:text-[#4D41DF] transition-colors cursor-pointer"
              >
                View Guarantee
              </button>
              <button
                type="button"
                onClick={() => showToast('Connecting to Academic Support Live Coordinator...', 'info')}
                className="px-5 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary cursor-pointer shadow-md"
              >
                Live Chat Support
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. INTERACTIVE SLIDING DETAIL DRAWER                     */}
        {/* ======================================================== */}
        <div
          className={`fixed inset-0 bg-[#302E45]/40 backdrop-blur-sm z-50 transition-opacity duration-300 flex justify-end ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCloseDrawer}
        >
          <div
            className={`w-full max-w-2xl bg-white h-full overflow-y-auto p-6 md:p-8 shadow-2xl transition-transform duration-300 flex flex-col justify-between space-y-6 ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Content */}
            <div className="space-y-6">
              {/* Drawer Top Navigation Bar */}
              <div className="flex items-center justify-between border-b border-[#EAE5FF] pb-4">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0EBFF] text-xs font-bold text-[#464555] hover:text-[#1B192F] hover:bg-[#E4DFFE] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to My Requests</span>
                </button>

                {/* State Switcher dropdown for instant demonstration */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#464555]">Demo State:</span>
                  <select
                    value={activeRequest.status}
                    onChange={(e) => handleDrawerStateChange(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-[#F0EBFF] text-xs font-bold text-[#4D41DF] focus:outline-none cursor-pointer"
                  >
                    <option value="in-progress">In Progress (#REQ-1024)</option>
                    <option value="completed">Completed (#REQ-1018)</option>
                    <option value="pending">Pending (#REQ-1028)</option>
                    <option value="cancelled">Cancelled (#REQ-1012)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Header Info */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#4D41DF] bg-[#F0EBFF] px-3 py-1 rounded-full clay-pill-inset">
                    {activeRequest.service}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full clay-pill-inset ${
                      activeRequest.status === 'in-progress'
                        ? 'bg-[#E4DFFE] text-[#170065]'
                        : activeRequest.status === 'pending'
                        ? 'bg-[#FFB951] text-[#291800]'
                        : activeRequest.status === 'completed'
                        ? 'bg-[#EAE5FF] text-[#4D41DF]'
                        : 'bg-[#F0EBFF] text-[#464555]'
                    }`}
                  >
                    {activeRequest.status === 'in-progress' && '● In Progress'}
                    {activeRequest.status === 'pending' && '⏳ Pending Review'}
                    {activeRequest.status === 'completed' && '✓ Completed'}
                    {activeRequest.status === 'cancelled' && '✕ Cancelled'}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-[#1B192F] tracking-tight">
                  {activeRequest.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-[#464555] text-xs font-semibold">
                  <span>ID: #{activeRequest.id}</span>
                  <span>•</span>
                  <span>Submitted: {activeRequest.submittedDate}</span>
                  <span>•</span>
                  <span className="text-[#7F5300] font-bold">
                    {activeRequest.dueDate?.startsWith('Delivered') || activeRequest.dueDate?.startsWith('Cancelled')
                      ? activeRequest.dueDate
                      : `Due: ${activeRequest.dueDate}`}
                  </span>
                </div>
              </div>

              {/* Vertical Milestone Timeline */}
              <div className="p-6 rounded-3xl bg-[#F6F1FF] clay-pill-inset space-y-4">
                <h4 className="text-sm font-bold text-[#1B192F] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">timeline</span>
                  Status &amp; Milestones
                </h4>

                <div className="space-y-4 pl-1">
                  {activeRequest.timeline?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {item.state === 'completed' ? (
                        <div className="w-6 h-6 rounded-full bg-[#4D41DF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                      ) : item.state === 'current' ? (
                        <div className="w-6 h-6 rounded-full bg-[#5846C8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm animate-pulse">
                          <span className="material-symbols-outlined text-[14px]">sync</span>
                        </div>
                      ) : item.state === 'cancelled' ? (
                        <div className="w-6 h-6 rounded-full bg-[#BA1A1A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#F0EBFF] text-[#777587] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold ${
                            item.state === 'upcoming' ? 'text-[#777587]' : 'text-[#1B192F]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-[#464555]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Specification Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B192F]">Project Specification</h4>
                <div className="p-5 rounded-2xl bg-[#F6F1FF] text-xs space-y-3">
                  <p className="text-[#1B192F] leading-relaxed">
                    {activeRequest.detailedDesc || activeRequest.desc}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[#464555] border-t border-[#EAE5FF]">
                    <div>
                      <span className="font-bold text-[#1B192F]">Subject:</span> {activeRequest.subject}
                    </div>
                    <div>
                      <span className="font-bold text-[#1B192F]">Word/Page Target:</span> {activeRequest.wordCount}
                    </div>
                    <div>
                      <span className="font-bold text-[#1B192F]">Referencing:</span> {activeRequest.referencing}
                    </div>
                    <div>
                      <span className="font-bold text-[#1B192F]">Software:</span> {activeRequest.software}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Files Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B192F]">Your Uploaded Files</h4>
                <div className="space-y-2">
                  {activeRequest.uploadedFiles?.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F0EBFF] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#4D41DF] text-[22px]">picture_as_pdf</span>
                        <div>
                          <p className="font-bold text-[#1B192F]">{file.name}</p>
                          <p className="text-[#464555] text-[11px]">{file.size} • Uploaded {file.date}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading ${file.name}...`, 'info')}
                        className="p-2 rounded-xl text-[#464555] hover:text-[#4D41DF] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivered Files Section (Shown when Completed) */}
              {activeRequest.status === 'completed' && activeRequest.deliveredFiles && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h4 className="text-sm font-bold text-[#4D41DF] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
                    Final Delivered Files
                  </h4>
                  <div className="p-4 rounded-2xl bg-[#EAE5FF] clay-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#4D41DF] text-[28px]">folder_zip</span>
                        <div>
                          <p className="font-bold text-[#1B192F] text-xs sm:text-sm">
                            {activeRequest.deliveredFiles.name}
                          </p>
                          <p className="text-[#464555] text-[11px]">
                            {activeRequest.deliveredFiles.size} • {activeRequest.deliveredFiles.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Starting download: ${activeRequest.deliveredFiles.name}`, 'success')}
                        className="px-3.5 py-1.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary flex items-center gap-1 cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download</span>
                      </button>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-[#E4DFFE]">
                      <span className="text-xs text-[#464555]">
                        Turnitin Plagiarism Score:{' '}
                        <strong className="text-[#4D41DF] font-bold">
                          {activeRequest.deliveredFiles.turnitinScore}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast('Revision request form dispatched to coordinator.', 'info')}
                        className="text-[#4D41DF] text-xs font-bold underline hover:opacity-80 cursor-pointer"
                      >
                        Request Free Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Action Footer */}
            <div className="pt-6 border-t border-[#EAE5FF] space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F0EBFF] text-xs font-semibold">
                <span className="text-[#464555]">Need clarification from the academic team?</span>
                <button
                  type="button"
                  onClick={() => showToast(`Opening inquiry thread for #${activeRequest.id}...`, 'info')}
                  className="font-bold text-[#4D41DF] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Open Inquiry</span>
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {activeRequest.canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancelRequest(activeRequest.id)}
                    className="w-1/2 py-3 rounded-full bg-[#F6F1FF] text-[#BA1A1A] text-xs font-bold clay-card hover:bg-[#FFDAD6] transition-colors cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}

                {activeRequest.status === 'completed' ? (
                  <button
                    type="button"
                    onClick={() => showToast(`Downloading ${activeRequest.deliveredFiles?.name || 'bundle'}`, 'success')}
                    className="w-full py-3 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download Solution Pack (.zip)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast(`Checking latest milestone for #${activeRequest.id}... (All on track)`, 'info')}
                    className={`${
                      activeRequest.canCancel ? 'w-1/2' : 'w-full'
                    } py-3 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md`}
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>Check Progress Update</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. NEW REQUEST MODAL                                     */}
      {/* ======================================================== */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#302E45]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setRequestModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4D41DF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1B192F]">Submit New Academic Request</h3>
                  <p className="text-xs text-[#464555]">We match your brief with qualified academic mentors</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">
                  Assignment Title / Subject Topic *
                </label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics Problem Set or IoT Telemetry Code"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none placeholder-[#464555]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Service Category</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
                  >
                    <option value="Assignment Writing">Assignment Writing (Core Academic)</option>
                    <option value="Practical Files & Viva">Practical Files & Viva Prep</option>
                    <option value="Coding & Technical">Coding & Technical Projects</option>
                    <option value="PPT & Presentation">PPT & Slide Decks</option>
                    <option value="Project Reports">Project Reports & Thesis</option>
                    <option value="Engineering Drawing">Engineering Drawing & CAD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Deadline *</label>
                  <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                    <input
                      type="date"
                      value={reqDeadline}
                      onChange={(e) => setReqDeadline(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Output Format</label>
                  <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                    <select
                      value={reqFormat}
                      onChange={(e) => setReqFormat(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
                    >
                      <option value="Digital PDF / Docs">Digital PDF / Docs</option>
                      <option value="Handwritten Assignment">Handwritten Assignment</option>
                      <option value="PowerPoint Presentation">PowerPoint Presentation</option>
                      <option value="Source Code & Zip">Source Code & Zip</option>
                      <option value="Physical Sheets (Speed Post)">Physical Sheets (Speed Post)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">
                  Specific Requirements or Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste teacher instructions, rubric guidelines, word limits, or special remarks..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] text-sm text-[#1B192F] outline-none resize-none placeholder-[#464555]/50 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#464555] hover:bg-[#F6F1FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
                >
                  Submit Academic Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PROFILE EDIT MODAL                                    */}
      {/* ======================================================== */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#302E45]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4D41DF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1B192F]">Student Profile</h3>
                  <p className="text-xs text-[#464555]">Manage your account details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Full Name</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#1B192F] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">College / University</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none"
                    placeholder="e.g. Stanford University or MIT"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Course / Degree</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#464555] hover:bg-[#F6F1FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. GUARANTEE / POLICY MODAL                              */}
      {/* ======================================================== */}
      {guaranteeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#302E45]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setGuaranteeModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBFF]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px] text-[#4D41DF]">verified_user</span>
                <h3 className="text-xl font-bold text-[#1B192F]">Academic Integrity Guarantee</h3>
              </div>
              <button
                type="button"
                onClick={() => setGuaranteeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] text-[#1B192F] flex items-center justify-center text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-xs sm:text-sm text-[#464555] space-y-3 leading-relaxed">
              <p>
                <strong>Zero Plagiarism:</strong> Every deliverable undergoes dual Turnitin and Grammarly plagiarism checks before release to your dashboard.
              </p>
              <p>
                <strong>Confidential Identity:</strong> All briefs and communications are sanitized. Your mentor only sees anonymized task instructions.
              </p>
              <p>
                <strong>Free Revisions:</strong> If any guideline from your uploaded syllabus prompt is missed, request free revisions within 7 days.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setGuaranteeModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MOBILE BOTTOM NAVIGATION (Matching Stitch Shell)      */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#FCF8FF]/95 backdrop-blur-xl border-t border-[#E4DFFE] shadow-lg px-2 py-2 flex items-center justify-around">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span>Home</span>
        </Link>
        <Link
          to="/services"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
          <span>Services</span>
        </Link>
        <span
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-bold text-[#4D41DF] cursor-default"
        >
          <span className="material-symbols-outlined text-[22px]">task</span>
          <span>My Requests</span>
        </span>
        <Link
          to="/inquiries"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>Inquiries</span>
        </Link>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 8. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#F6F1FF] py-10 md:py-12 border-t border-[#E4DFFE]/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm font-bold text-[#1B192F]">Assignment Hub © 2025</p>
            <p className="text-xs text-[#464555] text-center md:text-left">
              You give us your work — we take care of the rest.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#464555]">
            <Link to="/about" className="hover:text-[#4D41DF] transition-colors">About</Link>
            <Link to="/contact" className="hover:text-[#4D41DF] transition-colors">Contact</Link>
            <Link to="/support" className="hover:text-[#4D41DF] transition-colors">Support</Link>
            <Link to="/privacy-policy" className="hover:text-[#4D41DF] transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-[#4D41DF] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MyRequestsPage;
