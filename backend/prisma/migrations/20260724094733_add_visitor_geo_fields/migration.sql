-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "timezone" TEXT;
