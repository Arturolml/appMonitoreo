import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateEvaluacioneDto {
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @IsString()
  @IsNotEmpty()
  diagnostico: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  indicaciones?: string;

  @IsString()
  @IsOptional()
  medicamentos?: string;

  @IsOptional() @IsInt() puntajeBarthel?: number;
  @IsOptional() @IsInt() puntajeTinetti?: number;
  @IsOptional() @IsInt() puntajeNorton?: number;
  @IsOptional() @IsInt() puntajePfeiffer?: number;
  @IsOptional() @IsInt() nivelDolor?: number;
  @IsOptional() @IsInt() puntajeLawton?: number;
  @IsOptional() @IsInt() puntajeMNA?: number;
  @IsOptional()
  datosEscalas?: any;

  @IsOptional()
  nivelEstres?: number;

  @IsOptional()
  nivelAnsiedad?: number;
}
