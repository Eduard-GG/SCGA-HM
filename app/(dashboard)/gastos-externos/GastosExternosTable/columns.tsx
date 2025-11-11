"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";

export type GastoExterno = {
  id: number;
  folio: string;
  fecha: Date;
  rz: string;
  banco: string;
  tdc: string;
  proveedor: string;
  concepto: string;
  referencia: string;
  documento: string;
  responsable: string;
  transferencia: string;
  tipoGasto: string;
  proyecto?: string;
};

export const columns: ColumnDef<GastoExterno>[] = [
  {
    accessorKey: "folio",
    header: "Folio",
    size: 80,
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.getValue("folio") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    size: 100,
    cell: ({ row }) => {
      const fechaRaw = row.getValue("fecha") as string;
      if (!fechaRaw) return <div className="text-sm text-muted-foreground">-</div>;

      const date = new Date(fechaRaw);
      return (
        <div className="text-sm">
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "proveedor",
    header: "Proveedor",
    size: 140,
    cell: ({ row }) => (
      <div className="text-sm max-w-[120px] truncate" title={row.getValue("proveedor")}>
        {row.getValue("proveedor") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "concepto",
    header: "Concepto",
    size: 180,
    cell: ({ row }) => (
      <div className="text-sm max-w-[150px] truncate" title={row.getValue("concepto")}>
        {row.getValue("concepto") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "tipoGasto",
    header: "Tipo",
    size: 100,
    cell: ({ row }) => {
      const tipo = row.getValue("tipoGasto") as string;
      return (
        <div className="text-sm">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {tipo ? tipo.toUpperCase() : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "banco",
    header: "Banco",
    size: 100,
    cell: ({ row }) => (
      <div className="text-sm max-w-20 truncate hidden md:table-cell" title={row.getValue("banco")}>
        {row.getValue("banco") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "rz",
    header: "Razón Social",
    size: 130,
    cell: ({ row }) => (
      <div className="text-sm max-w-[100px] truncate hidden lg:table-cell" title={row.getValue("rz")}>
        {row.getValue("rz") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "transferencia",
    header: "Monto",
    size: 120,
    cell: ({ row }) => {
      const amount = row.getValue("transferencia") as string;
      return (
        <div className="text-sm font-mono">
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "Acciones",
    id: "actions",
    enableHiding: false,
    size: 60,
    // cell: ({ row }) => <ActionCell gasto={row.original} />,
  },
];