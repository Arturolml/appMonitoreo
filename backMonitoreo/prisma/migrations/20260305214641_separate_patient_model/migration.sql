/*
  Warnings:

  - You are about to drop the column `propietarioId` on the `Dispositivo` table. All the data in the column will be lost.
  - You are about to drop the column `miMedicoId` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `_EnfermeroAPaciente` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pacienteId` to the `Dispositivo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alerta" DROP CONSTRAINT "Alerta_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Dispositivo" DROP CONSTRAINT "Dispositivo_propietarioId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluacion" DROP CONSTRAINT "Evaluacion_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "LecturaSalud" DROP CONSTRAINT "LecturaSalud_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "UmbralSalud" DROP CONSTRAINT "UmbralSalud_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_miMedicoId_fkey";

-- DropForeignKey
ALTER TABLE "_EnfermeroAPaciente" DROP CONSTRAINT "_EnfermeroAPaciente_A_fkey";

-- DropForeignKey
ALTER TABLE "_EnfermeroAPaciente" DROP CONSTRAINT "_EnfermeroAPaciente_B_fkey";

-- AlterTable
ALTER TABLE "Dispositivo" DROP COLUMN "propietarioId",
ADD COLUMN     "pacienteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "miMedicoId";

-- DropTable
DROP TABLE "_EnfermeroAPaciente";

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "miMedicoId" TEXT,
    "tipoSanguineo" TEXT,
    "alergias" TEXT,
    "antecedentes" TEXT,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- CreateIndex
CREATE INDEX "Paciente_miMedicoId_idx" ON "Paciente"("miMedicoId");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_miMedicoId_fkey" FOREIGN KEY ("miMedicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaSalud" ADD CONSTRAINT "LecturaSalud_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UmbralSalud" ADD CONSTRAINT "UmbralSalud_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
