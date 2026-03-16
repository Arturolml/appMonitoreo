import 'dart:convert';
import 'package:http/http.dart' as http;

class EvaluationService {
  final String baseUrl = 'http://192.168.100.20:3000';

  Future<void> createEvaluation({
    required String token,
    required String pacienteId,
    required String diagnostico,
    String? observaciones,
    String? indicaciones,
    String? medicamentos,
    int? puntajeBarthel,
    int? puntajeTinetti,
    int? puntajeNorton,
    int? puntajePfeiffer,
    int? nivelDolor,
    int? puntajeLawton,
    int? puntajeMNA,
    Map<String, dynamic>? datosEscalas,
    double? nivelEstres,
    double? nivelAnsiedad,
  }) async {
    final url = Uri.parse('$baseUrl/evaluaciones');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'pacienteId': pacienteId,
          'diagnostico': diagnostico,
          'observaciones': observaciones,
          'indicaciones': indicaciones,
          'medicamentos': medicamentos,
          'puntajeBarthel': puntajeBarthel,
          'puntajeTinetti': puntajeTinetti,
          'puntajeNorton': puntajeNorton,
          'puntajePfeiffer': puntajePfeiffer,
          'nivelDolor': nivelDolor,
          'puntajeLawton': puntajeLawton,
          'puntajeMNA': puntajeMNA,
          'datosEscalas': datosEscalas,
          'nivelEstres': nivelEstres,
          'nivelAnsiedad': nivelAnsiedad,
        }),
      );

      if (response.statusCode != 201) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Error al crear evaluación');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<dynamic>> getEvaluationsByPatient(String token, String patientId) async {
    final url = Uri.parse('$baseUrl/evaluaciones/paciente/$patientId');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener evaluaciones');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
