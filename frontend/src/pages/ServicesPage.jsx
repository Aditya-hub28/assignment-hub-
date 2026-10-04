import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useServiceRequest } from '../context/ServiceRequestContext';

const ACADEMIC_SERVICES = [
  {
    id: 'writing',
    name: 'Assignment Writing',
    icon: 'edit_note',
    iconBg: 'bg-[#EAE5FF] text-[#4D41DF]',
    desc: 'Handwritten or typed collegiate assignments, coursework answers, and problem-set solutions with full citations.'
  },
  {
    id: 'coding',
    name: 'Coding Projects',
    icon: 'terminal',
    iconBg: 'bg-[#E4DFFF] text-[#5846C8]',
    desc: 'Custom software development, web applications, algorithms, clean repository setups, and bug fixes across all major tech stacks.'
  },
  {
    id: 'drawing',
    name: 'Engineering Graphics / Drawing',
    icon: 'architecture',
    iconBg: 'bg-[#F0EBFF] text-[#675DF9]',
    desc: 'CAD models, isometric views, orthographic projections, and precision engineering drawing sheets following strict standards.'
  },
  {
    id: 'physics',
    name: 'Physics / Engineering Projects',
    icon: 'precision_manufacturing',
    iconBg: 'bg-[#FFDDB3] text-[#7F5300]',
    desc: 'Hardware circuit simulations, IoT prototypes, MATLAB models, and physical science computational experiments.'
  },
  {
    id: 'presentation',
    name: 'PPT / Presentation Making',
    icon: 'slideshow',
    iconBg: 'bg-[#E4DFFE] text-[#5846C8]',
    desc: 'High-impact academic slide decks, viva defense presentations, infographic layouts, and structured speaker notes.'
  },
  {
    id: 'documentation',
    name: 'Project Reports / Documentation',
    icon: 'folder_copy',
    iconBg: 'bg-[#E3DFFF] text-[#4D41DF]',
    desc: 'Comprehensive semester project binders, capstone documentation, executive summaries, and formal appendices.'
  },
  {
    id: 'research',
    name: 'Research / Technical Reports',
    icon: 'biotech',
    iconBg: 'bg-[#FFB951] text-[#291800]',
    desc: 'Deep analytical research papers, literature reviews, dataset analysis, and journal-ready conference drafts.'
  }
];

export function ServicesPage() {
  const navigate = useNavigate();
  const { setService, updateFormData } = useServiceRequest();

  const handleSelectService = (serviceName) => {
    setService(serviceName, false);
    updateFormData({
      service: serviceName,
      isCustom: false
    });
    navigate('/services/new');
  };

  const handleCustomService = () => {
    setService('Custom Service', true);
    updateFormData({
      service: 'Custom Service',
      isCustom: true
    });
    navigate('/services/custom');
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] antialiased flex flex-col">
      {/* Agent 1 Unified Standard Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 flex-grow">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-8 sm:gap-10">
          
          {/* Top Section: Header & Custom Service Banner */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="clay-pill px-3 py-1 rounded-full bg-[#EAE5FF] text-[#4D41DF] text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                  Catalog &amp; Support
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
                Academic Services
              </h1>
              <p className="text-sm sm:text-base text-[#464555] max-w-2xl leading-relaxed">
                Select an academic service below or request a custom solution tailored to your university requirements.
              </p>
            </div>

            {/* Prominent Top Banner: Custom Service */}
            <div className="relative overflow-hidden rounded-3xl bg-[#F6F1FF] clay-card p-6 sm:p-8">
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#E4DFFF]/40 blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F0EBFF] flex items-center justify-center shrink-0 clay-pill text-[#4D41DF]">
                    <span className="material-symbols-outlined text-[28px] sm:text-[30px]">tune</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-[#1B192F]">
                      Need a different service?
                    </span>
                    <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                      Have a unique project, niche topic, or custom coursework requirement? Submit a custom brief and our academic coordinators will review it.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCustomService}
                  className="clay-btn-primary flex items-center justify-center gap-2 bg-[#4D41DF] hover:bg-[#675DF9] text-white px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm shrink-0 transition-transform active:scale-95 hover:-translate-y-0.5 cursor-pointer shadow-lg"
                  type="button"
                >
                  <span>Request Custom Service</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* Services Grid (7 bespoke service items in 4 + 3 layout) */}
          <section>
            <div className="flex flex-col gap-6">
              {/* Row 1: 4 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ACADEMIC_SERVICES.slice(0, 4).map((srv) => (
                  <article
                    key={srv.id}
                    className="flex flex-col justify-between bg-white rounded-3xl p-6 clay-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white"
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${srv.iconBg} flex items-center justify-center clay-pill`}>
                        <span className="material-symbols-outlined text-[28px]">{srv.icon}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h2 className="text-lg sm:text-xl font-bold text-[#1B192F] leading-snug">
                          {srv.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                          {srv.desc}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 mt-4">
                      <button
                        onClick={() => handleSelectService(srv.name)}
                        className="clay-btn-primary w-full flex items-center justify-center gap-2 bg-[#4D41DF] hover:bg-[#675DF9] text-white py-3 px-4 rounded-full font-bold text-xs sm:text-sm transition-transform active:scale-95 hover:-translate-y-0.5 cursor-pointer shadow-md"
                        type="button"
                      >
                        <span>Request Service</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Row 2: 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ACADEMIC_SERVICES.slice(4).map((srv) => (
                  <article
                    key={srv.id}
                    className="flex flex-col justify-between bg-white rounded-3xl p-6 clay-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white"
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${srv.iconBg} flex items-center justify-center clay-pill`}>
                        <span className="material-symbols-outlined text-[28px]">{srv.icon}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h2 className="text-lg sm:text-xl font-bold text-[#1B192F] leading-snug">
                          {srv.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                          {srv.desc}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 mt-4">
                      <button
                        onClick={() => handleSelectService(srv.name)}
                        className="clay-btn-primary w-full flex items-center justify-center gap-2 bg-[#4D41DF] hover:bg-[#675DF9] text-white py-3 px-4 rounded-full font-bold text-xs sm:text-sm transition-transform active:scale-95 hover:-translate-y-0.5 cursor-pointer shadow-md"
                        type="button"
                      >
                        <span>Request Service</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Callout: Trust & Integrity Reassurance */}
          <aside className="flex justify-center pb-4">
            <div className="clay-pill inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#F0EBFF] text-[#464555] text-center max-w-full">
              <span className="material-symbols-outlined text-[#4D41DF] text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="text-xs sm:text-sm font-medium">
                All services strictly follow university academic integrity standards and are confidential.
              </span>
            </div>
          </aside>

        </div>
      </main>

      {/* Agent 3 Fixed Mobile Claymorphic Dock */}
      <MobileBottomNav activePath="services" />
    </div>
  );
}

export default ServicesPage;
