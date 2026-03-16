import { Injectable } from '@nestjs/common';
import { CreateUmbralesSaludDto } from './dto/create-umbrales-salud.dto';
import { UpdateUmbralesSaludDto } from './dto/update-umbrales-salud.dto';

@Injectable()
export class UmbralesSaludService {
  create(createUmbralesSaludDto: CreateUmbralesSaludDto) {
    return 'This action adds a new umbralesSalud';
  }

  findAll() {
    return `This action returns all umbralesSalud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} umbralesSalud`;
  }

  update(id: number, updateUmbralesSaludDto: UpdateUmbralesSaludDto) {
    return `This action updates a #${id} umbralesSalud`;
  }

  remove(id: number) {
    return `This action removes a #${id} umbralesSalud`;
  }
}
