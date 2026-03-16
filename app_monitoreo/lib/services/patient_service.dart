import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/patient.dart';

class PatientService {
  final String baseUrl = 'http://192.168.100.20:3000';

  Future<List<Patient>> getPatients(String token, {String? medicoId}) async {
    final queryParams = medicoId != null ? '?medicoId=$medicoId' : '';
    final url = Uri.parse(
      '$baseUrl/usuarios$queryParams',
    ); // Assuming users endpoint returns patients for now or update after checking

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Patient.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar pacientes');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
