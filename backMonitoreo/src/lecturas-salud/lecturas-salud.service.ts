import { Injectable } from '@nestjs/common';
// Triggering reload to sync Prisma types for blood pressure metrics
import { CreateLecturaSaludDto } from './dto/create-lecturas-salud.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LecturasSaludService {
  constructor(private prisma: PrismaService) {}
  async create(createLecturaSaludDto: CreateLecturaSaludDto) {
    // Determine the time of registration, using the mobile's time if provided, otherwise the current server time
    const timestamp = createLecturaSaludDto.fechaRegistro
      ? new Date(createLecturaSaludDto.fechaRegistro)
      : new Date();

    const pacienteId = createLecturaSaludDto.pacienteId;

    // 1. Fetch Patient's custom Health Thresholds (Umbrales)
    const umbral = await this.prisma.umbralSalud.findUnique({
      where: { pacienteId },
    });

    let esAnomalia = false;
    let tipoAlerta: string | null = null;
    let descripcionAlerta: string | null = null;

    // 2. Evaluate if the telemetry data breaches the configured Thresholds
    if (umbral) {
      if (createLecturaSaludDto.oxigenoSangre < umbral.oxigenoMinimo) {
        esAnomalia = true;
        tipoAlerta = 'HIPOXIA';
        descripcionAlerta = `Alerta: Oxígeno en sangre bajó a ${createLecturaSaludDto.oxigenoSangre}% (Mínimo: ${umbral.oxigenoMinimo}%)`;
      } else if (
        createLecturaSaludDto.frecuenciaCardiaca >
        umbral.frecuenciaCardiacaMaxima
      ) {
        esAnomalia = true;
        tipoAlerta = 'TAQUICARDIA';
        descripcionAlerta = `Alerta: Ritmo cardíaco subió a ${createLecturaSaludDto.frecuenciaCardiaca} BPM (Máximo: ${umbral.frecuenciaCardiacaMaxima} BPM)`;
      } else if (
        createLecturaSaludDto.frecuenciaCardiaca <
        umbral.frecuenciaCardiacaMinima
      ) {
        esAnomalia = true;
        tipoAlerta = 'BRADICARDIA';
        descripcionAlerta = `Alerta: Ritmo cardíaco bajó a ${createLecturaSaludDto.frecuenciaCardiaca} BPM (Mínimo: ${umbral.frecuenciaCardiacaMinima} BPM)`;
      } else if (
        createLecturaSaludDto.temperaturaCorporal >
        umbral.temperaturaCorporalMaxima
      ) {
        esAnomalia = true;
        tipoAlerta = 'FIEBRE ALTA';
        descripcionAlerta = `Alerta: Temperatura corporal subió a ${createLecturaSaludDto.temperaturaCorporal}°C (Máximo: ${umbral.temperaturaCorporalMaxima}°C)`;
      } else if (
        createLecturaSaludDto.presionSistolica &&
        createLecturaSaludDto.presionSistolica > umbral.presionSistolicaMaxima
      ) {
        esAnomalia = true;
        tipoAlerta = 'HIPERTENSIÓN S';
        descripcionAlerta = `Alerta: Presión Sistólica subió a ${createLecturaSaludDto.presionSistolica} mmHg (Límite: ${umbral.presionSistolicaMaxima})`;
      } else if (
        createLecturaSaludDto.presionDiastolica &&
        createLecturaSaludDto.presionDiastolica > umbral.presionDiastolicaMaxima
      ) {
        esAnomalia = true;
        tipoAlerta = 'HIPERTENSIÓN D';
        descripcionAlerta = `Alerta: Presión Diastólica subió a ${createLecturaSaludDto.presionDiastolica} mmHg (Límite: ${umbral.presionDiastolicaMaxima})`;
      }
    } else {
      // Fallback evaluation if no custom Thresholds exist
      esAnomalia = this.detectAnomalyFallback(createLecturaSaludDto);
      if (esAnomalia) {
        tipoAlerta = 'ANOMALÍA GENERAL';
        descripcionAlerta =
          'Alerta: Lectura Biométrica fuera de rangos estándares y peligrosos';
      }
    }

    // 3. Save the actual Telemetry metric from ESP32
    const lectura = await this.prisma.lecturaSalud.create({
      data: {
        oxigenoSangre: createLecturaSaludDto.oxigenoSangre,
        frecuenciaCardiaca: createLecturaSaludDto.frecuenciaCardiaca,
        temperaturaCorporal: createLecturaSaludDto.temperaturaCorporal,
        humedadAmbiental: createLecturaSaludDto.humedadAmbiental,
        presionSistolica: createLecturaSaludDto.presionSistolica,
        presionDiastolica: createLecturaSaludDto.presionDiastolica,
        fechaRegistro: timestamp,
        pacienteId: pacienteId,
        esAnomalia: esAnomalia,
      },
    });

    // 4. If breached, trigger a persistent DB alert for the clinic staff
    if (esAnomalia && tipoAlerta && descripcionAlerta) {
      await this.prisma.alerta.create({
        data: {
          tipo: tipoAlerta,
          descripcion: descripcionAlerta,
          pacienteId: pacienteId,
          estado: 'PENDIENTE',
          activo: true,
        },
      });
    }

    return lectura;
  }

  // Basic function to flag if the incoming reading is an anomaly out of generic safe bounds
  private detectAnomalyFallback(data: CreateLecturaSaludDto): boolean {
    if (data.oxigenoSangre < 90) return true;
    if (data.frecuenciaCardiaca > 120 || data.frecuenciaCardiaca < 50)
      return true;
    if (data.temperaturaCorporal > 38.0 || data.temperaturaCorporal < 35.0)
      return true;
    return false;
  }

  // Method to get all historical readings of a specific patient wearing the ESP32
  findAllByPatient(pacienteId: string) {
    return this.prisma.lecturaSalud.findMany({
      where: { pacienteId },
      orderBy: { fechaRegistro: 'desc' }, // Latest readings first
      take: 100, // Optionally limit to last 100 to prevent huge payloads
    });
  }

  findOne(id: bigint) {
    // BigInts must be handled specifically in JS/TS
    return this.prisma.lecturaSalud.findUnique({
      where: { id },
    });
  }
}
