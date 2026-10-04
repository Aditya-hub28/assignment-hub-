import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useServiceRequest } from '../context/ServiceRequestContext';
import { useToast } from '../context/ToastContext';

export function CustomServiceRequestPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const { formData, updateFormData, addFiles, removeFile } = useServiceRequest();

  const [dragActive, setDragActive] = useState(false);

  // Derive total size of uploaded files
  const totalSizeBytes = (formData.files || []).reduce((acc, f) => acc + (f.size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const progressPercent = Math.min(100, Math.round((totalSizeBytes / (50 * 1024 * 1024)) * 100));

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
    const serviceName = formData.customServiceName || formData.title;
    if (!serviceName || serviceName.trim().length < 3) {
      showToast('Please enter your custom service requirement name', 'error');
      return;
    }
    if (!formData.deadline) {
      showToast('Please specify a target due date', 'error');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      showToast('Please enter a detailed description of your custom requirements', 'error');
      return;
    }

    updateFormData({
      isCustom: true,
      service: 'Custom Service',
      customServiceName: serviceName,
      title: serviceName,
      subject: formData.subject || 'Custom Multidisciplinary Project'
    });

    navigate('/services/review');
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('ah_saved_custom_draft', JSON.stringify(formData));
      showToast('Custom draft saved successfully!', 'success');
    } catch {
      showToast('Failed to save draft.', 'error');
    }
  };

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
          
          {/* Breadcrumb & Step Tracker */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 font-bold text-sm text-[#464555] hover:text-[#4D41DF] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Services</span>
              <span className="text-[#C7C4D8]">/</span>
              <span className="text-[#1B192F]">Custom Service Request</span>
            </Link>

            {/* Visual Step Progress Indicator */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#F6F1FF] clay-pill self-start md:self-auto shadow-inner">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4D41DF] text-white shadow-md">
                <span className="w-4 h-4 rounded-full bg-white text-[#4D41DF] text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs sm:text-sm font-bold">Fill Brief</span>
              </div>
              <div className="w-4 h-0.5 bg-[#C7C4D8]/60 mx-1.5 rounded-full"></div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[#464555] opacity-70">
                <span className="w-4 h-4 rounded-full bg-[#F0EBFF] text-[#464555] text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs sm:text-sm font-bold hidden sm:inline">Review</span>
              </div>
              <div className="w-4 h-0.5 bg-[#C7C4D8]/60 mx-1.5 rounded-full"></div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[#464555] opacity-70">
                <span className="w-4 h-4 rounded-full bg-[#F0EBFF] text-[#464555] text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs sm:text-sm font-bold hidden sm:inline">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Header Block */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] text-[10px] sm:text-xs uppercase tracking-wider font-bold clay-pill">
                CUSTOM ACADEMIC BRIEF • BESPOKE INTAKE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
              Submit a Custom Service Request
            </h1>
            <p className="text-sm sm:text-base text-[#464555] max-w-3xl leading-relaxed">
              Have a unique project, niche topic, or cross-disciplinary requirement? Describe your brief below and our academic desk coordinators will review it promptly.
            </p>
          </div>

          {/* Main Two-Column Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Primary Intake Form */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Section A: Custom Requirement Details */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-6 border border-white">
                <div className="flex items-center justify-between border-b border-[#F0EBFF] pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E3DFFF] flex items-center justify-center text-[#4D41DF] clay-pill">
                      <span className="material-symbols-outlined text-[20px]">edit_document</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1B192F]">Requirement Details</h2>
                  </div>
                  <span className="text-xs text-[#464555]">* Mandatory fields</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Field 1: Service / Requirement Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1B192F] flex items-center justify-between" htmlFor="req-name">
                      <span>Service / Requirement Name <span className="text-red-500">*</span></span>
                      <span className="text-xs text-[#464555] font-normal">e.g. Thesis Chapter, Simulation, Lab Analysis</span>
                    </label>
                    <input
                      id="req-name"
                      type="text"
                      value={formData.customServiceName || formData.title || ''}
                      onChange={(e) => updateFormData({ customServiceName: e.target.value, title: e.target.value })}
                      placeholder="e.g. Computational Fluid Dynamics Simulation & Case Analysis Report"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
                    />
                  </div>

                  {/* Field 2: Subject / Topic */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1B192F]" htmlFor="subject-topic">
                      Subject / Topic <span className="text-xs text-[#464555] font-normal">(optional)</span>
                    </label>
                    <input
                      id="subject-topic"
                      type="text"
                      value={formData.subject || ''}
                      onChange={(e) => updateFormData({ subject: e.target.value })}
                      placeholder="e.g. Aerospace Engineering / Viscous Flow Dynamics"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
                    />
                  </div>

                  {/* Field 3: Target Due Date & Timezone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]" htmlFor="deadline-date">
                        Target Due Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#777587] pointer-events-none text-[20px]">
                          calendar_today
                        </span>
                        <input
                          id="deadline-date"
                          type="date"
                          value={formData.deadline || ''}
                          onChange={(e) => updateFormData({ deadline: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-[#1B192F]" htmlFor="deadline-time">
                        Time &amp; Deadline Window
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[#777587] pointer-events-none text-[20px]">
                          schedule
                        </span>
                        <input
                          id="deadline-time"
                          type="text"
                          value={formData.deadlineTime || '11:59 PM EST'}
                          onChange={(e) => updateFormData({ deadlineTime: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Field 4: Detailed Description / Requirements */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#1B192F]" htmlFor="req-desc">
                        Detailed Description / Requirements <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-[#464555] font-medium">
                        {(formData.description || '').length} / 3000 chars
                      </span>
                    </div>
                    <textarea
                      id="req-desc"
                      rows={6}
                      value={formData.description || ''}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      placeholder="Describe the full methodology, software/tool requirements, specific deliverables expected, constraints, reference rubrics, or academic guidelines..."
                      className="w-full p-4 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm sm:text-base clay-pill-inset focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all leading-relaxed placeholder:text-[#777587]/60 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Reference Files & Upload */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 clay-card flex flex-col gap-6 border border-white">
                <div className="flex items-center justify-between border-b border-[#F0EBFF] pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E4DFFF] flex items-center justify-center text-[#5846C8] clay-pill">
                      <span className="material-symbols-outlined text-[20px]">attachment</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1B192F]">Reference Files &amp; Datasets</h2>
                  </div>
                  <span className="text-xs text-[#4D41DF] font-bold">Max: 50 MB</span>
                </div>

                {/* Drag & Drop Clay Upload Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative rounded-2xl bg-[#F6F1FF] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 clay-pill-inset hover:bg-[#F0EBFF] ${
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
                  <div className="w-16 h-16 rounded-full bg-white text-[#4D41DF] flex items-center justify-center clay-card mb-3 group-hover:scale-105 transition-transform shadow-md">
                    <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#1B192F] mb-1">
                    Drag &amp; drop reference files here, or <span className="text-[#4D41DF] underline">Browse Files</span>
                  </p>
                  <p className="text-xs sm:text-sm text-[#464555] max-w-md mb-4">
                    Supports: PDF, DOC, DOCX, PPT, PPTX, Images (PNG/JPG), ZIP, RAR
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white text-[#464555] text-xs font-bold shadow-sm">
                      Single &amp; Multi-file
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-[#464555] text-xs font-bold shadow-sm">
                      Secure Cloud Sandbox
                    </span>
                  </div>
                </div>

                {/* Storage Indicator Bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#464555]">
                    <span className="text-[#1B192F] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">folder_zip</span>
                      Attached: {(formData.files || []).length} files
                    </span>
                    <span>{totalSizeMB} MB of 50 MB ({progressPercent}%)</span>
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
                              <span className="text-[11px] text-[#464555]">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
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
              </div>

              {/* Actions Area */}
              <div className="flex flex-col gap-4 pt-2 pb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
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

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto px-6 py-4 rounded-full bg-white text-[#1B192F] font-bold text-sm clay-card hover:bg-[#FAF8FF] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                    <span>Save Draft</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-[#464555] text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">lock</span>
                    <span>FERPA Confidential</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#C7C4D8]"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4D41DF] text-[16px]">verified</span>
                    <span>Custom Tailored Rubric</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Digest & Guidance */}
            <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
              
              <div className="rounded-3xl bg-white p-6 clay-card flex flex-col gap-5 border border-white">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xl font-bold text-[#1B192F]">Custom Brief Digest</h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D41DF] animate-ping"></span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <span className="text-[#464555] text-xs font-bold">Type</span>
                    <span className="text-xs sm:text-sm text-[#4D41DF] font-extrabold">Bespoke Custom Intake</span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <span className="text-[#464555] text-xs font-bold">Requirement Title</span>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold truncate max-w-[150px]">
                      {formData.customServiceName || formData.title || 'Untitled Brief'}
                    </span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <span className="text-[#464555] text-xs font-bold">Due Date</span>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold">
                      {formData.deadline || 'Pending'}
                    </span>
                  </div>

                  <div className="p-3 px-4 rounded-2xl bg-[#F6F1FF] flex items-center justify-between clay-pill-inset">
                    <span className="text-[#464555] text-xs font-bold">Attached Datasets</span>
                    <span className="text-xs sm:text-sm text-[#1B192F] font-bold">
                      {(formData.files || []).length} files ({totalSizeMB} MB)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#E4DFFF]/50 text-[#1B192F] flex items-start gap-3 shadow-inner">
                  <span className="material-symbols-outlined text-[#5846C8] text-[22px] shrink-0 mt-0.5">
                    handshake
                  </span>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                      Personal Coordinator Assigned
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#464555] leading-snug">
                      Custom requirements are matched with subject matter specialists. We guarantee rapid review within 1 hour.
                    </p>
                  </div>
                </div>
              </div>

            </aside>

          </div>

        </div>
      </main>

      <MobileBottomNav activePath="services" />
    </div>
  );
}

export default CustomServiceRequestPage;
