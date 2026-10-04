import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useServiceRequest } from '../context/ServiceRequestContext';
import { useToast } from '../context/ToastContext';

const SERVICES_CONFIG = [
  { id: 'writing', name: 'Assignment Writing', icon: 'edit_document', badge: 'Writing Mode' },
  { id: 'coding', name: 'Coding Projects', icon: 'terminal', badge: 'Coding Mode' },
  { id: 'presentation', name: 'PPT / Presentation', icon: 'slideshow', badge: 'Presentation Mode' },
  { id: 'engineering', name: 'Engineering Graphics', icon: 'draw', badge: 'Drafting Mode' },
  { id: 'physics', name: 'Physics / Lab Projects', icon: 'science', badge: 'Laboratory Mode' },
  { id: 'report', name: 'Research / Tech Reports', icon: 'menu_book', badge: 'Research Mode' }
];

export function ServiceRequestFormPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const { formData, updateFormData, setService, addFiles, removeFile } = useServiceRequest();

  const [dragActive, setDragActive] = useState(false);

  // Derive total size of uploaded files
  const totalSizeBytes = (formData.files || []).reduce((acc, f) => acc + (f.size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const progressPercent = Math.min(100, Math.round((totalSizeBytes / (50 * 1024 * 1024)) * 100));

  const currentServiceConfig = SERVICES_CONFIG.find(
    (s) => s.name.toLowerCase() === (formData.service || '').toLowerCase()
  ) || SERVICES_CONFIG[0];

  const handleServiceSelect = (serviceName) => {
    setService(serviceName, false);
    updateFormData({ service: serviceName, isCustom: false });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleContinueToReview = () => {
    if (!formData.title || formData.title.trim().length < 3) {
      showToast('Please enter an assignment topic or project name (at least 3 characters)', 'error');
      return;
    }
    if (!formData.subject || formData.subject.trim().length < 2) {
      showToast('Please enter the subject or course code', 'error');
      return;
    }
    if (!formData.deadline) {
      showToast('Please choose a submission deadline date', 'error');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      showToast('Please enter assignment details or prompt (at least 10 characters)', 'error');
      return;
    }

    navigate('/services/review');
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('ah_saved_draft', JSON.stringify(formData));
      showToast('Draft successfully saved to your browser session!', 'success');
    } catch {
      showToast('Could not save draft.', 'error');
    }
  };

  // Helper icon for file extension
  const getFileIcon = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return { icon: 'picture_as_pdf', bg: 'bg-[#FFDAD6] text-[#93000A]' };
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return { icon: 'folder_zip', bg: 'bg-[#FFDDB3] text-[#7F5300]' };
    if (['png', 'jpg', 'jpeg'].includes(ext)) return { icon: 'image', bg: 'bg-[#E4DFFF] text-[#5846C8]' };
    return { icon: 'description', bg: 'bg-[#EAE5FF] text-[#4D41DF]' };
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] antialiased flex flex-col">
      <Navbar />

      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-8">
          
          {/* Navigation & Stepper Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Back Breadcrumb */}
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-[#464555] hover:text-[#4D41DF] transition-all font-bold text-sm group w-fit"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                <span>Back to Services</span>
                <span className="text-[#C7C4D8]">/</span>
                <span className="text-[#1B192F] font-bold">New Request</span>
              </Link>

              {/* Stepper Indicator */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F6F1FF] clay-pill w-fit self-start sm:self-auto shadow-inner">
                {/* Step 1 (Active) */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4D41DF] text-white shadow-md">
                  <span className="w-5 h-5 rounded-full bg-white text-[#4D41DF] text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span className="font-bold text-xs sm:text-sm">Fill Requirements</span>
                </div>
                <div className="w-3 h-[2px] bg-[#C7C4D8] rounded-full hidden md:block"></div>
                {/* Step 2 */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[#464555] opacity-70">
                  <span className="w-5 h-5 rounded-full bg-[#F0EBFF] text-[#464555] text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span className="font-bold text-xs sm:text-sm hidden sm:inline">Review Request</span>
                </div>
                <div className="w-3 h-[2px] bg-[#C7C4D8] rounded-full hidden md:block"></div>
                {/* Step 3 */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[#464555] opacity-70">
                  <span className="w-5 h-5 rounded-full bg-[#F0EBFF] text-[#464555] text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span className="font-bold text-xs sm:text-sm hidden sm:inline">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Page Headline Section */}
            <div className="flex flex-col gap-1.5 pt-1 text-left">
              <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] text-[10px] sm:text-xs font-bold tracking-wider uppercase clay-pill">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                Academic Service Specifier
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
                Submit Your Academic Request
              </h1>
              <p className="text-sm sm:text-base text-[#464555] max-w-3xl leading-relaxed">
                Provide your assignment specifications, rubric criteria, and reference files. Our coordinators ensure strict alignment with your university standards.
              </p>
            </div>
          </div>

          {/* Two-Column Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Primary Form Column (8 Cols on LG) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* SECTION 1: Core Details */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-6 border border-white">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EBFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E4DFFF] flex items-center justify-center text-[#5846C8] clay-pill">
                      <span className="material-symbols-outlined text-[20px]">assignment</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1B192F]">1. Core Assignment Scope</h2>
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#464555] uppercase tracking-wider bg-[#F0EBFF] px-3 py-1 rounded-full font-bold">
                    Mandatory Specifications
                  </span>
                </div>

                {/* Service Selection Pills */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1B192F] flex items-center justify-between">
                    <span>Selected Academic Service <span className="text-red-500">*</span></span>
                    <span className="text-xs text-[#464555] font-normal">Switch dynamically adjusts requirements</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#F6F1FF] clay-pill-inset">
                    {SERVICES_CONFIG.map((srv) => {
                      const isActive = (formData.service || '').toLowerCase() === srv.name.toLowerCase();
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleServiceSelect(srv.name)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                            isActive
                              ? 'bg-[#4D41DF] text-white shadow-md'
                              : 'text-[#464555] hover:text-[#1B192F] hover:bg-white/60'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{srv.icon}</span>
                          <span>{srv.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Two Column Common Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment Name */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-[#1B192F]" htmlFor="assignment-topic">
                      Assignment / Project Name or Topic <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#777587] text-[20px] pointer-events-none">
                        menu_book
                      </span>
                      <input
                        id="assignment-topic"
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        placeholder="e.g. Distributed Database Architectures & Replication Schemes"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all placeholder:text-[#777587]/60"
                      />
                    </div>
                  </div>

                  {/* Subject / Course Code */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1B192F]" htmlFor="course-code">
                      Subject / Course Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#777587] text-[20px] pointer-events-none">
                        school
                      </span>
                      <input
                        id="course-code"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => updateFormData({ subject: e.target.value })}
                        placeholder="e.g. Computer Science CS402 / Database Systems"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all placeholder:text-[#777587]/60"
                      />
                    </div>
                  </div>

                  {/* Submission Deadline */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1B192F]" htmlFor="submission-deadline">
                      Submission Deadline <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#777587] text-[20px] pointer-events-none">
                        alarm
                      </span>
                      <input
                        id="submission-deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => updateFormData({ deadline: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Dynamic Service-Specific Requirements */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-6 border border-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EBFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E3DFFF] flex items-center justify-center text-[#4D41DF] clay-pill">
                      <span className="material-symbols-outlined text-[20px]">dynamic_form</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1B192F]">2. Service-Specific Requirements</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F0EBFF] px-4 py-1.5 rounded-full self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-[#4D41DF] animate-pulse"></span>
                    <span className="text-xs text-[#1B192F] font-bold uppercase tracking-wider">
                      {currentServiceConfig.badge}
                    </span>
                  </div>
                </div>

                {/* Panel: Assignment Writing */}
                {currentServiceConfig.id === 'writing' && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#1B192F]">
                          Number of Pages / Estimated Words <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-4 text-[#777587] text-[20px]">
                            description
                          </span>
                          <input
                            type="text"
                            value={formData.serviceSpecific?.numberOfPages || ''}
                            onChange={(e) => updateFormData({ serviceSpecific: { numberOfPages: e.target.value } })}
                            placeholder="e.g. 12 Pages (~3,000 words)"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#1B192F]">
                          Writing Delivery Format <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Typed (Doc/PDF)', 'Handwritten Notes'].map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => updateFormData({ serviceSpecific: { deliveryFormat: fmt } })}
                              className={`p-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                formData.serviceSpecific?.deliveryFormat === fmt
                                  ? 'bg-[#E3DFFF] text-[#4D41DF] shadow-inner font-extrabold'
                                  : 'bg-[#F6F1FF] text-[#464555] hover:bg-[#F0EBFF]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {fmt.includes('Typed') ? 'keyboard' : 'stylus'}
                              </span>
                              <span>{fmt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        College Format / Citation Standard <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['Course Syllabus Template', 'IEEE Academic Style', 'APA 7th Edition'].map((cit) => (
                          <button
                            key={cit}
                            type="button"
                            onClick={() => updateFormData({ serviceSpecific: { citationStandard: cit } })}
                            className={`p-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                              formData.serviceSpecific?.citationStandard === cit
                                ? 'bg-[#E3DFFF] text-[#4D41DF] shadow-inner'
                                : 'bg-[#F6F1FF] text-[#464555] hover:bg-[#F0EBFF]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">
                              {formData.serviceSpecific?.citationStandard === cit ? 'check_circle' : 'article'}
                            </span>
                            <span>{cit}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel: Coding Projects */}
                {currentServiceConfig.id === 'coding' && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#1B192F]">
                          Primary Tech Stack &amp; Libraries <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.serviceSpecific?.techStack || ''}
                          onChange={(e) => updateFormData({ serviceSpecific: { techStack: e.target.value } })}
                          placeholder="e.g. Python, FastAPI, PostgreSQL, Docker"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#1B192F]">Starter Git Repository (Optional)</label>
                        <input
                          type="text"
                          value={formData.serviceSpecific?.gitRepo || ''}
                          onChange={(e) => updateFormData({ serviceSpecific: { gitRepo: e.target.value } })}
                          placeholder="https://github.com/organization/course-repo"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[#F6F1FF]">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#1B192F]">
                        <input
                          type="checkbox"
                          checked={!!formData.serviceSpecific?.includeUnitTests}
                          onChange={(e) => updateFormData({ serviceSpecific: { includeUnitTests: e.target.checked } })}
                          className="w-4 h-4 accent-[#4D41DF] rounded"
                        />
                        <span>Include Unit Test Suite (PyTest / Jest)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#1B192F]">
                        <input
                          type="checkbox"
                          checked={!!formData.serviceSpecific?.includeSetupDocs}
                          onChange={(e) => updateFormData({ serviceSpecific: { includeSetupDocs: e.target.checked } })}
                          className="w-4 h-4 accent-[#4D41DF] rounded"
                        />
                        <span>Generate Architecture README &amp; Setup Docs</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Panel: PPT / Presentation */}
                {currentServiceConfig.id === 'presentation' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Target Slide Count <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.slideCount || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { slideCount: e.target.value } })}
                        placeholder="e.g. 15 Slides + Speaker Notes"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Slide Delivery Format <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.slideFormat || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { slideFormat: e.target.value } })}
                        placeholder="PowerPoint (.pptx) & PDF Export"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Panel: Engineering Graphics */}
                {currentServiceConfig.id === 'engineering' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Drafting Software / Tool standard <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.softwareTool || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { softwareTool: e.target.value } })}
                        placeholder="AutoCAD DWG, SolidWorks, or Printable Sheet"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Projection Method <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.projectionMethod || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { projectionMethod: e.target.value } })}
                        placeholder="First Angle / Third Angle projection"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Panel: Physics / Lab Projects */}
                {currentServiceConfig.id === 'physics' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Experiment / Lab Apparatus Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.experimentType || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { experimentType: e.target.value } })}
                        placeholder="e.g. Optics & Spectroscopy / Circuit Simulation"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#1B192F]">
                        <input
                          type="checkbox"
                          checked={!!formData.serviceSpecific?.includeCalculations}
                          onChange={(e) => updateFormData({ serviceSpecific: { includeCalculations: e.target.checked } })}
                          className="w-4 h-4 accent-[#4D41DF] rounded"
                        />
                        <span>Include Complete Calculation Derivations &amp; Graphs</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Panel: Research / Technical Reports */}
                {currentServiceConfig.id === 'report' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Research Domain / Specialization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.domainArea || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { domainArea: e.target.value } })}
                        placeholder="e.g. Distributed Computing, Bio-informatics"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]">
                        Target Journal / Template Standard <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serviceSpecific?.targetJournalStandard || ''}
                        onChange={(e) => updateFormData({ serviceSpecific: { targetJournalStandard: e.target.value } })}
                        placeholder="IEEE Two-Column, Springer LNCS, or University Thesis"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Prompt & Requirements Textarea */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#1B192F]" htmlFor="assignment-prompt">
                      Description / Assignment Questions / Prompt <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-[#464555]">
                      {(formData.description || '').length} / 2000 chars
                    </span>
                  </div>
                  <textarea
                    id="assignment-prompt"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe your assignment prompt, specific questions to answer, rubric criteria, and any instructions from your professor..."
                    className="w-full p-4 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all leading-relaxed placeholder:text-[#777587]/60"
                  />
                </div>
              </section>

              {/* SECTION 3: Multi-File Upload Experience */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-6 border border-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EBFF]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E4DFFF] flex items-center justify-center text-[#5846C8] clay-pill">
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1B192F]">3. Reference &amp; Guidelines Files</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#464555]">Storage Pool:</span>
                    <span className="px-3 py-1 rounded-full bg-[#F0EBFF] text-[#1B192F] text-xs font-bold clay-pill">
                      Max 50 MB total
                    </span>
                  </div>
                </div>

                {/* Drag and Drop Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[#F6F1FF] transition-all cursor-pointer clay-pill-inset hover:bg-[#F0EBFF] ${
                    dragActive ? 'ring-2 ring-[#4D41DF] bg-[#EDE8FA]' : ''
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar"
                  />
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#4D41DF] clay-card mb-3 group-hover:scale-105 transition-transform shadow-md">
                    <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#1B192F] mb-1">
                    Drag &amp; drop reference files here, or <span className="text-[#4D41DF] underline">Browse Files</span>
                  </p>
                  <p className="text-xs sm:text-sm text-[#464555] max-w-md mb-4">
                    Upload course syllabi, lecture slides, professor notes, grading rubrics, or boilerplate zip files.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                    {['PDF', 'DOC / DOCX', 'PPT / PPTX', 'Images (PNG/JPG)', 'ZIP / RAR'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white text-[#464555] text-[10px] sm:text-xs font-bold shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Total Size Tracker */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1B192F] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">folder_zip</span>
                      Attached Assets: {(formData.files || []).length} files
                    </span>
                    <span className="text-[#464555] font-normal">
                      {totalSizeMB} MB of 50 MB ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#F6F1FF] clay-pill-inset overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4D41DF] to-[#7161E3] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {(formData.files || []).length > 0 && (
                  <div className="flex flex-col gap-3">
                    {formData.files.map((file, idx) => {
                      const iconData = getFileIcon(file.name);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white clay-card border border-white"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${iconData.bg} flex items-center justify-center shrink-0 clay-pill`}>
                              <span className="material-symbols-outlined text-[22px]">{iconData.icon}</span>
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="font-bold text-xs sm:text-sm text-[#1B192F] truncate">
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-[#464555]">
                                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <span>•</span>
                                <span className="text-[#4D41DF] font-semibold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  Ready to review
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="w-8 h-8 rounded-full bg-[#F6F1FF] text-[#464555] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* SECTION 4: Additional Instructions & Mentor Notes */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-4 border border-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E4DFFF] flex items-center justify-center text-[#5846C8] clay-pill">
                    <span className="material-symbols-outlined text-[20px]">notes</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#1B192F]">
                    4. Academic Mentor &amp; Coordinator Notes
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#464555]">
                  Share instructor preferences, lecture focus nuances, or past feedback points to factor into the final delivery.
                </p>
                <textarea
                  rows={3}
                  value={formData.additionalInstructions || ''}
                  onChange={(e) => updateFormData({ additionalInstructions: e.target.value })}
                  placeholder="e.g. Professor Smith strictly penalizes missing latency units in the comparison chart. Please emphasize CAP theorem trade-offs in Section 3..."
                  className="w-full p-4 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all placeholder:text-[#777587]/60"
                />
              </section>

              {/* SECTION 5: Actions & Submission Area */}
              <div className="flex flex-col gap-4 pt-2 pb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Primary Submit CTA */}
                  <button
                    type="button"
                    onClick={handleContinueToReview}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#4D41DF] hover:bg-[#675DF9] text-white font-bold text-base transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg active:scale-95"
                  >
                    <span>Continue to Review</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  {/* Secondary Save Draft */}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto px-6 py-4 rounded-full bg-white text-[#1B192F] font-bold text-sm clay-card hover:bg-[#FAF8FF] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                    <span>Save Draft</span>
                  </button>
                </div>

                {/* Trust Badges Strip */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-[#464555] text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">lock</span>
                    <span>Strict FERPA Encryption</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#C7C4D8]"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">verified</span>
                    <span>Zero Plagiarism Guarantee</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#C7C4D8]"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">psychology</span>
                    <span>Subject Specialists Reviewed</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right/Sidebar Sticky Column (4 Cols on LG) */}
            <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
              
              {/* Live Request Summary Clay Card */}
              <div className="rounded-3xl bg-white p-6 clay-card flex flex-col gap-5 border border-white">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xl font-bold text-[#1B192F]">Configuration Digest</h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D41DF] animate-ping"></span>
                </div>

                {/* Dynamic Overview Entries */}
                <div className="flex flex-col gap-3">
                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <div className="flex items-center gap-2 text-[#464555] text-xs font-bold">
                      <span className="material-symbols-outlined text-[18px]">category</span>
                      <span>Selected Service</span>
                    </div>
                    <span className="text-xs sm:text-sm text-[#4D41DF] font-extrabold text-right">
                      {formData.service || 'Assignment Writing'}
                    </span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <div className="flex items-center gap-2 text-[#464555] text-xs font-bold">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>Deadline Target</span>
                    </div>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold text-right">
                      {formData.deadline || 'Pending selection'}
                    </span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <div className="flex items-center gap-2 text-[#464555] text-xs font-bold">
                      <span className="material-symbols-outlined text-[18px]">format_size</span>
                      <span>Requested Scope</span>
                    </div>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold text-right truncate max-w-[140px]">
                      {formData.serviceSpecific?.numberOfPages || formData.serviceSpecific?.slideCount || 'Standard Scope'}
                    </span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <div className="flex items-center gap-2 text-[#464555] text-xs font-bold">
                      <span className="material-symbols-outlined text-[18px]">attach_file</span>
                      <span>Attached Files</span>
                    </div>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold text-right">
                      {(formData.files || []).length} files ({totalSizeMB} MB)
                    </span>
                  </div>
                </div>

                {/* Academic Assurance Notification */}
                <div className="p-4 rounded-2xl bg-[#E3DFFF]/50 text-[#1B192F] flex items-start gap-3 shadow-inner">
                  <span className="material-symbols-outlined text-[#4D41DF] text-[22px] shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                      No Upfront Commitment
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#464555] leading-snug">
                      Your requirement package is thoroughly reviewed by academic desk coordinators before any schedule or confirmation is finalized.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Academic Mentor / Support Desk Card */}
              <div className="rounded-3xl bg-white p-6 clay-card flex flex-col gap-4 border border-white">
                <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-[#4D41DF] to-[#7161E3] flex flex-col justify-end p-4 text-white shadow-inner relative overflow-hidden">
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">support_agent</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">Support Desk</span>
                  <span className="text-lg font-bold text-white">Direct Academic Coordinator Chat</span>
                </div>
                <p className="text-xs text-[#464555] leading-relaxed">
                  Have specific formatting guidelines or ambiguous professor instructions? Once submitted, a coordinator reviews your brief within 1 hour.
                </p>
              </div>

            </aside>

          </div>

        </div>
      </main>

      <MobileBottomNav activePath="services" />
    </div>
  );
}

export default ServiceRequestFormPage;
