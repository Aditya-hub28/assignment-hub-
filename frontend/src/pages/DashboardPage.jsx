import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Comprehensive Service Catalog Database for the Interactive Modal & Grid
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

export function DashboardPage() {
  const { user, profile, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active section for scrollspy
  const [activeTab, setActiveTab] = useState('dashboard-home');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Category filter state for Academic Services
  const [activeCategory, setActiveCategory] = useState('all');

  // Service Details Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Profile modal edit state
  const [editName, setEditName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // New Request modal state
  const [reqService, setReqService] = useState('Assignment Writing');
  const [reqTopic, setReqTopic] = useState('');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqFormat, setReqFormat] = useState('Digital PDF / Docs');
  const [reqNotes, setReqNotes] = useState('');

  // Fallback defaults
  const fullName = profile?.fullName || user?.email?.split('@')[0] || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';
  const initial = (fullName.charAt(0) || 'A').toUpperCase();
  const collegeName = profile?.college?.name || 'Default College Campus';
  const email = profile?.email || user?.email || 'student@college.edu';
  const mobile = profile?.mobile ? `+91 ${profile.mobile}` : '-';

  // Initialize profile name in modal
  useEffect(() => {
    if (fullName) {
      setEditName(fullName);
    }
  }, [fullName]);

  // Set default deadline date (2 days from now)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setReqDeadline(d.toISOString().split('T')[0]);
  }, []);

  // Check URL hash on initial render (e.g. #services-section)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const targetId = hash === 'services' ? 'services-section' : hash;
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveTab(targetId);
        }, 150);
      }
    }
  }, []);

  // Scrollspy detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      const sectionIds = ['dashboard-home', 'services-section', 'my-requests-section', 'support-section'];
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (serviceModalOpen) setServiceModalOpen(false);
        if (requestModalOpen) setRequestModalOpen(false);
        if (profileModalOpen) setProfileModalOpen(false);
        if (userDropdownOpen) setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [serviceModalOpen, requestModalOpen, profileModalOpen, userDropdownOpen]);

  const scrollToTab = (e, tabId) => {
    e.preventDefault();
    setActiveTab(tabId);
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, null, `#${tabId}`);
    }
  };

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ full_name: editName.trim() });
      setProfileModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { id: 'dashboard-home', label: 'Home' },
    { id: 'services-section', label: 'Services' },
    { id: 'my-requests-section', label: 'My Requests' },
    { id: 'support-section', label: 'Inquiries' }
  ];

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
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans text-[#25233A] relative">
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR (Refined Navbar & Single CTA) */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/90 backdrop-blur-xl border-b border-[#E2DCFF]/50 shadow-[0_4px_20px_rgba(108,99,255,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Student Workspace Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
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

            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset">
              Student Workspace
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F0FF] rounded-full clay-pill-inset">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToTab(e, link.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#6C63FF] shadow-sm'
                      : 'text-[#6E6A8A] hover:text-[#25233A]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Primary CTA: + New Request */}
            <button
              onClick={() => handleOpenRequestModal()}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Request</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => showToast('You have 2 pending notifications.', 'info')}
              aria-label="Notifications"
              className="relative p-2 rounded-full bg-white text-[#6E6A8A] hover:text-[#6C63FF] transition-all clay-card cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB84D] text-[#25233A] text-[10px] font-extrabold ring-2 ring-white">
                2
              </span>
            </button>

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
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">person</span>
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#FFB84D]">settings</span>
                    <span>Account Settings</span>
                  </button>
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
      {/* 2. MAIN DASHBOARD CONTENT */}
      {/* ======================================================== */}
      <main className="w-full pt-28 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col w-full gap-12">
          
          {/* Greeting Banner */}
          <section
            id="dashboard-home"
            className="scroll-mt-28 w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white rounded-3xl clay-card relative overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col gap-1.5 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#F3F0FF] text-[#FFB84D] text-xs uppercase tracking-wider font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FFB84D] animate-pulse"></span> Academic Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight">
                Good morning, <span>{firstName}</span> <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
              </h1>
              <p className="text-base sm:text-lg text-[#6E6A8A] font-medium">
                What work would you like us to handle for you today?
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2.5 z-10">
              <div className="flex items-center gap-1.5 text-[#6E6A8A] text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] text-[#55C595]">verified_user</span>
                <span>Guaranteed confidential & on-time delivery</span>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#F3F0FF] hover:bg-[#EBE5FF] text-[#6C63FF] text-xs font-bold clay-card transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>{collegeName}</span>
              </button>
            </div>
          </section>

          {/* Zero Active Submissions / Empty State Section */}
          <section
            id="my-requests-section"
            className="scroll-mt-28 flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-3xl bg-white clay-card w-full relative overflow-hidden"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#E2DCFF] flex items-center justify-center clay-card text-[#6C63FF] mb-6 shadow-md">
              <span className="material-symbols-outlined text-[42px] sm:text-[48px]">library_books</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#6E6A8A] text-xs font-bold mb-3 clay-pill-inset">
              Zero Active Submissions
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight">
              No requests yet
            </h2>

            <p className="text-sm sm:text-base text-[#6E6A8A] max-w-lg mt-2 leading-relaxed font-medium">
              Send us your work and our team will take care of it. Sit back, relax, and let our academic specialists handle your deadlines.
            </p>

            {/* 3-Step Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl my-8">
              <div className="p-4 rounded-2xl bg-[#F3F0FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
                <span className="material-symbols-outlined text-[#6C63FF] text-[26px]">task</span>
                <span className="text-sm font-bold text-[#25233A]">1. Submit Work</span>
                <span className="text-xs text-[#6E6A8A]">Upload prompt or files</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F3F0FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
                <span className="material-symbols-outlined text-[#FFB84D] text-[26px]">engineering</span>
                <span className="text-sm font-bold text-[#25233A]">2. We Execute</span>
                <span className="text-xs text-[#6E6A8A]">Specialists craft solutions</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F3F0FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
                <span className="material-symbols-outlined text-[#55C595] text-[26px]">cloud_done</span>
                <span className="text-sm font-bold text-[#25233A]">3. Download</span>
                <span className="text-xs text-[#6E6A8A]">On-time guaranteed delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => handleOpenRequestModal()}
                className="px-8 py-3.5 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:scale-105 active:scale-95 transition-all text-center cursor-pointer shadow-lg"
              >
                + New Request
              </button>
              <a
                href="#services-section"
                onClick={(e) => scrollToTab(e, 'services-section')}
                className="px-7 py-3.5 rounded-full bg-[#EBE5FF] text-[#6C63FF] text-sm font-bold clay-card hover:bg-[#E2DCFF] transition-all cursor-pointer"
              >
                Explore Services
              </a>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION: ACADEMIC SERVICES (Full-Width Category Bar) */}
          {/* ======================================================== */}
          <section id="services-section" className="scroll-mt-28 flex flex-col w-full relative">
            
            {/* Ambient Glows */}
            <div className="absolute -top-12 -left-16 w-80 h-80 bg-[#6C63FF]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#FFB84D]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-[#5846c8]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Section Header & Hero Intro */}
            <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F0FF] text-[#6C63FF] text-xs font-bold clay-pill-inset mb-3">
                <span className="material-symbols-outlined text-[16px] text-[#FFB84D]">auto_awesome</span>
                <span>CATALOGUE & DELIVERABLES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#25233A] tracking-tight mb-3">
                Academic Services
              </h2>
              <p className="text-sm sm:text-base text-[#6E6A8A] max-w-2xl leading-relaxed font-medium">
                Get your academic work completed with clear requirements, transparent timelines, and organized university-grade delivery.
              </p>
            </div>

            {/* FULL-WIDTH CLAY CATEGORY BAR */}
            <div className="w-full max-w-7xl mx-auto p-2 sm:p-3 my-6 sm:my-8 rounded-2xl md:rounded-full bg-[#EDE8FA] border border-white/80 shadow-[0_10px_25px_-5px_rgba(108,99,255,0.08),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(108,99,255,0.08)] overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-start md:justify-center gap-2.5 sm:gap-4 flex-nowrap whitespace-nowrap w-full px-2 sm:px-4">
                {categoryFilters.map((cat) => {
                  const isCatActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`shrink-0 whitespace-nowrap px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm tracking-normal transition-all duration-200 cursor-pointer ${
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

            {/* SERVICES GRID (7 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {filteredServices.map((svc) => {
                const isFullSpan = svc.id === 'other';
                return (
                  <article
                    key={svc.id}
                    className={`flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-white clay-card transition-all duration-300 hover:-translate-y-1.5 group ${
                      isFullSpan ? 'md:col-span-2 lg:col-span-3 lg:flex-row items-stretch gap-6' : ''
                    }`}
                  >
                    <div className={isFullSpan ? 'flex-1' : ''}>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#F3F0FF] flex items-center justify-center clay-pill-inset group-hover:scale-105 transition-transform">
                            <span
                              className={`material-symbols-outlined text-[28px] ${svc.iconColor}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {svc.icon}
                            </span>
                          </div>
                          {isFullSpan && (
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold text-[#25233A]">{svc.title}</h3>
                              <p className="text-xs text-[#6E6A8A] font-semibold">{svc.subtitle}</p>
                            </div>
                          )}
                        </div>

                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3F0FF] text-[#6C63FF] clay-pill-inset shrink-0">
                          {svc.badge}
                        </span>
                      </div>

                      {!isFullSpan && (
                        <h3 className="text-xl font-bold text-[#25233A] mb-2">{svc.title}</h3>
                      )}

                      <p className={`text-xs sm:text-sm text-[#6E6A8A] leading-relaxed mb-6 ${isFullSpan ? 'max-w-3xl' : ''}`}>
                        {svc.desc}
                      </p>

                      {/* Specs List */}
                      <div className={`space-y-2 mb-6 ${isFullSpan ? 'grid grid-cols-1 sm:grid-cols-3 gap-2.5 space-y-0' : ''}`}>
                        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset">
                          <span className="material-symbols-outlined text-[#6C63FF] text-[18px]">schedule</span>
                          <span><strong className="text-[#25233A]">Timeline:</strong> {svc.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset">
                          <span className="material-symbols-outlined text-[#6C63FF] text-[18px]">
                            {svc.id === 'presentation' ? 'co_present' : svc.id === 'reports' ? 'auto_stories' : svc.id === 'coding' ? 'data_object' : svc.id === 'drawing' ? 'draw' : svc.id === 'physics' ? 'biotech' : 'description'}
                          </span>
                          <span><strong className="text-[#25233A]">Scope:</strong> {svc.scope}</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset">
                          <span className="material-symbols-outlined text-[#6C63FF] text-[18px]">inventory_2</span>
                          <span><strong className="text-[#25233A]">Format:</strong> {svc.format}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className={isFullSpan ? 'flex lg:flex-col justify-end items-center gap-3 lg:w-56 shrink-0 pt-4 lg:pt-0' : 'flex flex-col gap-2 mt-auto'}>
                      <button
                        type="button"
                        onClick={() => handleOpenServiceDetails(svc.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#F3F0FF] text-[#6C63FF] text-xs sm:text-sm font-bold clay-card hover:bg-[#EBE5FF] transition-all cursor-pointer"
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRequestModal(svc.title)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-white text-[#25233A] hover:text-[#6C63FF] text-xs font-bold clay-pill-inset transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Request Service</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* REASSURANCE & QUALITY TRUST SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-4">
              
              {/* Trust Card */}
              <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl bg-white clay-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="material-symbols-outlined text-[#6C63FF] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified_user
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#25233A]">
                      Why Students Trust Assignment Hub
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6E6A8A] mb-6">
                    Every submission passes rigorous formatting and originality reviews before delivery to your workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                    <span className="material-symbols-outlined text-[#6C63FF] text-[20px] mt-0.5">lock</span>
                    <div>
                      <p className="text-sm text-[#25233A] font-bold">100% Confidential</p>
                      <p className="text-xs text-[#6E6A8A]">Your identity and academic files remain strictly private.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                    <span className="material-symbols-outlined text-[#6C63FF] text-[20px] mt-0.5">rule</span>
                    <div>
                      <p className="text-sm text-[#25233A] font-bold">Rubric Compliant</p>
                      <p className="text-xs text-[#6E6A8A]">Aligned with standard APA, IEEE, Harvard or your college format.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                    <span className="material-symbols-outlined text-[#FFB84D] text-[20px] mt-0.5">alarm_on</span>
                    <div>
                      <p className="text-sm text-[#25233A] font-bold">On-Time Guarantee</p>
                      <p className="text-xs text-[#6E6A8A]">Delivered ahead of agreed deadline for your final review.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset">
                    <span className="material-symbols-outlined text-[#6C63FF] text-[20px] mt-0.5">support_agent</span>
                    <div>
                      <p className="text-sm text-[#25233A] font-bold">Coordinator Support</p>
                      <p className="text-xs text-[#6E6A8A]">Direct updates and clarification throughout each stage.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Assistance Clay Card */}
              <div className="lg:col-span-4 p-6 md:p-8 rounded-3xl bg-[#6C63FF] text-white clay-card flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white mb-4">
                    <span className="material-symbols-outlined text-[24px]">contact_support</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Have a unique syllabus or urgent deadline?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                    Get personalized assistance from an academic coordinator who will inspect your guidelines and provide instant schedule feasibility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenRequestModal('Custom Syllabus / Urgent Inquiries')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white text-[#6C63FF] text-xs sm:text-sm font-bold clay-card hover:bg-[#FAF8FF] transition-all cursor-pointer shadow-md"
                >
                  <span>Contact Academic Coordinator</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

            </div>
          </section>

          {/* Refined Single CTA Banner ("Unburden Your Schedule") */}
          <section className="w-full rounded-3xl bg-gradient-to-br from-[#EBE5FF] to-[#E2DCFF] p-8 md:p-10 clay-card relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex flex-col gap-3 text-center md:text-left max-w-xl">
                <span className="text-xs uppercase tracking-wider text-[#6C63FF] font-bold">Unburden Your Schedule</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight">
                  Have work you need done?
                </h2>
                <p className="text-base text-[#6E6A8A] font-medium">
                  Send us your requirements and files. Our team will take care of the rest.
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white clay-pill-inset text-xs text-[#25233A] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-[#6C63FF]">verified</span> 100% Confidential
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white clay-pill-inset text-xs text-[#25233A] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-[#6C63FF]">rule</span> Rubric Compliant
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white clay-pill-inset text-xs text-[#25233A] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-[#6C63FF]">bolt</span> Fast Turnaround
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <button
                  onClick={() => handleOpenRequestModal()}
                  className="px-8 py-4 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:scale-105 active:scale-95 transition-all text-center cursor-pointer shadow-lg"
                >
                  + New Request
                </button>
                <a
                  href="#services-section"
                  onClick={(e) => scrollToTab(e, 'services-section')}
                  className="px-7 py-4 rounded-full bg-white text-[#6C63FF] text-sm font-bold clay-card hover:bg-[#F3F0FF] transition-all text-center cursor-pointer"
                >
                  Explore Services
                </a>
              </div>
            </div>
          </section>

          {/* Support / Inquiries Compact Box */}
          <section
            id="support-section"
            className="scroll-mt-28 flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white clay-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center text-[#FFB84D] clay-card shrink-0">
                <span className="material-symbols-outlined text-[28px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-[#25233A]">Need help with a request?</h3>
                <p className="text-xs sm:text-sm text-[#6E6A8A] mt-0.5 leading-relaxed">
                  Have a question about your work, payment, or delivery? Our academic coordinators are available 24/7.
                </p>
              </div>
            </div>
            <button
              onClick={() => showToast('Academic live desk: support@assignmenthub.in (24/7 Live Desk)', 'info')}
              className="px-6 py-3 rounded-full bg-[#EBE5FF] text-[#6C63FF] text-sm font-bold clay-card hover:bg-[#E2DCFF] transition-all shrink-0 cursor-pointer"
            >
              View Inquiries →
            </button>
          </section>

        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. MOBILE BOTTOM NAVIGATION (Fixed) */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2DCFF] shadow-lg px-2 py-2 flex items-center justify-around">
        <a
          href="#dashboard-home"
          onClick={(e) => scrollToTab(e, 'dashboard-home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs transition-colors ${
            activeTab === 'dashboard-home' ? 'text-[#6C63FF] font-bold' : 'text-[#6E6A8A] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span>Home</span>
        </a>
        <a
          href="#services-section"
          onClick={(e) => scrollToTab(e, 'services-section')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs transition-colors ${
            activeTab === 'services-section' ? 'text-[#6C63FF] font-bold' : 'text-[#6E6A8A] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
          <span>Services</span>
        </a>
        <a
          href="#my-requests-section"
          onClick={(e) => scrollToTab(e, 'my-requests-section')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs transition-colors ${
            activeTab === 'my-requests-section' ? 'text-[#6C63FF] font-bold' : 'text-[#6E6A8A] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">task</span>
          <span>Requests</span>
        </a>
        <a
          href="#support-section"
          onClick={(e) => scrollToTab(e, 'support-section')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs transition-colors ${
            activeTab === 'support-section' ? 'text-[#6C63FF] font-bold' : 'text-[#6E6A8A] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>Inquiries</span>
        </a>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs text-[#6E6A8A] font-medium transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE SERVICE DETAIL MODAL */}
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#6C63FF] text-xs font-bold mb-2 clay-pill-inset">
                  <span>{selectedService.modalBadge || selectedService.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#25233A]">
                  {selectedService.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#F3F0FF] text-[#6E6A8A] hover:text-[#25233A] flex items-center justify-center clay-card transition-colors cursor-pointer"
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
                  <div className="p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset text-center">
                    <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Timeline</span>
                    <span className="text-sm font-bold text-[#25233A] mt-0.5 block">{selectedService.modalTimeline || selectedService.timeline}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset text-center">
                    <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Scope</span>
                    <span className="text-sm font-bold text-[#25233A] mt-0.5 block">{selectedService.modalScope || selectedService.scope}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F3F0FF] clay-pill-inset text-center">
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
      {/* 5. NEW REQUEST MODAL */}
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
      {/* 6. PROFILE EDIT MODAL */}
      {/* ======================================================== */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#25233A]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#25233A]">Student Profile</h3>
                  <p className="text-xs text-[#6E6A8A]">Manage your account details</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#25233A] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Full Name</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#25233A] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Email Address</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#25233A]">{email}</span>
                  <span className="text-[10px] font-bold text-[#55C595] bg-[#EDFBF4] px-2 py-0.5 rounded-md">Verified</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Mobile Number</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#25233A]">{mobile}</span>
                  <span className="text-[10px] font-bold text-[#6C63FF] bg-[#F3F0FF] px-2 py-0.5 rounded-md">Registered</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Assigned College Campus</label>
                <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex items-center">
                  <span className="text-sm font-bold text-[#6C63FF]">{collegeName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="text-xs font-bold text-[#BA1A1A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign out of this session</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#25233A]/70 hover:bg-[#FAF8FF] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FOOTER */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#F3F0FF] py-10 md:py-12 mt-12 border-t border-[#E2DCFF]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-[#25233A] font-semibold">Assignment Hub © 2026</p>
            <p className="text-xs text-[#6E6A8A] text-center md:text-left">You give us your work — we take care of the rest.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#dashboard-home" onClick={(e) => scrollToTab(e, 'dashboard-home')} className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors cursor-pointer">
              Dashboard Home
            </a>
            <a href="#services-section" onClick={(e) => scrollToTab(e, 'services-section')} className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors cursor-pointer">
              Services
            </a>
            <a href="#my-requests-section" onClick={(e) => scrollToTab(e, 'my-requests-section')} className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors cursor-pointer">
              My Requests
            </a>
            <a href="#support-section" onClick={(e) => scrollToTab(e, 'support-section')} className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors cursor-pointer">
              Inquiries & Support
            </a>
            <Link to="/" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Landing Page ↗
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
