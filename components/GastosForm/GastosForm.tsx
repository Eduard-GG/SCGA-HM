"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { gastoFormSchema } from "./GastosForm.form";
import { useState, useEffect, useCallback, useMemo } from "react";

interface Vehiculo {
  id: number;
  marca: string | null;
  modelo: string | null;
  placas: string;
  proyecto: string | null;
}

interface Gasto {
  id: number;
  folio?: string | null;
  fecha?: Date | null;
  rz?: string | null;
  banco?: string | null;
  tdc?: string | null;
  proveedor?: string | null;
  concepto: string;
  referencia?: string | null;
  documento?: string | null;
  proyecto?: string | null;
  placa: string;
  responsable?: string | null;
  transferencia?: string | null;
  tipoGasto?: string | null;
}

type GastosFormProps = {
  onSuccess: () => void;
  gasto?: Gasto; // Para edición
};

const GastosForm = ({ onSuccess, gasto }: GastosFormProps) => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [isResponsableFilled, setIsResponsableFilled] = useState(false);

  const form = useForm<z.infer<typeof gastoFormSchema>>({
    resolver: zodResolver(gastoFormSchema),
    defaultValues: {
      folio: gasto?.folio || "",
      fecha: gasto?.fecha ? new Date(gasto.fecha).toISOString().split('T')[0] : "",
      rz: gasto?.rz || "",
      banco: gasto?.banco || "",
      tdc: gasto?.tdc || "",
      proveedor: gasto?.proveedor || "",
      concepto: gasto?.concepto || "",
      referencia: gasto?.referencia || "",
      documento: gasto?.documento || "",
      proyecto: gasto?.proyecto || "",
      placa: gasto?.placa || "",
      responsable: gasto?.responsable || "",
      transferencia: gasto?.transferencia || "",
      tipoGasto: gasto?.tipoGasto || "",
    },
  });

  const watchedPlaca = form.watch("placa");

  const updateProyecto = useCallback(() => {
    if (watchedPlaca) {
      const veh = vehiculos.find(v => v.placas === watchedPlaca);
      if (veh && veh.proyecto) {
        form.setValue("proyecto", veh.proyecto);
      }
    }
  }, [watchedPlaca, vehiculos, form]);

  useEffect(() => {
    updateProyecto();
  }, [updateProyecto]);

  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter(v => v.placas && v.placas.trim());
  }, [vehiculos]);

  // Cargar vehículos para el dropdown
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await axios.get('/api/vehiculos');
        setVehiculos(response.data);
      } catch (error) {
        console.error('Error fetching vehiculos:', error);
        toast.error('Error al cargar la lista de vehículos');
      } finally {
        setLoadingVehiculos(false);
      }
    };

    fetchVehiculos();
  }, []);

  // Cargar información del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/user');
        // Establecer el responsable automáticamente si no hay uno definido y no es edición
        if (!gasto && response.data.nombreCompleto) {
          form.setValue("responsable", response.data.nombreCompleto);
          setIsResponsableFilled(true);
        } else if (gasto && gasto.responsable) {
          // Si es edición y ya tiene responsable, deshabilitar el campo
          setIsResponsableFilled(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Usuario no autenticado - permitir edición manual
          console.log('Usuario no autenticado - campo responsable editable manualmente');
          setIsResponsableFilled(false);
        } else {
          console.error('Error fetching current user:', error);
        }
      }
    };

    fetchCurrentUser();
  }, [form, gasto]);

  const onSubmit = useCallback(async (values: z.infer<typeof gastoFormSchema>) => {
    try {
      const payload = {
        ...values,
        fecha: values.fecha ? new Date(values.fecha).toISOString() : null,
      };

      if (gasto) {
        // Editar gasto existente
        await axios.put(`/api/gastos/${gasto.id}`, payload);
        toast.success("Gasto actualizado correctamente!");
      } else {
        // Crear nuevo gasto
        await axios.post("/api/gastos", payload);
        toast.success("Gasto registrado correctamente!");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error al procesar el gasto";
        toast.error(errorMessage);
      } else {
        toast.error("Error inesperado al procesar el gasto");
      }
    }
  }, [gasto, form, onSuccess]);

  return (
    <div className="max-h-[80vh] overflow-y-auto px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Folio */}
          <FormField
            control={form.control}
            name="folio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Folio</FormLabel>
                <FormControl>
                  <Input placeholder="Folio..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha */}
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RZ */}
          <FormField
            control={form.control}
            name="rz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input placeholder="Razón Social..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Banco */}
          <FormField
            control={form.control}
            name="banco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <FormControl>
                  <Input placeholder="Banco..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TDC */}
          <FormField
            control={form.control}
            name="tdc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TDC</FormLabel>
                <FormControl>
                  <Input placeholder="TDC..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proveedor */}
          <FormField
            control={form.control}
            name="proveedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Proveedor..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Concepto */}
          <FormField
            control={form.control}
            name="concepto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concepto</FormLabel>
                <FormControl>
                  <Input placeholder="Concepto..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referencia */}
          <FormField
            control={form.control}
            name="referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input placeholder="Referencia..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Documento */}
          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Documento..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Placa (Vehículo) */}
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo (Placas)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingVehiculos}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingVehiculos ? "Cargando vehículos..." : "Selecciona un vehículo"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredVehiculos.map((vehiculo) => (
                      <SelectItem key={vehiculo.id} value={vehiculo.placas}>
                        {vehiculo.placas} - {vehiculo.marca} {vehiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proyecto */}
          <FormField
            control={form.control}
            name="proyecto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proyecto</FormLabel>
                <FormControl>
                  <Input placeholder="Proyecto..." className="max-w-sm" {...field} disabled={!!field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Responsable */}
          <FormField
            control={form.control}
            name="responsable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <FormControl>
                  <Input placeholder="Responsable..." className="max-w-sm" {...field} disabled={isResponsableFilled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transferencia */}
          <FormField
            control={form.control}
            name="transferencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Gasto */}
          <FormField
            control={form.control}
            name="tipoGasto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Gasto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de gasto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="combustible">Combustible</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="seguros">Seguros</SelectItem>
                    <SelectItem value="multas">Multas</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 cursor-pointer w-full">
            {gasto ? "Actualizar Gasto" : "Registrar Gasto"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default GastosForm;