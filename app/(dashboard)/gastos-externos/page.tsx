"use client";

import GastosExternosForm from "@/components/GastosExternosForm/GastosExternosForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { ActionCell } from "./GastosExternosTable/ActionCell";
import { columns, GastoExterno } from "./GastosExternosTable/columns";
import { DataTable } from "./GastosExternosTable/data-table";
import { Row } from "@tanstack/react-table";
import { Plus, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { exportToExcel } from "@/lib/exportToExcel";

interface CurrentUser {
  id: number;
  rol: string;
  canViewGastos: boolean;
  canViewGastosExternos: boolean;
  canViewVehiculos: boolean;
  canViewUsuarios: boolean;
}

const ITEMS_PER_PAGE = 10;

async function getData(): Promise<GastoExterno[]> {
  const baseURL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";

  try {
    const resultado = await axios.get(`${baseURL}/api/gastos-externos`);
    return resultado.data;
  } catch {
    return [];
  }
}

export default function GastosExternosPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GastoExterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Función centralizada para refrescar la tabla
  const refreshData = async () => {
    const newData = await getData();
    setData(newData);
    setOpen(false);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await refreshData();
      setLoading(false);
    };
    loadData();
  }, []);

  // Filtrar gastos según búsqueda
  const filteredData = useMemo(() => {
    return data.filter((gasto) => {
      // Filtro de búsqueda general
      const matchesSearch = searchTerm === '' ||
        gasto.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.rz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.proyecto?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [data, searchTerm]);

  const enhancedColumns = columns.map((col) =>
    col.id === "actions"
      ? {
          ...col,
          cell: ({ row }: { row: Row<GastoExterno>}) => (
            <ActionCell gasto={row.original} refreshData={refreshData} />
          ),
        }
      : col
  );

  const getVisiblePages = (current: number, total: number) => {
    const delta = 2; // Número de páginas a mostrar alrededor de la actual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Resetear a la primera página cuando cambien los filtros
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gastos Externos</h1>
            <p className="mt-2 text-muted-foreground">Cargando gastos externos...</p>
          </div>
        </div>
        <Card className="bg-white dark:bg-[#171717]">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar permisos
  if (!currentUser || !currentUser.canViewGastosExternos) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gastos Externos</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gastos Externos</h1>
          <p className="mt-2 text-muted-foreground">
            Gestión completa de gastos externos ({filteredData.length} de {data.length} registrados)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => exportToExcel(filteredData, 'gastos-externos.xlsx', 'Gastos Externos')}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Gasto
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle>Agregar Gasto Externo</DialogTitle>
              <DialogDescription>
                Registra un nuevo Gasto Externo.
              </DialogDescription>
            </DialogHeader>

            <GastosExternosForm onSuccess={refreshData} />
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <Card className="bg-white dark:bg-[#171717]">
        <CardHeader>
          <CardTitle>Listado de Gastos Externos</CardTitle>
          <CardDescription>
            Información completa de todos los gastos externos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por folio, proveedor, concepto, responsable, razón social o proyecto..."
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

          {filteredData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {data.length === 0
                ? 'No hay gastos externos registrados aún.'
                : 'No se encontraron gastos que coincidan con la búsqueda.'}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DataTable columns={enhancedColumns} data={currentData} />
              </div>

              {/* Paginado */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} gastos externos
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
                      {visiblePages.map((page, index) => (
                        page === '...' ? (
                          <span key={`dots-${index}`} className="px-2 py-1 text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="w-8 h-8 p-0 min-w-8"
                          >
                            {page}
                          </Button>
                        )
                      ))}
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