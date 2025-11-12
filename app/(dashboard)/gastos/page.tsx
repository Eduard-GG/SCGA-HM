"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import GastosForm from "@/components/GastosForm/GastosForm";
import { exportToExcel } from "@/lib/exportToExcel";

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
  createdAt: Date;
  updatedAt: Date;
}

interface CurrentUser {
  id: number;
  rol: string;
  canViewGastos: boolean;
  canViewGastosExternos: boolean;
  canViewVehiculos: boolean;
  canViewUsuarios: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/user");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Si no está autorizado, redirigir al login
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  // Cargar gastos
  const fetchGastos = async () => {
    try {
      const response = await axios.get("/api/gastos");
      setGastos(response.data);
    } catch (error) {
      console.error("Error fetching gastos:", error);
      toast.error("Error al cargar los gastos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchGastos();
    };
    loadData();
  }, []);

  // Filtrar gastos según búsqueda
  const filteredGastos = useMemo(() => {
    return gastos.filter((gasto) => {
      // Filtro de búsqueda general (incluye proyecto)
      const matchesSearch =
        searchTerm === "" ||
        gasto.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.rz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.proyecto?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [gastos, searchTerm]);

  const handleCreateSuccess = () => {
    setIsCreateSheetOpen(false);
    fetchGastos();
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedGasto(undefined);
    fetchGastos();
  };

  const handleEdit = (gasto: Gasto) => {
    setSelectedGasto(gasto);
    setEditDialogOpen(true);
  };

  const handleDelete = async (gasto: Gasto) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el gasto "${gasto.concepto}" del vehículo ${gasto.placa}?`
      )
    ) {
      try {
        await axios.delete(`/api/gastos/${gasto.id}`);
        toast.success("Gasto eliminado correctamente");
        fetchGastos();
      } catch (error) {
        console.error("Error eliminando gasto:", error);
        toast.error("Error al eliminar el gasto");
      }
    }
  };

  const getVisiblePages = (current: number, total: number) => {
    const delta = 2; // Número de páginas a mostrar alrededor de la actual
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push("...", total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  const totalPages = Math.ceil(filteredGastos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGastos = filteredGastos.slice(startIndex, endIndex);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Resetear a la primera página cuando cambien los filtros
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "combustible":
        return "COMBUSTIBLE";
      case "mantenimiento":
        return "MANTENIMIENTO";
      case "seguros":
        return "SEGUROS";
      case "multas":
        return "MULTAS";
      case "otros":
        return "OTROS";
      default:
        return tipo ? tipo.toUpperCase() : "SIN TIPO";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Gastos
            </h1>
            <p className="mt-2 text-muted-foreground">Cargando gastos...</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar permisos
  if (!currentUser || !currentUser.canViewGastos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Gastos
            </h1>
            <p className="mt-2 text-muted-foreground">
              No tienes permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gastos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestión completa de gastos de la flota ({filteredGastos.length} de{" "}
            {gastos.length} registrados)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => exportToExcel(filteredGastos, 'gastos.xlsx', 'Gastos')}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Gasto
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-4xl overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Agregar Nuevo Gasto</SheetTitle>
                <SheetDescription>
                  Complete el formulario para registrar un nuevo gasto en el
                  sistema.
                </SheetDescription>
              </SheetHeader>
              <GastosForm onSuccess={handleCreateSuccess} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gastos.length}</div>
            <p className="text-xs text-muted-foreground">Registros en total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combustible</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gastos.filter((g) => g.tipoGasto === "combustible").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos de combustible
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gastos.filter((g) => g.tipoGasto === "mantenimiento").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos de mantenimiento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(gastos.map((g) => g.placa)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehículos con gastos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Gastos</CardTitle>
          <CardDescription>
            Información completa de todos los gastos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por folio, proveedor, concepto, responsable, razón social, placas o proyecto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {filteredGastos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {gastos.length === 0
                ? "No hay gastos registrados aún."
                : "No se encontraron gastos que coincidan con la búsqueda."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead className="min-w-[100px]">Folio</TableHead>
                      <TableHead className="min-w-[100px]">Fecha</TableHead>
                      <TableHead className="min-w-[120px]">Concepto</TableHead>
                      <TableHead className="min-w-[100px]">Proveedor</TableHead>
                      <TableHead className="min-w-[100px]">Vehículo</TableHead>
                      <TableHead className="min-w-[100px]">Tipo</TableHead>
                      <TableHead className="min-w-[120px]">Monto</TableHead>
                      <TableHead className="min-w-[120px]">
                        Responsable
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentGastos.map((gasto) => (
                      <TableRow key={gasto.id}>
                        <TableCell className="font-medium">
                          {gasto.id}
                        </TableCell>
                        <TableCell className="truncate max-w-[100px]">
                          {gasto.folio || "-"}
                        </TableCell>
                        <TableCell>
                          {gasto.fecha
                            ? new Date(gasto.fecha).toLocaleDateString("es-ES")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[120px]">
                          {gasto.concepto}
                        </TableCell>
                        <TableCell className="truncate max-w-[100px]">
                          {gasto.proveedor || "-"}
                        </TableCell>
                        <TableCell className="font-mono truncate max-w-[100px]">
                          {gasto.placa}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTipoLabel(gasto.tipoGasto || "")}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate max-w-[120px] font-mono">
                          {formatCurrency(gasto.transferencia)}
                        </TableCell>
                        <TableCell className="truncate max-w-[120px]">
                          {gasto.responsable || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Gasto</DialogTitle>
                                  <DialogDescription>
                                    Información completa del gasto{" "}
                                    {gasto.concepto}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      ID
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.id}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Folio
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.folio || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Fecha
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.fecha
                                        ? new Date(
                                            gasto.fecha
                                          ).toLocaleDateString("es-ES")
                                        : "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Razón Social
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.rz || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Banco
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.banco || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      TDC
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.tdc || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Proveedor
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.proveedor || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Concepto
                                    </label>
                                    <p className="text-sm text-muted-foreground font-medium">
                                      {gasto.concepto}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Referencia
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.referencia || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Documento
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.documento || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Proyecto
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.proyecto || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Vehículo (Placas)
                                    </label>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {gasto.placa}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Responsable
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {gasto.responsable || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Monto
                                    </label>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {formatCurrency(gasto.transferencia)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Tipo de Gasto
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {getTipoLabel(gasto.tipoGasto || "")}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(gasto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(gasto)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginado */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, filteredGastos.length)} de{" "}
                    {filteredGastos.length} gastos
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="sm:hidden"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {visiblePages.map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`dots-${index}`}
                            className="px-2 py-1 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="w-8 h-8 p-0 min-w-8"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="sm:hidden"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para editar gasto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>
              Modifica la información del gasto seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedGasto && (
            <GastosForm gasto={selectedGasto} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
