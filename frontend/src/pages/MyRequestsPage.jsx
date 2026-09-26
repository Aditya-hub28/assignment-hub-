import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Comprehensive dataset matching Stitch Screen 37d3a96fee0f40fa9cb599ac62a83700 (12 Total, 3 Pending, 5 In Progress, 4 Completed, 1 Cancelled)
const INITIAL_REQUESTS = [
  // IN PROGRESS (5)
  {
    id: 'REQ-1024',
    service: 'Assignment Writing',
    icon: 'edit_note',
    title: 'Engineering Mathematics Assignment',
    status: 'in-progress',
    statusLabel: '● In Progress',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#170065]',
    description: 'Complete Engineering Mathematics assignment according to the provided requirements.',
    requirements: 'Multi-variable calculus sets, Laplace transformations, and step-by-step verified proofs.',
    submitted: '24 Sep 2026',
    date: '2026-09-24',
    deadline: '27 Sep 2026',
    deadlineDate: '2026-09-27',
    progress: 70,
    expectedCompletion: '27 Sep 2026',
    timeline: {
      step1: '24 Sep 2026',
      step2: '24 Sep 2026',
      step3: 'In progress with mentor',
      step4: 'Awaiting final solution deliverable'
    },
    submittedFiles: [
      { name: 'assignment_questions.pdf', size: '2.4 MB' },
      { name: 'reference_material.pdf', size: '1.8 MB' }
    ],
    btnText: 'View Submitted Files',
    btnClass: 'bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#E4DFFE] clay-card-sm'
  },
  {
    id: 'REQ-1029',
    service: 'Coding & Technical',
    icon: 'code',
    title: 'Machine Learning Neural Networks Lab',
    status: 'in-progress',
    statusLabel: '● In Progress',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#170065]',
    description: 'PyTorch convolutional neural network training script with classification benchmark accuracy report.',
    requirements: 'ResNet-18 fine-tuning on CIFAR-10, confusion matrix visualizer, and Jupyter notebook documentation.',
    submitted: '25 Sep 2026',
    date: '2026-09-25',
    deadline: '28 Sep 2026',
    deadlineDate: '2026-09-28',
    progress: 55,
    expectedCompletion: '28 Sep 2026',
    timeline: {
      step1: '25 Sep 2026',
      step2: '25 Sep 2026',
      step3: 'Model training and validation phase',
      step4: 'Notebook formatting and rubric review'
    },
    submittedFiles: [
      { name: 'ml_assignment_spec.pdf', size: '3.1 MB' }
    ],
    btnText: 'View Submitted Files',
    btnClass: 'bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#E4DFFE] clay-card-sm'
  },
  {
    id: 'REQ-1031',
    service: 'Practical Files & Viva',
    icon: 'science',
    title: 'Fluid Mechanics Lab Journal',
    status: 'in-progress',
    statusLabel: '● In Progress',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#170065]',
    description: 'Venturi meter & orifice plate calibration calculations with manual observation tables and graphs.',
    requirements: '10 practical experiments formatted according to VTU mechanical engineering lab handbook.',
    submitted: '23 Sep 2026',
    date: '2026-09-23',
    deadline: '29 Sep 2026',
    deadlineDate: '2026-09-29',
    progress: 40,
    expectedCompletion: '29 Sep 2026',
    timeline: {
      step1: '23 Sep 2026',
      step2: '24 Sep 2026',
      step3: 'Data tables and error calculations drafting',
      step4: 'Final graph plotting and lab signature review'
    },
    submittedFiles: [
      { name: 'lab_readings_raw.pdf', size: '1.9 MB' }
    ],
    btnText: 'View Submitted Files',
    btnClass: 'bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#E4DFFE] clay-card-sm'
  },
  {
    id: 'REQ-1033',
    service: 'PPT & Presentation',
    icon: 'slideshow',
    title: 'Autonomous EV Powertrain Seminar Deck',
    status: 'in-progress',
    statusLabel: '● In Progress',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#170065]',
    description: '18-slide visual presentation deck covering permanent magnet synchronous motor efficiency curves.',
    requirements: 'Include high-contrast diagrams, 16:9 widescreen layout, and speaker notes under every slide.',
    submitted: '25 Sep 2026',
    date: '2026-09-25',
    deadline: '28 Sep 2026',
    deadlineDate: '2026-09-28',
    progress: 80,
    expectedCompletion: '28 Sep 2026',
    timeline: {
      step1: '25 Sep 2026',
      step2: '25 Sep 2026',
      step3: 'Speaker notes & animation polish',
      step4: 'Pre-flight slide check'
    },
    submittedFiles: [
      { name: 'ev_powertrain_outline.docx', size: '1.2 MB' }
    ],
    btnText: 'View Submitted Files',
    btnClass: 'bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#E4DFFE] clay-card-sm'
  },
  {
    id: 'REQ-1035',
    service: 'Project Reports',
    icon: 'menu_book',
    title: 'Microservices Cloud Architecture Thesis',
    status: 'in-progress',
    statusLabel: '● In Progress',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#170065]',
    description: 'Comprehensive 45-page capstone report with Docker Kubernetes deployment architecture and latency analysis.',
    requirements: 'Follow IEEE standard structure with abstract, literature review, load test graphs, and citations.',
    submitted: '22 Sep 2026',
    date: '2026-09-22',
    deadline: '02 Oct 2026',
    deadlineDate: '2026-10-02',
    progress: 60,
    expectedCompletion: '02 Oct 2026',
    timeline: {
      step1: '22 Sep 2026',
      step2: '23 Sep 2026',
      step3: 'Methodology and benchmark metrics writing',
      step4: 'Turnitin similarity test & bibliography bind'
    },
    submittedFiles: [
      { name: 'capstone_guidelines.pdf', size: '4.5 MB' }
    ],
    btnText: 'View Submitted Files',
    btnClass: 'bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#E4DFFE] clay-card-sm'
  },

  // PENDING (3)
  {
    id: 'REQ-1028',
    service: 'Practical Files & Viva',
    icon: 'science',
    title: 'Data Structures & Algorithms Lab File',
    status: 'pending',
    statusLabel: '● Pending',
    statusBadgeClass: 'bg-[#FFB951] text-[#291800]',
    description: '15 balanced binary search tree & graph traversal programs with manual dry-run traces.',
    requirements: 'Full implementation in C++ with test cases, memory complexity analysis, and printable lab journal format.',
    submitted: '26 Sep 2026',
    date: '2026-09-26',
    deadline: '30 Sep 2026',
    deadlineDate: '2026-09-30',
    progress: 0,
    expectedCompletion: 'Under review',
    pendingNotice: 'Academic team is reviewing your files and requirements.',
    timeline: {
      step1: '26 Sep 2026',
      step2: 'Under review by coordinator',
      step3: 'Pending assignment',
      step4: 'Pending completion'
    },
    submittedFiles: [
      { name: 'dsa_problem_list.pdf', size: '1.2 MB' }
    ],
    btnText: 'Cancel Request',
    btnClass: 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffc8c2] clay-card-sm'
  },
  {
    id: 'REQ-1030',
    service: 'Coding & Technical',
    icon: 'code',
    title: 'Digital Signal Processing Matlab Scripts',
    status: 'pending',
    statusLabel: '● Pending',
    statusBadgeClass: 'bg-[#FFB951] text-[#291800]',
    description: 'FFT Butterworth and Chebyshev filter design algorithms with frequency response plots.',
    requirements: 'Clean .m code with inline comments and exported MATLAB figures as high-res images.',
    submitted: '26 Sep 2026',
    date: '2026-09-26',
    deadline: '01 Oct 2026',
    deadlineDate: '2026-10-01',
    progress: 0,
    expectedCompletion: 'Under review',
    pendingNotice: 'Reviewing MATLAB toolbox version compatibility and syllabus specs.',
    timeline: {
      step1: '26 Sep 2026',
      step2: 'Technical scope review',
      step3: 'Pending developer match',
      step4: 'Pending solution'
    },
    submittedFiles: [
      { name: 'dsp_questions_sheet.pdf', size: '1.6 MB' }
    ],
    btnText: 'Cancel Request',
    btnClass: 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffc8c2] clay-card-sm'
  },
  {
    id: 'REQ-1032',
    service: 'Assignment Writing',
    icon: 'edit_note',
    title: 'Business Analytics Case Study',
    status: 'pending',
    statusLabel: '● Pending',
    statusBadgeClass: 'bg-[#FFB951] text-[#291800]',
    description: 'Executive summary and supply chain predictive analytics critique for retail logistics case study.',
    requirements: 'APA 7th edition referencing, SWOT analysis matrix, and minimum 2,500 words.',
    submitted: '26 Sep 2026',
    date: '2026-09-26',
    deadline: '03 Oct 2026',
    deadlineDate: '2026-10-03',
    progress: 0,
    expectedCompletion: 'Under review',
    pendingNotice: 'Evaluating business case study prompt and rubric guidelines.',
    timeline: {
      step1: '26 Sep 2026',
      step2: 'Academic specialist vetting',
      step3: 'Pending drafting',
      step4: 'Pending proofing'
    },
    submittedFiles: [
      { name: 'retail_case_study.pdf', size: '2.1 MB' }
    ],
    btnText: 'Cancel Request',
    btnClass: 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffc8c2] clay-card-sm'
  },

  // COMPLETED (4)
  {
    id: 'REQ-1018',
    service: 'Coding & Technical',
    icon: 'code',
    title: 'IoT Smart Weather Station Simulation',
    status: 'completed',
    statusLabel: '✓ Completed',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#4D41DF]',
    description: 'ESP32 micro-controller code in C++ with MQTT telemetry dashboard configuration.',
    requirements: 'Complete source repository, wiring schematics, and simulation demo instructions.',
    submitted: '18 Sep 2026',
    date: '2026-09-18',
    deadline: '22 Sep 2026',
    deadlineDate: '2026-09-22',
    progress: 100,
    expectedCompletion: 'Delivered 22 Sep 2026',
    deliveredDate: '22 Sep 2026',
    timeline: {
      step1: '18 Sep 2026',
      step2: '18 Sep 2026',
      step3: 'Work In Progress — Completed',
      step4: 'Completed'
    },
    submittedFiles: [
      { name: 'weather_station_specs.pdf', size: '3.1 MB' }
    ],
    deliveredFiles: [
      { name: 'IoT_Weather_Station_Firmware.zip', size: '4.8 MB', icon: 'folder_zip' },
      { name: 'Simulation_Wiring_Guide.pdf', size: '2.4 MB', icon: 'description' }
    ],
    btnText: 'Download Files',
    btnClass: 'bg-[#4D41DF] text-white clay-btn-primary hover:bg-[#3d32ce]'
  },
  {
    id: 'REQ-1020',
    service: 'Assignment Writing',
    icon: 'edit_note',
    title: 'Reinforced Concrete Column Analysis',
    status: 'completed',
    statusLabel: '✓ Completed',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#4D41DF]',
    description: 'Axial load and uniaxial bending calculations per IS 456:2000 specifications.',
    requirements: 'Complete step-by-step derivations with interaction charts and clear structural diagrams.',
    submitted: '15 Sep 2026',
    date: '2026-09-15',
    deadline: '20 Sep 2026',
    deadlineDate: '2026-09-20',
    progress: 100,
    expectedCompletion: 'Delivered 20 Sep 2026',
    deliveredDate: '20 Sep 2026',
    timeline: {
      step1: '15 Sep 2026',
      step2: '16 Sep 2026',
      step3: 'Work In Progress — Completed',
      step4: 'Completed'
    },
    submittedFiles: [
      { name: 'civil_problem_sheet.pdf', size: '1.4 MB' }
    ],
    deliveredFiles: [
      { name: 'Concrete_Column_Analysis.pdf', size: '2.4 MB', icon: 'description' },
      { name: 'Concrete_Column_Analysis.docx', size: '1.8 MB', icon: 'article' }
    ],
    btnText: 'Download Files',
    btnClass: 'bg-[#4D41DF] text-white clay-btn-primary hover:bg-[#3d32ce]'
  },
  {
    id: 'REQ-1022',
    service: 'Practical Files & Viva',
    icon: 'science',
    title: 'Cloud DevOps CI/CD Pipeline Lab',
    status: 'completed',
    statusLabel: '✓ Completed',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#4D41DF]',
    description: 'GitHub Actions workflow yaml scripts, automated Docker containerization, and AWS ECS task setups.',
    requirements: '12 lab experiments with execution logs, screenshots of passing test suites, and viva questions.',
    submitted: '14 Sep 2026',
    date: '2026-09-14',
    deadline: '19 Sep 2026',
    deadlineDate: '2026-09-19',
    progress: 100,
    expectedCompletion: 'Delivered 19 Sep 2026',
    deliveredDate: '19 Sep 2026',
    timeline: {
      step1: '14 Sep 2026',
      step2: '14 Sep 2026',
      step3: 'Work In Progress — Completed',
      step4: 'Completed'
    },
    submittedFiles: [
      { name: 'devops_lab_syllabus.pdf', size: '2.0 MB' }
    ],
    deliveredFiles: [
      { name: 'DevOps_CI_CD_Lab_Report.pdf', size: '3.6 MB', icon: 'description' },
      { name: 'Workflows_Config_Bundle.zip', size: '1.2 MB', icon: 'folder_zip' }
    ],
    btnText: 'Download Files',
    btnClass: 'bg-[#4D41DF] text-white clay-btn-primary hover:bg-[#3d32ce]'
  },
  {
    id: 'REQ-1025',
    service: 'PPT & Presentation',
    icon: 'slideshow',
    title: 'Computer Vision Object Detection PPT',
    status: 'completed',
    statusLabel: '✓ Completed',
    statusBadgeClass: 'bg-[#E4DFFE] text-[#4D41DF]',
    description: 'YOLOv8 vs Faster R-CNN comparison presentation deck with mAP accuracy benchmarks and diagrams.',
    requirements: '15 slides formatted with custom icons, clean infographics, and comprehensive presenter cards.',
    submitted: '19 Sep 2026',
    date: '2026-09-19',
    deadline: '23 Sep 2026',
    deadlineDate: '2026-09-23',
    progress: 100,
    expectedCompletion: 'Delivered 23 Sep 2026',
    deliveredDate: '23 Sep 2026',
    timeline: {
      step1: '19 Sep 2026',
      step2: '19 Sep 2026',
      step3: 'Work In Progress — Completed',
      step4: 'Completed'
    },
    submittedFiles: [
      { name: 'presentation_brief.docx', size: '900 KB' }
    ],
    deliveredFiles: [
      { name: 'Computer_Vision_Slides.pptx', size: '8.4 MB', icon: 'slideshow' },
      { name: 'Presenter_Notes_Handout.pdf', size: '1.5 MB', icon: 'description' }
    ],
    btnText: 'Download Files',
    btnClass: 'bg-[#4D41DF] text-white clay-btn-primary hover:bg-[#3d32ce]'
  },

  // CANCELLED (1)
  {
    id: 'REQ-1012',
    service: 'PPT & Presentation',
    icon: 'slideshow',
    title: 'Renewable Energy Seminar Slides',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusBadgeClass: 'bg-[#F0EBFF] text-[#464555]',
    description: '20-slide keynote deck on offshore wind turbine aerodynamics with speaker notes.',
    requirements: 'Cancelled by student on 13 Sep 2026. Full token credit refunded.',
    submitted: '12 Sep 2026',
    date: '2026-09-12',
    deadline: '16 Sep 2026',
    deadlineDate: '2026-09-16',
    progress: 0,
    expectedCompletion: 'Cancelled on 13 Sep 2026',
    cancelledDate: '13 Sep 2026',
    timeline: {
      step1: '12 Sep 2026',
      step2: 'Order Cancelled by student on 13 Sep 2026',
      step3: 'Closed',
      step4: 'Closed'
    },
    submittedFiles: [
      { name: 'wind_energy_outline.pdf', size: '850 KB' }
    ],
    btnText: 'Closed Request',
    btnClass: 'bg-[#F0EBFF] text-[#777587] cursor-not-allowed opacity-70'
  }
];

export function MyRequestsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Requests state
  const [requestsList, setRequestsList] = useState(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Detail Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState('REQ-1024');

  // Modals state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // New Request Form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('Assignment Writing');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqFormat, setReqFormat] = useState('Digital PDF / Docs');
  const [reqNotes, setReqNotes] = useState('');

  // Profile Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editCollege, setEditCollege] = useState(user?.college || '');
  const [editCourse, setEditCourse] = useState(user?.course || '');

  // Derived user values
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';
  const email = user?.email || 'student@university.edu';

  // Find currently selected request for the drawer
  const activeRequest = useMemo(() => {
    return requestsList.find((r) => r.id === selectedReqId) || requestsList[0];
  }, [requestsList, selectedReqId]);

  // Dynamic counts exactly matching Stitch (Total: 12 active, Pending: 3, In Progress: 5, Completed: 4, Cancelled: 1)
  const stats = useMemo(() => {
    const inProgress = requestsList.filter((r) => r.status === 'in-progress').length;
    const pending = requestsList.filter((r) => r.status === 'pending').length;
    const completed = requestsList.filter((r) => r.status === 'completed').length;
    const cancelled = requestsList.filter((r) => r.status === 'cancelled').length;
    const total = inProgress + pending + completed; // Total active/tracked requests is 12 in the Stitch Work Tracking Center
    return { total, inProgress, pending, completed, cancelled, allTotal: requestsList.length };
  }, [requestsList]);

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    let result = requestsList.filter((r) => {
      const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const deadA = new Date(a.deadlineDate).getTime();
      const deadB = new Date(b.deadlineDate).getTime();

      if (sortBy === 'latest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'nearest') return deadA - deadB;
      if (sortBy === 'farthest') return deadB - deadA;
      return 0;
    });

    return result;
  }, [requestsList, activeFilter, searchQuery, sortBy]);

  // Drawer handlers
  const handleOpenDrawer = (reqId) => {
    setSelectedReqId(reqId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // Cancel Request Action
  const handleCancelRequest = (reqId) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'cancelled',
              statusLabel: 'Cancelled',
              statusBadgeClass: 'bg-[#F0EBFF] text-[#464555]',
              progress: 0,
              cancelledDate: todayStr,
              expectedCompletion: `Cancelled on ${todayStr}`,
              requirements: `Cancelled by student on ${todayStr}. Full token credit refunded.`,
              timeline: {
                ...r.timeline,
                step2: `Order Cancelled by student on ${todayStr}`,
                step3: 'Closed',
                step4: 'Closed'
              },
              btnText: 'Closed Request',
              btnClass: 'bg-[#F0EBFF] text-[#777587] cursor-not-allowed opacity-70'
            }
          : r
      )
    );
    showToast(`Request #${reqId} has been cancelled and refunded to your wallet.`, 'info');
  };

  // Handle Dynamic Button Click in Drawer
  const handleDrawerDynamicAction = () => {
    if (activeRequest.status === 'pending') {
      handleCancelRequest(activeRequest.id);
    } else if (activeRequest.status === 'completed') {
      showToast(`Downloading deliverable files for #${activeRequest.id}...`, 'success');
    } else if (activeRequest.status === 'in-progress') {
      showToast(`Submitted files are verified for #${activeRequest.id}. Mentor is drafting.`, 'info');
    }
  };

  // New Request Submission
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!reqTitle || !reqDeadline) {
      showToast('Please provide a title and deadline.', 'error');
      return;
    }

    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedDeadline = new Date(reqDeadline).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const newReq = {
      id: newId,
      service: reqType,
      icon: 'edit_note',
      title: reqTitle,
      status: 'pending',
      statusLabel: '● Pending',
      statusBadgeClass: 'bg-[#FFB951] text-[#291800]',
      description: reqNotes || `${reqType} deliverable prepared according to student guidelines.`,
      requirements: reqNotes || `Specific requirement instructions provided for ${reqTitle}.`,
      submitted: formattedDate,
      date: new Date().toISOString().split('T')[0],
      deadline: formattedDeadline,
      deadlineDate: reqDeadline,
      progress: 0,
      expectedCompletion: 'Under review',
      pendingNotice: 'Academic team is reviewing your files and requirements.',
      timeline: {
        step1: formattedDate,
        step2: 'Under review by coordinator',
        step3: 'Pending assignment',
        step4: 'Pending completion'
      },
      submittedFiles: [
        { name: 'brief_instructions.pdf', size: '1.5 MB' }
      ],
      btnText: 'Cancel Request',
      btnClass: 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffc8c2] clay-card-sm'
    };

    setRequestsList([newReq, ...requestsList]);
    setRequestModalOpen(false);
    setReqTitle('');
    setReqDeadline('');
    setReqNotes('');
    showToast(`Request #${newId} created successfully! Added to Work Tracking Center.`, 'success');
    setSelectedReqId(newId);
    setDrawerOpen(true);
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: editName,
      college: editCollege,
      course: editCourse
    });
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setProfileModalOpen(false);
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    showToast('Logged out successfully.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] flex flex-col selection:bg-[#4D41DF]/20 selection:text-[#4D41DF]">
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR (Matching Stitch Work Tracking Center)      */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FCF8FF]/90 backdrop-blur-xl border-b border-[#EAE5FF]/60 shadow-[0_10px_25px_rgba(108,99,255,0.05),inset_0_1px_2px_rgba(255,255,255,0.85)]">
        <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand & Workspace Pill */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#4D41DF] text-white flex items-center justify-center clay-btn-primary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <span className="font-bold text-xl text-[#1B192F] tracking-tight">Assignment Hub</span>
            </Link>
            <span className="hidden md:inline-flex items-center px-3.5 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-semibold clay-pill-inset">
              Student Workspace
            </span>
          </div>

          {/* Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 bg-[#F6F1FF] rounded-full clay-pill-inset">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all"
            >
              Services
            </Link>
            <span
              className="px-4 py-2 rounded-full text-sm font-bold bg-white text-[#4D41DF] shadow-sm clay-card-sm cursor-default"
            >
              My Requests
            </span>
            <Link
              to="/inquiries"
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all"
            >
              Inquiries
            </Link>
          </nav>

          {/* Action & Profile Block */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#4D41DF] font-bold text-sm text-white clay-btn-primary hover:-translate-y-0.5 transition-transform cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Request</span>
            </button>

            {/* Notification Bell Badge */}
            <button
              onClick={() => showToast('You have 2 pending updates on your tracking center.', 'info')}
              aria-label="Notifications"
              className="relative p-2.5 rounded-full bg-white text-[#464555] hover:text-[#4D41DF] transition-all clay-card cursor-pointer border border-white"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB951] text-[#291800] text-[10px] font-bold ring-2 ring-white">
                2
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-white clay-card hover:bg-[#F6F1FF] transition-all cursor-pointer border border-white"
              >
                <div className="w-8 h-8 rounded-full bg-[#4D41DF] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {initial}
                </div>
                <span className="hidden md:inline-block text-sm font-semibold text-[#1B192F] max-w-[120px] truncate">
                  {firstName}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#464555]">expand_more</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 z-50 clay-card shadow-2xl border border-white">
                  <div className="px-3 py-2 border-b border-[#E4DFFE] mb-1">
                    <p className="text-xs text-[#464555] font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-[#1B192F] truncate">{email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">person</span>
                    <span>My Profile</span>
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">dashboard</span>
                    <span>Student Dashboard</span>
                  </Link>
                  <Link
                    to="/services"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">category</span>
                    <span>Academic Services</span>
                  </Link>
                  <div className="my-1 h-px bg-[#E4DFFE]"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-all cursor-pointer"
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
      {/* 2. MAIN WORK TRACKING CENTER VIEW                         */}
      {/* ======================================================== */}
      <main className="w-full pt-28 pb-20 bg-[#FCF8FF] min-h-[calc(100vh-140px)] flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
          
          {/* Page Heading & Refined Subtitle */}
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B192F] tracking-tight">
              My Requests
            </h1>
            <p className="text-sm md:text-base text-[#464555] max-w-2xl font-medium">
              Track the progress and delivery of all your academic requests.
            </p>
          </div>

          {/* EXACT 4 COMPACT SUMMARY STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests: 12 */}
            <div className="p-4 rounded-2xl bg-white clay-card flex items-center justify-between border border-white/80">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#464555] tracking-wide">Total Requests</p>
                <p className="text-2xl md:text-3xl font-extrabold text-[#1B192F]">{stats.total}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0EBFF] text-[#4D41DF] flex items-center justify-center clay-pill-inset">
                <span className="material-symbols-outlined text-[22px]">assignment</span>
              </div>
            </div>

            {/* Pending: 3 */}
            <div className="p-4 rounded-2xl bg-white clay-card flex items-center justify-between border border-white/80">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#464555] tracking-wide">Pending</p>
                <p className="text-2xl md:text-3xl font-extrabold text-[#7F5300]">{stats.pending}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#FFDDB3] text-[#7F5300] flex items-center justify-center clay-pill-inset">
                <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
              </div>
            </div>

            {/* In Progress: 5 */}
            <div className="p-4 rounded-2xl bg-white clay-card flex items-center justify-between border border-white/80">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#464555] tracking-wide">In Progress</p>
                <p className="text-2xl md:text-3xl font-extrabold text-[#5846C8]">{stats.inProgress}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#E4DFFE] text-[#5846C8] flex items-center justify-center clay-pill-inset">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
            </div>

            {/* Completed: 4 */}
            <div className="p-4 rounded-2xl bg-white clay-card flex items-center justify-between border border-white/80">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#464555] tracking-wide">Completed</p>
                <p className="text-2xl md:text-3xl font-extrabold text-[#4D41DF]">{stats.completed}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#E4DFFE] text-[#4D41DF] flex items-center justify-center clay-pill-inset">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
            </div>
          </div>

          {/* STATUS FILTERS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <nav aria-label="Status Filters" className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F6F1FF] rounded-2xl clay-pill-inset">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                    : 'text-[#464555] hover:text-[#1B192F] font-medium'
                }`}
              >
                All <span className="ml-1 opacity-80">({stats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                    : 'text-[#464555] hover:text-[#1B192F] font-medium'
                }`}
              >
                Pending <span className="ml-1 opacity-80">({stats.pending})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('in-progress')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                  activeFilter === 'in-progress'
                    ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                    : 'text-[#464555] hover:text-[#1B192F] font-medium'
                }`}
              >
                In Progress <span className="ml-1 opacity-80">({stats.inProgress})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                    : 'text-[#464555] hover:text-[#1B192F] font-medium'
                }`}
              >
                Completed <span className="ml-1 opacity-80">({stats.completed})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('cancelled')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                  activeFilter === 'cancelled'
                    ? 'bg-white text-[#4D41DF] shadow-sm font-bold'
                    : 'text-[#464555] hover:text-[#1B192F] font-medium'
                }`}
              >
                Cancelled <span className="ml-1 opacity-80">({stats.cancelled})</span>
              </button>
            </nav>

            <span className="text-xs font-semibold text-[#464555] self-end sm:self-center">
              Showing {filteredRequests.length} of {stats.total} requests
            </span>
          </div>

          {/* SEARCH & SORT BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by request title or request ID..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] placeholder:text-[#464555] text-sm clay-pill-inset focus:bg-white focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#464555] hover:text-[#1B192F]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px]">
                sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-11 pr-10 py-3 rounded-2xl bg-[#F6F1FF] text-[#1B192F] text-sm font-semibold clay-pill-inset focus:bg-white focus:outline-none transition-all cursor-pointer"
              >
                <option value="latest">Sort: Latest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="nearest">Deadline: Nearest</option>
                <option value="farthest">Deadline: Farthest</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#464555] text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* REQUEST CARDS GRID */}
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((req) => (
                <article
                  key={req.id}
                  className={`p-6 rounded-3xl bg-white clay-card flex flex-col justify-between space-y-5 hover:-translate-y-0.5 transition-all border border-white/80 ${
                    req.status === 'cancelled' ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Header: Service Icon + Service Name | Status Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center clay-pill-inset ${
                            req.status === 'in-progress'
                              ? 'bg-[#F0EBFF] text-[#4D41DF]'
                              : req.status === 'pending'
                              ? 'bg-[#FFDDB3] text-[#7F5300]'
                              : req.status === 'completed'
                              ? 'bg-[#E4DFFE] text-[#4D41DF]'
                              : 'bg-[#F0EBFF] text-[#777587]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {req.icon || 'edit_note'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#464555] uppercase tracking-wider">
                          {req.service}
                        </span>
                      </div>

                      {/* Status Badges Matching Stitch Spec */}
                      {req.status === 'in-progress' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFE] text-[#170065] text-xs font-bold clay-pill-inset">
                          <span className="w-2 h-2 rounded-full bg-[#5846C8] animate-pulse"></span>
                          ● In Progress
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB951] text-[#291800] text-xs font-bold clay-pill-inset">
                          ● Pending
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFE] text-[#4D41DF] text-xs font-bold clay-pill-inset">
                          ✓ Completed
                        </span>
                      )}
                      {req.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-bold clay-pill-inset">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {/* Title & ID */}
                    <div>
                      <h2 className="text-[18px] font-bold text-[#1B192F] leading-snug">
                        {req.title}
                      </h2>
                      <span
                        className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'pending'
                            ? 'text-[#7F5300] bg-[#FFDDB3]'
                            : req.status === 'cancelled'
                            ? 'text-[#464555] bg-[#F0EBFF]'
                            : 'text-[#4D41DF] bg-[#F0EBFF]'
                        }`}
                      >
                        #{req.id}
                      </span>
                    </div>

                    {/* Dates row */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F6F1FF] text-xs text-[#464555] clay-pill-inset">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#777587]">
                          calendar_today
                        </span>
                        <span>
                          Submitted: <strong className="text-[#1B192F] font-semibold">{req.submitted}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            req.status === 'completed'
                              ? 'text-[#4D41DF]'
                              : req.status === 'cancelled'
                              ? 'text-[#BA1A1A]'
                              : 'text-[#7F5300]'
                          }`}
                        >
                          {req.status === 'completed'
                            ? 'verified'
                            : req.status === 'cancelled'
                            ? 'event_busy'
                            : 'schedule'}
                        </span>
                        <span>
                          {req.status === 'completed'
                            ? 'Delivered: '
                            : req.status === 'cancelled'
                            ? 'Cancelled: '
                            : 'Due: '}
                          <strong className="text-[#1B192F] font-semibold">
                            {req.status === 'completed'
                              ? req.deliveredDate
                              : req.status === 'cancelled'
                              ? req.cancelledDate
                              : req.deadline}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Tracking Status-Specific Content */}
                    {/* 1. IN PROGRESS: 70% Progress bar with clay track + purple fill, expected completion */}
                    {req.status === 'in-progress' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#464555] font-medium">Work Progress</span>
                          <span className="text-[#4D41DF] font-bold">{req.progress}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#EAE5FF] overflow-hidden clay-pill-inset p-0.5">
                          <div
                            className="h-full rounded-full bg-[#4D41DF] transition-all duration-700"
                            style={{ width: `${req.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-[#464555] font-medium text-right">
                          Expected completion: {req.expectedCompletion}
                        </p>
                      </div>
                    )}

                    {/* 2. PENDING: 'Waiting for review', NO fake progress bar */}
                    {req.status === 'pending' && (
                      <div className="p-3 rounded-2xl bg-[#F0EBFF] text-xs text-[#464555] flex items-center gap-2 clay-pill-inset">
                        <span className="material-symbols-outlined text-[18px] text-[#7F5300]">
                          hourglass_empty
                        </span>
                        <div>
                          <p className="font-bold text-[#1B192F]">Waiting for review</p>
                          <p className="text-[11px] text-[#464555]">
                            {req.pendingNotice || 'Academic team is reviewing your files and requirements.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 3. COMPLETED: Replace progress bar with 'Work completed' chip */}
                    {req.status === 'completed' && (
                      <div className="p-3 rounded-2xl bg-[#EAE5FF] flex items-center justify-between text-xs clay-card-sm border border-[#E4DFFE]/50">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#4D41DF]">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Work completed
                        </span>
                        <span className="text-[#464555] font-medium text-[11px]">Ready for download</span>
                      </div>
                    )}

                    {/* 4. CANCELLED: Cancellation date, No progress bar */}
                    {req.status === 'cancelled' && (
                      <div className="p-3 rounded-2xl bg-[#F0EBFF] text-xs text-[#464555] clay-pill-inset">
                        <p className="font-medium">
                          Request cancelled on {req.cancelledDate || '13 Sep 2026'}. File submission closed.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: Primary CTA raised tactile clay button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(req.id)}
                      className="open-detail-btn px-5 py-2.5 rounded-full bg-[#F0EBFF] text-[#4D41DF] hover:bg-[#4D41DF] hover:text-white font-bold text-xs md:text-sm clay-card transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>View Details</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Container */
            <div className="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl bg-white clay-card text-center space-y-4 border border-white">
              <div className="w-16 h-16 rounded-2xl bg-[#F0EBFF] flex items-center justify-center text-[#4D41DF] clay-pill-inset">
                <span className="material-symbols-outlined text-[32px]">folder_off</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1B192F]">No Requests Found</h3>
                <p className="text-xs md:text-sm text-[#464555] max-w-sm">
                  No academic requests matched your current filter or search criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs md:text-sm font-bold clay-btn-primary hover:opacity-95 cursor-pointer shadow-md"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. REQUEST DETAIL VIEW (SLIDE-OUT DRAWER / MODAL)        */}
        {/* ======================================================== */}
        <div
          className={`fixed inset-0 bg-[#302E45]/40 backdrop-blur-sm z-50 transition-opacity duration-300 flex justify-end ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCloseDrawer}
        >
          <div
            className={`w-full max-w-2xl bg-white h-full overflow-y-auto p-6 md:p-8 shadow-2xl transition-transform duration-300 flex flex-col justify-between space-y-6 ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Content Container */}
            <div className="space-y-6">
              {/* Top header: Back button & ID badge */}
              <div className="flex items-center justify-between border-b border-[#EAE5FF] pb-4">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EBFF] text-xs md:text-sm font-bold text-[#1B192F] hover:bg-[#EAE5FF] transition-colors clay-pill-inset cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to My Requests</span>
                </button>
                <span className="text-xs font-bold text-[#464555] bg-[#F0EBFF] px-3 py-1 rounded-full">
                  #{activeRequest.id}
                </span>
              </div>

              {/* Request Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#4D41DF] bg-[#F0EBFF] px-3 py-1 rounded-full clay-pill-inset">
                    {activeRequest.service}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full clay-pill-inset ${activeRequest.statusBadgeClass}`}>
                    {activeRequest.statusLabel}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#1B192F] leading-tight">
                  {activeRequest.title}
                </h2>
                <p className="text-xs text-[#464555] font-medium">Request ID: #{activeRequest.id}</p>
              </div>

              {/* REQUEST TRACKING TIMELINE (Vertical timeline matching Stitch Tracking Center) */}
              <div className="p-5 md:p-6 rounded-2xl bg-[#F6F1FF] clay-pill-inset space-y-4">
                <h3 className="text-xs font-bold text-[#464555] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">timeline</span>
                  Request Tracking Timeline
                </h3>

                <div className="space-y-4 pl-1">
                  {/* Timeline Item 1: Submitted */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-[#4D41DF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#1B192F]">Request Submitted</p>
                      <p className="text-[11px] text-[#464555]">{activeRequest.timeline?.step1 || activeRequest.submitted}</p>
                    </div>
                  </div>

                  {/* Timeline Item 2: Accepted / Review */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                        activeRequest.status === 'cancelled'
                          ? 'bg-[#BA1A1A] text-white'
                          : activeRequest.status === 'pending'
                          ? 'bg-[#FFB951] text-[#291800]'
                          : 'bg-[#4D41DF] text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {activeRequest.status === 'cancelled' ? 'close' : activeRequest.status === 'pending' ? 'hourglass_top' : 'check'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#1B192F]">
                        {activeRequest.status === 'cancelled'
                          ? 'Request Cancelled'
                          : activeRequest.status === 'pending'
                          ? 'Under Review'
                          : 'Request Accepted'}
                      </p>
                      <p className="text-[11px] text-[#464555]">{activeRequest.timeline?.step2}</p>
                    </div>
                  </div>

                  {/* Timeline Item 3: Work in Progress */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                        activeRequest.status === 'in-progress'
                          ? 'bg-[#5846C8] text-white ring-4 ring-[#5846C8]/20 animate-pulse'
                          : activeRequest.status === 'completed'
                          ? 'bg-[#4D41DF] text-white'
                          : 'bg-[#F0EBFF] text-[#777587]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {activeRequest.status === 'completed' ? 'check' : activeRequest.status === 'in-progress' ? 'autorenew' : 'circle'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-bold ${
                          activeRequest.status === 'in-progress' || activeRequest.status === 'completed'
                            ? 'text-[#1B192F]'
                            : 'text-[#777587]'
                        }`}
                      >
                        {activeRequest.status === 'completed'
                          ? 'Work In Progress — Completed'
                          : activeRequest.status === 'in-progress'
                          ? 'Work In Progress — Currently working'
                          : 'Work In Progress'}
                      </p>
                      <p className="text-[11px] text-[#464555]">{activeRequest.timeline?.step3}</p>
                    </div>
                  </div>

                  {/* Timeline Item 4: Completed */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                        activeRequest.status === 'completed'
                          ? 'bg-[#4D41DF] text-white'
                          : 'bg-[#F0EBFF] text-[#777587]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {activeRequest.status === 'completed' ? 'check' : 'circle'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-bold ${
                          activeRequest.status === 'completed' ? 'text-[#4D41DF]' : 'text-[#777587]'
                        }`}
                      >
                        Completed
                      </p>
                      <p className="text-[11px] text-[#464555]">{activeRequest.timeline?.step4}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROGRESS SECTION (Status-Specific) */}
              <div>
                {/* In Progress: Work Progress, 70% bar, Expected completion */}
                {activeRequest.status === 'in-progress' && (
                  <div className="p-4 rounded-2xl bg-[#F0EBFF] space-y-2 clay-card-sm border border-[#E4DFFE]/40">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#1B192F]">Work Progress</span>
                      <span className="text-[#4D41DF]">{activeRequest.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#EAE5FF] overflow-hidden clay-pill-inset p-0.5">
                      <div
                        className="h-full rounded-full bg-[#4D41DF]"
                        style={{ width: `${activeRequest.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-[#464555] font-medium text-right">
                      Expected completion: {activeRequest.expectedCompletion}
                    </p>
                  </div>
                )}

                {/* Completed: Work Completed chip banner */}
                {activeRequest.status === 'completed' && (
                  <div className="p-4 rounded-2xl bg-[#EAE5FF] text-xs font-bold text-[#4D41DF] clay-card-sm flex items-center gap-2 border border-[#E4DFFE]">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>✓ Work Completed - Completed on {activeRequest.deliveredDate || activeRequest.deadline}</span>
                  </div>
                )}
              </div>

              {/* REQUEST INFORMATION (Structured Compact Clay Cards) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#464555] uppercase tracking-wider">
                  Request Information
                </h3>
                <div className="p-4 rounded-2xl bg-[#F6F1FF] space-y-3 text-xs clay-card-sm border border-[#EAE5FF]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#EAE5FF]">
                    <div>
                      <span className="text-[#464555] block font-medium">Service</span>
                      <span className="font-bold text-[#1B192F] text-sm">{activeRequest.service}</span>
                    </div>
                    <div>
                      <span className="text-[#464555] block font-medium">Request Title</span>
                      <span className="font-bold text-[#1B192F] text-sm">{activeRequest.title}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#464555] block font-medium mb-0.5">Description</span>
                    <p className="text-[#1B192F] font-medium leading-relaxed">
                      {activeRequest.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#EAE5FF]">
                    <div>
                      <span className="text-[#464555] block font-medium">Submitted</span>
                      <span className="font-bold text-[#1B192F]">{activeRequest.submitted}</span>
                    </div>
                    <div>
                      <span className="text-[#464555] block font-medium">Deadline</span>
                      <span className="font-bold text-[#1B192F]">{activeRequest.deadline}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#464555] block font-medium mb-0.5">Requirements</span>
                    <p className="text-[#1B192F] font-medium leading-relaxed">
                      {activeRequest.requirements}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUBMITTED FILES SECTION */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#464555] uppercase tracking-wider">
                  Submitted Files
                </h3>
                <div className="space-y-2">
                  {activeRequest.submittedFiles?.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F0EBFF] text-xs clay-card-sm border border-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[#4D41DF] text-[22px]">
                          description
                        </span>
                        <div>
                          <p className="font-bold text-[#1B192F]">{file.name}</p>
                          <p className="text-[11px] text-[#464555]">{file.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading ${file.name}...`, 'info')}
                        className="px-3 py-1.5 rounded-full bg-white text-[#4D41DF] font-bold hover:bg-[#EAE5FF] transition-colors text-xs clay-card-sm cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DELIVERED FILES SECTION (ONLY shown when request is completed) */}
              {activeRequest.status === 'completed' && activeRequest.deliveredFiles && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-[#4D41DF] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Delivered Files
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#EAE5FF] space-y-3 clay-card border border-[#E4DFFE]">
                    <div className="space-y-2">
                      {activeRequest.deliveredFiles.map((deliv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[#4D41DF] text-[22px]">
                              {deliv.icon || 'description'}
                            </span>
                            <div>
                              <p className="font-bold text-[#1B192F]">{deliv.name}</p>
                              <p className="text-[11px] text-[#464555]">{deliv.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => showToast(`Downloading ${deliv.name}...`, 'success')}
                            className="px-3 py-1.5 rounded-full bg-[#F0EBFF] text-[#4D41DF] font-bold hover:bg-[#4D41DF] hover:text-white transition-colors text-xs cursor-pointer"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading all delivered files for #${activeRequest.id}...`, 'success')}
                        className="px-5 py-2 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:opacity-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download All</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CONTEXTUAL ACTIONS FOOTER (Strictly no chat or inquiry) */}
            <div className="pt-4 border-t border-[#EAE5FF]">
              <button
                type="button"
                onClick={handleDrawerDynamicAction}
                disabled={activeRequest.status === 'cancelled'}
                className={`w-full py-3 rounded-full font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeRequest.btnClass}`}
              >
                <span>{activeRequest.btnText}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 4. NEW REQUEST MODAL                                     */}
      {/* ======================================================== */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#302E45]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setRequestModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4D41DF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1B192F]">Submit New Academic Request</h3>
                  <p className="text-xs text-[#464555]">Track progress from assignment to final delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">
                  Assignment Title / Subject Topic *
                </label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics Problem Set or IoT Telemetry Code"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none placeholder-[#464555]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Service Category</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
                  >
                    <option value="Assignment Writing">Assignment Writing (Core Academic)</option>
                    <option value="Practical Files & Viva">Practical Files & Viva Prep</option>
                    <option value="Coding & Technical">Coding & Technical Projects</option>
                    <option value="PPT & Presentation">PPT & Slide Decks</option>
                    <option value="Project Reports">Project Reports & Thesis</option>
                    <option value="Engineering Drawing">Engineering Drawing & CAD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Deadline *</label>
                  <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                    <input
                      type="date"
                      value={reqDeadline}
                      onChange={(e) => setReqDeadline(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Output Format</label>
                  <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                    <select
                      value={reqFormat}
                      onChange={(e) => setReqFormat(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none cursor-pointer"
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
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">
                  Specific Requirements or Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste teacher instructions, rubric guidelines, word limits, or special remarks..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] text-sm text-[#1B192F] outline-none resize-none placeholder-[#464555]/50 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#464555] hover:bg-[#F6F1FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
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
          className="fixed inset-0 z-50 bg-[#302E45]/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 clay-card shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4D41DF] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1B192F]">Student Profile</h3>
                  <p className="text-xs text-[#464555]">Manage your account details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Full Name</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#1B192F] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">College / University</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none"
                    placeholder="e.g. Stanford University or MIT"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B192F]/70 mb-1.5">Course / Degree</label>
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] border border-[#E4DFFE] flex items-center">
                  <input
                    type="text"
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#1B192F] outline-none"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#464555] hover:bg-[#F6F1FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MOBILE BOTTOM NAVIGATION                               */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#FCF8FF]/95 backdrop-blur-xl border-t border-[#EAE5FF] shadow-lg px-2 py-2 flex items-center justify-around">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span>Home</span>
        </Link>
        <Link
          to="/services"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
          <span>Services</span>
        </Link>
        <span
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-bold text-[#4D41DF] cursor-default"
        >
          <span className="material-symbols-outlined text-[22px]">task</span>
          <span>My Requests</span>
        </span>
        <Link
          to="/inquiries"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>Inquiries</span>
        </Link>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 7. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#F6F1FF] border-t border-[#EAE5FF]/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm font-bold text-[#1B192F]">Assignment Hub © 2025</p>
            <p className="text-xs text-[#464555]">You give us your work — we take care of the rest.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#464555]">
            <Link to="/about" className="hover:text-[#4D41DF] transition-colors">About</Link>
            <Link to="/contact" className="hover:text-[#4D41DF] transition-colors">Contact</Link>
            <Link to="/support" className="hover:text-[#4D41DF] transition-colors">Support</Link>
            <Link to="/privacy-policy" className="hover:text-[#4D41DF] transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-[#4D41DF] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MyRequestsPage;
