import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  String? _role;
  String? _name;
  String? _userId;
  bool _isLoading = false;
  bool _isInitialized = false;
  final AuthService _authService = AuthService();

  String? get token => _token;
  String? get role => _role;
  String? get name => _name;
  String? get userId => _userId;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  bool get isAuthenticated => _token != null;
  bool get isAdmin => _role == 'ADMIN';

  AuthProvider() {
    _loadAuthData();
  }

  Future<void> _loadAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
    _role = prefs.getString('user_role');
    _name = prefs.getString('user_name');
    _userId = prefs.getString('user_id');
    _isInitialized = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _authService.login(email, password);
      _token = data['access_token'];
      _role = data['user']['rol'];
      _name = data['user']['nombre'];
      _userId = data['user']['id'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', _token!);
      await prefs.setString('user_role', _role!);
      await prefs.setString('user_name', _name!);
      await prefs.setString('user_id', _userId!);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _token = null;
    _role = null;
    _name = null;
    _userId = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_role');
    await prefs.remove('user_name');
    await prefs.remove('user_id');
    notifyListeners();
  }
}
