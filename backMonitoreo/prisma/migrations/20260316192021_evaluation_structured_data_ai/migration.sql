-- AlterTable
ALTER TABLE "Evaluacion" ADD COLUMN     "datosEscalas" JSONB,
ADD COLUMN     "nivelAnsiedad" DOUBLE PRECISION,
ADD COLUMN     "nivelEstres" DOUBLE PRECISION,
ADD COLUMN     "puntajeBarthel" INTEGER,
ADD COLUMN     "puntajeTinetti" INTEGER;
