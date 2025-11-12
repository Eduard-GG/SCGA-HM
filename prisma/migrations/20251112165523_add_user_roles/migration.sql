/*
  Warnings:

  - Made the column `rol` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET NOT NULL,
ALTER COLUMN "rol" SET DEFAULT 'user';
