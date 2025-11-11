import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== INICIANDO PUT /api/vehiculos/[id] ===");
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de vehículo inválido" },
        { status: 400 }
      );
    }

    console.log("Recibiendo solicitud PUT para vehículo ID:", id);
    const body = await request.json();
    console.log("Cuerpo recibido:", body);
    console.log("Tipo de datos en body:", typeof body);
    console.log("Keys del body:", Object.keys(body));

    const {
      marca,
      tipo,
      color,
      modelo,
      placas,
      ubicacion,
      motor,
      serie,
      eco,
      contrato,
      estatus,
      agencia,
      proyecto,
    } = body;

    console.log("Campos extraídos:");
    console.log("marca:", marca, "tipo:", typeof marca);
    console.log("placas:", placas, "tipo:", typeof placas);
    console.log("serie:", serie, "tipo:", typeof serie);

    // Convertir strings vacías a null para campos opcionales
    const cleanData = {
      marca: marca?.trim() || null,
      tipo: tipo?.trim() || null,
      color: color?.trim() || null,
      modelo: modelo?.trim() || null,
      placas: placas?.trim() || null,
      ubicacion: ubicacion?.trim() || null,
      motor: motor?.trim() || null,
      serie: serie?.trim() || null,
      eco: eco?.trim() || null,
      contrato: contrato?.trim() || null,
      estatus: estatus?.trim() || null,
      agencia: agencia?.trim() || null,
      proyecto: proyecto?.trim() || null,
    };

    console.log("Datos limpios:", cleanData);

    // Extraer valores limpios
    const {
      marca: cleanMarca,
      tipo: cleanTipo,
      color: cleanColor,
      modelo: cleanModelo,
      placas: cleanPlacas,
      ubicacion: cleanUbicacion,
      motor: cleanMotor,
      serie: cleanSerie,
      eco: cleanEco,
      contrato: cleanContrato,
      estatus: cleanEstatus,
      agencia: cleanAgencia,
      proyecto: cleanProyecto,
    } = cleanData;

    // Validar campos requeridos
    if (!cleanMarca || !cleanPlacas || !cleanSerie) {
      console.log("Campos requeridos faltantes:", {
        cleanMarca,
        cleanPlacas,
        cleanSerie,
      });
      return NextResponse.json(
        { error: "Marca, placas y serie son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el vehículo existe
    const existingVehiculo = await prisma.vehiculo.findUnique({
      where: { id },
    });

    if (!existingVehiculo) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar unicidad de placas (excluyendo el vehículo actual)
    if (cleanPlacas !== existingVehiculo.placas) {
      console.log("Verificando unicidad de placas:", cleanPlacas);
      const existingPlacas = await prisma.vehiculo.findUnique({
        where: { placas: cleanPlacas },
      });
      if (existingPlacas) {
        console.log("Placas ya existen:", existingPlacas);
        return NextResponse.json(
          { error: "Las placas ya están registradas" },
          { status: 400 }
        );
      }
    }

    // Verificar unicidad de serie (excluyendo el vehículo actual)
    if (cleanSerie !== existingVehiculo.serie) {
      console.log("Verificando unicidad de serie:", cleanSerie);
      const existingSerie = await prisma.vehiculo.findUnique({
        where: { serie: cleanSerie },
      });
      if (existingSerie) {
        console.log("Serie ya existe:", existingSerie);
        return NextResponse.json(
          { error: "La serie ya está registrada" },
          { status: 400 }
        );
      }
    }

    console.log("Actualizando vehículo...");
    const dataToUpdate = {
      marca: cleanMarca,
      tipo: cleanTipo,
      color: cleanColor,
      modelo: cleanModelo,
      placas: cleanPlacas,
      ubicacion: cleanUbicacion,
      motor: cleanMotor,
      serie: cleanSerie,
      eco: cleanEco,
      contrato: cleanContrato,
      estatus: cleanEstatus,
      agencia: cleanAgencia,
      proyecto: cleanProyecto,
    };
    console.log("Datos para actualizar:", dataToUpdate);
    console.log("Tipos de datos:");
    Object.entries(dataToUpdate).forEach(([key, value]) => {
      console.log(`${key}: ${value} (tipo: ${typeof value})`);
    });

    try {
      const vehiculo = await prisma.vehiculo.update({
        where: { id },
        data: dataToUpdate,
      });
      console.log("Vehículo actualizado exitosamente:", vehiculo);
      return NextResponse.json(vehiculo);
    } catch (updateError) {
      console.error("Error al actualizar vehículo:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error completo en PUT /api/vehiculos/[id]:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack"
    );
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
  console.log("=== INICIANDO DELETE /api/vehiculos/[id] ===");
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de vehículo inválido" },
        { status: 400 }
      );
    }

    console.log("Eliminando vehículo ID:", id);

    // Verificar que el vehículo existe
    const existingVehiculo = await prisma.vehiculo.findUnique({
      where: { id },
    });

    if (!existingVehiculo) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    try {
      await prisma.vehiculo.delete({
        where: { id },
      });
      console.log("Vehículo eliminado exitosamente");
      return NextResponse.json({ message: "Vehículo eliminado correctamente" });
    } catch (deleteError) {
      console.error("Error al eliminar vehículo:", deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error("Error completo en DELETE /api/vehiculos/[id]:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
