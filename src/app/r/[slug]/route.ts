import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getRepositories } from "@/shared/db/factory";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { phoneToWhatsAppNumber } from "@/shared/lib/phone";
import { formatPrice } from "@/shared/lib/currency";
import { randomSuffix } from "@/shared/lib/slug";
import { LeadOrigin } from "@/modules/leads";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.redirect(new URL("/locales", request.url), 307);
  }

  // 1. Detección y Rate Limiting por IP para evitar spam o click-bombing
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const rateLimitKey = `lead:${clientIp}:${slug}`;
  const rateLimit = checkRateLimit(rateLimitKey, 15, 60);

  if (!rateLimit.allowed) {
    return new NextResponse(
      "Has realizado demasiadas solicitudes en poco tiempo. Por favor intenta nuevamente en unos segundos.",
      { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
    );
  }

  // 2. Consulta en Repositorio
  const repos = getRepositories();
  const local = await repos.locales.findBySlug(slug);

  if (!local) {
    return NextResponse.redirect(new URL("/locales?error=no-encontrado", request.url), 307);
  }

  // 3. Verificación de Moderación (Solo locales publicados de dueños activos)
  if (local.estado !== "publicado") {
    return NextResponse.redirect(new URL(`/locales?error=no-disponible`, request.url), 307);
  }

  const owner = await repos.users.findById(local.owner_id);
  if (!owner || owner.estado !== "activo") {
    return NextResponse.redirect(new URL(`/locales?error=propietario-inactivo`, request.url), 307);
  }

  // 4. Parámetro de origen
  const originParam = request.nextUrl.searchParams.get("origin");
  const validOrigins: LeadOrigin[] = ["detalle", "tour3d", "listado"];
  const origen: LeadOrigin = validOrigins.includes(originParam as LeadOrigin)
    ? (originParam as LeadOrigin)
    : "detalle";

  // 5. Hashing anónimo para métricas (Privacidad RGPD/LPDP)
  const salt = process.env.LEAD_SALT || "localvista_salt_2026";
  const ipHash = createHash("sha256").update(clientIp + salt).digest("hex").slice(0, 32);
  const userAgentHash = createHash("sha256").update(userAgent + salt).digest("hex").slice(0, 32);

  // 6. Registro del Lead anónimo
  try {
    const leadId = `lead-${Date.now()}-${randomSuffix(4)}`;
    await repos.leads.create({
      id: leadId,
      local_id: local.id,
      origen,
      user_agent_hash: userAgentHash,
      ip_hash: ipHash,
    });
  } catch (err) {
    // Si falla el log de métricas, no bloqueamos la redirección comercial
    console.error("Error al registrar lead en /r/[slug]:", err);
  }

  // 7. Generación de mensaje y redirección segura a WhatsApp
  // El número de teléfono NUNCA se expone en el cliente ni en el HTML; solo se resuelve aquí.
  const whatsappNumber = phoneToWhatsAppNumber(owner.telefono_whatsapp);
  const priceFormatted = formatPrice(local.precio, local.moneda);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const localUrl = `${siteUrl}/locales/${local.slug}`;

  const messageText = [
    `Hola, vi tu local "${local.titulo}" en RentLocal (${priceFormatted} en ${local.distrito}).`,
    `Quisiera más información y agendar una visita:`,
    localUrl,
  ].join("\n");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return NextResponse.redirect(whatsappUrl, 307);
}
