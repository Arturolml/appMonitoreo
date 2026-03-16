import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

enum EstadoAlerta {
  PENDIENTE = 'PENDIENTE',
  REVISADA = 'REVISADA',
  RESUELTA = 'RESUELTA',
}

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  lecturaId: bigint; // Relates strictly to the telemetry triggering it

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
