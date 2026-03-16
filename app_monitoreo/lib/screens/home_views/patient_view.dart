import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/user_service.dart';
import '../../services/device_service.dart';

class PatientHomeView extends StatefulWidget {
  const PatientHomeView({super.key});

  @override
  State<PatientHomeView> createState() => _PatientHomeViewState();
}

class _PatientHomeViewState extends State<PatientHomeView> {
  final _userService = UserService();
  final _deviceService = DeviceService();
  final _deviceIdController = TextEditingController();

  Map<String, dynamic>? _profile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    try {
      final data = await _userService.getUserProfile(authProvider.token!);
      if (mounted) {
        setState(() {
          _profile = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _linkDevice() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (_deviceIdController.text.isEmpty) return;

    try {
      await _deviceService.linkDevice(
        authProvider.token!,
        _deviceIdController.text.trim(),
        'ESP32-Ortesis-V1',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Dispositivo vinculado'),
            backgroundColor: Colors.green,
          ),
        );
        _deviceIdController.clear();
        _fetchProfile();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final perfil = _profile?['perfilPaciente'];
    final devices = perfil?['dispositivos'] as List? ?? [];
    final doctor = perfil?['miMedico'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoCard(
            'Mis Datos de Salud',
            perfil?['tipoSanguineo'] ?? 'Pendiente',
            'SANGRE',
            Colors.red,
            Icons.favorite,
          ),
          const SizedBox(height: 16),
          _buildDoctorCard(doctor),
          const SizedBox(height: 24),
          Text(
            'Mis Dispositivos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          if (devices.isEmpty)
            const Text('No hay dispositivos vinculados.')
          else
            ...devices.map(
              (d) => Card(
                child: ListTile(
                  leading: const Icon(
                    Icons.developer_board,
                    color: Colors.green,
                  ),
                  title: Text(d['dispositivoId']),
                  subtitle: Text(d['modelo']),
                ),
              ),
            ),
          const SizedBox(height: 24),
          _buildLinkSection(),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    String title,
    String val,
    String label,
    Color color,
    IconData icon,
  ) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(colors: [color.withOpacity(0.8), color]),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 40),
            const SizedBox(width: 20),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                Text(
                  val,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorCard(Map<String, dynamic>? doctor) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.medical_services)),
        title: const Text('Mi Médico'),
        subtitle: Text(
          doctor != null
              ? 'Dr. ${doctor['nombre']} ${doctor['apellidoPaterno']}'
              : 'Sin asignar',
        ),
        trailing: const Icon(Icons.chat_bubble_outline, color: Colors.blue),
      ),
    );
  }

  Widget _buildLinkSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          const Text(
            'Vincular nueva órtesis',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _deviceIdController,
            decoration: const InputDecoration(
              hintText: 'ID del dispositivo (MAC)',
              border: InputBorder.none,
              fillColor: Colors.white,
              filled: true,
            ),
          ),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: _linkDevice,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Vincular'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _deviceIdController.dispose();
    super.dispose();
  }
}
