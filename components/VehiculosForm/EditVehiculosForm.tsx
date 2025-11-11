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
import { editVehiculoFormSchema } from "./EditVehiculosForm.form";

interface Vehiculo {
  id: number;
  marca: string | null;
  tipo: string | null;
  modelo: string | null;
  color: string | null;
  placas: string;
  ubicacion: string | null;
  motor: string | null;
  serie: string;
  eco: string | null;
  contrato: string | null;
  estatus: string | null;
  agencia: string | null;
  proyecto: string | null;
}

type EditVehiculosFormProps = {
  vehiculo: Vehiculo;
  onSuccess: () => void;
};

const EditVehiculosForm = ({ vehiculo, onSuccess }: EditVehiculosFormProps) => {
  const form = useForm<z.infer<typeof editVehiculoFormSchema>>({
    resolver: zodResolver(editVehiculoFormSchema),
    defaultValues: {
      marca: vehiculo.marca || "",
      tipo: vehiculo.tipo || "",
      color: vehiculo.color || "",
      modelo: vehiculo.modelo || "",
      placas: vehiculo.placas,
      ubicacion: vehiculo.ubicacion || "",
      motor: vehiculo.motor || "",
      serie: vehiculo.serie,
      eco: vehiculo.eco || "",
      contrato: vehiculo.contrato || "",
      estatus: vehiculo.estatus || "",
      agencia: vehiculo.agencia || "",
      proyecto: vehiculo.proyecto || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof editVehiculoFormSchema>) => {
    console.log("=== INICIANDO SUBMIT EDIT VEHICULO ===");
    console.log("Vehículo ID:", vehiculo.id);
    console.log("Valores del formulario:", values);
    console.log("Tipo de valores:", typeof values);
    console.log("Keys de valores:", Object.keys(values));

    try {
      console.log("Enviando datos actualizados del vehículo:", values);
      const response = await axios.put(`/api/vehiculos/${vehiculo.id}`, values);
      console.log("Respuesta exitosa:", response.data);

      toast.success("Vehículo actualizado correctamente!");
      onSuccess?.();
    } catch (error) {
      console.error("Error completo:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error de Axios:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
        });
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al actualizar el vehículo";
        toast.error(errorMessage);
      } else {
        console.error("Error no Axios:", error);
        toast.error("Error inesperado al actualizar el vehículo");
      }
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Marca */}
          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Marca..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo */}
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tipo..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modelo */}
          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Modelo..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Color..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Placas */}
          <FormField
            control={form.control}
            name="placas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placas</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Placas..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ubicación */}
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ubicación..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Motor */}
          <FormField
            control={form.control}
            name="motor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Motor..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serie */}
          <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Serie..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ECO */}
          <FormField
            control={form.control}
            name="eco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ECO</FormLabel>
                <FormControl>
                  <Input placeholder="ECO..." className="max-w-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contrato */}
          <FormField
            control={form.control}
            name="contrato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contrato</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contrato..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estatus */}
          <FormField
            control={form.control}
            name="estatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estatus</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Estatus..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Agencia */}
          <FormField
            control={form.control}
            name="agencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agencia</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Agencia..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proyecto */}
          <FormField
            control={form.control}
            name="proyecto"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Proyecto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Proyecto..."
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="col-span-1 md:col-span-2 cursor-pointer"
          >
            Actualizar Vehículo
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditVehiculosForm;
