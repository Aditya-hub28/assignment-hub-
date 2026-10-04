import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export function MyRequestsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active status filter tab: 'all' | 'active' | 'in_review' | 'completed'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected request for full details drawer/modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchUserRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.services.getRequests();
      const list = Array.isArray(res?.data) ? res.data : [];
      setRequests(list);
    } catch (err) {
      console.error('[MY_REQUESTS_FETCH_ERROR]', err);
      setError(err.message || 'Unable to retrieve requests. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  // Compute live dashboard metrics directly from real backend data
  const metrics = useMemo(() => {
    const total = requests.length;
    const active = requests.filter(
      (r) => !['completed', 'delivered', 'cancelled'].includes((r.status || '').toLowerCase())
    ).length;
    const completed = requests.filter((r) =>
      ['completed', 'delivered'].includes((r.status || '').toLowerCase())
    ).length;

    return { total, active, completed };
  }, [requests]);

  // Filter & Search
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Tab filter
        const status = (req.status || '').toLowerCase();
        if (activeTab === 'active') {
          if (['completed', 'delivered', 'cancelled'].includes(status)) return false;
        } else if (activeTab === 'in_review') {
          if (!status.includes('review') && status !== 'pending') return false;
        } else if (activeTab === 'completed') {
          if (!['completed', 'delivered'].includes(status)) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = (req.id || '').toLowerCase().includes(q);
          const matchTitle = (req.title || '').toLowerCase().includes(q);
          const matchSubject = (req.subject || '').toLowerCase().includes(q);
          const matchService = (req.service || '').toLowerCase().includes(q);
          return matchId || matchTitle || matchSubject || matchService;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') {
          return new Date(a.deadline || 0) - new Date(b.deadline || 0);
        }
        if (sortBy === 'course') {
          return (a.subject || '').localeCompare(b.subject || '');
        }
        // Default: newest submission
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [requests, activeTab, searchQuery, sortBy]);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied ${id} to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed' || s === 'delivered') {
      return {
        label: 'Delivered',
        dotClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (s.includes('review')) {
      return {
        label: 'In Review',
        dotClass: 'bg-amber-500 animate-pulse',
        badgeClass: 'bg-[#FFDDB3] text-[#7F5300] border-amber-300'
      };
    }
    return {
      label: 'In Progress',
      dotClass: 'bg-[#4D41DF] animate-ping',
      badgeClass: 'bg-[#E4DFFE] text-[#4D41DF] border-purple-200'
    };
  };

  const getFileIcon = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'folder_zip';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
    return 'description';
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] font-['Plus_Jakarta_Sans',sans-serif] text-[#1B192F] antialiased flex flex-col justify-between">
      {/* Agent 1 Standard Navbar */}
      <Navbar />

      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 flex-grow">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
          
          {/* Top Header & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] font-bold text-[10px] sm:text-xs w-fit clay-pill">
                <span className="material-symbols-outlined text-[16px]">folder_managed</span>
                <span>STUDENT WORKSPACE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
                My Requests
              </h1>
              <p className="text-sm sm:text-base text-[#464555] max-w-2xl leading-relaxed">
                Track, review, and inspect your academic submissions and active coordinator deliverables with real-time status updates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchUserRequests}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#1B192F] text-xs sm:text-sm font-bold clay-card hover:bg-[#FAF8FF] transition-transform active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* 1. REQUEST DASHBOARD (Real Backend Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Requests */}
            <div className="p-6 rounded-3xl bg-white clay-card flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 border border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#464555] font-bold">
                  Total Requests
                </span>
                <div className="w-10 h-10 rounded-full bg-[#EAE5FF] text-[#4D41DF] flex items-center justify-center clay-pill">
                  <span className="material-symbols-outlined text-[20px]">layers</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#1B192F] leading-none">
                  {metrics.total}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-xs font-bold clay-pill">
                  Lifetime
                </span>
              </div>
              <p className="mt-2 text-xs text-[#464555]">All lifetime submissions</p>
            </div>

            {/* Active Requests */}
            <div className="p-6 rounded-3xl bg-white clay-card flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 border border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#464555] font-bold">
                  Active Requests
                </span>
                <div className="w-10 h-10 rounded-full bg-[#E4DFFF] text-[#5846C8] flex items-center justify-center clay-pill">
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#1B192F] leading-none">
                  {metrics.active}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#E4DFFE] text-[#4D41DF] text-xs font-bold clay-pill">
                  Active
                </span>
              </div>
              <p className="mt-2 text-xs text-[#464555]">In progress or review</p>
            </div>

            {/* Completed Requests */}
            <div className="p-6 rounded-3xl bg-white clay-card flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 border border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#464555] font-bold">
                  Completed Requests
                </span>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center clay-pill">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#1B192F] leading-none">
                  {metrics.completed}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold clay-pill">
                  Completed
                </span>
              </div>
              <p className="mt-2 text-xs text-[#464555]">Successfully delivered</p>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="p-4 rounded-3xl bg-white clay-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border border-white">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F6F1FF] clay-pill-inset overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#4D41DF] text-white shadow-md'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                All Requests ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-[#4D41DF] text-white shadow-md'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                Active ({metrics.active})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-[#4D41DF] text-white shadow-md'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                Completed ({metrics.completed})
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-grow min-w-[260px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Request ID, Topic, or Service..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F6F1FF] text-[#1B192F] text-xs sm:text-sm clay-pill-inset focus:outline-none placeholder:text-[#777587]"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 rounded-full bg-[#F6F1FF] text-[#464555] text-xs font-bold clay-pill-inset focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort by: Newest Submission</option>
                  <option value="urgent">Sort by: Target Deadline</option>
                  <option value="course">Sort by: Course Code</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* 2. REQUEST LIST (Compact Rows, Only ONE List) */}
          <div className="flex flex-col gap-4">
            
            {/* Loading State */}
            {isLoading && (
              <div className="p-12 rounded-3xl bg-white clay-card flex flex-col items-center justify-center text-center gap-3 border border-white">
                <div className="w-8 h-8 border-3 border-[#4D41DF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-[#464555]">Loading your request records...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="p-8 rounded-3xl bg-white clay-card flex flex-col items-center text-center gap-3 border border-red-200">
                <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
                <h3 className="text-lg font-bold text-[#1B192F]">Unable to load requests</h3>
                <p className="text-xs text-[#464555]">{error}</p>
                <button
                  type="button"
                  onClick={fetchUserRequests}
                  className="px-6 py-2 rounded-full bg-[#4D41DF] text-white text-xs font-bold cursor-pointer hover:bg-[#675DF9]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredRequests.length === 0 && (
              <div className="p-12 sm:p-16 rounded-3xl bg-white clay-card flex flex-col items-center text-center gap-4 border border-white">
                <div className="w-16 h-16 rounded-full bg-[#F0EBFF] text-[#4D41DF] flex items-center justify-center clay-pill shadow-inner">
                  <span className="material-symbols-outlined text-[32px]">folder_open</span>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h3 className="text-xl font-bold text-[#1B192F]">No academic requests found</h3>
                  <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                    {searchQuery || activeTab !== 'all'
                      ? 'No requests match your current filters. Try changing your search query.'
                      : "You haven't submitted any service requests yet. When you submit an assignment or custom project, it will automatically appear here."}
                  </p>
                </div>
                <Link
                  to="/services"
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4D41DF] hover:bg-[#675DF9] text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Browse Academic Services</span>
                </Link>
              </div>
            )}

            {/* Compact Rows */}
            {!isLoading && !error && filteredRequests.length > 0 && (
              filteredRequests.map((req) => {
                const statusBadge = getStatusBadge(req.status);
                return (
                  <article
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="group p-4 sm:px-6 sm:py-4 rounded-3xl bg-white clay-card hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 border-l-4 border-[#4D41DF] border-t border-r border-b border-white relative overflow-hidden"
                  >
                    {/* Left: Request ID, Service, Topic, Subject */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-grow min-w-0">
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, req.id)}
                          title="Copy Request ID"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0EBFF] text-xs font-bold text-[#4D41DF] clay-pill hover:bg-[#EAE5FF] transition-colors"
                        >
                          <span>{req.id}</span>
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedId === req.id ? 'check' : 'content_copy'}
                          </span>
                        </button>

                        <span className="px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] text-xs font-bold clay-pill">
                          {req.service || 'Assignment'}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-[11px] text-[#777587] font-semibold">
                          {req.subject || 'Standard Coursework'}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-[#1B192F] truncate group-hover:text-[#4D41DF] transition-colors">
                          {req.title || 'Untitled Request'}
                        </h2>
                      </div>
                    </div>

                    {/* Right: Deadline, Status, Details Button */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="flex flex-col text-left md:text-right">
                        <span className="text-[10px] text-[#464555] uppercase font-bold">Target Due</span>
                        <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                          {req.deadline || 'Pending'}
                        </span>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`}></span>
                        <span>{statusBadge.label}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-[#4D41DF] text-white text-xs font-bold shadow-md transition-transform group-hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>Details</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}

          </div>

        </div>
      </main>

      {/* 3. REQUEST DETAILS MODAL / DRAWER (Stitch Full Details View) */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#1B192F]/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 flex items-center justify-between border-b border-[#F0EBFF] shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCopyId(e, selectedRequest.id)}
                  title="Click to copy ID"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFF] text-[#5846C8] font-bold text-xs sm:text-sm clay-pill"
                >
                  <span>{selectedRequest.id}</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedId === selectedRequest.id ? 'check' : 'content_copy'}
                  </span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4DFFE] text-[#4D41DF] text-xs font-bold clay-pill">
                  <span className="w-2 h-2 rounded-full bg-[#4D41DF] animate-ping"></span>
                  <span>{selectedRequest.statusLabel || 'In Progress'}</span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close Drawer"
                onClick={() => setSelectedRequest(null)}
                className="w-9 h-9 rounded-full bg-[#F6F1FF] text-[#464555] hover:text-[#1B192F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 sm:p-8 flex flex-col gap-6 text-left">
              
              {/* Title and Subject */}
              <div className="flex flex-col gap-1">
                <span className="px-3 py-1 rounded-full bg-[#F0EBFF] text-xs font-bold text-[#464555] w-fit clay-pill">
                  {selectedRequest.subject || 'Academic Coursework'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B192F] mt-1 leading-snug">
                  {selectedRequest.title || 'Untitled Request'}
                </h2>
              </div>

              {/* Status Stepper Progression */}
              <div className="p-5 rounded-3xl bg-[#F6F1FF] clay-pill-inset flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#464555] uppercase tracking-wider">Milestone Progress</span>
                  <span className="text-[#4D41DF]">Active Intake</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#4D41DF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <span className="font-bold text-[#1B192F]">Submitted</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#4D41DF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <span className="font-bold text-[#1B192F]">In Review</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#675DF9] text-white flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">pending</span>
                    </div>
                    <span className="font-bold text-[#4D41DF]">Working</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-[#EAE5FF] text-[#464555] flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                    </div>
                    <span className="text-[#464555]">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Key Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-[#F6F1FF] clay-pill-inset">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#464555]">Service Category</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                    {selectedRequest.service || 'Assignment Writing'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#464555]">Scope / Volume</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                    {selectedRequest.serviceSpecific?.numberOfPages || selectedRequest.serviceSpecific?.slideCount || 'Standard Scope'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#464555]">Delivery Format</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                    {selectedRequest.serviceSpecific?.deliveryFormat || selectedRequest.serviceSpecific?.slideFormat || 'Digital Files'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#464555]">Submitted Date</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1B192F]">
                    {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-[#464555]">Target Deadline</span>
                  <span className="text-xs sm:text-sm font-bold text-[#4D41DF]">
                    {selectedRequest.deadline || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Complete Description / Scope */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-[#1B192F]">Complete Academic Scope / Prompt</h3>
                <div className="p-4 rounded-2xl bg-white clay-card border border-white text-xs sm:text-sm text-[#464555] leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.description || 'No description provided.'}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedRequest.additionalInstructions && (
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-[#1B192F]">Special Mentor / Coordinator Notes</h3>
                  <div className="p-4 rounded-2xl bg-[#E4DFFF]/40 text-xs sm:text-sm text-[#1B192F] leading-relaxed border border-[#E4DFFF]">
                    {selectedRequest.additionalInstructions}
                  </div>
                </div>
              )}

              {/* Uploaded Reference Files */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-[#1B192F]">
                  Attached Reference Materials ({(selectedRequest.files || []).length})
                </h3>

                {(selectedRequest.files || []).length === 0 ? (
                  <p className="text-xs text-[#777587] italic">No reference files uploaded for this request.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedRequest.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F1FF] clay-pill-inset"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="material-symbols-outlined text-[#4D41DF] text-[20px]">
                            {getFileIcon(file.name)}
                          </span>
                          <span className="text-xs font-bold text-[#1B192F] truncate">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-[#777587] shrink-0">
                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        {file.url ? (
                          <a
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white text-[#4D41DF] flex items-center justify-center clay-card hover:bg-[#FAF8FF] shadow-sm shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#464555] bg-white px-2 py-1 rounded-full font-bold">
                            Uploaded
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Inquiries Chat Action Card */}
              <div className="p-5 rounded-3xl bg-[#F0EBFF] clay-pill flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4D41DF] text-white flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1B192F]">Dedicated Inquiry Channel</h4>
                    <p className="text-xs text-[#464555]">Direct communication linked to this request</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/inquiries?requestId=${selectedRequest.id}`)}
                  className="px-4 py-2 rounded-full bg-[#4D41DF] text-white font-bold text-xs shadow-md hover:bg-[#675DF9] transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  Open Inquiries Chat
                </button>
              </div>

            </div>

            {/* Drawer Bottom Bar */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-6 border-t border-[#F0EBFF] shadow-lg flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 rounded-full bg-[#F6F1FF] text-[#1B192F] text-xs font-bold clay-pill hover:bg-[#F0EBFF] transition-all cursor-pointer"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => navigate(`/inquiries?requestId=${selectedRequest.id}`)}
                className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs font-bold shadow-lg hover:bg-[#675DF9] transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Open Inquiries Chat</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Agent 3 Fixed Mobile Claymorphic Dock */}
      <MobileBottomNav activePath="my-requests" />
    </div>
  );
}

export default MyRequestsPage;
