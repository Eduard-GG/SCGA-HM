"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "./ActionCell";

export type Gasto = {
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
  createdAt: Date;
  updatedAt: Date;
};

interface ColumnsProps {
  onEdit: (gasto: Gasto) => void;
  onRefresh: () => void;
}

export const getColumns = ({
  onEdit,
  onRefresh,
}: ColumnsProps): ColumnDef<Gasto>[] => [
  {
    accessorKey: "folio",
    header: "Folio",
    cell: ({ row }) => {
      const folio = row.getValue("folio") as string;
      return <div className="font-medium">{folio || "-"}</div>;
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.getValue("fecha") as Date;
      return (
        <div>{fecha ? new Date(fecha).toLocaleDateString("es-ES") : "-"}</div>
      );
    },
  },
  {
    accessorKey: "concepto",
    header: "Concepto",
    cell: ({ row }) => {
      const concepto = row.getValue("concepto") as string;
      return <div className="font-medium">{concepto}</div>;
    },
  },
  {
    accessorKey: "proveedor",
    header: "Proveedor",
    cell: ({ row }) => {
      const proveedor = row.getValue("proveedor") as string;
      return <div>{proveedor || "-"}</div>;
    },
  },
  {
    accessorKey: "placa",
    header: "Vehículo",
    cell: ({ row }) => {
      const placa = row.getValue("placa") as string;
      return <div className="font-mono">{placa}</div>;
    },
  },
  {
    accessorKey: "tipoGasto",
    header: "Tipo",
    cell: ({ row }) => {
      const tipoGasto = row.getValue("tipoGasto") as string;
      const getTipoLabel = (tipo: string) => {
        switch (tipo) {
          case "combustible":
            return "Combustible";
          case "mantenimiento":
            return "Mantenimiento";
          case "seguros":
            return "Seguros";
          case "multas":
            return "Multas";
          case "otros":
            return "Otros";
          default:
            return tipo || "Sin tipo";
        }
      };

      return <Badge variant="outline">{getTipoLabel(tipoGasto)}</Badge>;
    },
  },
  {
    accessorKey: "responsable",
    header: "Responsable",
    cell: ({ row }) => {
      const responsable = row.getValue("responsable") as string;
      return <div>{responsable || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const gasto = row.original;

      return (
        <ActionCell
          gasto={gasto}
          onEdit={() => onEdit(gasto)}
          onRefresh={onRefresh}
        />
      );
    },
  },
];
