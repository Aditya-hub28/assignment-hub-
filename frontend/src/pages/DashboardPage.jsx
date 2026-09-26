import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function DashboardPage() {
  const { user, profile, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

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

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (requestModalOpen) setRequestModalOpen(false);
        if (profileModalOpen) setProfileModalOpen(false);
        if (userDropdownOpen) setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestModalOpen, profileModalOpen, userDropdownOpen]);

  const handleOpenRequestModal = (serviceName = 'Assignment Writing') => {
    setReqService(serviceName);
    setRequestModalOpen(true);
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

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans text-[#25233A] relative">
      
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR (Home Active, Services links to /services) */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2DCFF]/50 shadow-[0_4px_20px_rgba(108,99,255,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Student Workspace Badge */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
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

          {/* Centered Nav Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#EDE8FA] rounded-full clay-pill-inset">
            <span
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#DCD6FF] text-[#4D41DF] shadow-sm cursor-default"
            >
              Home
            </span>
            <Link
              to="/services"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Services
            </Link>
            <Link
              to="/my-requests"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              My Requests
            </Link>
            <a
              href="#support-section"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all duration-200"
            >
              Inquiries
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenRequestModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Request</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => showToast('You have 2 pending notifications.', 'info')}
              aria-label="Notifications"
              className="relative p-2 rounded-full bg-white text-[#6E6A8A] hover:text-[#6C63FF] transition-all clay-card cursor-pointer border border-white"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A5F] text-white text-[10px] font-extrabold ring-2 ring-white">
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
      {/* 2. MAIN DASHBOARD CONTENT                                */}
      {/* ======================================================== */}
      <main className="w-full pt-28 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto flex-grow">
        <div className="flex flex-col w-full gap-10 animate-in fade-in duration-300">
          
          {/* Greeting Banner */}
          <section className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white rounded-3xl clay-card relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col gap-1.5 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#EDE8FA] text-[#FFB84D] text-xs uppercase tracking-wider font-bold">
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
                className="px-4 py-2 rounded-full bg-[#EDE8FA] hover:bg-[#E2DCFF] text-[#6C63FF] text-xs font-bold clay-card transition-all flex items-center gap-1.5 cursor-pointer"
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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#EDE8FA] flex items-center justify-center clay-card text-[#6C63FF] mb-6 shadow-md">
              <span className="material-symbols-outlined text-[42px] sm:text-[48px]">library_books</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE8FA] text-[#6E6A8A] text-xs font-bold mb-3 clay-pill-inset">
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
              <div className="p-4 rounded-2xl bg-[#FAF8FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
                <span className="material-symbols-outlined text-[#6C63FF] text-[26px]">task</span>
                <span className="text-sm font-bold text-[#25233A]">1. Submit Work</span>
                <span className="text-xs text-[#6E6A8A]">Upload prompt or files</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
                <span className="material-symbols-outlined text-[#FFB84D] text-[26px]">engineering</span>
                <span className="text-sm font-bold text-[#25233A]">2. We Execute</span>
                <span className="text-xs text-[#6E6A8A]">Specialists craft solutions</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8FF] clay-pill-inset flex flex-col items-center text-center gap-1.5">
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
              <Link
                to="/services"
                className="px-7 py-3.5 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-sm font-bold clay-card hover:bg-[#E2DCFF] transition-all cursor-pointer"
              >
                Explore Services
              </Link>
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
                <Link
                  to="/services"
                  className="px-7 py-4 rounded-full bg-white text-[#6C63FF] text-sm font-bold clay-card hover:bg-[#F3F0FF] transition-all text-center cursor-pointer"
                >
                  Explore Services
                </Link>
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
              Contact Coordinator →
            </button>
          </section>

        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. MOBILE BOTTOM NAVIGATION                              */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2DCFF] shadow-lg px-2 py-2 flex items-center justify-around">
        <span
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs text-[#6C63FF] font-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span>Home</span>
        </span>
        <Link
          to="/services"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs text-[#6E6A8A] font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
          <span>Services</span>
        </Link>
        <a
          href="#my-requests-section"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs text-[#6E6A8A] font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">task</span>
          <span>Requests</span>
        </a>
        <a
          href="#support-section"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs text-[#6E6A8A] font-medium transition-colors"
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
      {/* 4. NEW REQUEST MODAL                                     */}
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
      {/* 5. PROFILE EDIT MODAL                                    */}
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
      {/* 6. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#EDE8FA] py-10 md:py-12 mt-12 border-t border-[#E2DCFF]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-[#25233A] font-semibold">Assignment Hub © 2026</p>
            <p className="text-xs text-[#6E6A8A] text-center md:text-left">You give us your work — we take care of the rest.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/dashboard" className="text-xs text-[#6C63FF] font-bold transition-colors">
              Dashboard Home
            </Link>
            <Link to="/services" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Services
            </Link>
            <Link to="/my-requests" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              My Requests
            </Link>
            <Link to="/" className="text-xs text-[#6E6A8A] hover:text-[#6C63FF] transition-colors">
              Landing Page ↗
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
