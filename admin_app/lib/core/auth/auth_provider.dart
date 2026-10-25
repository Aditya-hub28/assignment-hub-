import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
    _setupSupabaseAuthListener();
  }

  void _handleUnauthorized() {
    _currentUser = null;
    notifyListeners();
  }

  void _setupSupabaseAuthListener() {
    Supabase.instance.client.auth.onAuthStateChange.listen((data) async {
      final session = data.session;
      if (session != null && (data.event == AuthChangeEvent.signedIn || data.event == AuthChangeEvent.tokenRefreshed)) {
        final token = session.accessToken;
        final user = session.user;

        // Fetch official role from profiles table
        String role = user.userMetadata?['role']?.toString() ?? 'admin';
        try {
          final profileRes = await Supabase.instance.client
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();
          if (profileRes != null && profileRes['role'] != null) {
            role = profileRes['role'].toString();
          }
        } catch (_) {}

        final adminUser = AdminUser(
          id: user.id,
          email: user.email ?? '',
          role: role,
          fullName: user.userMetadata?['full_name']?.toString() ??
              user.userMetadata?['name']?.toString() ??
              user.email?.split('@').first ??
              'Admin User',
          mobile: user.userMetadata?['mobile']?.toString(),
          accessToken: token,
          refreshToken: session.refreshToken,
        );

        if (adminUser.isAdmin) {
          await _apiClient.saveSession(
            accessToken: token,
            refreshToken: session.refreshToken,
            userData: adminUser.toJson(),
          );
          _currentUser = adminUser;
          _errorMessage = null;
        } else {
          _errorMessage = 'Access denied: ${adminUser.email} has student role. Admin privileges required.';
          _currentUser = null;
          await _apiClient.clearSession();
        }

        _isLoading = false;
        notifyListeners();
      }
    });
  }

  Future<void> initialize() async {
    try {
      await _apiClient.init();

      // Check active Supabase session
      final supaSession = Supabase.instance.client.auth.currentSession;
      if (supaSession != null) {
        final supaUser = supaSession.user;
        String role = supaUser.userMetadata?['role']?.toString() ?? 'admin';
        try {
          final res = await Supabase.instance.client
              .from('profiles')
              .select('role')
              .eq('id', supaUser.id)
              .maybeSingle();
          if (res != null && res['role'] != null) {
            role = res['role'].toString();
          }
        } catch (_) {}

        final adminUser = AdminUser(
          id: supaUser.id,
          email: supaUser.email ?? '',
          role: role,
          fullName: supaUser.userMetadata?['full_name']?.toString() ??
              supaUser.userMetadata?['name']?.toString() ??
              supaUser.email?.split('@').first ??
              'Admin User',
          mobile: supaUser.userMetadata?['mobile']?.toString(),
          accessToken: supaSession.accessToken,
          refreshToken: supaSession.refreshToken,
        );

        if (adminUser.isAdmin) {
          await _apiClient.saveSession(
            accessToken: supaSession.accessToken,
            refreshToken: supaSession.refreshToken,
            userData: adminUser.toJson(),
          );
          _currentUser = adminUser;
        }
      } else if (_apiClient.token != null) {
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

  Future<bool> loginWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Supabase.instance.client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'assignmenthub://login-callback',
      );
      return true;
    } catch (e) {
      _errorMessage = 'Google sign-in failed: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
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

  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logout);
    } catch (_) {}
    try {
      await Supabase.instance.client.auth.signOut();
    } catch (_) {}
    await _apiClient.clearSession();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners();
  }

  Future<bool> forgotPassword(String email) async {
    return true;
  }

  Future<bool> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    return true;
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
