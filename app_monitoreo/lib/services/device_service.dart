import 'dart:convert';
import 'package:http/http.dart' as http;

class DeviceService {
  final String baseUrl = 'http://192.168.100.20:3000';

  Future<void> linkDevice(String token, String deviceId, String model) async {
    final url = Uri.parse('$baseUrl/dispositivos');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'dispositivoId': deviceId, 'modelo': model}),
    );

    if (response.statusCode != 201) {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Error al vincular dispositivo');
    }
  }

  Future<List<dynamic>> getMyDevices(String token) async {
    final url = Uri.parse('$baseUrl/dispositivos');

    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener dispositivos');
    }
  }
}
