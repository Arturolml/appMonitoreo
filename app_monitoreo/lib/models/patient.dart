class Patient {
  final String id; // This is now Paciente.id
  final String usuarioId;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? bloodType;
  final String? birthDate;
  final String? orthesisType;
  final String? affectedLimb;
  final bool isActive;

  Patient({
    required this.id,
    required this.usuarioId,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.bloodType,
    this.birthDate,
    this.orthesisType,
    this.affectedLimb,
    this.isActive = true,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    // The backend returns a Usuario object with include: { perfilPaciente: true }
    final perfil = json['perfilPaciente'] as Map<String, dynamic>?;

    // Favor names from the clinical profile if available
    final String nombre = perfil?['nombre'] ?? json['nombre'] ?? '';
    final String pApp =
        perfil?['apellidoPaterno'] ?? json['apellidoPaterno'] ?? '';
    final String mApp =
        perfil?['apellidoMaterno'] ?? json['apellidoMaterno'] ?? '';

    return Patient(
      id: perfil?['id'] ?? '',
      usuarioId: json['id'] ?? '',
      name: '$nombre $pApp $mApp'.trim(),
      email: json['email'] ?? '',
      phone: json['telefono'],
      role: json['rol'] ?? 'PACIENTE',
      bloodType: perfil?['tipoSanguineo'],
      birthDate: perfil?['fechaNacimiento'],
      orthesisType: perfil?['tipoOrtesis'],
      affectedLimb: perfil?['miembroAfectado'],
      isActive: json['activo'] ?? true,
    );
  }
}
