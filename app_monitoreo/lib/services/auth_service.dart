import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  // Use http://192.168.100.20:3000 for physical devices in the same network
  // Use http://10.0.2.2:3000 for Android Emulator
  // You can use a conditional if you prefer:
  // final String baseUrl = defaultTargetPlatform == TargetPlatform.android ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

  final String baseUrl = 'http://192.168.100.20:3000';

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Error al iniciar sesión');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
