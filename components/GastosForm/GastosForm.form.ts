import { z } from "zod";

export const gastoFormSchema = z.object({
  folio: z.string().optional(),
  fecha: z.string().optional(),
  rz: z.string().optional(),
  banco: z.string().optional(),
  tdc: z.string().optional(),
  proveedor: z.string().optional(),
  concepto: z.string().min(1, "El concepto es requerido"),
  referencia: z.string().optional(),
  documento: z.string().optional(),
  proyecto: z.string().optional(),
  placa: z.string().min(1, "La placa del vehículo es requerida"),
  responsable: z.string().optional(),
  transferencia: z.string().optional(),
  tipoGasto: z.string().optional(),
});

export type GastoFormValues = z.infer<typeof gastoFormSchema>;