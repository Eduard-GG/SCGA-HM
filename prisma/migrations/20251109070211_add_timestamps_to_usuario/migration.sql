/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `tema` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gasto" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "avatar",
DROP COLUMN "tema";
