import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UmbralesSaludService } from './umbrales-salud.service';
import { CreateUmbralesSaludDto } from './dto/create-umbrales-salud.dto';
import { UpdateUmbralesSaludDto } from './dto/update-umbrales-salud.dto';

@Controller('umbrales-salud')
export class UmbralesSaludController {
  constructor(private readonly umbralesSaludService: UmbralesSaludService) {}

  @Post()
  create(@Body() createUmbralesSaludDto: CreateUmbralesSaludDto) {
    return this.umbralesSaludService.create(createUmbralesSaludDto);
  }

  @Get()
  findAll() {
    return this.umbralesSaludService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.umbralesSaludService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUmbralesSaludDto: UpdateUmbralesSaludDto,
  ) {
    return this.umbralesSaludService.update(+id, updateUmbralesSaludDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.umbralesSaludService.remove(+id);
  }
}
