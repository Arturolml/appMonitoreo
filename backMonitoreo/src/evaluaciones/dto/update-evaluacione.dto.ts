import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluacioneDto } from './create-evaluacione.dto';

export class UpdateEvaluacioneDto extends PartialType(CreateEvaluacioneDto) {}
