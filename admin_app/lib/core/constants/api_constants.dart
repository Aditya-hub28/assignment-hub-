class ApiConstants {
  // Configurable at compile time via --dart-define=API_BASE_URL=https://...
  // Default to live production API on Render
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://assignment-hub-api-h0ny.onrender.com/api/v1',
  );

  // Auth endpoints
  static const String login = '$baseUrl/auth/login';
  static const String forgotPassword = '$baseUrl/auth/forgot-password';
  static const String me = '$baseUrl/auth/me';

  // Admin dashboard endpoints
  static const String dashboardStats = '$baseUrl/admin/dashboard/stats';

  // Admin request endpoints
  static const String requests = '$baseUrl/admin/requests';
  static String requestById(String id) => '$baseUrl/admin/requests/$id';
  static String requestStatus(String id) => '$baseUrl/admin/requests/$id/status';

  // Admin inquiry endpoints
  static const String inquiries = '$baseUrl/admin/inquiries';
  static String inquiryById(String id) => '$baseUrl/admin/inquiries/$id';
  static String inquiryMessages(String id) => '$baseUrl/admin/inquiries/$id/messages';

  // Admin user/student endpoints
  static const String users = '$baseUrl/admin/users';
  static String userById(String id) => '$baseUrl/admin/users/$id';
}
