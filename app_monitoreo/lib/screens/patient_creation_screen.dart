import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/user_service.dart';

class PatientCreationScreen extends StatefulWidget {
  const PatientCreationScreen({super.key});

  @override
  State<PatientCreationScreen> createState() => _PatientCreationScreenState();
}

class _PatientCreationScreenState extends State<PatientCreationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _userService = UserService();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nombreController = TextEditingController();
  final _apellidoPaternoController = TextEditingController();
  final _apellidoMaternoController = TextEditingController();
  final _curpController = TextEditingController();
  final _tipoOrtesisController = TextEditingController();
  final _miembroAfectadoController = TextEditingController();

  DateTime? _selectedBirthDate;
  bool _isLoading = false;

  Future<void> _createPatient() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      try {
        await _userService.createUser(
          token: authProvider.token!,
          email: _emailController.text.trim(),
          password: _passwordController.text,
          nombre: _nombreController.text.trim(),
          apellidoPaterno: _apellidoPaternoController.text.trim(),
          apellidoMaterno: _apellidoMaternoController.text.trim().isEmpty
              ? null
              : _apellidoMaternoController.text.trim(),
          rol: 'PACIENTE',
          curp: _curpController.text.trim(),
          miMedicoId: authProvider.userId, // Link to the current doctor
          fechaNacimiento: _selectedBirthDate?.toIso8601String(),
          tipoOrtesis: _tipoOrtesisController.text.trim(),
          miembroAfectado: _miembroAfectadoController.text.trim(),
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Paciente registrado exitosamente'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Paciente'),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Datos del Nuevo Paciente',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre(s)',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Campo requerido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _apellidoPaternoController,
                decoration: const InputDecoration(
                  labelText: 'Apellido Paterno',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Campo requerido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _apellidoMaternoController,
                decoration: const InputDecoration(
                  labelText: 'Apellido Materno (Opcional)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Correo Electrónico',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) =>
                    !value!.contains('@') ? 'Correo inválido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Contraseña Provisional',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) =>
                    value!.length < 6 ? 'Mínimo 6 caracteres' : null,
              ),
              const SizedBox(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(_selectedBirthDate == null
                    ? 'Seleccionar Fecha de Nacimiento'
                    : 'Nacimiento: ${_selectedBirthDate!.toLocal().toString().split(' ')[0]}'),
                trailing: const Icon(Icons.calendar_month),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now().subtract(const Duration(days: 365 * 20)),
                    firstDate: DateTime(1900),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) setState(() => _selectedBirthDate = picked);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _tipoOrtesisController,
                decoration: const InputDecoration(
                  labelText: 'Tipo de Órtesis (Ej: Inmovilizadora)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _miembroAfectadoController,
                decoration: const InputDecoration(
                  labelText: 'Miembro Afectado (Ej: Mano Izq.)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _curpController,
                decoration: const InputDecoration(
                  labelText: 'CURP',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Campo requerido' : null,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _createPatient,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Registrar Paciente',
                        style: TextStyle(fontSize: 18),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nombreController.dispose();
    _apellidoPaternoController.dispose();
    _apellidoMaternoController.dispose();
    _curpController.dispose();
    _tipoOrtesisController.dispose();
    _miembroAfectadoController.dispose();
    super.dispose();
  }
}
