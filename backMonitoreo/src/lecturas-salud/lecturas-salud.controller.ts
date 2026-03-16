import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LecturasSaludService } from './lecturas-salud.service';
import { CreateLecturaSaludDto } from './dto/create-lecturas-salud.dto';

@Controller('lecturas-salud')
export class LecturasSaludController {
  constructor(private readonly lecturasSaludService: LecturasSaludService) {}

  @Post()
  create(@Body() createLecturaSaludDto: CreateLecturaSaludDto) {
    return this.lecturasSaludService.create(createLecturaSaludDto);
  }

  // Get reading history exactly for a single patient mapping the user IoT request
  @Get('paciente/:pacienteId')
  findAllByPatient(@Param('pacienteId') pacienteId: string) {
    return this.lecturasSaludService.findAllByPatient(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Note: If using Javascript BigInts directly from Prisma we might need custom serialization
    return this.lecturasSaludService.findOne(BigInt(id));
  }
}
