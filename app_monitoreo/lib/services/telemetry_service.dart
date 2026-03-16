import 'dart:convert';
import 'package:http/http.dart' as http;

class TelemetryService {
  final String baseUrl = 'http://192.168.100.20:3000';

  Future<List<dynamic>> getPatientReadings(String token, String patientId) async {
    final url = Uri.parse('$baseUrl/lecturas-salud/paciente/$patientId');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener telemetría');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
