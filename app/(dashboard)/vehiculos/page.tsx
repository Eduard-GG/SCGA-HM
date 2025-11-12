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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import VehiculosForm from "@/components/VehiculosForm/VehiculosForm";
import EditVehiculosForm from "@/components/VehiculosForm/EditVehiculosForm";
import axios from "axios";

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

interface CurrentUser {
  id: number;
  rol: string;
  canViewGastos: boolean;
  canViewGastosExternos: boolean;
  canViewVehiculos: boolean;
  canViewUsuarios: boolean;
}

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

const ITEMS_PER_PAGE = 10;

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gm" | "hm" | "rf">(
    "all"
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(
    null
  );
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

  const fetchVehiculos = async () => {
    try {
      const response = await axios.get("/api/vehiculos");
      setVehiculos(response.data);
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchVehiculos();
    };
    loadData();
  }, []);

  // Filtrar vehículos según búsqueda y tipo
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      // Filtro de búsqueda general (incluye proyecto)
      const matchesSearch =
        searchTerm === "" ||
        vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.placas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.proyecto?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por tipo (GM/HM/RF)
      const matchesType =
        filterType === "all" ||
        (filterType === "gm" && vehiculo.tipo === "GM") ||
        (filterType === "hm" && vehiculo.tipo === "HM") ||
        (filterType === "rf" && vehiculo.tipo === "RF");

      return matchesSearch && matchesType;
    });
  }, [vehiculos, searchTerm, filterType]);

  // Función para determinar el tipo de vehículo
  const getVehicleType = (vehiculo: Vehiculo) => {
    return vehiculo.tipo || "Sin tipo";
  };

  const getVisiblePages = (current: number, total: number) => {
    const delta = 2;
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

  const showStatusColumn =
    filterType === "all" ||
    filteredVehiculos.some((v) => v.estatus && v.estatus.trim() !== "");

  const totalPages = Math.ceil(filteredVehiculos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVehiculos = filteredVehiculos.slice(startIndex, endIndex);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleEditVehiculo = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedVehiculo(null);
    fetchVehiculos();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Vehículos
            </h1>
            <p className="mt-2 text-muted-foreground">Cargando vehículos...</p>
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
  if (!currentUser || !currentUser.canViewVehiculos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Vehículos
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
            Vehículos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestión completa de la flota de vehículos (
            {filteredVehiculos.length} de {vehiculos.length} registrados)
          </p>
        </div>
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Vehículo
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-4xl">
            <SheetHeader>
              <SheetTitle>Agregar Nuevo Vehículo</SheetTitle>
              <SheetDescription>
                Complete el formulario para registrar un nuevo vehículo en el
                sistema.
              </SheetDescription>
            </SheetHeader>
            <VehiculosForm
              onSuccess={() => {
                setIsAddDialogOpen(false);
                fetchVehiculos();
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
      {/* Modal para editar vehículo */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>Editar Vehículo</SheetTitle>
            <SheetDescription>
              Modifique la información del vehículo seleccionado.
            </SheetDescription>
          </SheetHeader>
          {selectedVehiculo && (
            <EditVehiculosForm
              vehiculo={selectedVehiculo}
              onSuccess={handleEditSuccess}
            />
          )}
        </SheetContent>
      </Sheet>{" "}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Vehículos</CardTitle>
          <CardDescription>
            Información resumida de todos los vehículos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por marca, modelo, placas, serie o proyecto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  handleFilterChange();
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button
                variant={filterType === "gm" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterType("gm");
                  handleFilterChange();
                }}
              >
                GM
              </Button>
              <Button
                variant={filterType === "hm" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterType("hm");
                  handleFilterChange();
                }}
              >
                HM
              </Button>
              <Button
                variant={filterType === "rf" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterType("rf");
                  handleFilterChange();
                }}
              >
                RF
              </Button>
            </div>
          </div>

          {filteredVehiculos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {vehiculos.length === 0
                ? "No hay vehículos registrados aún."
                : "No se encontraron vehículos que coincidan con los filtros."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead className="w-[50px]">Tipo</TableHead>
                      <TableHead className="min-w-[100px]">Marca</TableHead>
                      <TableHead className="min-w-[100px]">Modelo</TableHead>
                      <TableHead className="min-w-[100px]">Placas</TableHead>
                      {showStatusColumn && (
                        <TableHead className="min-w-[100px]">Estatus</TableHead>
                      )}
                      <TableHead className="min-w-[120px] hidden md:table-cell">
                        Ubicación
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentVehiculos.map((vehiculo) => (
                      <TableRow key={vehiculo.id}>
                        <TableCell className="font-medium">
                          {vehiculo.id}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              getVehicleType(vehiculo) === "GM"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {getVehicleType(vehiculo)}
                          </span>
                        </TableCell>
                        <TableCell className="truncate max-w-[100px]">
                          {vehiculo.marca || "-"}
                        </TableCell>
                        <TableCell className="truncate max-w-[100px]">
                          {vehiculo.modelo || "-"}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[100px]">
                          {vehiculo.placas}
                        </TableCell>
                        {showStatusColumn && (
                          <TableCell className="truncate max-w-[100px]">
                            {vehiculo.estatus || "-"}
                          </TableCell>
                        )}
                        <TableCell className="hidden md:table-cell truncate max-w-[120px]">
                          {vehiculo.ubicacion || "-"}
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
                                  <DialogTitle>
                                    Detalles del Vehículo
                                  </DialogTitle>
                                  <DialogDescription>
                                    Información completa del vehículo{" "}
                                    {vehiculo.marca} {vehiculo.modelo}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      ID
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.id}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Marca
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.marca || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Tipo
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.tipo || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Modelo
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.modelo || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Color
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.color || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Placas
                                    </label>
                                    <p className="text-sm text-muted-foreground font-medium">
                                      {vehiculo.placas}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Ubicación
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.ubicacion || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Motor
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.motor || "-"}
                                    </p>
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <label className="text-sm font-medium">
                                      Serie
                                    </label>
                                    <p className="text-sm text-muted-foreground font-mono break-all">
                                      {vehiculo.serie}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      ECO
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.eco || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Contrato
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.contrato || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Estatus
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.estatus || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Agencia
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.agencia || "-"}
                                    </p>
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <label className="text-sm font-medium">
                                      Proyecto
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                      {vehiculo.proyecto || "-"}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditVehiculo(vehiculo)}
                            >
                              <Edit className="h-4 w-4" />
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
                    {Math.min(endIndex, filteredVehiculos.length)} de{" "}
                    {filteredVehiculos.length} vehículos
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
    </div>
  );
}
