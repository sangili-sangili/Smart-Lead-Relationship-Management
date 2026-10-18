/**
 * Standard API response wrapper to enforce consistent response envelopes
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, items = [], pagination = {}, message = 'Data fetched successfully') {
    return res.status(200).json({
      success: true,
      message,
      data: {
        items,
        pagination: {
          total: pagination.total || 0,
          page: Number(pagination.page) || 1,
          limit: Number(pagination.limit) || 10,
          pages: pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 10))
        }
      }
    });
  }
}

module.exports = ApiResponse;
