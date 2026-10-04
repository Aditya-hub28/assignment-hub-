import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException(this.message, {this.statusCode, this.details});

  @override
  String toString() => message;
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  static const String _tokenKey = 'assignmenthub_admin_access_token';
  static const String _refreshKey = 'assignmenthub_admin_refresh_token';
  static const String _userKey = 'assignmenthub_admin_user_data';

  String? _accessToken;
  VoidCallback? _onUnauthorized;

  void setUnauthorizedHandler(VoidCallback handler) {
    _onUnauthorized = handler;
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(_tokenKey);
  }

  String? get token => _accessToken;

  Future<void> saveSession({
    required String accessToken,
    String? refreshToken,
    Map<String, dynamic>? userData,
  }) async {
    _accessToken = accessToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, accessToken);
    if (refreshToken != null) {
      await prefs.setString(_refreshKey, refreshToken);
    }
    if (userData != null) {
      await prefs.setString(_userKey, jsonEncode(userData));
    }
  }

  Future<Map<String, dynamic>?> getSavedUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearSession() async {
    _accessToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshKey);
    await prefs.remove(_userKey);
  }

  Map<String, String> _buildHeaders([Map<String, String>? extraHeaders]) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_accessToken != null && _accessToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }
    return headers;
  }

  Future<dynamic> get(String url, {Map<String, String>? headers, Map<String, dynamic>? queryParams}) async {
    Uri uri = Uri.parse(url);
    if (queryParams != null && queryParams.isNotEmpty) {
      final sanitizedParams = <String, String>{};
      queryParams.forEach((key, value) {
        if (value != null && value.toString().isNotEmpty) {
          sanitizedParams[key] = value.toString();
        }
      });
      uri = uri.replace(queryParameters: sanitizedParams);
    }

    try {
      final response = await http
          .get(uri, headers: _buildHeaders(headers))
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Cannot reach AssignmentHub server. Check your connection or server status.');
    } on TimeoutException {
      throw ApiException('Server connection timed out. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(e.toString());
    }
  }

  Future<dynamic> post(String url, {Map<String, String>? headers, dynamic body}) async {
    try {
      final response = await http
          .post(
            Uri.parse(url),
            headers: _buildHeaders(headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Cannot reach AssignmentHub server. Check your connection.');
    } on TimeoutException {
      throw ApiException('Server connection timed out. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(e.toString());
    }
  }

  Future<dynamic> patch(String url, {Map<String, String>? headers, dynamic body}) async {
    try {
      final response = await http
          .patch(
            Uri.parse(url),
            headers: _buildHeaders(headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Cannot reach AssignmentHub server. Check your connection.');
    } on TimeoutException {
      throw ApiException('Server connection timed out. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(e.toString());
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final message = (body is Map && body['message'] != null)
        ? body['message'].toString()
        : (body is Map && body['error'] != null)
            ? body['error'].toString()
            : 'Server error (${response.statusCode})';

    if (response.statusCode == 401) {
      _accessToken = null;
      _onUnauthorized?.call();
      throw ApiException('Session expired. Please log in again.', statusCode: 401);
    }

    if (response.statusCode == 403) {
      throw ApiException(message.isNotEmpty ? message : 'Access denied. Administrator privileges required.', statusCode: 403);
    }

    throw ApiException(message, statusCode: response.statusCode, details: body);
  }
}

typedef VoidCallback = void Function();
