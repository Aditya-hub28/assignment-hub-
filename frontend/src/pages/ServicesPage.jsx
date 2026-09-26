import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { NotificationBell } from '../components/NotificationBell';

// Comprehensive Service Catalog Database matching Stitch Screen d164ad1e463a4bd6bbda046d5a455aa5
const serviceDetailsData = {
  writing: {
    id: 'writing',
    category: 'writing',
    title: 'Assignment Writing',
    badge: 'Core Academic',
    modalBadge: 'Core Academic Deliverable',
    icon: 'edit_document',
    iconColor: 'text-[#6C63FF]',
    desc: 'Academic assignment preparation including research, written answers, formatting, diagrams when required, and final document preparation.',
    timeline: '1–3 days',
    scope: '5–25 pages',
    format: 'PDF / Word document',
    modalTimeline: '1–3 Days',
    modalScope: '5–25 Pages',
    modalFormat: 'Word & Formatted PDF',
    provides: [
      'Thorough subject-specific research conducted according to university guidelines.',
      'Clear structure with logical academic headings, introduction, sub-topics, and conclusions.',
      'Formatting aligned to required standards (margins, typography, reference citations in APA/IEEE).',
      'Clean visual diagrams or table figures embedded when requested.'
    ],
    requirements: [
      'Assignment brief, topic prompt, or question paper (PDF or photo).',
      'Word count or page count target range specified by your syllabus.',
      'Specific instructor guidelines, marking rubric, or reference lecture slides.'
    ]
  },
  presentation: {
    id: 'presentation',
    category: 'presentations',
    title: 'PPT & Presentation',
    badge: 'Quick Turnaround',
    modalBadge: 'Quick Turnaround',
    icon: 'slideshow',
    iconColor: 'text-[#675df9]',
    desc: 'Complete presentation preparation with structured content, clean slide design, diagrams/images, and proper formatting.',
    timeline: '1–2 days',
    scope: '8–20 slides',
    format: 'PPT + optional PDF',
    modalTimeline: '1–2 Days',
    modalScope: '8–20 Slides',
    modalFormat: 'PPTX + PDF Deck',
    provides: [
      'Structured narrative flow from opening hook to data analysis and executive summary.',
      'Custom visual theme with high-contrast diagrams, iconography, and zero walls of text.',
      'Comprehensive speaker notes underneath each slide to help you present with confidence.',
      'Ready-to-present high-resolution 16:9 widescreen presentation slides.'
    ],
    requirements: [
      'Presentation topic, seminar title, or outline of required headings.',
      'Target presentation time or required number of total slides.',
      'Any mandatory charts, datasets, or company/university logos.'
    ]
  },
  reports: {
    id: 'reports',
    category: 'writing',
    title: 'Project Reports',
    badge: 'Comprehensive',
    modalBadge: 'Comprehensive Documentation',
    icon: 'menu_book',
    iconColor: 'text-[#5846c8]',
    desc: 'Complete academic project documentation including abstract, introduction, methodology, implementation, results, conclusion, and references.',
    timeline: '3–5 days',
    scope: '20–60+ pages',
    format: 'University Formatted Report',
    modalTimeline: '3–5 Days',
    modalScope: '20–60+ Pages',
    modalFormat: 'University Formatted Report',
    provides: [
      'Full thesis/capstone structure: Abstract, Introduction, Literature Review, Methodology, Results.',
      'Complete bibliography and academic referencing index.',
      'Clean page layout: Table of Contents, List of Figures, List of Tables, and Appendices.',
      'Original code snippets or calculation proof reviews included in structured annexures.'
    ],
    requirements: [
      'Project synopsis, approved proposal, or university guideline handbook.',
      'Design diagrams, screenshots, or simulation outputs (if pre-existing).',
      'Department-specific title page format or preliminary certificates.'
    ]
  },
  drawing: {
    id: 'drawing',
    category: 'labs',
    title: 'Engineering Drawing',
    badge: 'CAD & Sheets',
    modalBadge: 'CAD & Sheet Drafting',
    icon: 'architecture',
    iconColor: 'text-[#6C63FF]',
    desc: 'Preparation of required engineering drawing sheets according to the provided questions, dimensions, and specifications.',
    timeline: '2–4 days (depends on sheets)',
    scope: 'Isometric / Orthographic / CAD',
    format: 'Completed sheets & DWG/PDF',
    modalTimeline: '2–4 Days',
    modalScope: 'Isometric / Ortho / CAD',
    modalFormat: 'DWG / DXF & Scaled PDF',
    provides: [
      'Exact dimensioning and projection compliance according to standard drafting rules.',
      'Accurate isometric, orthographic, section, and auxiliary views.',
      'Standard title blocks filled with your institution, scale, and projection notation.',
      'High-definition printable sheets along with editable computer-aided vector source.'
    ],
    requirements: [
      'Question sheet or problem statement with all component dimensions.',
      'Projection method preference (First Angle or Third Angle projection).',
      'Drafting tool requirements (AutoCAD DWG, SolidWorks, or hand-drafted sheet photos).'
    ]
  },
  physics: {
    id: 'physics',
    category: 'labs',
    title: 'Physics & Practical',
    badge: 'Viva & Calculations',
    modalBadge: 'Viva & Calculations',
    icon: 'science',
    iconColor: 'text-[#a06900]',
    desc: 'Physics assignments, practical files, experiment write-ups, calculations, observations, diagrams, and conclusions.',
    timeline: '1–3 days',
    scope: 'Complete Lab Record',
    format: 'Written/Typed Practical File',
    modalTimeline: '1–3 Days',
    modalScope: 'Complete Lab Record',
    modalFormat: 'Written / Typed Practical File',
    provides: [
      'Experiment title, apparatus list, clear working principle, and circuit/ray diagrams.',
      'Observation tables formatted with error analysis, formula substitutions, and units.',
      'Precautions, sources of error, and anticipated Viva-Voce preparation Q&A.',
      'Clean visual layout suitable for laboratory manual submission and sign-off.'
    ],
    requirements: [
      'Laboratory manual syllabus or list of allocated experiment numbers.',
      'Raw readings, observations, or laboratory apparatus parameters recorded during class.',
      'Institution guidelines on whether typed submissions or handwritten files are required.'
    ]
  },
  coding: {
    id: 'coding',
    category: 'technical',
    title: 'Coding & Technical',
    badge: 'Source & Docs',
    modalBadge: 'Source & Docs',
    icon: 'terminal',
    iconColor: 'text-[#6C63FF]',
    desc: 'Programming and technical academic work including coding tasks, debugging, implementation, documentation, and basic explanation.',
    timeline: '2–5 days (complexity based)',
    scope: 'Full stack / Algorithms / DB',
    format: 'Clean Source Code + Readme',
    modalTimeline: '2–5 Days',
    modalScope: 'Full Stack / Algo / DB',
    modalFormat: 'Source Code + README',
    provides: [
      'Clean, modular, thoroughly commented source code adhering to industry style guides.',
      'Comprehensive README.md with environment setup, dependencies, and execution commands.',
      'Working test cases, demonstration console logs, or execution screenshot proof.',
      'Brief audio or markdown walkthrough summarizing core logic for student comprehension.'
    ],
    requirements: [
      'Problem statement, coding challenge rubric, or assignment PDF.',
      'Required programming language, framework version, or database constraints.',
      'Input/Output format examples and edge cases specified by your professor.'
    ]
  },
  other: {
    id: 'other',
    category: 'writing',
    title: 'Other Academic Work',
    badge: 'Custom Request',
    modalBadge: 'Custom Request',
    subtitle: 'Custom Research, Synopses & Departmental Forms',
    icon: 'extension',
    iconColor: 'text-[#675df9]',
    desc: 'Academic requirements that do not fit into the standard categories. Custom rubrics, research synopses, case law briefs, statistical reviews, and specialized university coursework.',
    timeline: 'Tailored to project',
    scope: 'Flexible custom scope',
    format: 'Review-determined',
    modalTimeline: 'Tailored to Project',
    modalScope: 'Flexible Custom Scope',
    modalFormat: 'Review-Determined',
    provides: [
      'Dedicated evaluation of your unique syllabus prompt by a specialized subject matter coordinator.',
      'Custom methodology tailored to unconventional academic formats or interdisciplinary work.',
      'Structured milestone updates with preliminary drafts for ongoing supervisor review.',
      'Full compliance with your custom rubric and institution criteria.'
    ],
    requirements: [
      'Comprehensive description of the academic requirement and specific challenges.',
      'Syllabus excerpts, sample outputs, or supervisor notes.',
      'Desired completion timeline and target submission milestone date.'
    ]
  }
};

export function ServicesPage() {
  const { user, profile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Category filter state
  const [activeCategory, setActiveCategory] = useState('all');

  // Service Details Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // New Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqService, setReqService] = useState('Assignment Writing');
  const [reqTopic, setReqTopic] = useState('');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqFormat, setReqFormat] = useState('Digital PDF / Docs');
  const [reqNotes, setReqNotes] = useState('');

  // User Dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Fallback student details
  const fullName = profile?.fullName || user?.email?.split('@')[0] || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';
  const initial = (fullName.charAt(0) || 'A').toUpperCase();
  const email = profile?.email || user?.email || 'student@college.edu';

  // Set default deadline date (2 days from now)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setReqDeadline(d.toISOString().split('T')[0]);
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (serviceModalOpen) setServiceModalOpen(false);
        if (requestModalOpen) setRequestModalOpen(false);
        if (userDropdownOpen) setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [serviceModalOpen, requestModalOpen, userDropdownOpen]);

  const handleOpenRequestModal = (serviceName = 'Assignment Writing') => {
    setReqService(serviceName);
    setRequestModalOpen(true);
  };

  const handleOpenServiceDetails = (serviceKey) => {
    const data = serviceDetailsData[serviceKey] || serviceDetailsData.writing;
    setSelectedService(data);
    setServiceModalOpen(true);
  };

  const handleRequestFromModal = (serviceTitle) => {
    setServiceModalOpen(false);
    handleOpenRequestModal(serviceTitle);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    showToast(`Request submitted for "${reqService}: ${reqTopic}"! Academic coordinators are reviewing it.`, 'success');
    setRequestModalOpen(false);
    setReqTopic('');
    setReqNotes('');
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Category filters
  const categoryFilters = [
    { id: 'all', label: 'All Services (7)' },
    { id: 'writing', label: 'Writing & Reports' },
    { id: 'presentations', label: 'Presentations' },
    { id: 'technical', label: 'Technical & Coding' },
    { id: 'labs', label: 'Labs & Drawings' }
  ];

  // Filtered services list
  const allServicesList = Object.values(serviceDetailsData);
  const filteredServices = allServicesList.filter((svc) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'writing') return svc.category === 'writing';
    if (activeCategory === 'presentations') return svc.category === 'presentations';
    if (activeCategory === 'technical') return svc.category === 'technical';
    if (activeCategory === 'labs') return svc.category === 'labs';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans text-[#25233A] relative overflow-x-hidden w-full">
      
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR (Matching media_1790421420852.png 1:1)     */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2DCFF]/50 shadow-[0_4px_20px_rgba(108,99,255,0.04)]">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Logo & Student Workspace Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center clay-card shadow-sm border border-white">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1X7S3rvjHLD2T2ZSwRsAwkZbxRDZ3YNIAMeXlPmZ5YGr9s0jmRhVDu9igu3_DdKtupdlp3mEkDiN7knq6FeOvbUtMAJIxKxPM0Q5vKgd3Crfg46CCu6JcYx8-YzIi8xpHxqy7Z-cdIxtXmLNNbaKoSgetaOV7FNhBRQvSqqts2tOh2Oo8VRN_QNKn7MrlxXMtvopLUFksqqXbuO-7ckIfqhBG5mccZLghWmgFvfefJGR8ffAM9YKkdxAT-P"
                  alt="Assignment Hub Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden sm:inline-block text-xl font-extrabold text-[#25233A] tracking-tight">
                Assignment<span className="text-[#6C63FF]">Hub</span>
              </span>
            </Link>

            <span className="hidden md:inline-flex items-center px-3.5 py-1 rounded-full bg-[#EDE8FA] text-[#6E6A8A] text-xs font-semibold clay-pill-inset">
              Student Workspace
            </span>
          </div>

          {/* Center: Nav Pills with 'Services' ACTIVE (as in media_1790421420852.png) */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#EDE8FA] rounded-full clay-pill-inset">
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Home
            </Link>
            <span
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#DCD6FF] text-[#4D41DF] shadow-sm transition-all duration-200 cursor-default"
            >
              Services
            </span>
            <Link
              to="/my-requests"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              My Requests
            </Link>
            <Link
              to="/inquiries"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Inquiries
            </Link>
          </nav>

          {/* Right: Notification Bell & Profile Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenRequestModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Request</span>
            </button>

            {/* Notification Bell with interactive Popup */}
            <NotificationBell />

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white clay-card hover:bg-[#FAF8FF] transition-all cursor-pointer border border-white"
              >
                <div className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {initial}
                </div>
                <span className="hidden md:inline-block text-sm text-[#25233A] font-semibold max-w-[120px] truncate">
                  {firstName}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#6E6A8A]">expand_more</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 z-50 clay-card shadow-2xl border border-white">
                  <div className="px-3 py-2 border-b border-[#E2DCFF] mb-1">
                    <p className="text-xs text-[#6E6A8A] font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-[#25233A] truncate">{email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">dashboard</span>
                    <span>Student Dashboard</span>
                  </Link>
                  <Link
                    to="/my-requests"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">task</span>
                    <span>My Requests</span>
                  </Link>
                  <Link
                    to="/inquiries"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">chat</span>
                    <span>Inquiries</span>
                  </Link>
                  <div className="my-1 h-px bg-[#E2DCFF]"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF2F2] transition-all cursor-pointer"
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
      {/* 2. DEDICATED ACADEMIC SERVICES PAGE CONTENT              */}
      {/* ======================================================== */}
      <main className="w-full pt-20 sm:pt-28 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-grow flex flex-col items-center">
        <div className="flex flex-col items-center w-full relative animate-in fade-in duration-300">
          
          {/* Ambient Background Glows (Contained to prevent horizontal layout shift) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-12 -left-16 w-80 h-80 bg-[#6C63FF]/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#FFB84D]/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-[#5846c8]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Header & Hero Intro */}
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-xs font-bold clay-pill-inset mb-3">
              <span className="material-symbols-outlined text-[16px] text-[#FFB84D]">auto_awesome</span>
              <span>CATALOGUE & DELIVERABLES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#25233A] tracking-tight mb-3">
              Academic Services
            </h1>
            <p className="text-sm sm:text-base text-[#6E6A8A] max-w-2xl leading-relaxed font-medium">
              Get your academic work completed with clear requirements, transparent timelines, and organized university-grade delivery.
            </p>
          </div>

          {/* FULL-WIDTH CLAY CATEGORY BAR */}
          <div className="w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 my-4 sm:my-8 rounded-2xl md:rounded-full bg-[#EDE8FA] border border-white/80 shadow-[0_10px_25px_-5px_rgba(108,99,255,0.08),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(108,99,255,0.08)] overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-3 flex-nowrap whitespace-nowrap min-w-max md:min-w-0 md:w-full px-1 sm:px-2">
              {categoryFilters.map((cat) => {
                const isCatActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm tracking-normal transition-all duration-200 cursor-pointer ${
                      isCatActive
                        ? 'bg-[#6C63FF] text-white font-bold shadow-[inset_0_3px_6px_rgba(0,0,0,0.22),inset_0_-1px_2px_rgba(255,255,255,0.35),0_2px_4px_rgba(108,99,255,0.15)]'
                        : 'bg-white text-[#25233A] hover:text-[#6C63FF] hover:bg-white font-semibold border border-white/90 shadow-[0_4px_10px_rgba(108,99,255,0.06),0_1px_3px_rgba(0,0,0,0.04),inset_0_2px_3px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(108,99,255,0.06)] hover:-translate-y-0.5'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7 SERVICES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 w-full max-w-7xl mx-auto">
            {filteredServices.map((svc) => {
              const isFullSpan = svc.id === 'other';
              return (
                <article
                  key={svc.id}
                  className={`flex flex-col justify-between p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white clay-card transition-all duration-300 hover:-translate-y-1 group ${
                    isFullSpan ? 'md:col-span-2 lg:col-span-3 lg:flex-row items-stretch gap-5 sm:gap-6' : ''
                  }`}
                >
                  <div className={isFullSpan ? 'flex-1 min-w-0' : 'min-w-0 flex-1 flex flex-col'}>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F3F0FF] flex items-center justify-center clay-pill-inset group-hover:scale-105 transition-transform shrink-0">
                          <span
                            className={`material-symbols-outlined text-[24px] sm:text-[28px] ${svc.iconColor}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {svc.icon}
                          </span>
                        </div>
                        {isFullSpan && (
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#25233A] truncate">{svc.title}</h3>
                            <p className="text-xs text-[#6E6A8A] font-semibold truncate">{svc.subtitle}</p>
                          </div>
                        )}
                      </div>

                      <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#F3F0FF] text-[#6C63FF] clay-pill-inset shrink-0 whitespace-nowrap">
                        {svc.badge}
                      </span>
                    </div>

                    {!isFullSpan && (
                      <h3 className="text-lg sm:text-xl font-bold text-[#25233A] mb-1.5 sm:mb-2 leading-snug">{svc.title}</h3>
                    )}

                    <p className={`text-xs sm:text-sm text-[#6E6A8A] leading-relaxed mb-4 sm:mb-6 ${isFullSpan ? 'max-w-3xl' : 'min-h-[36px] sm:min-h-[44px]'}`}>
                      {svc.desc}
                    </p>

                    {/* Specs List */}
                    <div className={`space-y-2 mb-4 sm:mb-6 ${isFullSpan ? 'grid grid-cols-1 sm:grid-cols-3 gap-2.5 space-y-0' : ''}`}>
                      <div className="flex items-center gap-2 p-2 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset min-w-0">
                        <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0">schedule</span>
                        <span className="truncate"><strong className="text-[#25233A]">Timeline:</strong> {svc.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset min-w-0">
                        <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0">
                          {svc.id === 'presentation' ? 'co_present' : svc.id === 'reports' ? 'auto_stories' : svc.id === 'coding' ? 'data_object' : svc.id === 'drawing' ? 'draw' : svc.id === 'physics' ? 'biotech' : 'description'}
                        </span>
                        <span className="truncate"><strong className="text-[#25233A]">Scope:</strong> {svc.scope}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset min-w-0">
                        <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0">inventory_2</span>
                        <span className="truncate"><strong className="text-[#25233A]">Format:</strong> {svc.format}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card CTAs */}
                  <div className={isFullSpan ? 'flex flex-col sm:flex-row lg:flex-col justify-center lg:justify-end items-stretch gap-2.5 sm:gap-3 w-full lg:w-56 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#F0EBFF]' : 'flex flex-col gap-2 mt-auto pt-2'}>
                    <button
                      type="button"
                      onClick={() => handleOpenServiceDetails(svc.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6C63FF] text-xs sm:text-sm font-bold clay-card hover:bg-[#EBE5FF] transition-all cursor-pointer"
                    >
                      <span>View Details</span>
                      <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(svc.title)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-white text-[#25233A] hover:text-[#6C63FF] text-xs font-bold clay-pill-inset transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      <span>Request Service</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Reassurance & Quality Trust Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-4 w-full max-w-7xl mx-auto">
            {/* Trust Reassurances */}
            <div className="lg:col-span-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white clay-card flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[22px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#25233A]">
                    Why Students Trust Assignment Hub
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6E6A8A] mb-4 sm:mb-6 leading-relaxed">
                  Every submission passes rigorous formatting and originality reviews before delivery to your workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[18px] sm:text-[20px] mt-0.5 shrink-0">lock</span>
                  <div>
                    <p className="text-xs sm:text-sm text-[#25233A] font-bold">100% Confidential</p>
                    <p className="text-[11px] sm:text-xs text-[#6E6A8A] leading-normal">Your identity and academic files remain strictly private.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[18px] sm:text-[20px] mt-0.5 shrink-0">rule</span>
                  <div>
                    <p className="text-xs sm:text-sm text-[#25233A] font-bold">Rubric Compliant</p>
                    <p className="text-[11px] sm:text-xs text-[#6E6A8A] leading-normal">Aligned with standard APA, IEEE, Harvard or your college format.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                  <span className="material-symbols-outlined text-[#FFB84D] text-[18px] sm:text-[20px] mt-0.5 shrink-0">alarm_on</span>
                  <div>
                    <p className="text-xs sm:text-sm text-[#25233A] font-bold">On-Time Guarantee</p>
                    <p className="text-[11px] sm:text-xs text-[#6E6A8A] leading-normal">Delivered ahead of agreed deadline for your final review.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[18px] sm:text-[20px] mt-0.5 shrink-0">support_agent</span>
                  <div>
                    <p className="text-xs sm:text-sm text-[#25233A] font-bold">Coordinator Support</p>
                    <p className="text-[11px] sm:text-xs text-[#6E6A8A] leading-normal">Direct updates and clarification throughout each stage.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Assistance Card */}
            <div className="lg:col-span-4 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-[#6C63FF] text-white clay-card flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 flex items-center justify-center text-white mb-3 sm:mb-4">
                  <span className="material-symbols-outlined text-[22px] sm:text-[24px]">contact_support</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
                  Have a unique syllabus or urgent deadline?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4 sm:mb-6">
                  Get personalized assistance from an academic coordinator who will inspect your guidelines and provide instant schedule feasibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenRequestModal('Custom Syllabus / Urgent Inquiries')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white text-[#6C63FF] text-xs sm:text-sm font-bold clay-card hover:bg-[#FAF8FF] transition-all cursor-pointer shadow-md"
              >
                <span>Contact Coordinator</span>
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE SERVICE DETAIL MODAL                       */}
      {/* ======================================================== */}
      {serviceModalOpen && selectedService && (
        <div
          className="fixed inset-0 z-50 bg-[#25233A]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setServiceModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 clay-card shadow-2xl border border-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2DCFF] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-xs font-bold mb-2 clay-pill-inset">
                  <span>{selectedService.modalBadge || selectedService.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#25233A]">
                  {selectedService.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#EDE8FA] text-[#6E6A8A] hover:text-[#25233A] flex items-center justify-center clay-card transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Section 1: What We Provide */}
              <div className="p-5 rounded-2xl bg-[#FAF8FF] clay-pill-inset">
                <h4 className="text-sm font-bold text-[#25233A] flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[20px]">task_alt</span>
                  <span>What We Provide</span>
                </h4>
                <ul className="space-y-2 text-[#6E6A8A] text-xs sm:text-sm">
                  {selectedService.provides.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#55C595] text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2: What You Need to Provide */}
              <div className="p-5 rounded-2xl bg-[#FAF8FF] clay-pill-inset">
                <h4 className="text-sm font-bold text-[#25233A] flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#5846c8] text-[20px]">upload_file</span>
                  <span>What You Need to Provide</span>
                </h4>
                <ul className="space-y-2 text-[#6E6A8A] text-xs sm:text-sm">
                  {selectedService.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0 mt-0.5">arrow_right</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3: Expected Deliverables & Specs */}
              <div>
                <h4 className="text-sm font-bold text-[#25233A] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a06900] text-[20px]">tune</span>
                  <span>Expected Deliverables & Specs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#EDE8FA] clay-pill-inset text-center">
                    <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Timeline</span>
                    <span className="text-sm font-bold text-[#25233A] mt-0.5 block">{selectedService.modalTimeline || selectedService.timeline}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EDE8FA] clay-pill-inset text-center">
                    <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Scope</span>
                    <span className="text-sm font-bold text-[#25233A] mt-0.5 block">{selectedService.modalScope || selectedService.scope}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EDE8FA] clay-pill-inset text-center">
                    <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Format</span>
                    <span className="text-sm font-bold text-[#25233A] mt-0.5 block">{selectedService.modalFormat || selectedService.format}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-6 mt-6 border-t border-[#E2DCFF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#6E6A8A] text-center sm:text-left">
                Pre-selects this service directly in your New Request flow.
              </p>
              <button
                type="button"
                onClick={() => handleRequestFromModal(selectedService.title)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md"
              >
                <span>Request This Service</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. NEW REQUEST MODAL                                     */}
      {/* ======================================================== */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#25233A]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setRequestModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#25233A]">New Academic Request</h3>
                  <p className="text-xs text-[#6E6A8A]">Tell us what work you need completed</p>
                </div>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#25233A] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Service Category</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">category</span>
                  <select
                    value={reqService}
                    onChange={(e) => setReqService(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none cursor-pointer"
                  >
                    <option value="Assignment Writing">Assignment Writing</option>
                    <option value="PPT & Presentation">PPT & Presentation</option>
                    <option value="Project Reports">Project Reports</option>
                    <option value="Engineering Drawing">Engineering Drawing</option>
                    <option value="Physics & Practical">Physics & Practical</option>
                    <option value="Coding & Technical">Coding & Technical</option>
                    <option value="Other Academic Work">Other Academic Work</option>
                    <option value="Custom Academic Request">Custom Academic Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Topic / Subject / Title</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Distributed Operating Systems Unit 3"
                    value={reqTopic}
                    onChange={(e) => setReqTopic(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Submission Deadline</label>
                  <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                    <input
                      type="date"
                      value={reqDeadline}
                      onChange={(e) => setReqDeadline(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Output Format</label>
                  <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                    <select
                      value={reqFormat}
                      onChange={(e) => setReqFormat(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none cursor-pointer"
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
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">
                  Specific Requirements or Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste teacher instructions, rubric guidelines, word limits, or special remarks..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] outline-none resize-none placeholder-[#25233A]/40 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#25233A]/70 hover:bg-[#FAF8FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md"
                >
                  Submit Academic Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#EDE8FA] py-10 md:py-12 mt-12 border-t border-[#E2DCFF]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-[#25233A] font-semibold">Assignment Hub © 2026</p>
            <p className="text-xs text-[#6E6A8A] text-center md:text-left">You give us your work — we take care of the rest.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/dashboard" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Dashboard Home
            </Link>
            <Link to="/services" className="text-xs text-[#6C63FF] font-bold transition-colors">
              Services
            </Link>
            <Link to="/my-requests" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              My Requests
            </Link>
            <Link to="/inquiries" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Inquiries & Support
            </Link>
            <Link to="/" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Landing Page ↗
            </Link>
          </div>
        </div>
      </footer>
      <MobileBottomNav activeTab="services" />
    </div>
  );
}
