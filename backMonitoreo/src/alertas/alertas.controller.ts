import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(@Body() createAlertaDto: CreateAlertaDto) {
    return this.alertasService.create(createAlertaDto);
  }

  @Get('pendientes')
  findAllPending() {
    return this.alertasService.findAllPending();
  }

  @Patch(':id/resolver')
  resolver(
    @Param('id') id: string,
    @Body('notasResolucion') notasResolucion: string,
    @Body('medicoId') medicoId: string,
  ) {
    return this.alertasService.resolver(id, notasResolucion, medicoId);
  }
}
