"use client";

import { useState } from "react";
import { TourEditor, TourConfig } from "@/modules/viewer3d";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface TourEditorClientProps {
  initialConfig: TourConfig;
  rubros: string[];
  onSaveAction: (config: TourConfig) => Promise<{ success: boolean; message?: string }>;
}

export function TourEditorClient({
  initialConfig,
  rubros,
  onSaveAction,
}: TourEditorClientProps) {
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSave = async (config: TourConfig) => {
    setStatus(null);
    try {
      const res = await onSaveAction(config);
      if (res.success) {
        setStatus({
          type: "success",
          message: "¡Recorrido 3D guardado y actualizado con éxito!",
        });
      } else {
        setStatus({
          type: "error",
          message: res.message || "Error al guardar el recorrido 3D.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Error de conexión al guardar.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {status && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <TourEditor
        initialConfig={initialConfig}
        rubros={rubros}
        onSave={handleSave}
      />
    </div>
  );
}
