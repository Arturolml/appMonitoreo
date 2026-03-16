import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';

@Injectable()
export class DispositivosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDispositivoDto: CreateDispositivoDto) {
    // 1. Find the patient profile for this user
    const paciente = await (this.prisma as any).paciente.findUnique({
      where: { usuarioId: userId },
    });

    if (!paciente) {
      throw new NotFoundException(
        'Perfil de paciente no encontrado para este usuario',
      );
    }

    // 2. Link the device
    return (this.prisma as any).dispositivo.create({
      data: {
        dispositivoId: createDispositivoDto.dispositivoId,
        modelo: createDispositivoDto.modelo,
        pacienteId: paciente.id,
      },
    });
  }

  findAllByPatient(userId: string) {
    return (this.prisma as any).dispositivo.findMany({
      where: {
        paciente: {
          usuarioId: userId,
        },
      },
    });
  }

  findOne(id: string) {
    return (this.prisma as any).dispositivo.findUnique({
      where: { id },
    });
  }

  remove(id: string) {
    return (this.prisma as any).dispositivo.delete({
      where: { id },
    });
  }
}
