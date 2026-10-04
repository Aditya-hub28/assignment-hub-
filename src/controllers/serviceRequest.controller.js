const serviceRequestService = require('../services/serviceRequest.service');

/**
 * Controller for Service Requests
 */
class ServiceRequestController {
  /**
   * POST /api/v1/services/requests
   * Create a new service request
   */
  async createRequest(req, res, next) {
    try {
      const user = req.user || null;
      const requestData = req.body;

      const created = await serviceRequestService.createRequest(requestData, user);

      return res.status(201).json({
        success: true,
        message: 'Service request submitted successfully',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/requests
   * Get all service requests
   */
  async getRequests(req, res, next) {
    try {
      const user = req.user || null;
      const requests = await serviceRequestService.getRequests(user?.id, user?.email);

      return res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/requests/:id
   * Get single service request by ID
   */
  async getRequestById(req, res, next) {
    try {
      const user = req.user || null;
      const { id } = req.params;

      const request = await serviceRequestService.getRequestById(id, user?.id, user?.email);

      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Service request with ID ${id} was not found`
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceRequestController();
