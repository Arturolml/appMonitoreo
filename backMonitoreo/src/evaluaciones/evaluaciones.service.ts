import { Injectable } from '@nestjs/common';
import { CreateEvaluacioneDto } from './dto/create-evaluacione.dto';
import { UpdateEvaluacioneDto } from './dto/update-evaluacione.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEvaluacioneDto: CreateEvaluacioneDto,
    evaluadorId: string,
    nombreEvaluador: string,
  ) {
    // Solve common issue: Frontend sends Usuario.id instead of Paciente.id
    let actualPacienteId = createEvaluacioneDto.pacienteId;

    // Check if the ID belongs to a Usuario with a Paciente profile
    const profile = await this.prisma.paciente.findFirst({
      where: {
        OR: [{ id: actualPacienteId }, { usuarioId: actualPacienteId }],
      },
    });

    if (!profile) {
      throw new Error(`Paciente con ID ${actualPacienteId} no encontrado`);
    }

    actualPacienteId = profile.id;

    return this.prisma.evaluacion.create({
      data: {
        ...createEvaluacioneDto,
        pacienteId: actualPacienteId,
        evaluadorId,
        nombreEvaluador,
      },
    });
  }

  // Find evaluations made exclusively for a specific patient
  findAllByPatient(pacienteId: string) {
    return this.prisma.evaluacion.findMany({
      where: { pacienteId },
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: {
          select: { nombre: true, apellidoPaterno: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.evaluacion.findUnique({
      where: { id },
    });
  }
}
