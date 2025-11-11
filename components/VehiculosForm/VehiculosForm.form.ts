import { z } from "zod";

export const vehiculoFormSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  tipo: z.string().optional(),
  color: z.string().optional(),
  modelo: z.string().optional(),
  placas: z.string().min(1, "Las placas son requeridas"),
  ubicacion: z.string().optional(),
  motor: z.string().optional(),
  serie: z.string().min(1, "La serie es requerida"),
  eco: z.string().optional(),
  contrato: z.string().optional(),
  estatus: z.string().optional(),
  agencia: z.string().optional(),
  proyecto: z.string().optional(),
});

export type VehiculoFormValues = z.infer<typeof vehiculoFormSchema>;
