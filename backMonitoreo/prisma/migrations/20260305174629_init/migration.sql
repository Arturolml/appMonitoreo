-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MEDICO', 'ENFERMERO', 'PACIENTE');

-- CreateEnum
CREATE TYPE "EstadoAlerta" AS ENUM ('PENDIENTE', 'REVISADA', 'RESUELTA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "curp" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'PACIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "miMedicoId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT 'ESP32-Ortesis-V1',
    "ubicacion" TEXT,
    "nivelBateria" INTEGER,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaSincronizacion" TIMESTAMP(3) NOT NULL,
    "propietarioId" TEXT NOT NULL,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturaSalud" (
    "id" BIGSERIAL NOT NULL,
    "oxigenoSangre" DOUBLE PRECISION NOT NULL,
    "frecuenciaCardiaca" INTEGER NOT NULL,
    "temperaturaCorporal" DOUBLE PRECISION NOT NULL,
    "humedadAmbiental" DOUBLE PRECISION NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esAnomalia" BOOLEAN NOT NULL DEFAULT false,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "LecturaSalud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UmbralSalud" (
    "id" TEXT NOT NULL,
    "oxigenoMinimo" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
    "frecuenciaCardiacaMaxima" INTEGER NOT NULL DEFAULT 100,
    "frecuenciaCardiacaMinima" INTEGER NOT NULL DEFAULT 50,
    "temperaturaCorporalMaxima" DOUBLE PRECISION NOT NULL DEFAULT 37.8,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "UmbralSalud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoAlerta" NOT NULL DEFAULT 'PENDIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "resueltaPor" TEXT,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "observaciones" TEXT,
    "receta" TEXT,
    "pacienteId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "nombreEvaluador" TEXT NOT NULL,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EnfermeroAPaciente" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EnfermeroAPaciente_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_curp_key" ON "Usuario"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_dispositivoId_key" ON "Dispositivo"("dispositivoId");

-- CreateIndex
CREATE INDEX "LecturaSalud_pacienteId_fechaRegistro_idx" ON "LecturaSalud"("pacienteId", "fechaRegistro" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UmbralSalud_pacienteId_key" ON "UmbralSalud"("pacienteId");

-- CreateIndex
CREATE INDEX "_EnfermeroAPaciente_B_index" ON "_EnfermeroAPaciente"("B");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_miMedicoId_fkey" FOREIGN KEY ("miMedicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaSalud" ADD CONSTRAINT "LecturaSalud_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UmbralSalud" ADD CONSTRAINT "UmbralSalud_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnfermeroAPaciente" ADD CONSTRAINT "_EnfermeroAPaciente_A_fkey" FOREIGN KEY ("A") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnfermeroAPaciente" ADD CONSTRAINT "_EnfermeroAPaciente_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
