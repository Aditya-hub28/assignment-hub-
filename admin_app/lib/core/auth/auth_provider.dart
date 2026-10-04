import 'package:flutter/material.dart';
import '../constants/api_constants.dart';
import '../network/api_client.dart';
import '../../data/models/admin_user.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  AdminUser? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = false;

  AdminUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null && _currentUser!.isAdmin;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isInitialized => _isInitialized;

  AuthProvider() {
    _apiClient.setUnauthorizedHandler(_handleUnauthorized);
  }

  void _handleUnauthorized() {
    _currentUser = null;
    notifyListeners();
  }

  Future<void> initialize() async {
    try {
      await _apiClient.init();
      if (_apiClient.token != null) {
        final savedData = await _apiClient.getSavedUserData();
        if (savedData != null) {
          final user = AdminUser.fromJson(savedData, token: _apiClient.token);
          if (user.isAdmin) {
            _currentUser = user;
          } else {
            await _apiClient.clearSession();
          }
        }
      }
    } catch (_) {
      await _apiClient.clearSession();
    } finally {
      _isLoading = false;
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        body: {
          'email': email.trim(),
          'password': password,
        },
      );

      if (response is! Map || response['data'] == null) {
        throw ApiException('Unexpected server response format');
      }

      final data = response['data'] as Map<String, dynamic>;
      final session = data['session'] as Map<String, dynamic>?;
      final user = data['user'] as Map<String, dynamic>?;
      final profile = data['profile'] as Map<String, dynamic>?;

      if (session == null || user == null) {
        throw ApiException('Invalid session data received from server');
      }

      final role = (user['role']?.toString() ?? 'student').toLowerCase();
      if (role != 'admin') {
        throw ApiException('Access denied. Administrator privileges are required to access the Admin Portal.');
      }

      final token = session['accessToken']?.toString() ?? session['access_token']?.toString() ?? '';
      final refreshToken = session['refreshToken']?.toString() ?? session['refresh_token']?.toString();

      final adminUser = AdminUser(
        id: user['id']?.toString() ?? '',
        email: user['email']?.toString() ?? '',
        role: 'admin',
        fullName: profile?['fullName']?.toString() ?? profile?['full_name']?.toString() ?? user['email']?.toString(),
        mobile: profile?['mobile']?.toString(),
        accessToken: token,
        refreshToken: refreshToken,
      );

      await _apiClient.saveSession(
        accessToken: token,
        refreshToken: refreshToken,
        userData: adminUser.toJson(),
      );

      _currentUser = adminUser;
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred during login. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiClient.post(
        ApiConstants.forgotPassword,
        body: {'email': email.trim()},
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Failed to submit password reset request. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _apiClient.clearSession();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
