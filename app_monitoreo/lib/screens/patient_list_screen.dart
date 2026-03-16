import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/patient_provider.dart';
import '../widgets/patient_card.dart';

class PatientListScreen extends StatefulWidget {
  const PatientListScreen({super.key});

  @override
  State<PatientListScreen> createState() => _PatientListScreenState();
}

class _PatientListScreenState extends State<PatientListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isAuthenticated) {
        final String? medicoId = authProvider.role == 'MEDICO'
            ? authProvider.userId
            : null;
        Provider.of<PatientProvider>(
          context,
          listen: false,
        ).fetchPatients(authProvider.token!, medicoId: medicoId);
      }
    });
  }

  Future<void> _onRefresh() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final String? medicoId = authProvider.role == 'MEDICO'
        ? authProvider.userId
        : null;
    await Provider.of<PatientProvider>(
      context,
      listen: false,
    ).fetchPatients(authProvider.token!, medicoId: medicoId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pacientes'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.patients.isEmpty) {
            return const Center(child: Text('No hay pacientes registrados'));
          }

          return RefreshIndicator(
            onRefresh: _onRefresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.patients.length,
              itemBuilder: (context, index) {
                final patient = provider.patients[index];
                return PatientCard(
                  patient: patient,
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      '/patient-detail',
                      arguments: patient.id,
                    );
                  },
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.pushNamed(context, '/create-patient');
          if (result == true) _onRefresh();
        },
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add),
      ),
    );
  }
}
