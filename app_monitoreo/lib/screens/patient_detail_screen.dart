import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';
import '../services/user_service.dart';
import 'package:intl/intl.dart';
import 'evaluation_creation_screen.dart';
import 'evaluation_detail_screen.dart';
import '../services/telemetry_service.dart';
import 'dart:async';

class PatientDetailScreen extends StatefulWidget {
  final String patientId;

  const PatientDetailScreen({super.key, required this.patientId});

  @override
  State<PatientDetailScreen> createState() => _PatientDetailScreenState();
}

class _PatientDetailScreenState extends State<PatientDetailScreen> {
  final UserService _userService = UserService();
  final TelemetryService _telemetryService = TelemetryService();
  Map<String, dynamic>? _expediente;
  List<dynamic> _readings = [];
  bool _isLoading = true;
  String? _error;
  Timer? _telemetryTimer;

  @override
  void initState() {
    super.initState();
    _fetchExpediente();
    _startTelemetryPolling();
  }

  @override
  void dispose() {
    _telemetryTimer?.cancel();
    super.dispose();
  }

  void _startTelemetryPolling() {
    _fetchTelemetry();
    _telemetryTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _fetchTelemetry();
    });
  }

  Future<void> _fetchTelemetry() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null) return;

    try {
      final data = await _telemetryService.getPatientReadings(token, widget.patientId);
      if (mounted) {
        setState(() {
          _readings = data;
        });
      }
    } catch (e) {
      debugPrint('Error polling telemetry: $e');
    }
  }

  Future<void> _fetchExpediente() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;

    if (token == null) return;

    try {
      final data = await _userService.getPatientExpediente(token, widget.patientId);
      if (mounted) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('monitoring_patient_id', widget.patientId);
        setState(() {
          _expediente = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  int _calculateAge(String? birthDateStr) {
    if (birthDateStr == null) return 0;
    try {
      final birthDate = DateTime.parse(birthDateStr);
      final today = DateTime.now();
      int age = today.year - birthDate.year;
      if (today.month < birthDate.month || (today.month == birthDate.month && today.day < birthDate.day)) {
        age--;
      }
      return age;
    } catch (e) {
      return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Expediente Clínico'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _isLoading = true;
                              _error = null;
                            });
                            _fetchExpediente();
                          },
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                )
              : _buildContent(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EvaluationCreationScreen(patientId: widget.patientId),
            ),
          );
          if (result == true) _fetchExpediente();
        },
        label: const Text('Nueva Evaluación'),
        icon: const Icon(Icons.add_chart),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }

  Widget _buildContent() {
    final perfil = _expediente?['perfilPaciente'];
    final evaluations = perfil?['evaluaciones'] as List? ?? [];
    final devices = perfil?['dispositivos'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(perfil),
          const SizedBox(height: 24),
          _buildTelemetryMonitor(),
          const SizedBox(height: 24),
          _buildSectionTitle('Datos Clínicos'),
          const SizedBox(height: 12),
          _buildInfoRow('Tipo de Órtesis', perfil?['tipoOrtesis'] ?? 'No especificada'),
          _buildInfoRow('Miembro Afectado', perfil?['miembroAfectado'] ?? 'No especificado'),
          _buildInfoRow('Tipo Sanguíneo', perfil?['tipoSanguineo'] ?? 'No especificado'),
          _buildInfoRow('Alergias', perfil?['alergias'] ?? 'Ninguna'),
          _buildInfoRow('Antecedentes', perfil?['antecedentes'] ?? 'Sin antecedentes registrados'),
          const SizedBox(height: 24),
          _buildSectionTitle('Dispositivos Vinculados'),
          const SizedBox(height: 12),
          if (devices.isEmpty)
            const Text('No hay dispositivos vinculados.')
          else
            ...devices.map((d) => _buildDeviceItem(d)),
          const SizedBox(height: 24),
          _buildSectionTitle('Evaluaciones Clínicas'),
          const SizedBox(height: 12),
          if (evaluations.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(child: Text('Aún no hay evaluaciones registradas.')),
            )
          else
            ...evaluations.map((e) => _buildEvaluationCard(e)),
          const SizedBox(height: 24),
          _buildSectionTitle('Alertas Recientes'),
          const SizedBox(height: 12),
          if ((perfil?['alertas'] as List? ?? []).isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(child: Text('No hay alertas registradas recientemente.')),
            )
          else
            ...(perfil?['alertas'] as List).map((a) => _buildAlertItem(a)),
        ],
      ),
    );
  }

  Widget _buildAlertItem(dynamic alert) {
    final date = DateTime.parse(alert['fechaCreacion']);
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(date);
    final isCritical = alert['tipo'].toString().toLowerCase().contains('crítica') || 
                       alert['tipo'].toString().toLowerCase().contains('critica');

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: isCritical ? Colors.red.shade50 : Colors.orange.shade50,
      child: ListTile(
        leading: Icon(
          Icons.warning_amber_rounded,
          color: isCritical ? Colors.red : Colors.orange,
        ),
        title: Text(
          alert['tipo'],
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isCritical ? Colors.red.shade900 : Colors.orange.shade900,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(alert['descripcion']),
            const SizedBox(height: 4),
            Text(
              formattedDate,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: alert['estado'] == 'PENDIENTE' ? Colors.red : Colors.green,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            alert['estado'],
            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(dynamic perfil) {
    return Row(
      children: [
        const CircleAvatar(
          radius: 30,
          backgroundColor: Colors.blueAccent,
          child: Icon(Icons.person, size: 40, color: Colors.white),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${perfil['nombre']} ${perfil['apellidoPaterno']}',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  Text(
                    '${_calculateAge(perfil['fechaNacimiento'])} Años',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const Text(' • ', style: TextStyle(color: Colors.grey)),
                  Text(
                    'CURP: ${perfil['curp'] ?? 'N/A'}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueAccent),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.grey),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceItem(dynamic device) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.developer_board, color: Colors.green),
        title: Text(device['dispositivoId']),
        subtitle: Text(device['modelo']),
      ),
    );
  }

  Widget _buildEvaluationCard(dynamic eval) {
    final date = DateTime.parse(eval['fechaCreacion']);
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(date);

    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => EvaluationDetailScreen(evaluation: eval)),
      ),
      child: Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    formattedDate,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueGrey),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
              const Divider(),
              Text(
                'Diagnóstico: ${eval['diagnostico']}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                'Por: ${eval['nombreEvaluador']}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTelemetryMonitor() {
    if (_readings.isEmpty) return const SizedBox.shrink();
    final last = _readings.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSectionTitle('Monitoreo en Vivo (ESP32)'),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  const Text('Vivo', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 2.1,
          children: [
            _buildVitalCard('Frec. Cardíaca', '${last['frecuenciaCardiaca']}', 'BPM', Colors.red, Icons.favorite),
            _buildVitalCard('Oxigenación', '${last['oxigenoSangre']}', '%', Colors.cyan, Icons.air),
            _buildVitalCard('Presión Art.', last['presionSistolica'] != null ? '${(last['presionSistolica'] as num).round()}/${(last['presionDiastolica'] as num).round()}' : '---', 'mmHg', Colors.indigo, Icons.speed),
            _buildVitalCard('Temperatura', '${(last['temperaturaCorporal'] as num).toStringAsFixed(1)}', '°C', Colors.orange, Icons.thermostat),
          ],
        ),
      ],
    );
  }

  Widget _buildVitalCard(String label, String value, String unit, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(width: 2),
              Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
