import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDispositivoDto {
  @IsString()
  @IsNotEmpty()
  dispositivoId: string; // MAC Address or Chip ID

  @IsString()
  @IsNotEmpty()
  modelo: string;
}
