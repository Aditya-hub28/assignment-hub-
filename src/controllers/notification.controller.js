const notificationService = require('../services/notification.service');

class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const user = req.user || null;
      const result = await notificationService.getNotifications(user?.id, user?.email);
      return res.status(200).json({
        success: true,
        count: result.notifications.length,
        unreadCount: result.unreadCount,
        data: result.notifications
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/notifications/mark-read
   */
  async markRead(req, res, next) {
    try {
      const user = req.user || null;
      const { id, all } = req.body || {};
      const result = await notificationService.markRead(user?.id, user?.email, { id, all });
      return res.status(200).json({
        success: true,
        message: 'Notifications updated successfully',
        unreadCount: result.unreadCount,
        data: result.notifications
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
