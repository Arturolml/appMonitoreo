import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacioneDto } from './dto/create-evaluacione.dto';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  // Strict constraint: Only certified Medicos can create and sign physical/health evaluations
  @Roles(Rol.MEDICO)
  @Post()
  create(
    @Request() req: any,
    @Body() createEvaluacioneDto: CreateEvaluacioneDto,
  ) {
    // req.user logic comes from JwtAuthStrategy unpacking the token payload
    const evaluadorId = req.user.userId;
    const nombreEvaluador = req.user.nombre || 'Personal Médico'; // Fallback if name payload is short

    return this.evaluacionesService.create(
      createEvaluacioneDto,
      evaluadorId,
      nombreEvaluador,
    );
  }

  // Any authenticated user belonging to the system can view historic records (RBAC filters can be extended here)
  @Get('paciente/:pacienteId')
  findAllByPatient(@Param('pacienteId') pacienteId: string) {
    return this.evaluacionesService.findAllByPatient(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluacionesService.findOne(id);
  }
}
