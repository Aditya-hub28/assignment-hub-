import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { isAuthenticated, user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  // Scrollspy & navigation syncing
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      const sectionIds = ['hero', 'services', 'how-it-works', 'benefits', 'faqs'];
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      setMobileMenuOpen(false);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, null, `#${id}`);
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'faqs', label: 'FAQs' },
  ];

  const services = [
    {
      icon: 'edit_note',
      title: 'Assignments',
      desc: 'Handwritten & typed collegiate coursework structured to exact academic standards with neat formatting.',
      color: 'bg-primary/10 text-primary',
      badge: 'Most Popular'
    },
    {
      icon: 'folder_copy',
      title: 'Practical Files',
      desc: 'Complete lab records with calculations, clean flowcharts, precise graphs, and viva question preps.',
      color: 'bg-secondary/15 text-secondary',
      badge: 'Lab Ready'
    },
    {
      icon: 'memory',
      title: 'Mini Projects',
      desc: 'Turnkey hardware & software working prototypes with full documentation, circuit schematics, and code.',
      color: 'bg-[#FFE5EB] text-tertiary',
      badge: 'Turnkey'
    },
    {
      icon: 'biotech',
      title: 'Physics Projects',
      desc: 'Derivations, working models, experimental setups, circuit diagrams, and comprehensive theory notes.',
      color: 'bg-[#EDFBF4] text-success',
      badge: 'Experimental'
    },
    {
      icon: 'architecture',
      title: 'Engineering Drawing',
      desc: 'Accurate CAD sheets, isometric views, orthographic projections, and clean manual drafting submissions.',
      color: 'bg-[#F3F0FF] text-primary',
      badge: 'Precision CAD'
    },
    {
      icon: 'terminal',
      title: 'Coding Projects',
      desc: 'Full-stack apps, clean bug-free algorithms, database schemas, API integrations, and code documentation.',
      color: 'bg-secondary/15 text-secondary',
      badge: 'Full Stack'
    },
    {
      icon: 'school',
      title: 'Other College Services',
      desc: 'Synopses, seminar presentations, research review essays, and tailored viva defense notes.',
      color: 'bg-[#EDFBF4] text-success',
      badge: 'Custom Help'
    },
    {
      icon: 'more_horiz',
      title: 'Custom Academic Tasks',
      desc: 'Specialized collegiate requirements, custom rubrics, paper submissions, or interdisciplinary projects.',
      color: 'bg-primary/10 text-primary',
      badge: 'Flexible'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Share Requirements',
      desc: 'Tell us your topic, deadline, page count, and format preferences via our easy request form.'
    },
    {
      step: '02',
      title: 'Academic Matching',
      desc: 'We assign a dedicated subject specialist tailored to your specific university guidelines.'
    },
    {
      step: '03',
      title: 'Precision Crafting',
      desc: 'Your solution is prepared strictly adhering to college rubrics and verified for quality.'
    },
    {
      step: '04',
      title: 'On-Time Delivery',
      desc: 'Download your final submission files directly with guaranteed confidential delivery.'
    }
  ];

  const benefits = [
    {
      icon: 'lock',
      title: '100% Confidential',
      desc: 'Your personal info, campus identity, and submission files remain strictly encrypted and private.'
    },
    {
      icon: 'timer',
      title: 'Always On Time',
      desc: 'We never miss a college deadline. Express turnarounds available for urgent deadlines.'
    },
    {
      icon: 'verified',
      title: 'Quality Guaranteed',
      desc: 'Crafted with precision to meet collegiate evaluation criteria and faculty standards.'
    },
    {
      icon: 'savings',
      title: 'Student-Friendly Pricing',
      desc: 'Affordable, transparent quotes designed specifically for undergraduate & postgraduate budgets.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Academic Support',
      desc: 'Got a question about your project? Our academic coordinators are available round the clock.'
    },
    {
      icon: 'replay',
      title: 'Free Reasonable Revisions',
      desc: 'Need minor adjustments according to faculty feedback? We refine it promptly at no extra charge.'
    }
  ];

  const faqs = [
    {
      q: 'How do I place an order for my college assignment?',
      a: 'Simply log in to your Student Dashboard, select your service (Assignments, Practical Files, Projects, etc.), enter your topic name, deadline, and instructions, and submit. Our academic coordinators review it immediately.'
    },
    {
      q: 'Will my identity and university details remain confidential?',
      a: 'Absolutely. We treat academic privacy with the highest priority. Your email, mobile number, campus name, and submitted materials are strictly private and never shared.'
    },
    {
      q: 'Can I get handwritten assignments as well as soft copies?',
      a: 'Yes! You can choose between Digital Softcopies (PDF, Word, ZIP) or Handwritten Hardcopy format depending on what your college faculty accepts.'
    },
    {
      q: 'What if I need adjustments after receiving my work?',
      a: 'We offer free reasonable revisions based on your teacher\'s specific rubric feedback to make sure your work meets exact college expectations.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-sans text-[#25233A] overflow-x-hidden">
      {/* ======================================================== */}
      {/* FLOATING CLAY NAVBAR */}
      {/* ======================================================== */}
      <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full px-5 py-3 md:py-3.5 flex items-center justify-between shadow-[8px_12px_26px_rgba(108,99,255,0.12),-5px_-5px_15px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_5px_rgba(108,99,255,0.06)] border border-white/80 transition-all">
          
          {/* Logo */}
          <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0 border border-[#6C63FF]/20">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#25233A]">Assignment<span className="text-[#6C63FF]">Hub</span></span>
              <span className="text-[10px] font-bold text-[#8B7CFF] -mt-1 hidden sm:block tracking-wider uppercase">College Solutions</span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-[#FAF8FF] p-1.5 rounded-full shadow-[inset_2px_2px_5px_rgba(108,99,255,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] border border-white/50">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-4 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-200 font-bold ${
                    isActive
                      ? 'bg-[#6C63FF] text-white shadow-[0_4px_10px_rgba(108,99,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                      : 'text-[#25233A]/70 hover:text-[#6C63FF]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="clay-btn px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#6C63FF] rounded-full shadow-[0_6px_18px_rgba(108,99,255,0.4),inset_0_2px_3px_rgba(255,255,255,0.35)] hover:bg-[#5b52f5] flex items-center space-x-2"
              >
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="clay-btn px-5 py-2 text-xs sm:text-sm font-bold text-[#25233A] bg-white rounded-full shadow-[3px_4px_12px_rgba(108,99,255,0.1),-2px_-2px_8px_#ffffff,inset_1px_1px_2px_rgba(255,255,255,0.9)] hover:text-[#6C63FF] border border-white/60"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="clay-btn px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#6C63FF] rounded-full shadow-[0_6px_18px_rgba(108,99,255,0.4),inset_0_2px_3px_rgba(255,255,255,0.35)] hover:bg-[#5b52f5] flex items-center space-x-1.5"
                >
                  <span>Sign Up</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="clay-btn px-3 py-1.5 text-xs font-bold text-white bg-[#6C63FF] rounded-full shadow-[0_4px_12px_rgba(108,99,255,0.35)]"
            >
              {isAuthenticated ? "App" : "Join"}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white shadow-[3px_4px_10px_rgba(108,99,255,0.12),inset_1px_1px_2px_#ffffff] text-[#25233A]"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white rounded-3xl p-5 shadow-[8px_14px_30px_rgba(108,99,255,0.14)] border border-white/80 space-y-3">
            <div className="flex flex-col space-y-2">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-[#F3F0FF] text-[#6C63FF]'
                      : 'text-[#25233A] hover:bg-[#FAF8FF]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-[#F3F0FF] flex space-x-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#6C63FF] rounded-xl">
                  Open Student Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-1/2 text-center py-2.5 text-sm font-bold text-[#25233A] bg-[#FAF8FF] rounded-xl">Login</Link>
                  <Link to="/signup" className="w-1/2 text-center py-2.5 text-sm font-bold text-white bg-[#6C63FF] rounded-xl shadow-[0_4px_12px_rgba(108,99,255,0.35)]">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* SECTION 1: HERO */}
      {/* ======================================================== */}
      <section id="hero" className="scroll-mt-36 relative pt-16 sm:pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#8B7CFF]/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#FFB84D]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white shadow-[3px_4px_10px_rgba(108,99,255,0.1),inset_1px_1px_2px_#ffffff] border border-white/60 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#55C595] animate-pulse"></span>
              <span className="text-xs sm:text-sm font-bold text-[#25233A]">Academic Lifeline for Indian Students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#25233A] leading-[1.15]">
              You give us your work — <br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B7CFF] to-[#FF6584] bg-clip-text text-transparent">
                we take care of the rest.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#25233A]/70 max-w-2xl leading-relaxed">
              Assignments, practical records, working hardware & software mini projects, physics models, CAD drawing sheets, and complete presentation packs — delivered strictly before your college deadline.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto clay-btn px-8 py-4 text-base font-extrabold text-white bg-[#6C63FF] rounded-full shadow-[0_10px_26px_rgba(108,99,255,0.42),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.2)] hover:bg-[#5b52f5] flex items-center justify-center space-x-2"
              >
                <span>{isAuthenticated ? "Enter Workspace" : "Get Started Now"}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <a
                href="#services"
                onClick={(e) => scrollToSection(e, 'services')}
                className="w-full sm:w-auto clay-btn px-7 py-4 text-base font-bold text-[#25233A] bg-white rounded-full shadow-[6px_8px_18px_rgba(108,99,255,0.1),-4px_-4px_12px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.9)] hover:text-[#6C63FF] text-center"
              >
                Browse Services
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-semibold text-[#25233A]/80">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#55C595] text-[20px]">verified</span>
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#6C63FF] text-[20px]">schedule</span>
                <span>On-Time Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#FFB84D] text-[20px]">grade</span>
                <span>4.9/5 Student Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Claymorphic Student Workspace Illustration & Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-6 sm:pt-8 lg:pt-4">
            <div className="relative w-full max-w-lg lg:max-w-none rounded-[2.5rem] bg-white p-3 sm:p-4 shadow-[12px_20px_45px_rgba(108,99,255,0.16),-8px_-8px_24px_#ffffff,inset_3px_3px_6px_rgba(255,255,255,0.95),inset_-3px_-3px_8px_rgba(108,99,255,0.08)] border border-white">
              <div className="relative rounded-[2rem] overflow-hidden bg-[#FAF8FF]">
                <img
                  src="/images/study-workspace.png"
                  alt="3D Clay Study Desk"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6C63FF]/10 via-transparent to-white/20 pointer-events-none"></div>
              </div>

              {/* Floating Clay Pill: Timely Delivery */}
              <div className="animate-float absolute -bottom-5 -left-4 sm:-bottom-6 sm:-left-6 bg-white px-4 py-3 rounded-2xl shadow-[8px_12px_24px_rgba(108,99,255,0.16),-4px_-4px_12px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.9)] border border-white flex items-center space-x-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-[#55C595]/20 flex items-center justify-center text-[#55C595]">
                  <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#25233A]">On-Time Submissions</p>
                  <p className="text-[11px] font-semibold text-[#55C595]">100% Deadline Guarantee</p>
                </div>
              </div>

              {/* Floating Clay Pill: Top Grade GPA */}
              <div className="animate-float-alt absolute -top-4 -right-3 sm:-top-5 sm:-right-5 bg-white px-4 py-2.5 rounded-2xl shadow-[8px_12px_24px_rgba(108,99,255,0.16),-4px_-4px_12px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.9)] border border-white flex items-center space-x-2.5 z-20">
                <div className="w-8 h-8 rounded-xl bg-[#FFB84D]/25 flex items-center justify-center text-[#FFB84D] font-extrabold text-sm">
                  ★
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#25233A]">Academic Quality</p>
                  <p className="text-xs font-extrabold text-[#6C63FF]">A Grade (94%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: SERVICES */}
      {/* ======================================================== */}
      <section id="services" className="scroll-mt-32 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white shadow-sm border border-white/60 text-xs font-bold text-[#6C63FF] mb-3">
            Academic Catalog
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight">
            Everything your curriculum demands.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#25233A]/70">
            From handwritten notebooks to complex working prototypes — choose your discipline and we'll take over.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="clay-card rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF8FF] text-[#25233A]/70 border border-[#E2DCFF]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#25233A] mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#25233A]/70 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F3F0FF] flex items-center justify-between">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="text-xs font-bold text-[#6C63FF] hover:text-[#5b52f5] flex items-center gap-1"
                >
                  <span>Request Service</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: HOW IT WORKS */}
      {/* ======================================================== */}
      <section id="how-it-works" className="scroll-mt-32 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="clay-surface rounded-3xl p-8 sm:p-12 md:p-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">Hassle-Free Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight mt-1">
              How Assignment Hub Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#25233A]/70">
              Four simple steps between your college deadline stress and complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white shadow-sm flex flex-col relative">
                <span className="text-3xl font-extrabold text-[#6C63FF]/30 mb-2">{st.step}</span>
                <h4 className="text-base font-bold text-[#25233A] mb-1.5">{st.title}</h4>
                <p className="text-xs text-[#25233A]/70 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: BENEFITS */}
      {/* ======================================================== */}
      <section id="benefits" className="scroll-mt-32 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#55C595] uppercase tracking-wider">The Assignment Hub Standard</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight mt-1">
            Built for college peace of mind
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#25233A]/70">
            Why students across Delhi-NCR and India rely on us every semester.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((bn, idx) => (
            <div key={idx} className="clay-card rounded-3xl p-6 sm:p-8 flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F3F0FF] flex items-center justify-center text-[#6C63FF] shadow-sm">
                <span className="material-symbols-outlined text-[26px]">{bn.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-[#25233A]">{bn.title}</h3>
              <p className="text-xs sm:text-sm text-[#25233A]/70 leading-relaxed">{bn.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: FAQS */}
      {/* ======================================================== */}
      <section id="faqs" className="scroll-mt-32 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#FFB84D] uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="clay-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#25233A] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className={`material-symbols-outlined text-[22px] text-[#6C63FF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#25233A]/70 leading-relaxed border-t border-[#F3F0FF] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* CTA BANNER */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="clay-surface rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center relative overflow-hidden">
          <span className="text-xs uppercase tracking-wider text-[#6C63FF] font-bold">Never Miss a Deadline Again</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] mt-2 mb-4 tracking-tight">
            Ready to hand over your coursework?
          </h2>
          <p className="text-sm sm:text-base text-[#25233A]/70 max-w-xl mb-8">
            Join thousands of smart college students. Create your free student account in 30 seconds.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/signup"}
            className="clay-btn px-8 py-4 rounded-full bg-[#6C63FF] text-white font-extrabold text-sm sm:text-base shadow-[0_8px_24px_rgba(108,99,255,0.4)] hover:bg-[#5b52f5] flex items-center gap-2"
          >
            <span>{isAuthenticated ? "Go to My Dashboard" : "Register Free Student Account"}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#F3F0FF] py-12 mt-12 border-t border-[#E2DCFF]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-base font-extrabold text-[#25233A]">Assignment<span className="text-[#6C63FF]">Hub</span></span>
            <p className="text-xs text-[#25233A]/70">You give us your work — we take care of the rest.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#25233A]/70">
            <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="hover:text-[#6C63FF]">Home</a>
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-[#6C63FF]">Services</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-[#6C63FF]">How It Works</a>
            <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')} className="hover:text-[#6C63FF]">Benefits</a>
            <a href="#faqs" onClick={(e) => scrollToSection(e, 'faqs')} className="hover:text-[#6C63FF]">FAQs</a>
            <Link to="/terms" className="hover:text-[#6C63FF]">Terms</Link>
            <Link to="/privacy-policy" className="hover:text-[#6C63FF]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

