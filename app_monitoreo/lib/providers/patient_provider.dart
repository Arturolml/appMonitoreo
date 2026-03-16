import 'package:flutter/material.dart';
import '../models/patient.dart';
import '../services/patient_service.dart';

class PatientProvider with ChangeNotifier {
  List<Patient> _patients = [];
  bool _isLoading = false;
  final PatientService _patientService = PatientService();

  List<Patient> get patients => _patients;
  bool get isLoading => _isLoading;

  Future<void> fetchPatients(String token, {String? medicoId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _patients = await _patientService.getPatients(token, medicoId: medicoId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }
}
