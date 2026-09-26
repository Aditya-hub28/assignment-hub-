import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'inquiry',
    category: 'unread',
    icon: 'chat',
    iconBg: 'bg-primary text-white',
    title: 'Dr. Banerjee replied to your Inquiry',
    description: 'Mathematics Assignment: “Proofs are already 70% completed, we can deliver by Thursday 9:00 PM.”',
    time: '2 min ago',
    unread: true,
    targetInquiryId: 'REQ-1024',
    actionText: 'Reply Now',
    actionIcon: 'reply'
  },
  {
    id: 'notif-2',
    type: 'update',
    category: 'updates',
    icon: 'trending_up',
    iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
    title: 'Progress Update on #REQ-1024',
    description: 'Engineering Mathematics Assignment reached 70% completion milestone.',
    time: '1 hour ago',
    unread: true,
    link: '/my-requests',
    actionText: 'View Request',
    actionIcon: 'arrow_forward'
  },
  {
    id: 'notif-3',
    type: 'download',
    category: 'updates',
    icon: 'download_done',
    iconBg: 'bg-surface-container-high text-primary',
    title: 'Deliverables Ready for Download',
    description: 'IoT Smart Weather Station Simulation files have been uploaded to your drive.',
    time: 'Yesterday, 4:15 PM',
    extraBadge: 'File: .ZIP (14.2 MB)',
    unread: false
  },
  {
    id: 'notif-4',
    type: 'reminder',
    category: 'updates',
    icon: 'alarm',
    iconBg: 'bg-secondary-fixed text-secondary',
    title: 'Deadline Reminder: DSA Lab File',
    description: 'Data Structures & Algorithms review will conclude tomorrow.',
    time: '2 days ago',
    unread: false
  },
  {
    id: 'notif-5',
    type: 'announcement',
    category: 'all',
    icon: 'school',
    iconBg: 'bg-surface-container text-primary',
    title: 'Academic Services Updated',
    description: 'Explore new coursework & dissertation assistance packages in the Services hub.',
    time: '3 days ago',
    link: '/services',
    actionText: 'Explore Services',
    actionIcon: 'arrow_forward',
    unread: false
  }
];

export function NotificationBell({ onSelectInquiry }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unread | updates
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const containerRef = useRef(null);

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

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => n.unread);
    }
    if (filter === 'updates') {
      return notifications.filter(n => n.category === 'updates');
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'success');
  };

  const handleAction = (notif) => {
    setIsOpen(false);
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
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center transition-all shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(77,65,223,0.15)] hover:shadow-[4px_6px_12px_rgba(108,99,255,0.15)] cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed text-[9px] sm:text-[10px] flex items-center justify-center leading-none font-bold shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Claymorphic Notification Dropdown Popup */}
      {isOpen && (
        <div
          className="fixed inset-x-3 top-18 sm:inset-x-auto sm:right-0 sm:top-14 w-auto sm:w-[420px] max-w-[96vw] sm:max-w-[90vw] rounded-2xl sm:rounded-3xl bg-surface-container-lowest shadow-[24px_32px_60px_rgba(37,35,58,0.25),-12px_-12px_32px_rgba(255,255,255,0.95)] z-50 flex flex-col overflow-hidden transition-all border border-surface-container-high/40 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top indicator / caret on desktop */}
          <div className="hidden sm:block absolute -top-2 right-4 w-4 h-4 bg-surface-container-lowest rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.03)] border-t border-l border-surface-container-high/30"></div>

          {/* Popup Header */}
          <div className="p-4 sm:p-5 pb-3 bg-surface-container-lowest flex items-center justify-between z-10 border-b border-surface-container/40">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg sm:text-[20px] text-on-surface tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] sm:text-xs font-bold shadow-[2px_4px_8px_rgba(108,99,255,0.25)]">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] sm:text-xs text-primary hover:underline font-bold cursor-pointer"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs in Popup */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center gap-1.5 z-10 border-b border-surface-container/60 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-surface-container-highest text-primary shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(77,65,223,0.1)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'unread'
                  ? 'bg-surface-container-highest text-primary shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(77,65,223,0.1)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('updates')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'updates'
                  ? 'bg-surface-container-highest text-primary shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(77,65,223,0.1)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Updates ({notifications.filter(n => n.category === 'updates').length})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="flex flex-col max-h-[340px] sm:max-h-[380px] overflow-y-auto divide-y divide-surface-container z-10">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-xs sm:text-sm flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-outline">notifications_off</span>
                <span>No notifications found in this tab.</span>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3.5 sm:p-4 hover:bg-surface-container-low/60 transition-colors flex items-start gap-2.5 sm:gap-3 relative group ${
                    notif.unread ? 'bg-primary-fixed/20' : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center shadow-[4px_6px_12px_rgba(108,99,255,0.15)] ${notif.iconBg}`}
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{notif.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {notif.title}
                      </span>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-snug line-clamp-2">
                      {notif.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant">
                        {notif.time}
                      </span>
                      {notif.actionText && (
                        <button
                          type="button"
                          onClick={() => handleAction(notif)}
                          className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary text-white text-[10px] sm:text-[11px] font-bold shadow-[2px_4px_8px_rgba(108,99,255,0.25)] hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{notif.actionText}</span>
                          <span className="material-symbols-outlined text-[12px] sm:text-[13px]">{notif.actionIcon}</span>
                        </button>
                      )}
                      {notif.extraBadge && (
                        <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant">
                          {notif.extraBadge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-3.5 bg-surface-container-low flex items-center justify-between z-10 border-t border-surface-container">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/inquiries');
              }}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('Notification preferences are set to instantaneous push', 'info');
              }}
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
