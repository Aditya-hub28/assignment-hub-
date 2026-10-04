import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { Navbar } from '../components/Navbar';
import { ServiceRequestModal } from '../components/ServiceRequestModal';

// Comprehensive Service Catalog supporting the 7 core academic services
const serviceDetailsData = {
  writing: {
    id: 'writing',
    category: 'writing',
    title: 'Assignment Writing',
    badge: 'Core Academic',
    modalBadge: 'Core Academic Deliverable',
    icon: 'edit_document',
    iconColor: 'text-[#6C63FF]',
    desc: 'Academic assignment preparation including research, structured written answers, citations, diagrams when required, and final document delivery.',
    timeline: '1–3 days',
    scope: '5–25 pages',
    format: 'Word doc & Formatted PDF',
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
  coding: {
    id: 'coding',
    category: 'technical',
    title: 'Coding Projects',
    badge: 'Source & Testing',
    modalBadge: 'Source & Testing',
    icon: 'terminal',
    iconColor: 'text-[#6C63FF]',
    desc: 'Custom software development, programming tasks, bug fixing, test suite implementation, comprehensive README setup guides, and code walkthroughs.',
    timeline: '2–5 days',
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
  drawing: {
    id: 'drawing',
    category: 'labs',
    title: 'Engineering Graphics / Drawing',
    badge: 'CAD & Sheets',
    modalBadge: 'CAD & Sheet Drafting',
    icon: 'architecture',
    iconColor: 'text-[#6C63FF]',
    desc: 'Preparation of precision engineering drawing sheets according to provided dimensions, orthographic/isometric projections, and CAD drafting.',
    timeline: '2–4 days',
    scope: 'Isometric / Ortho / CAD',
    format: 'DWG / DXF & Scaled PDF',
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
    title: 'Physics / Engineering Projects',
    badge: 'Viva & Calculations',
    modalBadge: 'Viva & Calculations',
    icon: 'science',
    iconColor: 'text-[#a06900]',
    desc: 'Physics lab write-ups, practical file records, calculation proofs, observation tables, simulation models, and viva-voce examination preparation.',
    timeline: '1–3 days',
    scope: 'Complete Lab Journal',
    format: 'Written / Typed Practical File',
    modalTimeline: '1–3 Days',
    modalScope: 'Complete Lab Journal',
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
  presentation: {
    id: 'presentation',
    category: 'presentations',
    title: 'PPT / Presentation Making',
    badge: 'Quick Turnaround',
    modalBadge: 'Visual Decks & Speaker Notes',
    icon: 'slideshow',
    iconColor: 'text-[#675df9]',
    desc: 'Professional presentation slide decks with high-impact layouts, custom infographics, structured topic flow, and comprehensive presenter speaker notes.',
    timeline: '1–2 days',
    scope: '8–25 slides',
    format: '16:9 Widescreen PPTX & PDF',
    modalTimeline: '1–2 Days',
    modalScope: '8–25 Slides',
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
    title: 'Project Reports / Documentation',
    badge: 'Comprehensive',
    modalBadge: 'University Formatted Report',
    icon: 'menu_book',
    iconColor: 'text-[#5846c8]',
    desc: 'Complete academic project documentation: abstract, literature survey, system methodology, architecture diagrams, results, and citations.',
    timeline: '3–6 days',
    scope: '20–60+ pages',
    format: 'University Formatted Report',
    modalTimeline: '3–6 Days',
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
  research: {
    id: 'research',
    category: 'writing',
    title: 'Research / Technical Reports',
    badge: 'Peer Reviewed Format',
    modalBadge: 'Research & Citations',
    icon: 'analytics',
    iconColor: 'text-[#4338CA]',
    desc: 'High-level research papers, survey papers, technical reviews, and literature critiques with IEEE / APA citation standards and plagiarism compliance.',
    timeline: '3–7 days',
    scope: 'Journal / Conference Standard',
    format: 'IEEE / APA Formatted PDF & LaTeX',
    modalTimeline: '3–7 Days',
    modalScope: 'Journal / Conference Standard',
    modalFormat: 'IEEE / APA Formatted PDF',
    provides: [
      'Rigorous research methodology with deep literature review across recent publications.',
      'Mathematical model formulation, comparative benchmarks, and empirical analysis.',
      'Precise citation management in BibTeX, IEEE, or APA 7th format.',
      'Turnitin originality verification ensuring low similarity index.'
    ],
    requirements: [
      'Target conference/journal template or course research problem statement.',
      'Key reference seed papers or dataset links if applicable.',
      'Required formatting guidelines (single column, double column IEEE, word count).'
    ]
  }
};

export function ServicesPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Category filter state
  const [activeCategory, setActiveCategory] = useState('all');

  // Service Details Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // New Request Modal state (Multi-step wizard)
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqService, setReqService] = useState('Assignment Writing');
  const [isCustomReq, setIsCustomReq] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (serviceModalOpen) setServiceModalOpen(false);
        if (requestModalOpen) setRequestModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [serviceModalOpen, requestModalOpen]);

  const handleOpenRequestModal = (serviceName = 'Assignment Writing', isCustom = false) => {
    setReqService(serviceName);
    setIsCustomReq(isCustom);
    setRequestModalOpen(true);
  };

  const handleOpenServiceDetails = (serviceKey) => {
    const data = serviceDetailsData[serviceKey] || serviceDetailsData.writing;
    setSelectedService(data);
    setServiceModalOpen(true);
  };

  const handleRequestFromModal = (serviceTitle) => {
    setServiceModalOpen(false);
    handleOpenRequestModal(serviceTitle, false);
  };

  // Category filters
  const categoryFilters = [
    { id: 'all', label: 'All Services (7)' },
    { id: 'writing', label: 'Writing & Reports' },
    { id: 'presentations', label: 'Presentations' },
    { id: 'technical', label: 'Coding Projects' },
    { id: 'labs', label: 'Engineering & Labs' }
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
      {/* 1. TOP NAVBAR (Maintained as required)                   */}
      {/* ======================================================== */}
      <Navbar onNewRequest={() => handleOpenRequestModal('Assignment Writing', false)} />

      {/* ======================================================== */}
      {/* 2. DEDICATED ACADEMIC SERVICES PAGE CONTENT              */}
      {/* ======================================================== */}
      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-grow flex flex-col items-center">
        <div className="flex flex-col items-center w-full relative animate-in fade-in duration-300">
          
          {/* Ambient Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-12 -left-16 w-80 h-80 bg-[#6C63FF]/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#FFB84D]/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-[#5846c8]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Header & Hero Intro */}
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-xs font-bold clay-pill-inset mb-3">
              <span className="material-symbols-outlined text-[16px] text-[#FFB84D]">auto_awesome</span>
              <span>ACADEMIC CATALOGUE & DELIVERABLES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#25233A] tracking-tight mb-3">
              Academic Services
            </h1>
            <p className="text-sm sm:text-base text-[#6E6A8A] max-w-2xl leading-relaxed font-medium">
              Get your university work completed with clear guidelines, transparent timelines, and structured deliverable reviews.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 w-full max-w-7xl mx-auto">
            {filteredServices.map((svc) => (
              <article
                key={svc.id}
                className="flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white clay-card transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="min-w-0 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F3F0FF] flex items-center justify-center clay-pill-inset group-hover:scale-105 transition-transform shrink-0">
                      <span
                        className={`material-symbols-outlined text-[24px] sm:text-[28px] ${svc.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {svc.icon}
                      </span>
                    </div>

                    <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#F3F0FF] text-[#6C63FF] clay-pill-inset shrink-0 whitespace-nowrap">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#25233A] mb-1.5 sm:mb-2 leading-snug">{svc.title}</h3>

                  <p className="text-xs sm:text-sm text-[#6E6A8A] leading-relaxed mb-4 sm:mb-6 min-h-[40px]">
                    {svc.desc}
                  </p>

                  {/* Specs List */}
                  <div className="space-y-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 p-2 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset min-w-0">
                      <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0">schedule</span>
                      <span className="truncate"><strong className="text-[#25233A]">Timeline:</strong> {svc.timeline}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl sm:rounded-2xl bg-[#F3F0FF] text-[#6E6A8A] text-xs font-semibold clay-pill-inset min-w-0">
                      <span className="material-symbols-outlined text-[#6C63FF] text-[18px] shrink-0">
                        {svc.id === 'presentation' ? 'co_present' : svc.id === 'reports' ? 'auto_stories' : svc.id === 'coding' ? 'data_object' : svc.id === 'drawing' ? 'draw' : svc.id === 'physics' ? 'biotech' : svc.id === 'research' ? 'analytics' : 'description'}
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
                <div className="flex flex-col gap-2 mt-auto pt-2">
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
                    onClick={() => handleOpenRequestModal(svc.title, false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-white text-[#25233A] hover:text-[#6C63FF] text-xs font-bold clay-pill-inset transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Request Service</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* ======================================================== */}
          {/* DEDICATED "NEED A DIFFERENT SERVICE? / CUSTOM SERVICE"   */}
          {/* ======================================================== */}
          <div className="w-full max-w-7xl mx-auto mb-10">
            <div className="p-6 sm:p-8 rounded-3xl bg-white clay-card border border-[#E2DCFF]/70 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF6E5] text-[#FFB84D] flex items-center justify-center clay-pill-inset shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    design_services
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#EDE8FA] text-[#6C63FF] clay-pill-inset">
                      Custom Academic Option
                    </span>
                    <span className="text-xs text-[#55C595] font-bold">● Flexible Rubric</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#25233A] tracking-tight">
                    Need a different service?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E6A8A] max-w-2xl font-medium leading-relaxed">
                    Have a unique departmental assignment, cross-disciplinary project, custom dataset analysis, or specialized syllabus requirements? Submit a custom service request tailored to your exact guidelines.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenRequestModal('Custom Service', true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  <span>Request Custom Service</span>
                </button>
              </div>
            </div>
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
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFB84D] text-[#1B192F] p-3 rounded-xl clay-pill-inset">
                  <span className="material-symbols-outlined text-[#7F5300] text-[18px] sm:text-[20px] mt-0.5 shrink-0">alarm_on</span>
                  <div>
                    <p className="text-xs sm:text-sm text-[#291800] font-bold">On-Time Guarantee</p>
                    <p className="text-[11px] sm:text-xs text-[#523B00] leading-normal">Delivered ahead of agreed deadline for your final review.</p>
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
                  Have an urgent deadline or specific prompt?
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed mb-4 sm:mb-6">
                  Submit your custom service requirement right now with your reference files, and our coordinators will begin inspection immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenRequestModal('Custom Service', true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white text-[#6C63FF] text-xs sm:text-sm font-bold clay-card hover:bg-[#FAF8FF] transition-all cursor-pointer shadow-md"
              >
                <span>Request Custom Service</span>
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
      {/* 5. MULTI-STEP SERVICE REQUEST MODAL                      */}
      {/* ======================================================== */}
      <ServiceRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        initialService={reqService}
        isCustomService={isCustomReq}
      />

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
