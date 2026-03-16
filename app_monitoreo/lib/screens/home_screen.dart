import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'home_views/doctor_view.dart';
import 'home_views/patient_view.dart';
import 'home_views/admin_view.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final role = authProvider.role;

    Widget body;
    String title;
    Color appBarColor;
    bool showFab = false;

    switch (role) {
      case 'PACIENTE':
        body = const PatientHomeView();
        title = 'Monitoreo Vital';
        appBarColor = Colors.indigo;
        break;
      case 'ADMIN':
        body = const AdminHomeView();
        title = 'Administración';
        appBarColor = Colors.redAccent;
        break;
      default:
        body = const DoctorHomeView();
        title = 'Panel Médico';
        appBarColor = Colors.blueAccent;
        showFab = true;
    }

    return Scaffold(
      backgroundColor: role == 'PACIENTE' ? Colors.blueGrey[50] : Colors.white,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: appBarColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/');
              }
            },
          ),
        ],
      ),
      body: body,
      floatingActionButton: showFab
          ? FloatingActionButton(
              onPressed: () => Navigator.pushNamed(context, '/create-patient'),
              backgroundColor: Colors.blueAccent,
              child: const Icon(Icons.person_add),
            )
          : null,
    );
  }
}
