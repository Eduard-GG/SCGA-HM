import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de gasto inválido" },
        { status: 400 }
      );
    }

    const gasto = await prisma.gasto.findUnique({
      where: { id },
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            placas: true,
            color: true,
            tipo: true,
          },
        },
      },
    });

    if (!gasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(gasto);
  } catch (error) {
    console.error("Error fetching gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== INICIANDO PUT /api/gastos/[id] ===");
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de gasto inválido" },
        { status: 400 }
      );
    }

    console.log("Recibiendo solicitud PUT para gasto ID:", id);
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

    // Verificar que el gasto existe
    const existingGasto = await prisma.gasto.findUnique({
      where: { id },
    });

    if (!existingGasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
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

    console.log("Actualizando gasto...");
    const dataToUpdate = {
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

    const gasto = await prisma.gasto.update({
      where: { id },
      data: dataToUpdate,
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

    console.log("Gasto actualizado exitosamente:", gasto);
    return NextResponse.json(gasto);
  } catch (error) {
    console.error("Error completo en PUT /api/gastos/[id]:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== INICIANDO DELETE /api/gastos/[id] ===");
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de gasto inválido" },
        { status: 400 }
      );
    }

    console.log("Eliminando gasto ID:", id);

    // Verificar que el gasto existe
    const existingGasto = await prisma.gasto.findUnique({
      where: { id },
    });

    if (!existingGasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    await prisma.gasto.delete({
      where: { id },
    });

    console.log("Gasto eliminado exitosamente");
    return NextResponse.json({ message: "Gasto eliminado correctamente" });
  } catch (error) {
    console.error("Error completo en DELETE /api/gastos/[id]:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
