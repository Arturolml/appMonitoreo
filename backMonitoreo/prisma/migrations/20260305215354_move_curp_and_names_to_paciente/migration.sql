/*
  Warnings:

  - You are about to drop the column `curp` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[curp]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidoPaterno` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Usuario_curp_key";

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "apellidoMaterno" TEXT,
ADD COLUMN     "apellidoPaterno" TEXT NOT NULL,
ADD COLUMN     "curp" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "curp";

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_curp_key" ON "Paciente"("curp");
