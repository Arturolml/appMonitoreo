import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/patient_list_screen.dart';
import 'screens/patient_creation_screen.dart';
import 'screens/patient_detail_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/patient_provider.dart';

import 'services/background_monitoring_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await BackgroundMonitoringService.initializeService();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PatientProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (!auth.isInitialized) {
          return const MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            ),
          );
        }

        return MaterialApp(
          title: 'Monitoreo de Salud',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
            useMaterial3: true,
          ),
          home: auth.isAuthenticated ? const HomeScreen() : const LoginScreen(),
          routes: {
            '/login': (context) => const LoginScreen(),
            '/home': (context) => const HomeScreen(),
            '/patients': (context) => const PatientListScreen(),
            '/create-patient': (context) => const PatientCreationScreen(),
            '/patient-detail': (context) => PatientDetailScreen(
                  patientId:
                      ModalRoute.of(context)!.settings.arguments as String,
                ),
          },
        );
      },
    );
  }
}
