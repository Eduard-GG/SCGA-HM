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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const { nombreCompleto, email, password, rol, canViewGastos, canViewGastosExternos, canViewVehiculos, canViewUsuarios } = await request.json();

    const updateData: Partial<{ nombreCompleto: string; email: string; password?: string; rol: string; canViewGastos: boolean; canViewGastosExternos: boolean; canViewVehiculos: boolean; canViewUsuarios: boolean; }> = {
      nombreCompleto,
      email,
      rol,
      canViewGastos,
      canViewGastosExternos,
      canViewVehiculos,
      canViewUsuarios,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // No permitir eliminar al propio usuario
    if (currentUser.id === userId) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
    }

    await prisma.usuario.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}