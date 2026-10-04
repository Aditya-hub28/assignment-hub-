const inquiryService = require('../services/inquiry.service');

class InquiryController {
  /**
   * GET /api/v1/inquiries
   */
  async getInquiries(req, res, next) {
    try {
      const user = req.user || null;
      const inquiries = await inquiryService.getInquiries(user?.id, user?.email);

      return res.status(200).json({
        success: true,
        count: inquiries.length,
        data: inquiries
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inquiries/:id
   */
  async getInquiryById(req, res, next) {
    try {
      const user = req.user || null;
      const { id } = req.params;

      const inquiry = await inquiryService.getInquiryById(id, user?.id, user?.email);

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: `Inquiry with ID "${id}" was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        data: inquiry
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/inquiries/:id/messages
   */
  async sendMessage(req, res, next) {
    try {
      const user = req.user || null;
      const { id } = req.params;
      const { content, attachments } = req.body;

      const result = await inquiryService.addMessage(id, { content, attachments }, user);

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: result.message,
        inquiry: result.inquiry
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InquiryController();
