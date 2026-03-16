import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/user_service.dart';

class AdminHomeView extends StatefulWidget {
  const AdminHomeView({super.key});

  @override
  State<AdminHomeView> createState() => _AdminHomeViewState();
}

class _AdminHomeViewState extends State<AdminHomeView> {
  final UserService _userService = UserService();
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchUsers();
    });
  }

  Future<void> _fetchUsers() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;

    if (token == null) return;

    try {
      final response = await _userService.getUsers(token);
      setState(() {
        _users = response;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error al cargar usuarios: $e')));
      }
      setState(() => _isLoading = false);
    }
  }

  Future<void> _showPasswordResetDialog(dynamic user) async {
    final TextEditingController passwordController = TextEditingController();
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Resetear Contraseña: ${user['nombre']}'),
        content: TextField(
          controller: passwordController,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Nueva Contraseña',
            hintText: 'Mínimo 6 caracteres',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (passwordController.text.length < 6) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'La contraseña debe tener al menos 6 caracteres',
                    ),
                  ),
                );
                return;
              }
              final authProvider = Provider.of<AuthProvider>(
                context,
                listen: false,
              );
              try {
                await _userService.updateUser(authProvider.token!, user['id'], {
                  'passwordHash': passwordController.text,
                });
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Contraseña actualizada con éxito'),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              }
            },
            child: const Text('Actualizar'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleUserStatus(dynamic user) async {
    final bool currentlyActive = user['activo'] ?? true;
    final String action = currentlyActive ? 'desactivar' : 'reactivar';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${action.toUpperCase()} Usuario'),
        content: Text('¿Está seguro de que desea $action a ${user['nombre']}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              action.toUpperCase(),
              style: TextStyle(
                color: currentlyActive ? Colors.red : Colors.green,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      try {
        // Use updateUser to toggle active status instead of deleteUser
        await _userService.updateUser(authProvider.token!, user['id'], {
          'activo': !currentlyActive,
        });
        _fetchUsers();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  Future<void> _showCreateUserDialog() async {
    final formKey = GlobalKey<FormState>();
    final nombreController = TextEditingController();
    final apPaternoController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    String selectedRol = 'MEDICO';

    return showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Nuevo Usuario'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nombreController,
                    decoration: const InputDecoration(labelText: 'Nombre'),
                    validator: (v) => v!.isEmpty ? 'Requerido' : null,
                  ),
                  TextFormField(
                    controller: apPaternoController,
                    decoration: const InputDecoration(
                      labelText: 'Apellido Paterno',
                    ),
                    validator: (v) => v!.isEmpty ? 'Requerido' : null,
                  ),
                  TextFormField(
                    controller: emailController,
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (v) => v!.isEmpty ? 'Requerido' : null,
                  ),
                  TextFormField(
                    controller: passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Contraseña'),
                    validator: (v) =>
                        v!.length < 6 ? 'Mín. 6 caracteres' : null,
                  ),
                  DropdownButtonFormField<String>(
                    value: selectedRol,
                    items: ['ADMIN', 'MEDICO', 'ENFERMERO']
                        .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                        .toList(),
                    onChanged: (v) => setModalState(() => selectedRol = v!),
                    decoration: const InputDecoration(labelText: 'Rol'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  final authProvider = Provider.of<AuthProvider>(
                    context,
                    listen: false,
                  );
                  try {
                    await _userService.createUser(
                      token: authProvider.token!,
                      email: emailController.text,
                      password: passwordController.text,
                      nombre: nombreController.text,
                      apellidoPaterno: apPaternoController.text,
                      rol: selectedRol,
                    );
                    if (context.mounted) {
                      Navigator.pop(context);
                      _fetchUsers();
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(
                        context,
                      ).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  }
                }
              },
              child: const Text('Crear'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchUsers,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      'Gestión de Usuarios',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _users.length,
                      itemBuilder: (context, index) {
                        final user = _users[index];
                        final bool isActive = user['activo'] ?? true;

                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          elevation: isActive ? 2 : 0,
                          color: isActive ? Colors.white : Colors.grey.shade100,
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: user['rol'] == 'ADMIN'
                                  ? Colors.red.shade100
                                  : Colors.blue.shade100,
                              child: Icon(
                                user['rol'] == 'ADMIN'
                                    ? Icons.shield
                                    : Icons.person,
                                color: user['rol'] == 'ADMIN'
                                    ? Colors.red
                                    : Colors.blue,
                              ),
                            ),
                            title: Text(
                              '${user['nombre']} ${user['apellidoPaterno']}',
                              style: TextStyle(
                                decoration: isActive
                                    ? null
                                    : TextDecoration.lineThrough,
                                color: isActive ? Colors.black : Colors.grey,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(user['email']),
                                const SizedBox(height: 4),
                                Chip(
                                  label: Text(
                                    user['rol'],
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.white,
                                    ),
                                  ),
                                  backgroundColor: user['rol'] == 'ADMIN'
                                      ? Colors.red
                                      : Colors.blue,
                                  padding: EdgeInsets.zero,
                                  visualDensity: VisualDensity.compact,
                                ),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.key, size: 20),
                                  onPressed: () =>
                                      _showPasswordResetDialog(user),
                                  tooltip: 'Resetear Contraseña',
                                ),
                                IconButton(
                                  icon: Icon(
                                    isActive
                                        ? Icons.power_settings_new
                                        : Icons.power_off,
                                    color: isActive ? Colors.green : Colors.red,
                                  ),
                                  onPressed: () => _toggleUserStatus(user),
                                  tooltip: isActive ? 'Desactivar' : 'Activar',
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateUserDialog,
        backgroundColor: Colors.redAccent,
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
    );
  }
}
