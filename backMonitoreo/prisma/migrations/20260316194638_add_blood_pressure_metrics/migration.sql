-- AlterTable
ALTER TABLE "LecturaSalud" ADD COLUMN     "presionDiastolica" DOUBLE PRECISION,
ADD COLUMN     "presionSistolica" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UmbralSalud" ADD COLUMN     "presionDiastolicaMaxima" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
ADD COLUMN     "presionSistolicaMaxima" DOUBLE PRECISION NOT NULL DEFAULT 140.0;
