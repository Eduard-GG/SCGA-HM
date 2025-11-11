import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehiculoId = searchParams.get("vehiculoId");

    let gastos;

    if (vehiculoId) {
      // Obtener gastos de un vehículo específico
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { id: parseInt(vehiculoId) },
        include: { gastos: true },
      });

      if (!vehiculo) {
        return NextResponse.json(
          { error: "Vehículo no encontrado" },
          { status: 404 }
        );
      }

      gastos = vehiculo.gastos;
    } else {
      // Obtener todos los gastos con información del vehículo
      gastos = await prisma.gasto.findMany({
        include: {
          vehiculo: {
            select: {
              id: true,
              marca: true,
              modelo: true,
              placas: true,
            },
          },
        },
        orderBy: { fecha: "desc" },
      });
    }

    return NextResponse.json(gastos);
  } catch (error) {
    console.error("Error fetching gastos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("=== INICIANDO POST /api/gastos ===");
  try {
    const body = await request.json();
    console.log("Cuerpo recibido:", body);

    const {
      folio,
      fecha,
      rz,
      banco,
      tdc,
      proveedor,
      concepto,
      referencia,
      documento,
      proyecto,
      placa,
      responsable,
      transferencia,
      tipoGasto,
    } = body;

    // Validar campos requeridos
    if (!concepto || !placa) {
      console.log("Campos requeridos faltantes:", { concepto, placa });
      return NextResponse.json(
        { error: "Concepto y placa son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el vehículo existe
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placas: placa },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    console.log("Creando gasto...");
    const dataToCreate = {
      folio: folio || null,
      fecha: fecha ? new Date(fecha) : null,
      rz: rz || null,
      banco: banco || null,
      tdc: tdc || null,
      proveedor: proveedor || null,
      concepto,
      referencia: referencia || null,
      documento: documento || null,
      proyecto: proyecto || null,
      placa,
      responsable: responsable || null,
      transferencia: transferencia || null,
      tipoGasto: tipoGasto || null,
    };
    console.log("Datos para crear:", dataToCreate);

    const gasto = await prisma.gasto.create({
      data: dataToCreate,
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            placas: true,
          },
        },
      },
    });

    console.log("Gasto creado exitosamente:", gasto);
    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    console.error("Error completo en POST /api/gastos:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
