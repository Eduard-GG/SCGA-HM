import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Theme API not implemented yet" });
}

export async function POST(request: NextRequest) {
  const { theme } = await request.json();
  // Aquí se podría guardar el tema en la base de datos si fuera necesario
  return NextResponse.json({ theme });
}
