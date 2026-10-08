export type Moneda = "PEN" | "USD";

export function formatPrice(precio: number, moneda: Moneda): string {
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(precio);

  if (moneda === "PEN") {
    return `S/ ${formatted}`;
  }
  return `US$ ${formatted}`;
}
