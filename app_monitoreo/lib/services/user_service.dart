import 'dart:convert';
import 'package:http/http.dart' as http;

class UserService {
  final String baseUrl = 'http://192.168.100.20:3000';

  Future<void> createUser({
    required String token,
    required String email,
    required String password,
    required String nombre,
    required String apellidoPaterno,
    String? apellidoMaterno,
    required String rol,
    String? curp,
    String? miMedicoId,
    String? fechaNacimiento,
    String? tipoOrtesis,
    String? miembroAfectado,
  }) async {
    final url = Uri.parse('$baseUrl/usuarios');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'email': email,
          'passwordHash': password, // Backend expects passwordHash in DTO
          'nombre': nombre,
          'apellidoPaterno': apellidoPaterno,
          'apellidoMaterno': apellidoMaterno ?? '',
          'rol': rol,
          'curp': curp,
          'miMedicoId': miMedicoId,
          'fechaNacimiento': fechaNacimiento,
          'tipoOrtesis': tipoOrtesis,
          'miembroAfectado': miembroAfectado,
        }),
      );

      if (response.statusCode != 201) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Error al crear usuario');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<Map<String, dynamic>> getUserProfile(String token) async {
    final url = Uri.parse('$baseUrl/usuarios/perfil');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener perfil');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<dynamic>> getUsers(String token) async {
    final url = Uri.parse('$baseUrl/usuarios');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener lista de usuarios');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<void> updateUser(
    String token,
    String id,
    Map<String, dynamic> data,
  ) async {
    final url = Uri.parse('$baseUrl/usuarios/$id');

    try {
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );

      if (response.statusCode != 200) {
        throw Exception('Error al actualizar usuario');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<void> deleteUser(String token, String id) async {
    final url = Uri.parse('$baseUrl/usuarios/$id');

    try {
      final response = await http.delete(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode != 200) {
        throw Exception('Error al eliminar/desactivar usuario');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<Map<String, dynamic>> getPatientExpediente(
    String token,
    String patientId,
  ) async {
    final url = Uri.parse('$baseUrl/usuarios/$patientId/expediente');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Error al obtener expediente');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
