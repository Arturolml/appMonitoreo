import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Prisma's Enums mapping
enum Rol {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  ENFERMERO = 'ENFERMERO',
  PACIENTE = 'PACIENTE',
}

export class CreateUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  passwordHash: string; // Recieved plain via API, hashed via Service before Prisma

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellidoPaterno: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  curp?: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @IsOptional()
  @IsString()
  miMedicoId?: string;

  // Additional Clinical Fields for PACIENTE
  @IsOptional()
  @IsString()
  fechaNacimiento?: string; // We'll receive ISO string

  @IsOptional()
  @IsString()
  tipoOrtesis?: string;

  @IsOptional()
  @IsString()
  miembroAfectado?: string;

  @IsOptional()
  @IsString()
  tipoSanguineo?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  antecedentes?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
