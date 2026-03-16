import {
  IsNumber,
  IsNotEmpty,
  IsString,
  Min,
  Max,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateLecturaSaludDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  oxigenoSangre: number; // SpO2

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(300)
  frecuenciaCardiaca: number; // BPM

  @IsNumber()
  @IsNotEmpty()
  @Min(20)
  @Max(45)
  temperaturaCorporal: number; // °C

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  humedadAmbiental: number; // %

  @IsOptional()
  @IsNumber()
  presionSistolica?: number;

  @IsOptional()
  @IsNumber()
  presionDiastolica?: number;

  @IsString()
  @IsNotEmpty()
  pacienteId: string; // The ID of the patient wearing the device

  // Optional, if the mobile app wants to send exactly when it was generated (rather than DB insert time)
  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;
}
