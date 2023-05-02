-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "kavitaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kavitaHost" TEXT,
ADD COLUMN     "kavitaPassword" TEXT,
ADD COLUMN     "kavitaUser" TEXT,
ADD COLUMN     "kavitaLibraries" TEXT;
