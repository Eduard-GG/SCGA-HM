-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "tipo" TEXT,
    "color" TEXT,
    "modelo" TEXT,
    "placas" TEXT NOT NULL,
    "ubicacion" TEXT,
    "motor" TEXT,
    "serie" TEXT NOT NULL,
    "eco" TEXT,
    "contrato" TEXT,
    "estatus" TEXT,
    "agencia" TEXT,
    "proyecto" TEXT,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "folio" TEXT,
    "fecha" TIMESTAMP(3),
    "rz" TEXT,
    "banco" TEXT,
    "tdc" TEXT,
    "proveedor" TEXT,
    "concepto" TEXT,
    "referencia" TEXT,
    "documento" TEXT,
    "proyecto" TEXT,
    "placa" TEXT,
    "responsable" TEXT,
    "transferencia" TEXT,
    "tipoGasto" TEXT,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoExterno" (
    "id" SERIAL NOT NULL,
    "folio" TEXT,
    "fecha" TIMESTAMP(3),
    "rz" TEXT,
    "banco" TEXT,
    "tdc" TEXT,
    "proveedor" TEXT,
    "concepto" TEXT,
    "referencia" TEXT,
    "documento" TEXT,
    "responsable" TEXT,
    "transferencia" TEXT,
    "tipoGasto" TEXT,

    CONSTRAINT "GastoExterno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placas_key" ON "Vehiculo"("placas");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_serie_key" ON "Vehiculo"("serie");

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_placa_fkey" FOREIGN KEY ("placa") REFERENCES "Vehiculo"("placas") ON DELETE SET NULL ON UPDATE CASCADE;
