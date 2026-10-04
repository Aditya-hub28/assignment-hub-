import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (ext) => {
  switch (ext?.toLowerCase()) {
    case 'pdf':
      return { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50' };
    case 'doc':
    case 'docx':
      return { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'ppt':
    case 'pptx':
      return { icon: 'slideshow', color: 'text-amber-500', bg: 'bg-amber-50' };
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'zip':
    case 'rar':
      return { icon: 'folder_zip', color: 'text-purple-500', bg: 'bg-purple-50' };
    default:
      return { icon: 'draft', color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

export function ServiceRequestModal({
  isOpen,
  onClose,
  initialService = 'Assignment Writing',
  isCustomService = false
}) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Workflow steps: 'form' | 'review' | 'success'
  const [step, setStep] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState(null);

  // Form State
  const [isCustom, setIsCustom] = useState(isCustomService);
  const [service, setService] = useState(initialService);
  const [customServiceName, setCustomServiceName] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Service-Specific Fields State
  // 1. Assignment Writing
  const [assignmentPages, setAssignmentPages] = useState('10');
  const [assignmentType, setAssignmentType] = useState('Typed (Digital PDF / Word)');
  const [assignmentFormat, setAssignmentFormat] = useState('Standard University Format');

  // 2. Coding Projects
  const [techStack, setTechStack] = useState('');
  const [codingFeatures, setCodingFeatures] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [docRequired, setDocRequired] = useState('Yes - Comprehensive README & Docs');
  const [pptRequired, setPptRequired] = useState('No');

  // 3. PPT / Presentation Making
  const [pptSlides, setPptSlides] = useState('15');
  const [presentationType, setPresentationType] = useState('Class / Seminar Presentation');
  const [pptTemplate, setPptTemplate] = useState('16:9 Modern Minimalist Theme');

  // 4. Engineering Graphics / Drawing
  const [drawingSoftware, setDrawingSoftware] = useState('AutoCAD (.dwg / .dxf)');
  const [projectionSystem, setProjectionSystem] = useState('First Angle Projection');
  const [drawingSpecs, setDrawingSpecs] = useState('');

  // 5. Physics / Engineering Projects
  const [experimentType, setExperimentType] = useState('Practical Lab Record & Journal');
  const [apparatusTools, setApparatusTools] = useState('');
  const [calculationFormat, setCalculationFormat] = useState('Observation Tables with Error Analysis');

  // 6. Project Reports / Documentation
  const [reportPages, setReportPages] = useState('30–40 Pages');
  const [reportStandard, setReportStandard] = useState('IEEE Standard Capstone Format');
  const [projectStage, setProjectStage] = useState('Final Comprehensive Dissertation');

  // 7. Research / Technical Reports
  const [researchDomain, setResearchDomain] = useState('');
  const [citationStyle, setCitationStyle] = useState('IEEE Citation Style');
  const [plagiarismThreshold, setPlagiarismThreshold] = useState('Strict (< 10% Turnitin)');

  // Reset or initialize when modal opens or initialService changes
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setIsCustom(isCustomService);
      setService(isCustomService ? 'Custom Service' : initialService);
      setUploadError('');
    }
  }, [isOpen, initialService, isCustomService]);

  if (!isOpen) return null;

  // Calculate total files size
  const totalFileSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const sizePercentage = Math.min(100, Math.round((totalFileSize / MAX_TOTAL_SIZE) * 100));

  // Process files
  const handleFilesSelected = (selectedFiles) => {
    setUploadError('');
    const newFiles = Array.from(selectedFiles);
    let currentTotal = totalFileSize;

    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setUploadError(`File "${file.name}" has an unsupported format. Allowed: PDF, DOC, DOCX, PPT, PPTX, Images (PNG, JPG), ZIP, RAR.`);
        showToast(`Unsupported file type: .${ext}`, 'error');
        return;
      }

      if (currentTotal + file.size > MAX_TOTAL_SIZE) {
        setUploadError(`Cannot add "${file.name}". Total files exceed the 50 MB limit (${formatFileSize(currentTotal + file.size)}).`);
        showToast('Maximum 50 MB total upload limit reached.', 'error');
        return;
      }

      currentTotal += file.size;

      // Read small/medium files as data URLs for preview/upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type || ext,
            extension: ext,
            data: e.target?.result || null
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setUploadError('');
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Build service-specific metadata object
  const getServiceSpecificData = () => {
    if (isCustom) return {};

    switch (service) {
      case 'Assignment Writing':
        return {
          numberOfPages: assignmentPages,
          assignmentType,
          collegeFormat: assignmentFormat
        };
      case 'Coding Projects':
        return {
          techStack,
          features: codingFeatures,
          githubLink: githubLink || 'None provided',
          documentationRequired: docRequired,
          pptRequired
        };
      case 'PPT / Presentation Making':
      case 'PPT & Presentation':
        return {
          numberOfSlides: pptSlides,
          presentationType,
          slideTemplate: pptTemplate
        };
      case 'Engineering Graphics / Drawing':
        return {
          softwareFormat: drawingSoftware,
          projectionSystem,
          dimensionsSpecs: drawingSpecs || 'Per attached problem sheet'
        };
      case 'Physics / Engineering Projects':
      case 'Physics & Practical':
        return {
          experimentType,
          apparatusList: apparatusTools || 'Standard lab equipment',
          calculationFormat
        };
      case 'Project Reports / Documentation':
      case 'Project Reports':
        return {
          scopePages: reportPages,
          reportStandard,
          projectStage
        };
      case 'Research / Technical Reports':
        return {
          researchDomain: researchDomain || 'General Academic',
          citationStyle,
          plagiarismTolerance: plagiarismThreshold
        };
      default:
        return {};
    }
  };

  // Validation before going to Review Step
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setUploadError('');

    if (isCustom && !customServiceName.trim()) {
      showToast('Please specify the custom service name or requirement.', 'error');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      showToast('Please provide a descriptive topic or title (at least 3 characters).', 'error');
      return;
    }

    if (!subject.trim()) {
      showToast('Please enter the subject or branch.', 'error');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      showToast('Please enter detailed requirements or instructions (at least 10 characters).', 'error');
      return;
    }

    if (!deadline) {
      showToast('Please select a submission deadline.', 'error');
      return;
    }

    setStep('review');
  };

  // Final Confirmation & Submission to Backend
  const handleConfirmAndSubmit = async () => {
    setIsSubmitting(true);
    setUploadError('');

    const payload = {
      service: isCustom ? 'Custom Service' : service,
      isCustom: Boolean(isCustom),
      customServiceName: isCustom ? customServiceName.trim() : null,
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      deadline,
      additionalInstructions: additionalInstructions.trim(),
      serviceSpecific: getServiceSpecificData(),
      files,
      userName: profile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student',
      userEmail: profile?.email || user?.email || null
    };

    try {
      const response = await api.services.createRequest(payload);
      if (response && response.success && response.data) {
        setCreatedRequest(response.data);

        // Also cache in localStorage for immediate sync with MyRequests
        try {
          const cached = JSON.parse(localStorage.getItem('ah_user_requests') || '[]');
          cached.unshift(response.data);
          localStorage.setItem('ah_user_requests', JSON.stringify(cached));
        } catch {
          // non-blocking
        }

        setStep('success');
        showToast(`Request ${response.data.id} submitted successfully!`, 'success');
      } else {
        throw new Error(response?.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showToast(err.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Request ID to clipboard
  const handleCopyId = () => {
    if (createdRequest?.id) {
      navigator.clipboard.writeText(createdRequest.id);
      showToast(`Copied Request ID: ${createdRequest.id}`, 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25233A]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (step !== 'success') onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 clay-card shadow-2xl border border-white max-h-[92vh] overflow-y-auto relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* MODAL HEADER & STEP PROGRESS INDICATOR                  */}
        {/* ======================================================== */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2DCFF] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {step === 'success' ? 'check_circle' : step === 'review' ? 'rate_review' : isCustom ? 'design_services' : 'assignment'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE8FA] text-[#6C63FF] clay-pill-inset">
                  {isCustom ? 'Custom Service Request' : 'Standard Academic Service'}
                </span>
                <span className="text-xs font-semibold text-[#6E6A8A]">
                  {step === 'form' && 'Step 1 of 2: Details'}
                  {step === 'review' && 'Step 2 of 2: Review'}
                  {step === 'success' && 'Completed'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#25233A] tracking-tight">
                {step === 'form' && (isCustom ? 'Custom Service Requirement' : `Request ${service}`)}
                {step === 'review' && 'Review Your Request'}
                {step === 'success' && 'Request Submitted!'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EDE8FA] text-[#6E6A8A] hover:text-[#25233A] flex items-center justify-center transition-colors cursor-pointer clay-card shrink-0"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: SERVICE FORM (Normal or Custom)                  */}
        {/* ======================================================== */}
        {step === 'form' && (
          <form onSubmit={handleProceedToReview} className="space-y-4 text-left">
            {/* Service Toggle / Switcher */}
            <div className="p-3 rounded-2xl bg-[#F6F3FF] border border-[#E2DCFF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6C63FF] text-[18px]">tune</span>
                <span className="text-xs font-bold text-[#25233A]">Service Mode:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    if (service === 'Custom Service') setService('Assignment Writing');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isCustom ? 'bg-[#6C63FF] text-white shadow-sm' : 'bg-white text-[#6E6A8A] hover:text-[#25233A]'
                  }`}
                >
                  Standard Service
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCustom ? 'bg-[#6C63FF] text-white shadow-sm' : 'bg-white text-[#6E6A8A] hover:text-[#25233A]'
                  }`}
                >
                  Custom Service ✨
                </button>
              </div>
            </div>

            {/* If Standard: Service Dropdown */}
            {!isCustom ? (
              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">Selected Service</label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">category</span>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none cursor-pointer"
                  >
                    <option value="Assignment Writing">Assignment Writing</option>
                    <option value="Coding Projects">Coding Projects</option>
                    <option value="Engineering Graphics / Drawing">Engineering Graphics / Drawing</option>
                    <option value="Physics / Engineering Projects">Physics / Engineering Projects</option>
                    <option value="PPT / Presentation Making">PPT / Presentation Making</option>
                    <option value="Project Reports / Documentation">Project Reports / Documentation</option>
                    <option value="Research / Technical Reports">Research / Technical Reports</option>
                  </select>
                </div>
              </div>
            ) : (
              /* If Custom: Custom Service Requirement Name */
              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                  Custom Service / Requirement Name <span className="text-red-500">*</span>
                </label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#FFB84D]">stars</span>
                  <input
                    type="text"
                    placeholder="e.g. Robotics Kinematics Simulation, Law Case Analysis, Quantum Circuit"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#6E6A8A] mt-1">
                  Creates an academic request tailored specifically to your syllabus.
                </p>
              </div>
            )}

            {/* Common: Topic / Name & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                  Topic / Work Title <span className="text-red-500">*</span>
                </label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Distributed Operating Systems Unit 4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                  Subject / Course Area <span className="text-red-500">*</span>
                </label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Computer Science, Mechanical, Physics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description / Requirements */}
            <div>
              <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                Description / Detailed Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain the questions, problems, scope, deliverables, or syllabus guidelines required for this work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] outline-none resize-none placeholder-[#25233A]/40 font-medium"
                required
              />
            </div>

            {/* SERVICE SPECIFIC FIELDS (Dynamic based on selected service) */}
            {!isCustom && (
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/80 space-y-3 clay-pill-inset">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6C63FF] text-[18px]">build_circle</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C63FF]">
                    {service} Specifications
                  </h4>
                </div>

                {/* 1. Assignment Writing */}
                {service === 'Assignment Writing' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Number of Pages</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={assignmentPages}
                        onChange={(e) => setAssignmentPages(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Handwritten / Typed</label>
                      <select
                        value={assignmentType}
                        onChange={(e) => setAssignmentType(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Typed (Digital PDF / Word)">Typed (Digital PDF / Word)</option>
                        <option value="Handwritten (Clean Scanned PDF)">Handwritten (Scanned PDF)</option>
                        <option value="Both Handwritten & Typed">Both Handwritten & Typed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">College Format / Template</label>
                      <select
                        value={assignmentFormat}
                        onChange={(e) => setAssignmentFormat(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Standard University Format">Standard University Format</option>
                        <option value="IEEE Two-Column">IEEE Two-Column</option>
                        <option value="APA 7th Formatted">APA 7th Formatted</option>
                        <option value="Custom College Template">Custom College Template</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. Coding Projects */}
                {service === 'Coding Projects' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">
                          Technology / Tech Stack <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Python, React, C++, Node.js, PyTorch"
                          value={techStack}
                          onChange={(e) => setTechStack(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">GitHub Link (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://github.com/..."
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Key Required Features</label>
                      <input
                        type="text"
                        placeholder="e.g. Authentication, Database migrations, Unit tests, Clean API"
                        value={codingFeatures}
                        onChange={(e) => setCodingFeatures(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Documentation Required</label>
                        <select
                          value={docRequired}
                          onChange={(e) => setDocRequired(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                        >
                          <option value="Yes - Comprehensive README & Docs">Yes - Comprehensive README & Docs</option>
                          <option value="No - Code Only">No - Code Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">PPT / Presentation Required</label>
                        <select
                          value={pptRequired}
                          onChange={(e) => setPptRequired(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                        >
                          <option value="No">No</option>
                          <option value="Yes - Project Demo & Architecture PPT">Yes - Project Demo PPT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PPT / Presentation Making */}
                {(service === 'PPT / Presentation Making' || service === 'PPT & Presentation') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Number of Slides</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={pptSlides}
                        onChange={(e) => setPptSlides(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Presentation Type</label>
                      <select
                        value={presentationType}
                        onChange={(e) => setPresentationType(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Class / Seminar Presentation">Class / Seminar Presentation</option>
                        <option value="Capstone Final Viva Defense">Capstone Final Defense</option>
                        <option value="Pitch Deck / Executive Brief">Pitch Deck / Executive Brief</option>
                        <option value="Technical Lecture Deck">Technical Lecture Deck</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Reference / Slide Template</label>
                      <select
                        value={pptTemplate}
                        onChange={(e) => setPptTemplate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="16:9 Modern Minimalist Theme">16:9 Modern Minimalist Theme</option>
                        <option value="High-Contrast Infographics">High-Contrast Infographics</option>
                        <option value="College / University Official">College Official Template</option>
                        <option value="Provided Custom Deck">Provided Custom Deck</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Engineering Graphics / Drawing */}
                {service === 'Engineering Graphics / Drawing' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Software / Sheet Format</label>
                      <select
                        value={drawingSoftware}
                        onChange={(e) => setDrawingSoftware(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="AutoCAD (.dwg / .dxf)">AutoCAD (.dwg / .dxf)</option>
                        <option value="SolidWorks (.sldprt / .slddrw)">SolidWorks (.sldprt)</option>
                        <option value="Manual Drafting Sheets (A1 / A2 / A3)">Manual Drafting Sheets</option>
                        <option value="CATIA / Autodesk Inventor">CATIA / Inventor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Projection System</label>
                      <select
                        value={projectionSystem}
                        onChange={(e) => setProjectionSystem(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="First Angle Projection">First Angle Projection</option>
                        <option value="Third Angle Projection">Third Angle Projection</option>
                        <option value="Isometric & Perspective Views">Isometric & Perspective</option>
                        <option value="Sectional Auxiliary Views">Sectional Auxiliary Views</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Component Dimensions / Scale</label>
                      <input
                        type="text"
                        placeholder="e.g. Metric mm, 1:1 scale"
                        value={drawingSpecs}
                        onChange={(e) => setDrawingSpecs(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Physics / Engineering Projects */}
                {(service === 'Physics / Engineering Projects' || service === 'Physics & Practical') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Experiment / Project Type</label>
                      <select
                        value={experimentType}
                        onChange={(e) => setExperimentType(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Practical Lab Record & Journal">Practical Lab Journal</option>
                        <option value="Hardware Circuit & Prototype">Hardware Circuit & Prototype</option>
                        <option value="MATLAB / LabVIEW Simulation">Simulation & Graphs</option>
                        <option value="Viva-Voce Questions & Proofs">Viva-Voce Q&A & Derivations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Apparatus / Software Tools</label>
                      <input
                        type="text"
                        placeholder="e.g. CRO, Multimeter, MATLAB"
                        value={apparatusTools}
                        onChange={(e) => setApparatusTools(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Observation Format</label>
                      <select
                        value={calculationFormat}
                        onChange={(e) => setCalculationFormat(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Observation Tables with Error Analysis">Observation Tables & Errors</option>
                        <option value="Step-by-step Formulas & Plot Graphs">Formulas & Plot Graphs</option>
                        <option value="Standard Lab Handbook Format">Standard Lab Handbook Format</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 6. Project Reports / Documentation */}
                {(service === 'Project Reports / Documentation' || service === 'Project Reports') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Number of Pages / Length</label>
                      <input
                        type="text"
                        placeholder="e.g. 30–50 Pages"
                        value={reportPages}
                        onChange={(e) => setReportPages(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Report Standard</label>
                      <select
                        value={reportStandard}
                        onChange={(e) => setReportStandard(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="IEEE Standard Capstone Format">IEEE Capstone Standard</option>
                        <option value="University Official Thesis Handbook">University Thesis Handbook</option>
                        <option value="APA 7th Edition">APA 7th Edition</option>
                        <option value="ACM Technical Report Format">ACM Technical Format</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Project Stage</label>
                      <select
                        value={projectStage}
                        onChange={(e) => setProjectStage(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Final Comprehensive Dissertation">Final Dissertation / Thesis</option>
                        <option value="Mid-Term Progress Review">Mid-Term Progress Review</option>
                        <option value="Synopsis & Project Proposal">Synopsis & Project Proposal</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 7. Research / Technical Reports */}
                {service === 'Research / Technical Reports' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Research Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. Deep Learning, Renewable Energy"
                        value={researchDomain}
                        onChange={(e) => setResearchDomain(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Citation Style</label>
                      <select
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="IEEE Citation Style">IEEE Citation Style</option>
                        <option value="APA 7th Edition">APA 7th Edition</option>
                        <option value="Harvard Referencing">Harvard Referencing</option>
                        <option value="ACM / Springer Format">ACM / Springer Format</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#25233A]/70 mb-1">Plagiarism Tolerance</label>
                      <select
                        value={plagiarismThreshold}
                        onChange={(e) => setPlagiarismThreshold(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#E2DCFF] text-xs font-bold text-[#25233A] outline-none"
                      >
                        <option value="Strict (< 10% Turnitin)">Strict (&lt; 10% Turnitin)</option>
                        <option value="Standard Academic (< 15%)">Standard Academic (&lt; 15%)</option>
                        <option value="Zero-tolerance verified">Zero-tolerance verified</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deadline & Additional Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                  Submission Deadline <span className="text-red-500">*</span>
                </label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">event</span>
                  <input
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#25233A]/80 mb-1.5">
                  Additional Instructions (Optional)
                </label>
                <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Specific professor notes, formatting guidelines"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                  />
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* FILE UPLOAD SECTION (50 MB Limit, Drag-and-Drop)         */}
            {/* ======================================================== */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#25233A]/80">
                  Reference Files & Question Papers (Up to 50 MB)
                </label>
                <span className="text-[11px] font-bold text-[#6E6A8A]">
                  {formatFileSize(totalFileSize)} / 50 MB
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#EDE8FA] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    sizePercentage > 90 ? 'bg-red-500' : 'bg-[#6C63FF]'
                  }`}
                  style={{ width: `${sizePercentage}%` }}
                ></div>
              </div>

              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? 'border-[#6C63FF] bg-[#6C63FF]/5 scale-[0.99]'
                    : 'border-[#C8C2EA] bg-[#FAF8FF] hover:border-[#6C63FF] hover:bg-[#F3F0FF]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-[#EDE8FA] text-[#6C63FF] flex items-center justify-center clay-pill-inset">
                  <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#25233A]">
                    Drag & drop reference files here, or <span className="text-[#6C63FF] underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-[#6E6A8A] mt-0.5">
                    Supported: PDF, Word (DOC/DOCX), PPT/PPTX, Images (PNG, JPG), ZIP, RAR (Max 50 MB)
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                  {files.map((file, idx) => {
                    const iconMeta = getFileIcon(file.extension);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-xs font-semibold text-[#25233A]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${iconMeta.bg} ${iconMeta.color} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-[18px]">{iconMeta.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate max-w-[240px] sm:max-w-xs text-xs font-bold text-[#25233A]">{file.name}</p>
                            <p className="text-[10px] text-[#6E6A8A] font-semibold">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(idx);
                          }}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-[#6E6A8A] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-[#E2DCFF]"
                          title="Remove file"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#E2DCFF] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6E6A8A] hover:text-[#25233A] hover:bg-[#FAF8FF] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <span>Review Request</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: REQUEST REVIEW (Screen 3: Request Review)        */}
        {/* ======================================================== */}
        {step === 'review' && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] clay-pill-inset space-y-3">
              {/* Service & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2DCFF]/70">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE8FA] text-[#6C63FF] clay-pill-inset">
                    {isCustom ? 'Custom Service' : service}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#25233A] mt-1">
                    {isCustom ? customServiceName : title}
                  </h4>
                  {isCustom && <p className="text-xs text-[#6E6A8A] font-semibold">Topic: {title}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider block">Deadline</span>
                  <span className="text-xs font-bold text-[#25233A] bg-white px-2.5 py-1 rounded-lg border border-[#E2DCFF] inline-block mt-0.5">
                    {new Date(deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <strong className="text-[#6E6A8A]">Subject / Course:</strong>{' '}
                  <span className="text-[#25233A] font-bold">{subject}</span>
                </div>
                <div>
                  <strong className="text-[#6E6A8A]">Detailed Requirements:</strong>
                  <p className="mt-1 text-[#25233A] font-medium bg-white p-3 rounded-xl border border-[#E2DCFF] leading-relaxed whitespace-pre-line text-xs">
                    {description}
                  </p>
                </div>
              </div>

              {/* Service-Specific Details Summary */}
              {!isCustom && (
                <div className="pt-2">
                  <strong className="text-[11px] font-bold text-[#6E6A8A] uppercase tracking-wider block mb-2">
                    Service Specifics
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(getServiceSpecificData()).map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-white border border-[#E2DCFF]">
                        <span className="text-[10px] text-[#6E6A8A] block font-semibold capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-xs font-bold text-[#25233A] truncate block">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Instructions */}
              {additionalInstructions && (
                <div className="text-xs">
                  <strong className="text-[#6E6A8A]">Additional Instructions:</strong>
                  <p className="mt-1 text-[#25233A] font-medium bg-white p-2.5 rounded-xl border border-[#E2DCFF]">
                    {additionalInstructions}
                  </p>
                </div>
              )}

              {/* Attached Files Review */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <strong className="text-[11px] font-bold text-[#6E6A8A] uppercase tracking-wider">
                    Attached Files ({files.length})
                  </strong>
                  <span className="text-[11px] font-bold text-[#6E6A8A]">Total: {formatFileSize(totalFileSize)}</span>
                </div>

                {files.length === 0 ? (
                  <p className="text-xs text-[#6E6A8A] italic">No reference files attached.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                    {files.map((file, idx) => {
                      const iconMeta = getFileIcon(file.extension);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2DCFF] text-xs min-w-0"
                        >
                          <div className={`w-7 h-7 rounded-lg ${iconMeta.bg} ${iconMeta.color} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-[16px]">{iconMeta.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#25233A]">{file.name}</p>
                            <p className="text-[10px] text-[#6E6A8A]">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 Review Action Buttons */}
            <div className="pt-4 border-t border-[#E2DCFF] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6C63FF] bg-[#EDE8FA] hover:bg-[#E2DCFF] transition-all cursor-pointer clay-card inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Request</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: SUBMIT SUCCESSFULLY (Screen 4: Submit Success)   */}
        {/* ======================================================== */}
        {step === 'success' && createdRequest && (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Green Checkmark Tactile Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#E8F8F0] border-2 border-[#55C595]/30 text-[#55C595] flex items-center justify-center mx-auto clay-pill-inset shadow-lg">
              <span className="material-symbols-outlined text-4xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight">
                Request Submitted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6A8A] max-w-md mx-auto leading-relaxed font-medium">
                Your academic request has been securely created and assigned to academic coordinators for immediate review.
              </p>
            </div>

            {/* Generated Details Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] clay-pill-inset max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E2DCFF]">
                <span className="text-xs font-bold text-[#6E6A8A]">Backend Request ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-[#6C63FF] bg-white px-2.5 py-1 rounded-lg border border-[#E2DCFF]">
                    {createdRequest.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-md bg-white hover:bg-[#EDE8FA] text-[#6C63FF] border border-[#E2DCFF] transition-colors cursor-pointer"
                    title="Copy Request ID"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6E6A8A]">Service:</span>
                <span className="font-bold text-[#25233A] truncate max-w-[200px]">
                  {createdRequest.isCustom ? createdRequest.customServiceName : createdRequest.service}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6E6A8A]">Deadline:</span>
                <span className="font-bold text-[#25233A]">
                  {new Date(createdRequest.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6E6A8A]">Status:</span>
                <span className="font-bold text-[#a06900] bg-[#FFF8EB] px-2 py-0.5 rounded-full border border-[#FFDDB3]">
                  ● Pending Coordinator Review
                </span>
              </div>
            </div>

            {/* Two Action Buttons: View My Request & Back to Services (NO auto redirect, NO pricing) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/my-requests');
                }}
                className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                <span>View My Request</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#EDE8FA] text-[#25233A] text-xs sm:text-sm font-bold clay-card hover:bg-[#E2DCFF] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">category</span>
                <span>Back to Services</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
