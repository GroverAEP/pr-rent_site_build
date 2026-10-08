"use client";
/**
 * Wrapper del visor 3D con:
 * - Carga dinámica (next/dynamic + ssr:false) de Viewer3DCanvas
 * - Detección de soporte WebGL
 * - Fallback a galería de fotos si no hay WebGL o falla la carga
 * - Skeleton de carga
 * - Botón "Entrar al local" como punto de entrada
 */

import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { TourConfig } from "../domain/tour.types";

// Carga dinámica sin SSR (Three.js no funciona en servidor)
const Viewer3DCanvas = dynamic(() => import("./Viewer3DCanvas"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

// ─── Props ────────────────────────────────────────────────────────────────────
export interface TourViewerProps {
  tourConfig: TourConfig;
  glbUrl?: string;
  photos: string[];   // URLs de fotos para el fallback
  titulo: string;
}

// ─── WebGL detection ──────────────────────────────────────────────────────────
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TourViewer({ tourConfig, glbUrl, photos, titulo }: TourViewerProps) {
  const [state, setState] = useState<"idle" | "loading" | "active" | "fallback">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const hasCheckedWebGL = useRef(false);

  const handleEnter = useCallback(() => {
    // Chequeamos WebGL en el momento que el usuario hace clic (no antes)
    if (!hasCheckedWebGL.current) {
      hasCheckedWebGL.current = true;
      if (!checkWebGL()) {
        setError("Tu dispositivo no soporta WebGL. Mostrando la galería de fotos.");
        setState("fallback");
        return;
      }
    }
    setState("loading");
    // Timeout de seguridad: si Three.js falla silenciosamente, activar fallback
    const timeout = setTimeout(() => {
      setState(prev => prev === "loading" ? "fallback" : prev);
    }, 12000);
    return () => clearTimeout(timeout);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setState("active");
  }, []);

  const handleError = useCallback(() => {
    setError("Error al cargar el visor 3D.");
    setState("fallback");
  }, []);

  // ─── Estado: idle (botón de entrada) ─────────────────────────────────────
  if (state === "idle") {
    return (
      <div
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group cursor-pointer"
        onClick={handleEnter}
      >
        {/* Thumbnail del local */}
        {photos[0] && (
          <Image
            src={photos[0]}
            alt={titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 800px"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Botón central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
              <span className="text-3xl">🏠</span>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg drop-shadow-lg">Entrar al local</p>
              <p className="text-white/70 text-xs">Recorrido 3D interactivo</p>
            </div>
          </div>
        </div>

        {/* Badge 3D */}
        <div className="absolute top-4 right-4 bg-[#0E5A73] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <span className="text-base">🥽</span>
          Tour 3D
        </div>
      </div>
    );
  }

  // ─── Estado: fallback (galería de fotos) ─────────────────────────────────
  if (state === "fallback") {
    return (
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
        {photos.length > 0 ? (
          <>
            <Image
              src={photos[fallbackIndex]}
              alt={`${titulo} - foto ${fallbackIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 65vw"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                <button
                  className="w-8 h-8 rounded-full bg-black/50 text-white text-lg flex items-center justify-center hover:bg-black/70"
                  onClick={() => setFallbackIndex(i => (i - 1 + photos.length) % photos.length)}
                >‹</button>
                <span className="text-white/80 text-xs bg-black/40 px-2 py-1 rounded">
                  {fallbackIndex + 1} / {photos.length}
                </span>
                <button
                  className="w-8 h-8 rounded-full bg-black/50 text-white text-lg flex items-center justify-center hover:bg-black/70"
                  onClick={() => setFallbackIndex(i => (i + 1) % photos.length)}
                >›</button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Sin fotos disponibles
          </div>
        )}

        {error && (
          <div className="absolute top-3 left-3 right-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Visor 3D no disponible</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleEnter}
            className="text-xs bg-white/80 hover:bg-white text-slate-700 px-3 py-1.5 rounded-lg shadow transition-colors"
          >
            🔄 Reintentar 3D
          </button>
        </div>
      </div>
    );
  }

  // ─── Estado: loading o active (visor 3D) ─────────────────────────────────
  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900">
      {(state === "loading") && <ViewerSkeleton />}
      <div className={`absolute inset-0 transition-opacity duration-500 ${state === "active" ? "opacity-100" : "opacity-0"}`}>
        <Viewer3DCanvas
          tourConfig={tourConfig}
          glbUrl={glbUrl}
          onLoadComplete={handleLoadComplete}
          onError={handleError}
        />
      </div>
      {/* Botón de salir del tour */}
      {state === "active" && (
        <button
          className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-black/80 transition-colors z-20"
          onClick={() => setState("idle")}
        >
          ← Salir del tour
        </button>
      )}
    </div>
  );
}

// ─── Skeleton de carga ────────────────────────────────────────────────────────
function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
      {/* Animación de carga */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0E5A73] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white/80 font-medium text-sm">Cargando recorrido 3D…</p>
        <p className="text-white/40 text-xs mt-1">Generando el local en 3D</p>
      </div>
      {/* Barra de progreso animada */}
      <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-[#0E5A73] rounded-full animate-progress" />
      </div>
    </div>
  );
}
