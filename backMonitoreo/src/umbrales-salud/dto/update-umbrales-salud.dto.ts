import { PartialType } from '@nestjs/mapped-types';
import { CreateUmbralesSaludDto } from './create-umbrales-salud.dto';

export class UpdateUmbralesSaludDto extends PartialType(
  CreateUmbralesSaludDto,
) {}
