import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Sample conversation dataset matching Stitch Screen d167850e22ad434e91dd9d2aab2d11c2
const INITIAL_CONVERSATIONS = [
  {
    id: 'math',
    title: 'Mathematics Assignment',
    subtitle: 'Calculus III',
    subjectDetail: 'Subject: Calculus III & Vector Algebra • Assigned Academic Support',
    icon: 'functions',
    iconBg: 'bg-[#675DF9] text-white',
    lastTime: '2 min ago',
    unread: true,
    resolved: false,
    messages: [
      {
        id: 1,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: '10:30 AM',
        text: 'Hi Aditya! How can we help you today with your coursework?'
      },
      {
        id: 2,
        sender: 'user',
        senderName: 'You',
        time: '10:32 AM',
        text: 'I need help completing my Mathematics assignment. Can it be completed by tomorrow afternoon?'
      },
      {
        id: 3,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: '10:35 AM',
        text: 'Yes, our mathematics mentor Dr. Banerjee is available. Please send the assignment questions and any specific required formatting instructions.'
      },
      {
        id: 4,
        sender: 'user',
        senderName: 'You',
        time: '10:36 AM',
        text: 'Sure, here are the problem sheets from the professor:',
        attachment: {
          name: 'Math_Assignment_Questions_Set4.pdf',
          size: '2.4 MB • 6 Pages',
          type: 'pdf'
        }
      },
      {
        id: 5,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: '10:40 AM',
        text: 'Received! We are reviewing the questions right away. You can reply anytime if you have additional notes or university rubrics.'
      }
    ]
  },
  {
    id: 'project',
    title: 'Final Year Project',
    subtitle: 'IoT Smart Irrigation',
    subjectDetail: 'Subject: IoT Smart Irrigation System • Technical Mentor Lead',
    icon: 'engineering',
    iconBg: 'bg-[#E4DFFE] text-[#5846C8]',
    lastTime: 'Yesterday',
    unread: false,
    resolved: false,
    messages: [
      {
        id: 1,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: 'Yesterday, 04:15 PM',
        text: 'Greetings! Our engineering lead Eng. Vikram Rao is reviewing your IoT project outline.'
      },
      {
        id: 2,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: 'Yesterday, 04:20 PM',
        text: 'Please send the project requirements, required micro-controller hardware (ESP32/Arduino), and report length guidelines.'
      },
      {
        id: 3,
        sender: 'user',
        senderName: 'You',
        time: 'Yesterday, 06:10 PM',
        text: 'I have uploaded the synopsis and circuit diagrams. Need Wokwi simulation plus report.'
      }
    ]
  },
  {
    id: 'ppt',
    title: 'New PPT Requirement',
    subtitle: 'Macroeconomics',
    subjectDetail: 'Subject: Macroeconomics Seminar • Presentation Specialist',
    icon: 'slideshow',
    iconBg: 'bg-[#FFDDB3] text-[#7F5300]',
    lastTime: '2 days ago',
    unread: false,
    resolved: false,
    messages: [
      {
        id: 1,
        sender: 'user',
        senderName: 'You',
        time: '24 Sep, 11:15 AM',
        text: 'I need around 15 slides on modern monetary policy and inflation targeting.'
      },
      {
        id: 2,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: '24 Sep, 11:30 AM',
        text: 'Understood. We will structure 15 widescreen 16:9 slides with infographics and complete presenter notes for your viva.'
      }
    ]
  },
  {
    id: 'python',
    title: 'Python Lab Report Formatting',
    subtitle: 'CS 204 Data Structures',
    subjectDetail: 'Subject: CS 204 Data Structures • Completed Reference Archive',
    icon: 'code',
    iconBg: 'bg-[#EAE5FF] text-[#464555]',
    lastTime: '3 days ago',
    unread: false,
    resolved: true,
    messages: [
      {
        id: 1,
        sender: 'user',
        senderName: 'You',
        time: '23 Sep, 02:00 PM',
        text: 'Can you help format 10 Python recursion programs according to IEEE lab standards?'
      },
      {
        id: 2,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: '23 Sep, 05:40 PM',
        text: 'Verified! Formatted PDF has been sent with complete dry-run recursion trees.'
      }
    ]
  }
];

export function InquiriesPage() {
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Conversations state
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedConvoId, setSelectedConvoId] = useState('math');
  const [listFilter, setListFilter] = useState('all'); // 'all' | 'resolved-only'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'resolved' | 'empty'

  // Composer state
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // New Convo form
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Profile Edit form
  const [editName, setEditName] = useState(user?.name || '');
  const [editCollege, setEditCollege] = useState(user?.college || '');
  const [editCourse, setEditCourse] = useState(user?.course || '');

  // Derived user details
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';
  const email = user?.email || 'student@university.edu';

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active conversation object
  const activeConvo = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvoId) || conversations[0];
  }, [conversations, selectedConvoId]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConvo?.messages]);

  // Counts
  const counts = useMemo(() => {
    const total = conversations.length;
    const resolved = conversations.filter((c) => c.resolved).length;
    return { total, resolved };
  }, [conversations]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesFilter = listFilter === 'all' || (listFilter === 'resolved-only' && c.resolved);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.subjectDetail.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [conversations, listFilter, searchQuery]);

  // Switch view mode (Active, Resolved, Empty)
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'active') {
      const activeOne = conversations.find((c) => !c.resolved) || conversations[0];
      setSelectedConvoId(activeOne.id);
      setListFilter('all');
    } else if (mode === 'resolved') {
      const resolvedOne = conversations.find((c) => c.resolved) || conversations[0];
      setSelectedConvoId(resolvedOne.id);
      setListFilter('resolved-only');
    }
  };

  // Select conversation
  const handleSelectConversation = (id) => {
    setSelectedConvoId(id);
    if (viewMode === 'empty') {
      setViewMode('active');
    }
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  // Toggle resolved state
  const handleToggleResolvedState = () => {
    const newResolvedState = !activeConvo.resolved;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvo.id
          ? {
              ...c,
              resolved: newResolvedState
            }
          : c
      )
    );
    showToast(
      newResolvedState
        ? `Conversation "${activeConvo.title}" marked as Resolved.`
        : `Conversation "${activeConvo.title}" reopened.`,
      'info'
    );
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text && !selectedFile) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      senderName: 'You',
      time: timeStr,
      text: text || 'Uploaded file for review:',
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            type: selectedFile.type?.includes('pdf') ? 'pdf' : 'doc'
          }
        : null
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvo.id
          ? {
              ...c,
              lastTime: 'Just now',
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    setInputMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Simulated responsive feedback from Academic Support
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'support',
        senderName: 'Assignment Hub Academic Support',
        badge: 'Verified Staff',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Thank you for your update! Our academic coordinator has logged this into your coursework file.'
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                lastTime: 'Just now',
                messages: [...c.messages, replyMsg]
              }
            : c
        )
      );
    }, 1200);
  };

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      showToast(`Attached: ${file.name}`, 'info');
    }
  };

  // Handle Create New Conversation
  const handleCreateConversation = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const newId = `convo-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newConversation = {
      id: newId,
      title: newTitle.trim(),
      subtitle: 'Academic Inquiries',
      subjectDetail: `Subject: ${newTitle.trim()} • Assigned Academic Support`,
      icon: 'chat',
      iconBg: 'bg-[#675DF9] text-white',
      lastTime: 'Just now',
      unread: false,
      resolved: false,
      messages: [
        {
          id: 1,
          sender: 'user',
          senderName: 'You',
          time: timeStr,
          text: newMessage.trim()
        },
        {
          id: 2,
          sender: 'support',
          senderName: 'Assignment Hub Academic Support',
          badge: 'Verified Staff',
          time: timeStr,
          text: `Hello ${firstName}! We received your inquiry regarding "${newTitle.trim()}". A subject mentor will answer in ~10 minutes.`
        }
      ]
    };

    setConversations([newConversation, ...conversations]);
    setSelectedConvoId(newId);
    setNewModalOpen(false);
    setNewTitle('');
    setNewMessage('');
    setViewMode('active');
    showToast(`Conversation "${newTitle}" created successfully!`, 'success');
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
      {/* 1. TOP NAVBAR (Matching Stitch Header)                   */}
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
            <Link
              to="/my-requests"
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] transition-all"
            >
              My Requests
            </Link>
            <span
              className="px-4 py-2 rounded-full text-sm font-bold bg-white text-[#4D41DF] shadow-sm clay-card-sm cursor-default"
            >
              Inquiries
            </span>
          </nav>

          {/* Action & Profile Block */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#4D41DF] font-bold text-sm text-white clay-btn-primary hover:-translate-y-0.5 transition-transform cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Conversation</span>
            </button>

            {/* Notification Bell Badge */}
            <button
              onClick={() => showToast('You have 2 updates from academic mentors.', 'info')}
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
                  <Link
                    to="/my-requests"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#F0EBFF] hover:text-[#1B192F] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#4D41DF]">task</span>
                    <span>My Requests</span>
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
      {/* 2. MAIN INQUIRIES CHAT CENTER INTERFACE                   */}
      {/* ======================================================== */}
      <main className="w-full pt-28 pb-20 bg-[#FCF8FF] min-h-[calc(100vh-140px)] flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6">
          
          {/* Top Header Bar with Crisp Title and Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B192F] tracking-tight">
                  Inquiries
                </h1>
                <span className="px-3 py-1 rounded-full bg-[#E3DFFF] text-[#4D41DF] text-xs font-bold clay-pill-inset flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4D41DF] animate-pulse"></span>
                  Direct Academic Chat
                </span>
              </div>
              <p className="text-sm md:text-base text-[#464555] font-medium">
                Chat with the Assignment Hub team about your academic coursework and requirements.
              </p>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              {/* Interactive Preview Controls (Active, Resolved, Empty switches) */}
              <div className="flex items-center bg-[#F6F1FF] p-1.5 rounded-full clay-pill-inset">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('active')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'active'
                      ? 'text-[#4D41DF] bg-white clay-card-sm shadow-sm'
                      : 'text-[#464555] hover:text-[#1B192F]'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('resolved')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'resolved'
                      ? 'text-[#4D41DF] bg-white clay-card-sm shadow-sm'
                      : 'text-[#464555] hover:text-[#1B192F]'
                  }`}
                >
                  Resolved
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('empty')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'empty'
                      ? 'text-[#4D41DF] bg-white clay-card-sm shadow-sm'
                      : 'text-[#464555] hover:text-[#1B192F]'
                  }`}
                >
                  Empty
                </button>
              </div>

              <button
                type="button"
                onClick={() => setNewModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#4D41DF] text-white font-bold text-xs md:text-sm clay-btn-primary hover:-translate-y-0.5 transition-transform cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>New Conversation</span>
              </button>
            </div>
          </div>

          {/* MAIN TWO-PANEL INTERFACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[720px]">
            
            {/* ======================================================== */}
            {/* LEFT PANEL: Conversation List (4 cols on desktop)       */}
            {/* ======================================================== */}
            <aside className="w-full lg:col-span-5 xl:col-span-4 flex flex-col gap-4 bg-white p-5 rounded-3xl clay-card border border-white/80">
              
              {/* Search Conversation Inset Box */}
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464555] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F1FF] rounded-xl text-xs md:text-sm text-[#1B192F] placeholder:text-[#464555]/70 clay-pill-inset focus:outline-none focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#464555] hover:text-[#1B192F]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pill Chips */}
              <div className="flex items-center gap-1 p-1 bg-[#F6F1FF] rounded-full clay-pill-inset">
                <button
                  type="button"
                  onClick={() => setListFilter('all')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
                    listFilter === 'all'
                      ? 'text-[#4D41DF] bg-white clay-card-sm shadow-sm'
                      : 'text-[#464555] hover:text-[#1B192F]'
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter('resolved-only')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
                    listFilter === 'resolved-only'
                      ? 'text-[#4D41DF] bg-white clay-card-sm shadow-sm'
                      : 'text-[#464555] hover:text-[#1B192F]'
                  }`}
                >
                  Resolved ({counts.resolved})
                </button>
              </div>

              {/* Conversation Item List */}
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[520px] pr-1">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((convo) => {
                    const isSelected = selectedConvoId === convo.id && viewMode !== 'empty';
                    const lastMsg = convo.messages[convo.messages.length - 1];

                    return (
                      <div
                        key={convo.id}
                        onClick={() => handleSelectConversation(convo.id)}
                        className={`cursor-pointer p-4 rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#F0EBFF] clay-pill-inset border-2 border-[#4D41DF]/30 shadow-md'
                            : 'bg-white hover:bg-[#F6F1FF] clay-card border border-white/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full ${convo.iconBg} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                              <span className="material-symbols-outlined text-[18px]">
                                {convo.icon || 'chat'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-[#1B192F] leading-tight truncate">
                                {convo.title}
                              </h3>
                              <span className={`text-[11px] font-bold uppercase tracking-wider block truncate ${
                                convo.resolved ? 'text-[#464555]' : 'text-[#4D41DF]'
                              }`}>
                                {convo.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[11px] font-semibold text-[#464555]">
                              {convo.lastTime}
                            </span>
                            {convo.resolved ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#EAE5FF] text-[#464555] text-[10px] font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                Resolved
                              </span>
                            ) : convo.unread ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#4D41DF] shadow-[0_0_8px_rgba(77,65,223,0.8)]"></span>
                            ) : null}
                          </div>
                        </div>

                        <div className="pl-11">
                          <p className="text-xs text-[#464555] truncate font-medium">
                            <span className="font-bold text-[#1B192F]">
                              {lastMsg?.sender === 'user' ? 'You: ' : 'Assignment Hub: '}
                            </span>
                            {lastMsg?.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-[#464555]">
                    No conversations match your search.
                  </div>
                )}
              </div>

              {/* Student Direct Helper Pill */}
              <div className="mt-auto pt-2 border-t border-[#F0EBFF]">
                <div className="p-3.5 rounded-2xl bg-[#F6F1FF] flex items-center gap-3 clay-pill-inset">
                  <div className="w-10 h-10 rounded-full bg-[#E3DFFF] flex items-center justify-center text-[#4D41DF] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1B192F]">Academic Response Team</p>
                    <p className="text-[11px] text-[#464555]">Typical response within 10-15 minutes</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ======================================================== */}
            {/* RIGHT PANEL: Active Chat Canvas OR Empty State Panel     */}
            {/* ======================================================== */}
            {viewMode === 'empty' ? (
              /* EMPTY STATE VIEW */
              <section className="w-full lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-3xl clay-card text-center min-h-[640px] border border-white">
                <div className="w-24 h-24 rounded-3xl bg-[#F0EBFF] text-[#4D41DF] flex items-center justify-center mb-6 clay-pill-inset">
                  <span className="material-symbols-outlined text-[48px]">chat_bubble_outline</span>
                </div>
                <h2 className="text-2xl font-bold text-[#1B192F] mb-2">No Conversations Yet</h2>
                <p className="text-sm text-[#464555] max-w-md mb-6 leading-relaxed">
                  Have questions about an upcoming paper, problem set, or presentation? Start a direct thread with our subject mentors.
                </p>
                <button
                  type="button"
                  onClick={() => setNewModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#4D41DF] text-white font-bold text-sm clay-btn-primary hover:-translate-y-0.5 transition-all cursor-pointer shadow-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">add_comment</span>
                  <span>Start Your First Conversation</span>
                </button>
              </section>
            ) : (
              /* ACTIVE CONVERSATION CANVAS */
              <section className="w-full lg:col-span-7 xl:col-span-8 flex flex-col bg-white rounded-3xl clay-card overflow-hidden min-h-[640px] border border-white/80">
                
                {/* Conversation Top Bar */}
                <div className="p-5 md:p-6 bg-white flex items-center justify-between border-b border-[#F0EBFF] z-10 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#675DF9] text-white flex items-center justify-center clay-btn-primary shadow-md shrink-0">
                      <span className="material-symbols-outlined text-[24px]">
                        {activeConvo?.icon || 'functions'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg md:text-xl font-bold text-[#1B192F] tracking-tight">
                          {activeConvo?.title}
                        </h2>
                        {activeConvo?.resolved ? (
                          <span className="px-3 py-0.5 rounded-full bg-[#EAE5FF] text-[#464555] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Resolved
                          </span>
                        ) : (
                          <span className="px-3 py-0.5 rounded-full bg-[#F0EBFF] text-[#4D41DF] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 clay-pill-inset">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4D41DF]"></span>
                            Active conversation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#464555] font-medium mt-0.5">
                        {activeConvo?.subjectDetail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleResolvedState}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-xs font-bold text-[#1B192F] transition-all clay-pill-inset cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#4D41DF]">
                        {activeConvo?.resolved ? 'replay' : 'check_circle'}
                      </span>
                      <span>{activeConvo?.resolved ? 'Reopen Conversation' : 'Mark as Resolved'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewModalOpen(true)}
                      title="Start Another Conversation"
                      className="w-9 h-9 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] flex items-center justify-center text-[#464555] hover:text-[#1B192F] transition-all cursor-pointer clay-pill-inset"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                {/* RESOLVED CONVERSATION BANNER */}
                {activeConvo?.resolved && (
                  <div className="px-6 py-3 bg-[#EAE5FF] flex items-center justify-between gap-4 border-b border-[#E4DFFE]">
                    <div className="flex items-center gap-2 text-xs text-[#1B192F]">
                      <span className="material-symbols-outlined text-[#4D41DF] text-[20px]">task_alt</span>
                      <span>
                        This conversation has been marked as <strong>Resolved</strong>. Messages remain accessible for academic reference.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewModalOpen(true)}
                      className="px-3 py-1 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      <span>Start New</span>
                    </button>
                  </div>
                )}

                {/* CHAT MESSAGE SCROLL AREA */}
                <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[500px] bg-gradient-to-b from-white to-[#FCF8FF]">
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-1">
                    <span className="px-4 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-semibold clay-pill-inset">
                      Today, 26 Sep
                    </span>
                  </div>

                  {/* Messages Stream */}
                  {activeConvo?.messages?.map((msg) => {
                    const isUser = msg.sender === 'user';

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${
                          isUser ? 'self-end flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md font-bold text-xs ${
                            isUser
                              ? 'bg-[#5846C8] text-white'
                              : 'bg-[#4D41DF] text-white'
                          }`}
                        >
                          {isUser ? initial : 'AH'}
                        </div>

                        {/* Content */}
                        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1B192F]">
                              {isUser ? 'You' : msg.senderName}
                            </span>
                            {!isUser && msg.badge && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[#E3DFFF] text-[#4D41DF] text-[9px] font-bold uppercase tracking-wider">
                                {msg.badge}
                              </span>
                            )}
                            <span className="text-[11px] text-[#464555]/70">{msg.time}</span>
                          </div>

                          <div
                            className={`p-4 sm:p-5 rounded-2xl ${
                              isUser
                                ? 'rounded-tr-sm bg-[#E3DFFF] text-[#1B192F] shadow-sm clay-card border border-[#DCD6FF]'
                                : 'rounded-tl-sm bg-[#F6F1FF] text-[#1B192F] clay-card border border-white'
                            }`}
                          >
                            <p className="text-xs sm:text-sm font-medium leading-relaxed">
                              {msg.text}
                            </p>

                            {/* Embedded File Attachment Card */}
                            {msg.attachment && (
                              <div className="mt-3 p-3 rounded-xl bg-white text-[#1B192F] flex items-center justify-between gap-3 clay-card border border-white">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-[#1B192F] block truncate">
                                      {msg.attachment.name}
                                    </span>
                                    <span className="text-[10px] text-[#464555]">
                                      {msg.attachment.size}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => showToast(`Opening ${msg.attachment.name}...`, 'info')}
                                  className="px-2.5 py-1 rounded-full bg-[#F0EBFF] hover:bg-[#E4DFFE] text-[11px] font-bold text-[#4D41DF] transition-colors cursor-pointer shrink-0"
                                >
                                  Download
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sticky Bottom Message Composer */}
                <div className="p-4 sm:p-5 bg-white border-t border-[#F0EBFF] z-10">
                  <form
                    onSubmit={handleSendMessage}
                    className="relative flex items-center gap-2 p-2 bg-[#F6F1FF] rounded-2xl clay-pill-inset"
                  >
                    {/* Attachment Trigger */}
                    <label
                      className="cursor-pointer w-10 h-10 rounded-xl bg-white hover:bg-[#F0EBFF] flex items-center justify-center text-[#464555] hover:text-[#4D41DF] transition-all clay-card shrink-0"
                      title="Attach file"
                    >
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message to Academic Support..."
                      className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-[#1B192F] placeholder:text-[#464555]/70 focus:outline-none"
                    />

                    {/* Selected File Badge */}
                    {selectedFile && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E3DFFF] text-[#4D41DF] text-xs font-bold clay-pill-inset">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        <span className="truncate max-w-[120px]">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="hover:text-[#BA1A1A] font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Submit Send Button */}
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-[#4D41DF] text-white flex items-center justify-center clay-btn-primary hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </form>

                  <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#464555]/70">
                    <span>Press Enter to send. Attach PDFs, docs, or screenshots.</span>
                    <span className="font-semibold text-[#4D41DF] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      Confidential academic workspace
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. START NEW CONVERSATION CLAY MODAL                     */}
      {/* ======================================================== */}
      {newModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#302E45]/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200"
          onClick={() => setNewModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white p-6 sm:p-8 rounded-3xl clay-card shadow-2xl border border-white flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#1B192F] tracking-tight">
                  Start New Conversation
                </h3>
                <p className="text-xs text-[#464555]">
                  What is this conversation regarding?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F1FF] hover:bg-[#F0EBFF] text-[#1B192F] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateConversation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1B192F]">
                  Conversation Subject / Assignment Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Database Normalization Assignment, Seminar Deck..."
                  className="w-full px-4 py-3 bg-[#F6F1FF] rounded-xl text-xs md:text-sm text-[#1B192F] placeholder:text-[#464555]/70 clay-pill-inset focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1B192F]">
                  Your Initial Message *
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Briefly describe what you need assistance with, your deadline, and instructions..."
                  rows={4}
                  className="w-full p-4 bg-[#F6F1FF] rounded-xl text-xs md:text-sm text-[#1B192F] placeholder:text-[#464555]/70 clay-pill-inset focus:outline-none focus:bg-white resize-none"
                  required
                />
              </div>

              {/* Optional Attachment Dropzone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1B192F]">Optional Attachment</label>
                <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F6F1FF] border-2 border-dashed border-[#C7C4D8] hover:border-[#4D41DF] cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-[28px] text-[#4D41DF] mb-1">
                    upload_file
                  </span>
                  <span className="text-xs font-bold text-[#1B192F]">
                    Click to attach questions, syllabus, or lecture slides
                  </span>
                  <span className="text-[10px] text-[#464555]">PDF, DOCX, ZIP, or PNG up to 25 MB</span>
                  <input type="file" className="hidden" />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F0EBFF]">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#464555] hover:bg-[#F6F1FF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold clay-btn-primary hover:bg-[#3d32ce] transition-all cursor-pointer shadow-md"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PROFILE EDIT MODAL                                    */}
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
      {/* 5. MOBILE BOTTOM NAVIGATION                               */}
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
        <Link
          to="/my-requests"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">task</span>
          <span>My Requests</span>
        </Link>
        <span
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-bold text-[#4D41DF] cursor-default"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>Inquiries</span>
        </span>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#4D41DF] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 6. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#F6F1FF] border-t border-[#EAE5FF]/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm font-bold text-[#1B192F]">Assignment Hub © 2026.</p>
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

export default InquiriesPage;
