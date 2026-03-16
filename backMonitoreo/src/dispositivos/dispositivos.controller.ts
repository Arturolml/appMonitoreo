import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { DispositivosService } from './dispositivos.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';

@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly dispositivosService: DispositivosService) {}

  @Post()
  create(@Req() req, @Body() createDispositivoDto: CreateDispositivoDto) {
    return this.dispositivosService.create(req.user.userId, createDispositivoDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.dispositivosService.findAllByPatient(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositivosService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositivosService.remove(id);
  }
}
