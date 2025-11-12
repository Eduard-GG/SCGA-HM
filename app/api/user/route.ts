import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de la cookie
    const token = request.cookies.get("auth-token")?.value;

    console.log("Token recibido:", token ? "Sí" : "No");
    console.log("Cookies disponibles:", request.cookies.getAll());

    if (!token) {
      return NextResponse.json({ error: "No autorizado - Token no encontrado" }, { status: 401 });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Obtener información del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        canViewGastos: true,
        canViewGastosExternos: true,
        canViewVehiculos: true,
        canViewUsuarios: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
