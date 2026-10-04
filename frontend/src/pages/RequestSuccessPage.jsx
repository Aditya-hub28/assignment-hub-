import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useServiceRequest } from '../context/ServiceRequestContext';
import { useToast } from '../context/ToastContext';

export function RequestSuccessPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { submittedRequest, formData, resetForm } = useServiceRequest();

  const [copied, setCopied] = useState(false);

  // Fallback if accessed directly without submission
  const requestId = submittedRequest?.id || 'REQ-20261004-001';
  const serviceTitle = submittedRequest?.service || formData.service || 'Assignment Writing';
  const topicTitle = submittedRequest?.title || formData.title || formData.customServiceName || 'Academic Service Request';
  const subjectName = submittedRequest?.subject || formData.subject || 'Standard Coursework';
  const deadlineDate = submittedRequest?.deadline || formData.deadline || '30 Oct 2026, 11:59 PM';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    showToast(`Copied ${requestId} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartNew = () => {
    resetForm();
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] antialiased flex flex-col">
      <Navbar />

      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 flex-grow">
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col items-center">
          
          {/* Ambient Clay Soft Background Blooms */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4D41DF]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-48 right-12 w-64 h-64 bg-[#FFB951]/20 rounded-full blur-2xl pointer-events-none -z-10"></div>

          {/* Step Progress Tracker */}
          <section className="w-full max-w-2xl mb-8">
            <div className="bg-[#F6F1FF] p-2 sm:p-3 rounded-full clay-pill shadow-inner">
              <div className="grid grid-cols-3 gap-2 relative">
                {/* Step 1: Completed */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4D41DF] flex items-center justify-center text-white shadow-md shrink-0">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">check</span>
                  </div>
                  <div className="flex flex-col min-w-0 hidden sm:flex text-left">
                    <span className="text-[10px] text-[#4D41DF] font-bold leading-none">STEP 1</span>
                    <span className="text-xs font-bold text-[#1B192F] truncate">Requirements</span>
                  </div>
                </div>

                {/* Step 2: Completed */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4D41DF] flex items-center justify-center text-white shadow-md shrink-0">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">check</span>
                  </div>
                  <div className="flex flex-col min-w-0 hidden sm:flex text-left">
                    <span className="text-[10px] text-[#4D41DF] font-bold leading-none">STEP 2</span>
                    <span className="text-xs font-bold text-[#1B192F] truncate">Review Details</span>
                  </div>
                </div>

                {/* Step 3: Active / Success */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white clay-card shadow-md">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#675DF9] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">check_circle</span>
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-[10px] text-[#4D41DF] font-bold leading-none">STEP 3</span>
                    <span className="text-xs font-bold text-[#1B192F] truncate">Confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Success Showcase Card */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-10 md:p-12 clay-card flex flex-col items-center text-center border border-white shadow-2xl">
            
            {/* Tactile Clay Badge with Ambient Halo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#4D41DF]/20 rounded-full blur-xl scale-125"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#675DF9] to-[#4D41DF] flex items-center justify-center text-white shadow-xl transform hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-[44px] sm:text-[54px] font-bold">
                  task_alt
                </span>
              </div>
            </div>

            {/* Confirmation Headings */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBFF] text-[#4D41DF] text-xs font-bold tracking-widest uppercase mb-3 clay-pill">
              <span className="w-2 h-2 rounded-full bg-[#4D41DF] animate-pulse"></span>
              Order Intake Confirmed
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] mb-3 tracking-tight">
              Request Submitted Successfully!
            </h1>
            <p className="text-sm sm:text-base text-[#464555] max-w-2xl leading-relaxed">
              Your academic request has been received by our coordination desk. A subject coordinator is currently reviewing your guidelines and reference files.
            </p>

            {/* Details Capsule Card */}
            <div className="w-full mt-8 bg-[#F6F1FF] rounded-2xl p-5 sm:p-8 text-left clay-pill-inset">
              
              {/* Header row of the details card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE5FF] gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider text-[#464555] font-bold">
                    Request Reference
                  </span>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#4D41DF] font-extrabold text-sm sm:text-base clay-card shadow-sm">
                    <span>{requestId}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      title="Copy ID"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#464555] hover:text-[#4D41DF] hover:bg-[#F0EBFF] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copied ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                  {copied && (
                    <span className="text-xs text-[#4D41DF] font-bold animate-in fade-in">Copied!</span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] text-xs font-bold clay-pill self-start sm:self-auto">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Just now • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Selected Service */}
                <div className="bg-white p-4 rounded-2xl clay-card flex items-start gap-4 border border-white">
                  <div className="w-10 h-10 rounded-full bg-[#E4DFFF] flex items-center justify-center text-[#5846C8] shrink-0 clay-pill">
                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#464555] uppercase tracking-wider font-bold">
                      Selected Service
                    </span>
                    <span className="text-base font-bold text-[#1B192F] truncate">
                      {serviceTitle}
                    </span>
                    <span className="text-xs text-[#464555]">Standard Academic Workflow</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="bg-white p-4 rounded-2xl clay-card flex items-start gap-4 border border-white">
                  <div className="w-10 h-10 rounded-full bg-[#FFDDB3] flex items-center justify-center text-[#7F5300] shrink-0 clay-pill">
                    <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#464555] uppercase tracking-wider font-bold">
                      Target Deadline
                    </span>
                    <span className="text-base font-bold text-[#1B192F] truncate">
                      {deadlineDate}
                    </span>
                    <span className="text-xs text-[#464555]">Coordinated Delivery Window</span>
                  </div>
                </div>

                {/* Topic */}
                <div className="md:col-span-2 bg-white p-4 rounded-2xl clay-card flex items-start gap-4 border border-white">
                  <div className="w-10 h-10 rounded-full bg-[#E3DFFF] flex items-center justify-center text-[#4D41DF] shrink-0 clay-pill">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-[10px] text-[#464555] uppercase tracking-wider font-bold">
                      Assignment Topic
                    </span>
                    <span className="text-base font-bold text-[#1B192F]">
                      {topicTitle}
                    </span>
                    <span className="text-xs text-[#464555]">{subjectName}</span>
                  </div>
                </div>

                {/* Coordinator Status Banner */}
                <div className="md:col-span-2 bg-[#F0EBFF] p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 clay-pill">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#7F5300] animate-pulse"></span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                        Coordinator Desk Status: In Review
                      </span>
                      <span className="text-[11px] sm:text-xs text-[#464555]">
                        Academic specialist assignment expected within 1–2 hours.
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[#4D41DF] text-xs font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Intake Queue #04</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Action Buttons */}
            <div className="w-full mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/my-requests"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#4D41DF] hover:bg-[#675DF9] text-white font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>View in My Requests</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <button
                type="button"
                onClick={handleStartNew}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] font-bold text-sm clay-pill transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Submit Another Request</span>
              </button>

              <Link
                to="/inquiries"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF8FF] text-[#464555] font-bold text-sm clay-card transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Open Coordinator Chat</span>
              </Link>
            </div>

          </div>

        </div>
      </main>

      <MobileBottomNav activePath="services" />
    </div>
  );
}

export default RequestSuccessPage;
