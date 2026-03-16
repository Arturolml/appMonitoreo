import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) { }
  async create(createUsuarioDto: CreateUsuarioDto) {
    // Hash the incoming plain text password with a salt round of 10
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.passwordHash,
      saltRounds,
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          email: createUsuarioDto.email,
          nombre: createUsuarioDto.nombre,
          apellidoPaterno: createUsuarioDto.apellidoPaterno,
          apellidoMaterno: createUsuarioDto.apellidoMaterno || '',
          rol: createUsuarioDto.rol || 'PACIENTE',
          password: hashedPassword,
        },
      });

      // If the role is PACIENTE, create the clinical profile
      if (user.rol === 'PACIENTE') {
        const paciente = await (tx as any).paciente.create({
          data: {
            usuarioId: user.id,
            miMedicoId: createUsuarioDto.miMedicoId,
            nombre: createUsuarioDto.nombre,
            apellidoPaterno: createUsuarioDto.apellidoPaterno,
            apellidoMaterno: createUsuarioDto.apellidoMaterno || '',
            curp: createUsuarioDto.curp,
            fechaNacimiento: createUsuarioDto.fechaNacimiento
              ? new Date(createUsuarioDto.fechaNacimiento)
              : null,
            tipoOrtesis: createUsuarioDto.tipoOrtesis,
            miembroAfectado: createUsuarioDto.miembroAfectado,
            tipoSanguineo: createUsuarioDto.tipoSanguineo,
            alergias: createUsuarioDto.alergias,
            antecedentes: createUsuarioDto.antecedentes,
          },
        });

        // Initialize default health thresholds for the new patient
        await (tx as any).umbralSalud.create({
          data: {
            pacienteId: paciente.id,
            oxigenoMinimo: 90.0,
            frecuenciaCardiacaMaxima: 100,
            frecuenciaCardiacaMinima: 50,
            temperaturaCorporalMaxima: 37.8,
            activo: true
          }
        });
      }

      return user;
    });
  }

  findAll(requesterId: string, requesterRol: string, medicoId?: string, rol?: string) {
    const where: any = {};

    // For doctors, we ALWAYS filter by their own patients
    if (requesterRol === 'MEDICO') {
      where.rol = 'PACIENTE';
      where.perfilPaciente = { miMedicoId: requesterId };
    } else {
      // For ADMIN or others, we use the optional filters
      if (medicoId) {
        where.rol = 'PACIENTE';
        where.perfilPaciente = { miMedicoId: medicoId };
      } else if (rol) {
        where.rol = rol;
      }
    }

    return this.prisma.usuario.findMany({
      where,
      include: {
        perfilPaciente: {
          include: {
            miMedico: {
              select: {
                nombre: true,
                apellidoPaterno: true,
              },
            },
          },
        },
      },
    });
  }

  getProfile(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        perfilPaciente: {
          include: {
            miMedico: {
              select: {
                nombre: true,
                apellidoPaterno: true,
              },
            },
            dispositivos: true,
            umbrales: true,
            evaluaciones: {
              orderBy: { fechaCreacion: 'desc' },
            },
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidoPaterno: true,
        rol: true,
        fechaCreacion: true,
        activo: true,
      },
    });
  }

  // EXCLUSIVELY FOR INTERNAL AUTH VERIFICATION (Returns un-omitted password hash)
  findByEmailWithPassword(email: string) {
    return this.prisma.usuario.findFirst({
      where: { email, activo: true },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const data: any = { ...updateUsuarioDto };

    // If password is being updated, hash it
    if (updateUsuarioDto.passwordHash) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(updateUsuarioDto.passwordHash, saltRounds);
      delete data.passwordHash;
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }

  async getExpediente(id: string, requesterId: string, requesterRol: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { id: id },
          { perfilPaciente: { id: id } }
        ]
      },
      include: {
        perfilPaciente: {
          include: {
            miMedico: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
              },
            },
            dispositivos: true,
            umbrales: true,
            evaluaciones: {
              orderBy: { fechaCreacion: 'desc' },
            },
            alertas: {
              orderBy: { fechaCreacion: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!user || !user.perfilPaciente) {
      throw new Error('Paciente no encontrado');
    }

    // Ownership check for MEDICO role
    if (requesterRol === 'MEDICO' && user.perfilPaciente.miMedicoId !== requesterId) {
      throw new Error('No tiene permiso para ver este expediente');
    }

    return user;
  }
}
