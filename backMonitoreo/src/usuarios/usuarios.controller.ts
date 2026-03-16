import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Public } from '../auth/public.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Public()
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get('perfil')
  getProfile(@Req() req) {
    return this.usuariosService.getProfile(req.user.userId);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('medicoId') medicoId?: string,
    @Query('rol') rol?: string,
  ) {
    return this.usuariosService.findAll(
      req.user.userId,
      req.user.rol,
      medicoId,
      rol,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @Get(':id/expediente')
  async getExpediente(@Param('id') id: string, @Req() req) {
    try {
      return await this.usuariosService.getExpediente(
        id,
        req.user.userId,
        req.user.rol,
      );
    } catch (error) {
      if (error.message.includes('permiso')) {
        throw new ForbiddenException(error.message);
      }
      throw new NotFoundException(error.message);
    }
  }
}
