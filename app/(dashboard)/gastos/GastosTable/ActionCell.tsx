"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ActionCellProps {
  gasto: {
    id: number;
    concepto: string;
    placa: string;
  };
  onEdit: () => void;
  onRefresh: () => void;
}

export function ActionCell({ gasto, onEdit, onRefresh }: ActionCellProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/gastos/${gasto.id}`);
      toast.success("Gasto eliminado correctamente");
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      toast.error("Error al eliminar el gasto");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="text-red-600 hover:text-red-700"
        >
          Eliminar
        </Button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Gasto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el gasto &quot;
              {gasto.concepto}&quot; del vehículo {gasto.placa}? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
