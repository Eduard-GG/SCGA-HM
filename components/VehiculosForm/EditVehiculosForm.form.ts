import { z } from "zod";

export const editVehiculoFormSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  tipo: z.string(),
  color: z.string(),
  modelo: z.string(),
  placas: z.string().min(1, "Las placas son requeridas"),
  ubicacion: z.string(),
  motor: z.string(),
  serie: z.string().min(1, "La serie es requerida"),
  eco: z.string(),
  contrato: z.string(),
  estatus: z.string(),
  agencia: z.string(),
  proyecto: z.string(),
});

export type EditVehiculoFormValues = z.infer<typeof editVehiculoFormSchema>;
