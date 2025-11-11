import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(vehiculos);
  } catch (error) {
    console.error("Error fetching vehiculos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("=== INICIANDO POST /api/vehiculos ===");
  try {
    console.log("Recibiendo solicitud POST a /api/vehiculos");
    const body = await request.json();
    console.log("Cuerpo recibido:", body);
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

    // Validar campos requeridos
    if (!marca || !placas || !serie) {
      console.log("Campos requeridos faltantes:", { marca, placas, serie });
      return NextResponse.json(
        { error: "Marca, placas y serie son requeridos" },
        { status: 400 }
      );
    }

    // Verificar unicidad de placas y serie
    console.log("Verificando unicidad de placas:", placas);
    try {
      const existingPlacas = await prisma.vehiculo.findUnique({
        where: { placas },
      });
      console.log("Resultado verificación placas:", existingPlacas);
      if (existingPlacas) {
        console.log("Placas ya existen:", existingPlacas);
        return NextResponse.json(
          { error: "Las placas ya están registradas" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error al verificar placas:", error);
      throw error;
    }

    console.log("Verificando unicidad de serie:", serie);
    try {
      const existingSerie = await prisma.vehiculo.findUnique({
        where: { serie },
      });
      console.log("Resultado verificación serie:", existingSerie);
      if (existingSerie) {
        console.log("Serie ya existe:", existingSerie);
        return NextResponse.json(
          { error: "La serie ya está registrada" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error al verificar serie:", error);
      throw error;
    }

    console.log("Creando vehículo...");
    const dataToCreate = {
      marca,
      tipo: tipo || null,
      color: color || null,
      modelo: modelo || null,
      placas,
      ubicacion: ubicacion || null,
      motor: motor || null,
      serie,
      eco: eco || null,
      contrato: contrato || null,
      estatus: estatus || null,
      agencia: agencia || null,
      proyecto: proyecto || null,
    };
    console.log("Datos para crear:", dataToCreate);

    try {
      const vehiculo = await prisma.vehiculo.create({
        data: dataToCreate,
      });
      console.log("Vehículo creado exitosamente:", vehiculo);
      return NextResponse.json(vehiculo, { status: 201 });
    } catch (createError) {
      console.error("Error al crear vehículo:", createError);
      throw createError;
    }
  } catch (error) {
    console.error("Error completo en POST /api/vehiculos:", error);
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
