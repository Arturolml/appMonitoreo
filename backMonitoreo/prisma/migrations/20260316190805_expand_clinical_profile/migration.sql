/*
  Warnings:

  - You are about to drop the column `receta` on the `Evaluacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Evaluacion" DROP COLUMN "receta",
ADD COLUMN     "indicaciones" TEXT,
ADD COLUMN     "medicamentos" TEXT;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "miembroAfectado" TEXT,
ADD COLUMN     "tipoOrtesis" TEXT;
