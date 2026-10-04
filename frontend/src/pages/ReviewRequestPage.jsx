import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useServiceRequest } from '../context/ServiceRequestContext';
import { useToast } from '../context/ToastContext';

export function ReviewRequestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { formData, submitCurrentRequest, isSubmitting } = useServiceRequest();

  // If user navigates to review with no data, redirect to services
  if (!formData.title && !formData.description) {
    navigate('/services');
    return null;
  }

  const handleEditBack = () => {
    if (formData.isCustom) {
      navigate('/services/custom');
    } else {
      navigate('/services/new');
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const res = await submitCurrentRequest();
      if (res?.success) {
        navigate('/services/success');
      }
    } catch (err) {
      // toast shown in context
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
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6 sm:gap-8">
          
          {/* Breadcrumb & Nav Cue */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditBack}
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#4D41DF] hover:text-[#1B192F] transition-colors group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span>Back to Edit Form</span>
            </button>
            <span className="text-[#C7C4D8] font-bold text-sm">/</span>
            <span className="text-[#464555] font-bold text-sm">Review Your Request</span>
          </div>

          {/* Stepper Indicator */}
          <div className="w-full p-4 sm:p-6 rounded-3xl bg-white clay-card border border-white">
            <div className="grid grid-cols-3 gap-2 items-center relative">
              {/* Connecting Progress Track Behind */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 bg-[#EAE5FF] rounded-full mx-8 -z-0">
                <div className="h-full bg-gradient-to-r from-[#4D41DF] to-[#675DF9] rounded-full w-2/3 transition-all duration-500"></div>
              </div>

              {/* Step 1: Completed */}
              <div className="relative z-10 flex flex-col items-center text-center gap-1.5 cursor-pointer" onClick={handleEditBack}>
                <div className="w-10 h-10 rounded-full bg-[#E4DFFF] text-[#5846C8] flex items-center justify-center clay-pill shadow-sm">
                  <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                </div>
                <span className="text-xs font-bold text-[#464555] hidden sm:inline-block">1. Fill Requirements</span>
                <span className="text-xs font-bold text-[#464555] sm:hidden">1. Fill</span>
              </div>

              {/* Step 2: Active */}
              <div className="relative z-10 flex flex-col items-center text-center gap-1.5">
                <div className="w-11 h-11 rounded-full bg-[#4D41DF] text-white flex items-center justify-center shadow-lg scale-105">
                  <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[#4D41DF]">2. Review Request</span>
              </div>

              {/* Step 3: Pending */}
              <div className="relative z-10 flex flex-col items-center text-center gap-1.5 opacity-60">
                <div className="w-10 h-10 rounded-full bg-[#F6F1FF] text-[#464555] flex items-center justify-center clay-pill">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <span className="text-xs font-bold text-[#464555] hidden sm:inline-block">3. Confirmation</span>
                <span className="text-xs font-bold text-[#464555] sm:hidden">3. Done</span>
              </div>
            </div>
          </div>

          {/* Header Block */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] text-[10px] sm:text-xs uppercase tracking-wider font-bold clay-pill">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              Final Verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
              Review Your Request
            </h1>
            <p className="text-sm sm:text-base text-[#464555] max-w-2xl leading-relaxed">
              Double-check your academic requirements and attached files before submitting to our coordination desk.
            </p>
          </div>

          {/* Main Bento Verification Card */}
          <div className="flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white clay-card flex flex-col gap-6 border border-white">
              
              {/* Header Ribbon: Service Type & Deadline Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EBFF]">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-[#4D41DF] text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      {formData.isCustom ? 'tune' : 'edit_document'}
                    </span>
                    <span>{formData.service}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#F0EBFF] text-[#1B192F] text-xs font-bold clay-pill">
                    {formData.isCustom ? 'Bespoke Brief' : 'Academic Service'}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFDDB3] text-[#7F5300] font-bold text-xs sm:text-sm clay-pill">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Target Deadline:</span>
                  <strong className="font-extrabold">{formData.deadline || 'Flexible'}</strong>
                </div>
              </div>

              {/* Topic Title & Course */}
              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#777587] font-bold">
                  Assignment / Topic Title
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B192F] leading-tight">
                  {formData.title || formData.customServiceName || 'Untitled Service Request'}
                </h2>
                <div className="flex items-center gap-2 text-[#464555] text-xs sm:text-sm font-medium mt-1">
                  <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">menu_book</span>
                  <span>{formData.subject || 'General Academic Standard'}</span>
                </div>
              </div>

              {/* Spec Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F6F1FF] clay-pill-inset flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white text-[#4D41DF] flex items-center justify-center shrink-0 clay-card shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">format_size</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-[#464555]">Volume / Length</span>
                    <span className="text-sm font-bold text-[#1B192F]">
                      {formData.serviceSpecific?.numberOfPages || formData.serviceSpecific?.slideCount || 'Standard Scope'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6F1FF] clay-pill-inset flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white text-[#4D41DF] flex items-center justify-center shrink-0 clay-card shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-[#464555]">Delivery Format</span>
                    <span className="text-sm font-bold text-[#1B192F]">
                      {formData.serviceSpecific?.deliveryFormat || formData.serviceSpecific?.slideFormat || 'Digital Deliverable'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6F1FF] clay-pill-inset flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white text-[#4D41DF] flex items-center justify-center shrink-0 clay-card shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-[#464555]">Academic Standard</span>
                    <span className="text-sm font-bold text-[#1B192F] truncate max-w-[140px]">
                      {formData.serviceSpecific?.techStack || formData.subject || 'University Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prompt Container */}
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#777587] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Assignment Prompt &amp; Scope Requirements
                  </span>
                  <span className="text-xs text-[#4D41DF] font-bold">Entered Prompt</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#F6F1FF] clay-pill-inset text-[#1B192F] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {formData.description}
                </div>
              </div>

              {/* Special Notes Inset */}
              {formData.additionalInstructions && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E4DFFF]/50 clay-card shadow-inner text-left">
                  <span className="material-symbols-outlined text-[#5846C8] text-[22px] mt-0.5 shrink-0">
                    tips_and_updates
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-[#5846C8] font-bold">
                      Special Notes from Student
                    </span>
                    <p className="text-xs sm:text-sm text-[#1B192F] mt-1 leading-relaxed">
                      {formData.additionalInstructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Attached Files List */}
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#777587] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">attachment</span>
                    Attached Reference Assets ({(formData.files || []).length} Files)
                  </span>
                </div>

                {(formData.files || []).length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#F6F1FF] text-xs text-[#464555] italic text-center">
                    No reference files attached.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.files.map((file, idx) => {
                      const iconData = getFileIcon(file.name);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#F6F1FF] clay-pill-inset flex items-center gap-3 min-w-0"
                        >
                          <div className={`w-9 h-9 rounded-xl ${iconData.bg} flex items-center justify-center shrink-0 clay-pill`}>
                            <span className="material-symbols-outlined text-[20px]">{iconData.icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[#1B192F] truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-[#464555]">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Trust & Policy Reassurance */}
              <div className="w-full px-6 py-3 rounded-full bg-[#F6F1FF] clay-pill flex flex-wrap items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B192F]">
                  <span className="material-symbols-outlined text-[#4D41DF] text-[18px]">verified_user</span>
                  <span>FERPA Encrypted</span>
                </div>
                <span className="text-[#C7C4D8] hidden sm:inline-block">•</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B192F]">
                  <span className="material-symbols-outlined text-[#4D41DF] text-[18px]">spellcheck</span>
                  <span>Zero Plagiarism Guarantee</span>
                </div>
                <span className="text-[#C7C4D8] hidden sm:inline-block">•</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B192F]">
                  <span className="material-symbols-outlined text-[#4D41DF] text-[18px]">support_agent</span>
                  <span>Coordinator Reviewed (No upfront fee)</span>
                </div>
              </div>

            </div>

            {/* Primary Action Sticky Bottom Bar */}
            <div className="p-6 rounded-3xl bg-white clay-card flex flex-col sm:flex-row items-center justify-between gap-4 border border-white shadow-xl">
              <div className="flex items-center gap-3 text-[#464555] text-left">
                <span className="material-symbols-outlined text-[24px] text-[#4D41DF] shrink-0">info</span>
                <span className="text-xs sm:text-sm">
                  Ready to dispatch? Your assigned subject coordinator will review instructions within 1 hour.
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={handleEditBack}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#F6F1FF] text-[#1B192F] font-bold text-sm clay-pill hover:bg-[#F0EBFF] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Edit Request</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#4D41DF] hover:bg-[#675DF9] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check</span>
                      <span>Confirm &amp; Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      <MobileBottomNav activePath="services" />
    </div>
  );
}

export default ReviewRequestPage;
