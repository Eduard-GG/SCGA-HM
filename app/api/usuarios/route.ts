import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: { id: true, rol: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        canViewGastos: true,
        canViewGastosExternos: true,
        canViewVehiculos: true,
        canViewUsuarios: true,
        createdAt: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { nombreCompleto, email, password, rol, canViewGastos, canViewGastosExternos, canViewVehiculos, canViewUsuarios } = await request.json();

    if (!nombreCompleto || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombreCompleto,
        email,
        password: hashedPassword,
        rol: rol || "user",
        canViewGastos: canViewGastos ?? true,
        canViewGastosExternos: canViewGastosExternos ?? true,
        canViewVehiculos: canViewVehiculos ?? true,
        canViewUsuarios: canViewUsuarios ?? false,
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        canViewGastos: true,
        canViewGastosExternos: true,
        canViewVehiculos: true,
        canViewUsuarios: true,
        createdAt: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Error creando usuario:", error);
    interface PrismaError {
      code?: string;
      [key: string]: unknown;
    }
    const prismaError = error as PrismaError;
    if (typeof error === "object" && error !== null && "code" in error && prismaError.code === "P2002") {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}