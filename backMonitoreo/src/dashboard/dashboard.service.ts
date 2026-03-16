import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(doctorId: string) {
    const activePatients = await this.prisma.paciente.count({
      where: { 
        miMedicoId: doctorId,
        usuario: { activo: true } 
      },
    });

    const criticalAlerts = await this.prisma.alerta.count({
      where: { 
        estado: 'PENDIENTE',
        paciente: { miMedicoId: doctorId }
      },
    });

    return {
      activePatients,
      criticalAlerts,
    };
  }
}
