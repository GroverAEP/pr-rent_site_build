import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".glb")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos en formato 3D .glb" },
        { status: 400 }
      );
    }

    // Límite de 50MB para modelos de fotogrametría / GLB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo permitido (50MB)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Asegurar directorio public/uploads/models
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "models");
    await mkdir(uploadsDir, { recursive: true });

    const safeHash = crypto.randomBytes(8).toString("hex");
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}-${safeHash}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/models/${uniqueFileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno al procesar el archivo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
