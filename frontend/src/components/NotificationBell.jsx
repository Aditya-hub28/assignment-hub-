import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export function NotificationBell({ onSelectInquiry }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unread | updates | inquiries
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);

  // Fetch real notifications from backend
  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.notifications.getNotifications();
      const list = Array.isArray(res?.data) ? res.data : [];
      setNotifications(list);
      setUnreadCount(
        typeof res?.unreadCount === 'number'
          ? res.unreadCount
          : list.filter((n) => n.unread).length
      );
    } catch (err) {
      console.warn('[NOTIFICATIONS_FETCH_ERROR]', err.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch notifications on mount and set polling interval
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 20000); // 20s live sync

    return () => clearInterval(interval);
  }, []);

  // When popover opens, re-sync with backend
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen]);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => n.unread);
    }
    if (filter === 'updates') {
      return notifications.filter((n) => n.category === 'updates' || n.type === 'update');
    }
    if (filter === 'inquiries') {
      return notifications.filter((n) => n.type === 'inquiry');
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    showToast('All notifications marked as read', 'success');

    // Persist to backend
    try {
      await api.notifications.markRead({ all: true });
    } catch (err) {
      console.warn('[NOTIF_MARK_READ_ERROR]', err.message);
    }
  };

  const handleAction = async (notif) => {
    setIsOpen(false);

    // Mark as read in backend
    if (notif.unread) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.notifications.markRead({ id: notif.id });
      } catch (err) {
        // non-blocking
      }
    }

    if (notif.targetInquiryId) {
      if (onSelectInquiry) {
        onSelectInquiry(notif.targetInquiryId);
      } else {
        navigate('/inquiries', { state: { openInquiryId: notif.targetInquiryId } });
      }
    } else if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Notification Bell Button */}
      <button
        aria-label="Notifications"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EDE8FA] text-[#4D41DF] flex items-center justify-center transition-all shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(77,65,223,0.15)] hover:shadow-[4px_6px_12px_rgba(108,99,255,0.15)] cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FFB84D] text-[#25233A] text-[9px] sm:text-[10px] flex items-center justify-center leading-none font-extrabold shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Claymorphic Notification Dropdown Popup */}
      {isOpen && (
        <div className="fixed inset-x-3 top-20 sm:inset-x-auto sm:right-0 sm:top-14 w-auto sm:w-[420px] max-w-[96vw] sm:max-w-[90vw] rounded-2xl sm:rounded-3xl bg-white shadow-[24px_32px_60px_rgba(37,35,58,0.2),-8px_-8px_24px_rgba(255,255,255,0.95)] z-50 flex flex-col overflow-hidden transition-all border border-[#E2DCFF]/60 animate-in fade-in zoom-in-95 duration-150">
          {/* Top indicator / caret on desktop */}
          <div className="hidden sm:block absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.03)] border-t border-l border-[#E2DCFF]/60"></div>

          {/* Popup Header */}
          <div className="p-4 sm:p-5 pb-3 bg-white flex items-center justify-between z-10 border-b border-[#F0EBFF]">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-[#25233A] tracking-tight">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#6C63FF] text-white text-[10px] sm:text-xs font-extrabold shadow-xs">
                  {unreadCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#E6F9EF] text-emerald-700 text-[10px] font-bold">
                  All caught up
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] sm:text-xs text-[#6C63FF] hover:underline font-bold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchNotifications()}
                className="w-7 h-7 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#6E6A8A] flex items-center justify-center transition-colors cursor-pointer"
                title="Refresh notifications"
              >
                <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] flex items-center justify-center text-[#6E6A8A] hover:text-[#25233A] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs in Popup */}
          <div className="px-4 sm:px-5 py-2 flex items-center gap-1.5 z-10 border-b border-[#F0EBFF] overflow-x-auto no-scrollbar bg-[#FAF8FF]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#EDE8FA] text-[#6C63FF] shadow-xs'
                  : 'text-[#6E6A8A] hover:text-[#25233A]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#EDE8FA] text-[#6C63FF] shadow-xs'
                  : 'text-[#6E6A8A] hover:text-[#25233A]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('updates')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'updates'
                  ? 'bg-[#EDE8FA] text-[#6C63FF] shadow-xs'
                  : 'text-[#6E6A8A] hover:text-[#25233A]'
              }`}
            >
              Requests ({notifications.filter((n) => n.category === 'updates' || n.type === 'update').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('inquiries')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'inquiries'
                  ? 'bg-[#EDE8FA] text-[#6C63FF] shadow-xs'
                  : 'text-[#6E6A8A] hover:text-[#25233A]'
              }`}
            >
              Inquiries ({notifications.filter((n) => n.type === 'inquiry').length})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="flex flex-col max-h-[340px] sm:max-h-[380px] overflow-y-auto divide-y divide-[#F0EBFF] z-10">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-[#6E6A8A] text-xs flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#6C63FF] animate-spin">
                  progress_activity
                </span>
                <span>Loading notifications from backend...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-[#6E6A8A] text-xs sm:text-sm flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[28px] text-[#A5A0C2]">notifications_off</span>
                <span className="font-semibold text-[#25233A]">No notifications in this tab</span>
                <span className="text-[11px] text-[#6E6A8A]">
                  New updates and coordinator messages will appear here live.
                </span>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleAction(notif)}
                  className={`p-3.5 sm:p-4 hover:bg-[#FAF8FF] transition-colors flex items-start gap-3 relative group cursor-pointer ${
                    notif.unread ? 'bg-[#F9F7FF]' : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-xs ${notif.iconBg || 'bg-[#EDE8FA] text-[#6C63FF]'}`}
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{notif.icon || 'notifications'}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#25233A] truncate">
                        {notif.title}
                      </span>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#6C63FF] shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6A8A] leading-snug line-clamp-2">
                      {notif.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#8E8C9D]">
                        {notif.time}
                      </span>
                      {notif.actionText && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-[10px] sm:text-[11px] font-bold flex items-center gap-1 group-hover:bg-[#6C63FF] group-hover:text-white transition-all">
                          <span>{notif.actionText}</span>
                          <span className="material-symbols-outlined text-[12px] sm:text-[13px]">
                            {notif.actionIcon || 'arrow_forward'}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-3.5 bg-[#FAF8FF] flex items-center justify-between z-10 border-t border-[#F0EBFF]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/inquiries');
              }}
              className="text-xs font-bold text-[#6C63FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Inquiries</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/my-requests');
              }}
              className="text-xs font-semibold text-[#6E6A8A] hover:text-[#25233A] flex items-center gap-1 cursor-pointer"
            >
              <span>View Requests</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
