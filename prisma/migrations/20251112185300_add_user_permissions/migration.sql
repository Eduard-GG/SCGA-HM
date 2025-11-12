-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "canViewGastos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canViewGastosExternos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canViewUsuarios" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canViewVehiculos" BOOLEAN NOT NULL DEFAULT true;
