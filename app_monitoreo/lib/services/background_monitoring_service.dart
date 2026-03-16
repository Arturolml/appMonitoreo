import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class BackgroundMonitoringService {
  static const String baseUrl = 'http://192.168.100.20:3000';
  static const String notificationChannelId = 'monitoring_channel';
  static const int notificationId = 888;

  static Future<void> initializeService() async {
    final service = FlutterBackgroundService();

    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      notificationChannelId,
      'Monitoreo VitalTrack',
      description: 'Este canal se usa para el monitoreo persistente de salud.',
      importance: Importance.low,
    );

    final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
        FlutterLocalNotificationsPlugin();

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        autoStart: true,
        isForegroundMode: true,
        notificationChannelId: notificationChannelId,
        initialNotificationTitle: 'Monitoreo Activo',
        initialNotificationContent: 'VitalTrack está monitoreando en segundo plano',
        foregroundServiceNotificationId: notificationId,
      ),
      iosConfiguration: IosConfiguration(
        autoStart: true,
        onForeground: onStart,
        onBackground: onIosBackground,
      ),
    );

    await service.startService();
  }

  @pragma('vm:entry-point')
  static Future<bool> onIosBackground(ServiceInstance service) async {
    return true;
  }

  @pragma('vm:entry-point')
  static void onStart(ServiceInstance service) async {
    DartPluginRegistrant.ensureInitialized();

    final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
        FlutterLocalNotificationsPlugin();

    if (service is AndroidServiceInstance) {
      service.on('setAsForeground').listen((event) {
        service.setAsForegroundService();
      });

      service.on('setAsBackground').listen((event) {
        service.setAsBackgroundService();
      });
    }

    service.on('stopService').listen((event) {
      service.stopSelf();
    });

    // Polling loop
    Timer.periodic(const Duration(seconds: 10), (timer) async {
      if (service is AndroidServiceInstance) {
        if (await service.isForegroundService()) {
          // Actualizar notificación de estado si fuera necesario
        }
      }

      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('jwt_token');
      final String? patientId = prefs.getString('monitoring_patient_id');

      if (token != null && patientId != null) {
        try {
          final response = await http.get(
            Uri.parse('$baseUrl/lecturas-salud/paciente/$patientId'),
            headers: {'Authorization': 'Bearer $token'},
          );

          if (response.statusCode == 200) {
            final List<dynamic> readings = jsonDecode(response.body);
            if (readings.isNotEmpty) {
              final lastReading = readings.first;
              
              // Si el backend marcó la lectura como anomalía (esto depende de tu lógica de backend)
              if (lastReading['esAnomalia'] == true) {
                flutterLocalNotificationsPlugin.show(
                  id: 999,
                  title: '🚨 ALERTA DE SALUD',
                  body: 'Se detectó una anomalía en los signos vitales del paciente.',
                  notificationDetails: const NotificationDetails(
                    android: AndroidNotificationDetails(
                      notificationChannelId,
                      'Alertas Críticas',
                      channelDescription: 'Canal para alertas urgentes de salud',
                      importance: Importance.max,
                      priority: Priority.high,
                      ticker: 'ticker',
                      icon: '@mipmap/ic_launcher',
                    ),
                  ),
                );
              }
            }
          }
        } catch (e) {
          debugPrint('Error en monitoreo de fondo: $e');
        }
      }
    });
  }
}
