const fs = require('fs');
const path = require('path');
const serviceRequestService = require('./serviceRequest.service');
const inquiryService = require('./inquiry.service');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const NOTIF_STATE_FILE = path.join(DATA_DIR, 'notification_state.json');

const loadNotifState = () => {
  try {
    if (!fs.existsSync(NOTIF_STATE_FILE)) return {};
    const raw = fs.readFileSync(NOTIF_STATE_FILE, 'utf-8');
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const saveNotifState = (state) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(NOTIF_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[NOTIF_SERVICE] Error saving notification state:', err.message);
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

class NotificationService {
  /**
   * Get all notifications for the given user directly from real backend events
   */
  async getNotifications(userId = null, userEmail = null) {
    const state = loadNotifState();
    const userKey = userId || userEmail || 'guest';
    const userState = state[userKey] || { readIds: [], markedAllReadAt: null };
    const readIds = new Set(userState.readIds || []);
    const markedAllReadAt = userState.markedAllReadAt ? new Date(userState.markedAllReadAt).getTime() : 0;

    const notifications = [];

    // 1. Fetch real requests from backend
    try {
      const requests = await serviceRequestService.getRequests(userId, userEmail);
      if (Array.isArray(requests)) {
        requests.forEach((req) => {
          const createdAtTime = new Date(req.createdAt || req.updatedAt || Date.now()).getTime();
          const notifId = `notif-req-${req.id}`;
          const isRead = readIds.has(notifId) || createdAtTime <= markedAllReadAt;

          let statusLabel = 'In Review';
          let statusIcon = 'hourglass_top';
          if (['completed', 'delivered'].includes((req.status || '').toLowerCase())) {
            statusLabel = 'Completed';
            statusIcon = 'check_circle';
          } else if (req.status === 'in_progress') {
            statusLabel = 'In Progress';
            statusIcon = 'trending_up';
          }

          notifications.push({
            id: notifId,
            type: 'update',
            category: 'updates',
            icon: statusIcon,
            iconBg: statusLabel === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-[#6C63FF] text-white',
            title: `Request ${req.id} • ${statusLabel}`,
            description: `"${req.title || 'Assignment'}" (${req.subject || req.service || 'Coursework'}) is currently ${req.status || 'under academic review'}.`,
            time: formatTimeAgo(req.updatedAt || req.createdAt),
            timestamp: req.updatedAt || req.createdAt,
            unread: !isRead,
            link: '/my-requests',
            actionText: 'View Request',
            actionIcon: 'arrow_forward'
          });
        });
      }
    } catch (err) {
      console.warn('[NOTIF_SERVICE] Error fetching requests for notifications:', err.message);
    }

    // 2. Fetch real inquiries and messages from backend
    try {
      const inquiries = await inquiryService.getInquiries(userId, userEmail);
      if (Array.isArray(inquiries)) {
        inquiries.forEach((inq) => {
          const lastMsgTime = inq.latestMessageTime || inq.updatedAt || inq.createdAt;
          const msgTimestamp = new Date(lastMsgTime || Date.now()).getTime();
          const notifId = `notif-inq-${inq.id}-${(inq.messages || []).length}`;
          const isRead = readIds.has(notifId) || msgTimestamp <= markedAllReadAt;

          const lastMsg = inq.latestMessage || (inq.messages && inq.messages.length > 0 ? inq.messages[inq.messages.length - 1].content : '');

          notifications.push({
            id: notifId,
            type: 'inquiry',
            category: 'unread',
            icon: 'chat',
            iconBg: 'bg-[#4D41DF] text-white',
            title: `Admin message on #${inq.requestId || inq.id}`,
            description: lastMsg ? (lastMsg.length > 110 ? `${lastMsg.slice(0, 110)}...` : lastMsg) : 'Admin has initiated an inquiry channel for your assignment.',
            time: formatTimeAgo(lastMsgTime),
            timestamp: lastMsgTime,
            unread: !isRead,
            targetInquiryId: inq.requestId || inq.id,
            actionText: 'Reply Now',
            actionIcon: 'reply'
          });
        });
      }
    } catch (err) {
      console.warn('[NOTIF_SERVICE] Error fetching inquiries for notifications:', err.message);
    }

    // 3. System Announcement
    const sysId = 'notif-sys-announcement-academic';
    const isSysRead = readIds.has(sysId);
    notifications.push({
      id: sysId,
      type: 'announcement',
      category: 'all',
      icon: 'verified_user',
      iconBg: 'bg-[#EDE8FA] text-[#6C63FF]',
      title: 'FERPA Verified Academic Hub',
      description: 'Your assignment briefs and inquiry channels are secured with end-to-end institutional privacy.',
      time: 'Official Update',
      timestamp: new Date().toISOString(),
      unread: !isSysRead,
      link: '/services',
      actionText: 'Explore Services',
      actionIcon: 'arrow_forward'
    });

    // Sort notifications by timestamp descending (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = notifications.filter(n => n.unread).length;

    return {
      notifications,
      unreadCount
    };
  }

  /**
   * Mark single notification or all notifications as read
   */
  async markRead(userId = null, userEmail = null, { id = null, all = false } = {}) {
    const state = loadNotifState();
    const userKey = userId || userEmail || 'guest';
    if (!state[userKey]) {
      state[userKey] = { readIds: [], markedAllReadAt: null };
    }

    if (all) {
      state[userKey].markedAllReadAt = new Date().toISOString();
      state[userKey].readIds = [];
    } else if (id) {
      const set = new Set(state[userKey].readIds || []);
      set.add(id);
      state[userKey].readIds = Array.from(set);
    }

    saveNotifState(state);
    return this.getNotifications(userId, userEmail);
  }
}

module.exports = new NotificationService();
