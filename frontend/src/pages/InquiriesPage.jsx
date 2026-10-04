import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export function InquiriesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Mobile navigation state: show list or chat thread
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Parse query params (e.g., ?requestId=REQ-...)
  const queryRequestId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('requestId') || params.get('inquiryId');
  }, [location.search]);

  // Fetch inquiries from backend
  const fetchInquiries = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.inquiries.getInquiries();
      let list = res?.data || [];
      setInquiries(list);
      setError(null);

      // Auto-select logic
      if (queryRequestId) {
        let match = list.find((i) => i.requestId === queryRequestId || i.id === queryRequestId);
        if (!match) {
          try {
            const single = await api.inquiries.getInquiryById(queryRequestId);
            if (single?.data) {
              match = single.data;
              list = [single.data, ...list.filter((x) => x.id !== single.data.id)];
              setInquiries(list);
            }
          } catch (e) {
            console.warn('Inquiry lookup fallback note:', e.message);
          }
        }
        if (match) {
          setSelectedInquiryId(match.id);
          setShowMobileChat(true);
          return;
        }
      }

      setSelectedInquiryId((prevSelected) => {
        if (prevSelected && list.some((i) => i.id === prevSelected)) {
          return prevSelected;
        }
        return list.length > 0 ? list[0].id : null;
      });
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      if (!silent) {
        setError(err.message || 'Failed to load inquiries from server.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(false);
    // Background polling every 5s for live chat updates
    const pollInterval = setInterval(() => {
      fetchInquiries(true);
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [user]);

  // If queryRequestId changes dynamically in URL, select it and reset filters
  useEffect(() => {
    if (queryRequestId) {
      setActiveTab('all');
      setSearchQuery('');
      if (inquiries.length > 0) {
        const match = inquiries.find((i) => i.requestId === queryRequestId || i.id === queryRequestId);
        if (match) {
          setSelectedInquiryId(match.id);
          setShowMobileChat(true);
        }
      }
    }
  }, [queryRequestId, inquiries]);

  // The currently selected inquiry object
  const activeInquiry = useMemo(() => {
    return inquiries.find((i) => i.id === selectedInquiryId) || null;
  }, [inquiries, selectedInquiryId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeInquiry?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeInquiry?.messages?.length, selectedInquiryId]);

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Tab filter
      if (activeTab === 'active' && inq.status === 'resolved') return false;
      if (activeTab === 'resolved' && inq.status !== 'resolved') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inReqId = inq.requestId?.toLowerCase().includes(q);
        const inId = inq.id?.toLowerCase().includes(q);
        const inTitle = inq.title?.toLowerCase().includes(q);
        const inSubject = inq.subject?.toLowerCase().includes(q);
        const inLatest = inq.latestMessage?.toLowerCase().includes(q);
        return inReqId || inId || inTitle || inSubject || inLatest;
      }
      return true;
    });
  }, [inquiries, activeTab, searchQuery]);

  // Copy Request ID to clipboard with feedback
  const handleCopyReqId = (reqId) => {
    if (!reqId) return;
    navigator.clipboard.writeText(reqId);
    setCopiedId(reqId);
    addToast(`Copied ${reqId} to clipboard!`, 'info');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = (textOverride || messageInput).trim();
    if (!textToSend || !activeInquiry || isSending) return;

    setIsSending(true);
    try {
      const res = await api.inquiries.sendMessage(activeInquiry.id, {
        content: textToSend,
        senderRole: 'user'
      });

      if (!textOverride) {
        setMessageInput('');
      }

      // Optimistically or immediately update local state
      const updatedMsg = res?.data?.content ? res.data : (res?.data?.message || res?.data);
      if (updatedMsg && (updatedMsg.content || updatedMsg.text)) {
        setInquiries((prev) =>
          prev.map((item) => {
            if (item.id === activeInquiry.id) {
              const msgs = [...(item.messages || []), updatedMsg];
              return {
                ...item,
                messages: msgs,
                latestMessage: updatedMsg.content,
                latestMessageTime: updatedMsg.createdAt,
                updatedAt: updatedMsg.createdAt
              };
            }
            return item;
          })
        );
      } else {
        await fetchInquiries(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      addToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const formatDueTime = (isoString) => {
    if (!isoString) return 'Flexible Deadline';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] text-[#1B192F] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <main className="w-full flex-1 pt-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pb-24 lg:pb-12">
        {/* Page Header */}
        <section className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3DFFF] text-[#100069] text-xs font-bold uppercase tracking-wider shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(108,99,255,0.15)]">
                <span className="material-symbols-outlined text-[14px]">forum</span>
                Direct Academic Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B192F] tracking-tight">
                Inquiries
              </h1>
              <p className="text-[#464555] text-sm sm:text-base max-w-2xl">
                Direct academic support and updates for your submitted requests. Every inquiry is linked to your active or past requests.
              </p>
            </div>

            {/* Quick Stats & Security Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-[6px_10px_20px_rgba(108,99,255,0.08),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4D41DF] animate-pulse"></span>
                <span className="text-xs sm:text-sm font-semibold text-[#1B192F]">
                  {inquiries.filter((i) => i.status !== 'resolved').length} Active Streams
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-[6px_10px_20px_rgba(108,99,255,0.08),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
                <span className="material-symbols-outlined text-[#4D41DF] text-[18px]">verified</span>
                <span className="text-xs sm:text-sm font-medium text-[#464555]">FERPA Verified</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#F6F1FF] p-2 rounded-2xl shadow-[inset_2px_2px_5px_rgba(37,35,58,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]">
            {/* Clay Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Request ID or Assignment title..."
                className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-xs sm:text-sm text-[#1B192F] placeholder:text-[#777587] shadow-[inset_2px_2px_4px_rgba(37,35,58,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#4D41DF]/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F0EBFF] rounded-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-[#4D41DF] shadow-[2px_4px_10px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                All Inquiries ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'active'
                    ? 'bg-white text-[#4D41DF] shadow-[2px_4px_10px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                Active ({inquiries.filter((i) => i.status !== 'resolved').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resolved')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'resolved'
                    ? 'bg-white text-[#4D41DF] shadow-[2px_4px_10px_rgba(108,99,255,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)]'
                    : 'text-[#464555] hover:text-[#1B192F]'
                }`}
              >
                Resolved ({inquiries.filter((i) => i.status === 'resolved').length})
              </button>
            </div>
          </div>
        </section>

        {/* Loading & Error States */}
        {isLoading && inquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[12px_16px_36px_rgba(108,99,255,0.08)]">
            <div className="w-12 h-12 rounded-full border-4 border-[#4D41DF]/20 border-t-[#4D41DF] animate-spin mb-4" />
            <p className="text-base font-semibold text-[#1B192F]">Connecting to Inquiries Chat Desk...</p>
            <p className="text-xs text-[#464555] mt-1">Retrieving your verified academic communications.</p>
          </div>
        )}

        {error && inquiries.length === 0 && (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-xl mx-auto my-12">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-2">warning</span>
            <h3 className="text-lg font-bold text-red-800">Unable to Load Inquiries</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => fetchInquiries(false)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State: No inquiries at all */}
        {!isLoading && inquiries.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-3xl shadow-[12px_16px_36px_rgba(108,99,255,0.08)] text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#E3DFFF] flex items-center justify-center text-[#4D41DF] mb-4 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8)]">
              <span className="material-symbols-outlined text-4xl">mark_chat_unread</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1B192F]">No Active Inquiries</h2>
            <p className="text-sm text-[#464555] max-w-md mt-2">
              Inquiries are automatically created when you submit a service request. When you have active coursework, your specialist communications and milestone drafts will appear here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link
                to="/services"
                className="px-6 py-2.5 rounded-full bg-[#4D41DF] text-white text-xs sm:text-sm font-bold shadow-[4px_8px_16px_rgba(108,99,255,0.35)] hover:-translate-y-0.5 transition-transform"
              >
                Browse Services &amp; Request
              </Link>
              <Link
                to="/my-requests"
                className="px-6 py-2.5 rounded-full bg-[#F6F1FF] text-[#1B192F] text-xs sm:text-sm font-bold hover:bg-[#EAE5FF] transition-colors"
              >
                View My Requests
              </Link>
            </div>
          </div>
        )}

        {/* Main 2-Column Claymorphic Workspace Interface */}
        {inquiries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[700px]">
            {/* LEFT COLUMN: Inquiries List */}
            <aside
              className={`lg:col-span-5 xl:col-span-4 flex flex-col gap-3 ${
                showMobileChat ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase tracking-wider text-[#464555] font-bold">
                  Linked Requests &amp; Threads
                </span>
                <span className="text-xs font-semibold text-[#4D41DF]">Recent Activity</span>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl shadow-[6px_10px_20px_rgba(108,99,255,0.06)]">
                  <span className="material-symbols-outlined text-[#777587] text-3xl mb-1">search_off</span>
                  <p className="text-xs text-[#464555]">No inquiries match your search or filter.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredInquiries.map((inq) => {
                    const isSelected = inq.id === selectedInquiryId;
                    const isResolved = inq.status === 'resolved';

                    return (
                      <div
                        key={inq.id}
                        onClick={() => {
                          setSelectedInquiryId(inq.id);
                          setShowMobileChat(true);
                        }}
                        className={`group cursor-pointer p-4 rounded-2xl transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-white shadow-[12px_16px_32px_rgba(108,99,255,0.14),-8px_-8px_24px_rgba(255,255,255,0.95)] ring-2 ring-[#4D41DF]/30'
                            : 'bg-white/80 hover:bg-white shadow-[6px_10px_22px_rgba(108,99,255,0.06),-4px_-4px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_16px_32px_rgba(108,99,255,0.12)]'
                        }`}
                      >
                        {/* Active Accent Bar */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4D41DF] rounded-r-full shadow-[2px_0_8px_rgba(108,99,255,0.5)]" />
                        )}

                        <div className="flex flex-col gap-2 pl-1">
                          {/* Header row: Request ID & Status pill */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)] ${
                                isSelected
                                  ? 'bg-[#E3DFFF] text-[#100069]'
                                  : 'bg-[#EAE5FF] text-[#464555]'
                              }`}
                            >
                              {inq.requestId || inq.id}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  isResolved
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-[#E4DFFE] text-[#422DB2]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isResolved ? 'bg-emerald-600' : 'bg-[#5846C8] animate-pulse'
                                  }`}
                                />
                                {inq.statusLabel || (isResolved ? 'Resolved' : 'In Progress')}
                              </span>
                            </div>
                          </div>

                          {/* Assignment Title */}
                          <div>
                            <h2 className="text-sm font-bold text-[#1B192F] line-clamp-1 group-hover:text-[#4D41DF] transition-colors">
                              {inq.title}
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1 text-[#464555] text-xs">
                              <span className="material-symbols-outlined text-[15px] text-[#7F5300]">
                                schedule
                              </span>
                              <span>Target Due: {formatDate(inq.deadline) || 'Flexible'}</span>
                            </div>
                          </div>

                          {/* Inset Message Preview Box */}
                          <div className="p-2.5 rounded-xl bg-[#F6F1FF] shadow-[inset_1px_1px_3px_rgba(37,35,58,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]">
                            <p className="text-xs text-[#464555] line-clamp-2">
                              <span className="font-semibold text-[#4D41DF]">Latest: </span>
                              {inq.latestMessage || 'Inquiry channel active.'}
                            </p>
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[11px] text-[#777587] font-medium">
                              Course: {inq.subject || 'Academic'}
                            </span>
                            <span className="text-[11px] font-semibold text-[#4D41DF]">
                              {formatTime(inq.latestMessageTime || inq.updatedAt) || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* RIGHT COLUMN: Active Request Chat Workspace */}
            <main
              className={`lg:col-span-7 xl:col-span-8 flex flex-col rounded-3xl bg-white shadow-[12px_16px_36px_rgba(108,99,255,0.12),-8px_-8px_24px_rgba(255,255,255,0.95)] overflow-hidden ${
                showMobileChat ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {activeInquiry ? (
                <>
                  {/* Sticky Request Context Bar Header */}
                  <div className="sticky top-0 z-20 px-5 py-4 bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(108,99,255,0.05)] border-b border-[#F0EBFF]">
                    {/* Mobile Back Button */}
                    <div className="lg:hidden mb-2">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#4D41DF] hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Inquiries List
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyReqId(activeInquiry.requestId || activeInquiry.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E3DFFF] text-[#100069] hover:bg-[#C4C0FF] text-xs font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)] transition-colors"
                            title="Click to copy Request ID"
                          >
                            <span>{activeInquiry.requestId || activeInquiry.id}</span>
                            <span className="material-symbols-outlined text-[13px]">
                              {copiedId === (activeInquiry.requestId || activeInquiry.id) ? 'check' : 'content_copy'}
                            </span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAE5FF] text-[#464555] text-xs font-semibold">
                            {activeInquiry.subject || 'Coursework'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4DFFE] text-[#422DB2] text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5846C8] animate-pulse" />
                            {activeInquiry.statusLabel || (activeInquiry.status === 'resolved' ? 'Resolved' : 'In Progress')}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#1B192F] tracking-tight mt-1 line-clamp-2">
                          {activeInquiry.title}
                        </h2>
                      </div>

                      {/* Deadline Info & Quick Link to Full Request View */}
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFDDB3] text-[#291800] text-xs font-semibold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                          <span className="material-symbols-outlined text-[15px] text-[#7F5300]">timer</span>
                          <span>Due: {formatDueTime(activeInquiry.deadline)}</span>
                        </div>
                        <Link
                          to={`/my-requests?highlight=${activeInquiry.requestId}`}
                          className="inline-flex items-center gap-1 text-[#4D41DF] hover:text-[#5846C8] text-xs font-bold transition-colors"
                        >
                          <span>View Request Details</span>
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        </Link>
                      </div>
                    </div>

                    {/* Academic Specialist Metadata Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 bg-[#F6F1FF] px-3.5 py-2 rounded-xl shadow-[inset_1px_1px_2px_rgba(37,35,58,0.04),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#675DF9] text-white flex items-center justify-center font-bold text-[10px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)]">
                          AH
                        </div>
                        <p className="text-xs text-[#1B192F] font-medium">
                          Assigned Support: <span className="text-[#4D41DF] font-bold">{activeInquiry.assignedSpecialist || 'Dr. Marcus Vance (Specialist)'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#464555] text-[11px] font-medium shadow-[1px_1px_3px_rgba(108,99,255,0.06)]">
                          <span className="material-symbols-outlined text-[13px] text-[#4D41DF]">description</span>
                          Rubric Verified
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#464555] text-[11px] font-medium shadow-[1px_1px_3px_rgba(108,99,255,0.06)]">
                          <span className="material-symbols-outlined text-[13px] text-[#4D41DF]">lock</span>
                          Encrypted Channel
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Message Conversation Stream */}
                  <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[500px] min-h-[380px] bg-gradient-to-b from-[#FCF8FF] to-white">
                    {/* System Event Pill */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBFF] text-[#464555] text-[11px] font-medium shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                        <span className="material-symbols-outlined text-[14px] text-[#4D41DF]">lock_reset</span>
                        <span>
                          Inquiry stream connected for {activeInquiry.requestId || activeInquiry.id} • {formatDate(activeInquiry.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    {activeInquiry.messages && activeInquiry.messages.length > 0 ? (
                      activeInquiry.messages.map((msg, index) => {
                        const isStudent = msg.senderRole === 'user' || msg.senderRole === 'student' || msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id || index}
                            className={`flex gap-2.5 ${isStudent ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isStudent && (
                              <div className="w-8 h-8 rounded-full bg-[#E4DFFE] text-[#170065] flex items-center justify-center shrink-0 font-bold text-xs shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                                <span className="material-symbols-outlined text-[17px] text-[#4D41DF]">school</span>
                              </div>
                            )}

                            <div className={`max-w-lg sm:max-w-xl flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-[11px] font-semibold text-[#1B192F]">
                                  {isStudent ? 'You' : msg.senderName || 'Academic Team'}
                                </span>
                                <span className="text-[10px] text-[#777587]">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>

                              <div
                                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                                  isStudent
                                    ? 'rounded-tr-xs bg-[#4D41DF] text-white shadow-[6px_10px_20px_rgba(108,99,255,0.28),inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]'
                                    : 'rounded-tl-xs bg-[#F6F1FF] text-[#1B192F] shadow-[6px_10px_20px_rgba(108,99,255,0.08),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(108,99,255,0.08)]'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                              </div>

                              {isStudent && (
                                <div className="flex items-center gap-1 mt-0.5 text-[#777587] text-[10px]">
                                  <span className="material-symbols-outlined text-[13px] text-[#4D41DF]">done_all</span>
                                  <span>Delivered</span>
                                </div>
                              )}
                            </div>

                            {isStudent && (
                              <div className="w-8 h-8 rounded-full bg-[#675DF9] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'ME'}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-gray-400 text-xs">
                        No messages yet. Send your first message below!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Area */}
                  <div className="p-4 sm:p-5 bg-[#F6F1FF] border-t border-[#EAE5FF] flex flex-col gap-2.5">
                    {/* Suggested Prompt Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      <span className="text-[11px] text-[#464555] font-semibold whitespace-nowrap">Suggested:</span>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(null, 'Can I review the draft citations and structure?')}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#E3DFFF] text-[#1B192F] text-[11px] font-medium whitespace-nowrap shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),1px_2px_4px_rgba(108,99,255,0.05)] transition-all"
                      >
                        Can I review the draft citations?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(null, 'Could you confirm the expected delivery timeline?')}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#E3DFFF] text-[#1B192F] text-[11px] font-medium whitespace-nowrap shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),1px_2px_4px_rgba(108,99,255,0.05)] transition-all"
                      >
                        Confirming delivery timeline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(null, 'I have additional rubric guidelines to share.')}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#E3DFFF] text-[#1B192F] text-[11px] font-medium whitespace-nowrap shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),1px_2px_4px_rgba(108,99,255,0.05)] transition-all"
                      >
                        Additional rubric guidelines
                      </button>
                    </div>

                    {/* Clay Input Form */}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 p-1.5 bg-white rounded-full shadow-[inset_2px_2px_5px_rgba(37,35,58,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.9),0_6px_16px_rgba(108,99,255,0.06)]"
                    >
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={`Type your message regarding ${activeInquiry.requestId || activeInquiry.id}...`}
                        className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#1B192F] placeholder:text-[#777587] focus:outline-none"
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#4D41DF] text-white text-xs sm:text-sm font-bold shadow-[4px_8px_16px_rgba(108,99,255,0.35),inset_2px_2px_4px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-transform disabled:opacity-50 disabled:pointer-events-none shrink-0"
                      >
                        <span>{isSending ? 'Sending...' : 'Send'}</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </button>
                    </form>

                    {/* FERPA / Security Microcopy */}
                    <div className="flex items-center justify-center gap-1 text-center mt-0.5">
                      <span className="material-symbols-outlined text-[13px] text-[#4D41DF]">verified_user</span>
                      <p className="text-[11px] text-[#464555]">
                        Messages are securely transmitted to the assigned academic coordinators for{' '}
                        <strong className="text-[#1B192F]">{activeInquiry.requestId || activeInquiry.id}</strong>.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-500">
                  <span className="material-symbols-outlined text-5xl text-[#4D41DF]/40 mb-2">chat_bubble_outline</span>
                  <p className="text-base font-semibold text-[#1B192F]">Select an inquiry to view conversation</p>
                  <p className="text-xs text-[#777587] mt-1 max-w-sm">
                    Select any linked request from the list on the left to review communication updates with your academic specialist.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default InquiriesPage;
