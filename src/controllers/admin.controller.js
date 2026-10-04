const adminService = require('../services/admin.service');

class AdminController {
  /**
   * GET /api/v1/admin/dashboard/stats
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/requests
   */
  async getRequests(req, res, next) {
    try {
      const { page, limit, status, service, search } = req.query;
      const result = await adminService.getRequests({
        page,
        limit,
        status,
        service,
        search
      });

      return res.status(200).json({
        success: true,
        count: result.requests.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        data: result.requests
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/requests/:id
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await adminService.getRequestById(id);

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/requests/:id/status
   */
  async updateRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, statusLabel, progress } = req.body;

      const updated = await adminService.updateRequestStatus(id, {
        status,
        statusLabel,
        progress
      });

      return res.status(200).json({
        success: true,
        message: 'Request status updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/inquiries
   */
  async getInquiries(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await adminService.getInquiries({
        page,
        limit,
        status,
        search
      });

      return res.status(200).json({
        success: true,
        count: result.inquiries.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        data: result.inquiries
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/inquiries/:id
   */
  async getInquiryById(req, res, next) {
    try {
      const { id } = req.params;
      const inquiry = await adminService.getInquiryById(id);

      return res.status(200).json({
        success: true,
        data: inquiry
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/inquiries/:id/messages
   */
  async sendInquiryMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content, attachments } = req.body;

      const result = await adminService.sendInquiryMessage(
        id,
        { content, attachments },
        req.user,
        req.profile
      );

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully.',
        data: result.message,
        inquiry: result.inquiry
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await adminService.getUsers({
        page,
        limit,
        search
      });

      return res.status(200).json({
        success: true,
        count: result.users.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        data: result.users
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
