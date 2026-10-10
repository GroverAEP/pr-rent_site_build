"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { localFormSchema, LocalFormData } from "../application/local.schemas";
import { createLocalAction, updateLocalAction } from "./actions";
import { Local } from "../domain/local.entity";
import {
  Building2,
  DollarSign,
  MapPin,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  Map,
  Navigation,
} from "lucide-react";

const DISTRITOS_LIMA = [
  "Villa El Salvador",
  "San Juan de Miraflores",
  "Villa María del Triunfo",
  "Lurín",
  "Chorrillos",
  "Santiago de Surco",
  "Miraflores",
  "San Isidro",
  "San Borja",
  "Barranco",
  "La Victoria",
  "Cercado de Lima",
  "Jesús María",
  "Magdalena del Mar",
  "Lince",
  "Pueblo Libre",
  "San Miguel",
  "Surquillo",
  "Ate",
  "Los Olivos",
];

const RUBROS_POPULARES = [
  "Boutique Retail",
  "Restaurante / Café",
  "Farmacia / Salud",
  "Oficina Comercial",
  "Showroom",
  "Calzado y Moda",
  "Tecnología",
  "Belleza / Spa",
  "Minimarket",
  "Almacén y Despacho",
];

interface LocalFormProps {
  initialData?: Local;
  isEditing?: boolean;
}

export function LocalForm({ initialData, isEditing = false }: LocalFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocalFormData>({
    resolver: zodResolver(localFormSchema) as Resolver<LocalFormData>,
    defaultValues: initialData
      ? {
          titulo: initialData.titulo,
          operacion: initialData.operacion,
          precio: initialData.precio,
          moneda: initialData.moneda,
          area_m2: initialData.area_m2,
          direccion: initialData.direccion,
          distrito: initialData.distrito,
          ciudad: initialData.ciudad,
          lat: initialData.lat,
          lng: initialData.lng,
          descripcion: initialData.descripcion,
          portada_url: initialData.portada_url,
          caracteristicas: initialData.caracteristicas,
          rubros_sugeridos: initialData.rubros_sugeridos,
        }
      : {
          titulo: "",
          operacion: "alquiler",
          precio: 3500,
          moneda: "PEN",
          area_m2: 80,
          direccion: "",
          distrito: "Villa El Salvador",
          ciudad: "Lima",
          lat: -12.215,
          lng: -76.938,
          descripcion: "",
          portada_url:
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
          caracteristicas: {
            banos: 1,
            estacionamiento: false,
            vitrina: true,
            aire_acondicionado: false,
            nivel: 1,
            pozo_tierra: true,
            trifasica: false,
          },
          rubros_sugeridos: ["Boutique Retail", "Restaurante / Café"],
        },
  });

  const selectedRubros = watch("rubros_sugeridos") || [];
  const portadaWatch = watch("portada_url");

  const toggleRubro = (rubro: string) => {
    if (selectedRubros.includes(rubro)) {
      setValue(
        "rubros_sugeridos",
        selectedRubros.filter((r) => r !== rubro)
      );
    } else {
      setValue("rubros_sugeridos", [...selectedRubros, rubro]);
    }
  };

  const [skipTour, setSkipTour] = useState(false);

  const onSubmit = async (data: LocalFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (isEditing && initialData) {
        const res = await updateLocalAction(initialData.id, data);
        if (!res.success) {
          setServerError(res.message || "Error al actualizar.");
          setIsSubmitting(false);
          return;
        }
        router.push("/panel");
        router.refresh();
      } else {
        const res = await createLocalAction(data);
        if (!res.success) {
          setServerError(res.message || "Error al crear local.");
          setIsSubmitting(false);
          return;
        }
        if (skipTour) {
          router.push("/panel");
        } else {
          router.push(`/panel/locales/${res.data?.id}/tour`);
        }
        router.refresh();
      }
    } catch {
      setServerError("Error de comunicación con el servidor.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Sección 1: Información Principal */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#0E5A73]" />
          <span>Datos Principales del Inmueble</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Título Comercial del Local
          </label>
          <input
            type="text"
            placeholder="Ej: Local Comercial Puerta a Calle en Av. Larco"
            {...register("titulo")}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
              errors.titulo ? "border-red-400 bg-red-50/30" : "border-slate-200"
            }`}
          />
          {errors.titulo && (
            <p className="text-xs text-red-600 mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Operación
            </label>
            <select
              {...register("operacion")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all"
            >
              <option value="alquiler">Alquiler</option>
              <option value="venta">Venta</option>
              <option value="traspaso">Traspaso</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Moneda
            </label>
            <select
              {...register("moneda")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all"
            >
              <option value="PEN">Soles (PEN S/)</option>
              <option value="USD">Dólares (USD $)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Precio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="any"
                placeholder="4500"
                {...register("precio")}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                  errors.precio ? "border-red-400 bg-red-50/30" : "border-slate-200"
                }`}
              />
            </div>
            {errors.precio && (
              <p className="text-xs text-red-600 mt-1">{errors.precio.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Área Total (m²)
            </label>
            <input
              type="number"
              step="any"
              placeholder="85"
              {...register("area_m2")}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                errors.area_m2 ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
            {errors.area_m2 && (
              <p className="text-xs text-red-600 mt-1">{errors.area_m2.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Distrito
            </label>
            <select
              {...register("distrito")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all"
            >
              {DISTRITOS_LIMA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dirección Comercial
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Av. José Larco 680"
                {...register("direccion")}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                  errors.direccion ? "border-red-400 bg-red-50/30" : "border-slate-200"
                }`}
              />
            </div>
            {errors.direccion && (
              <p className="text-xs text-red-600 mt-1">
                {errors.direccion.message}
              </p>
            )}
          </div>
        </div>

        {/* Coordenadas Google Maps */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Map className="w-4 h-4 text-[#0E5A73]" />
                Ubicación en Google Maps (Coordenadas)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Permite a los interesados ver el negocio en Google Maps y calcular rutas de llegada.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setValue("lat", Number(position.coords.latitude.toFixed(6)));
                      setValue("lng", Number(position.coords.longitude.toFixed(6)));
                    },
                    () => {
                      alert("No se pudo obtener la ubicación actual. Ingrese las coordenadas manualmente o desde Google Maps.");
                    }
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E5A73] bg-[#0E5A73]/10 hover:bg-[#0E5A73]/20 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              Usar mi ubicación actual
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Latitud (ej: -12.2154)
              </label>
              <input
                type="number"
                step="any"
                placeholder="-12.2154"
                {...register("lat")}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Longitud (ej: -76.9381)
              </label>
              <input
                type="number"
                step="any"
                placeholder="-76.9381"
                {...register("lng")}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Tip: Puedes buscar el local en Google Maps, hacer clic derecho sobre la ubicación y copiar las coordenadas.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Descripción Detallada
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              rows={4}
              placeholder="Detalla la zonificación, flujo peatonal, condiciones de garantía y estado actual del local..."
              {...register("descripcion")}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                errors.descripcion ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          </div>
          {errors.descripcion && (
            <p className="text-xs text-red-600 mt-1">
              {errors.descripcion.message}
            </p>
          )}
        </div>
      </div>

      {/* Sección 2: Foto de Portada */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#0E5A73]" />
          <span>Fotografía de Fachada / Portada</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            URL de la Imagen de Portada
          </label>
          <input
            type="url"
            placeholder="https://..."
            {...register("portada_url")}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all"
          />
          {errors.portada_url && (
            <p className="text-xs text-red-600 mt-1">
              {errors.portada_url.message}
            </p>
          )}
        </div>

        {portadaWatch && (
          <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portadaWatch}
              alt="Previsualización de portada"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Sección 3: Características y Servicios */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#0E5A73]" />
          <span>Equipamiento y Servicios del Local</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              {...register("caracteristicas.vitrina")}
              className="w-4 h-4 text-[#0E5A73] rounded focus:ring-[#0E5A73]"
            />
            <span className="text-xs font-medium text-slate-700">Vitrina a la calle</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              {...register("caracteristicas.estacionamiento")}
              className="w-4 h-4 text-[#0E5A73] rounded focus:ring-[#0E5A73]"
            />
            <span className="text-xs font-medium text-slate-700">Estacionamiento</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              {...register("caracteristicas.aire_acondicionado")}
              className="w-4 h-4 text-[#0E5A73] rounded focus:ring-[#0E5A73]"
            />
            <span className="text-xs font-medium text-slate-700">Aire acondicionado</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              {...register("caracteristicas.pozo_tierra")}
              className="w-4 h-4 text-[#0E5A73] rounded focus:ring-[#0E5A73]"
            />
            <span className="text-xs font-medium text-slate-700">Pozo a tierra</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              {...register("caracteristicas.trifasica")}
              className="w-4 h-4 text-[#0E5A73] rounded focus:ring-[#0E5A73]"
            />
            <span className="text-xs font-medium text-slate-700">Energía Trifásica</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Número de Baños (SSHH)
            </label>
            <input
              type="number"
              min={0}
              {...register("caracteristicas.banos")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nivel / Piso
            </label>
            <input
              type="number"
              min={1}
              {...register("caracteristicas.nivel")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Rubros Sugeridos
          </label>
          <div className="flex flex-wrap gap-2">
            {RUBROS_POPULARES.map((rubro) => {
              const active = selectedRubros.includes(rubro);
              return (
                <button
                  type="button"
                  key={rubro}
                  onClick={() => toggleRubro(rubro)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#0E5A73] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {rubro}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer text-center"
        >
          Cancelar
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isEditing && (
            <button
              type="submit"
              onClick={() => setSkipTour(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#0E5A73] text-[#0E5A73] hover:bg-[#0E5A73]/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Omitir Tour 3D</span>
            </button>
          )}

          <button
            type="submit"
            onClick={() => setSkipTour(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Guardar Cambios"
                : "Guardar y Configurar Tour 3D"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
