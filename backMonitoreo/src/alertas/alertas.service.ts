import { Injectable } from '@nestjs/common';
import { CreateAlertaDto } from './dto/create-alerta.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}
  create(createAlertaDto: CreateAlertaDto) {
    // We cannot map `lectura` id directly as it's not a direct column, instead we must link to the patient
    // However, the schema (lines 112-126) defines Alerta -> pacienteId
    // It doesn't define Alerta -> lecturaId. Oops! Let's adapt to schema:
    return 'This action is pending schema alignment for telemetry->alert relational DB link';
  }

  // Find alerts filtered exactly by pending status
  findAllPending() {
    return this.prisma.alerta.findMany({
      where: { estado: 'PENDIENTE', activo: true },
      include: {
        paciente: true, // The schema only links Alerta exactly to Paciente, not to a specific Lectura
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} alerta`;
  }

  // Specialized method to mark the alert as resolved, leaving a track record of WHICH doctor cleared it
  resolver(id: string, notasResolucion: string, medicoId: string) {
    return this.prisma.alerta.update({
      where: { id },
      data: {
        estado: 'RESUELTA',
        notas: notasResolucion, // Column is called "notas"
        resueltaPor: medicoId, // Column is called "resueltaPor"
      },
    });
  }
}
