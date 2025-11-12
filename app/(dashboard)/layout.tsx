"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Car,
  DollarSign,
  Users,
  BarChart3,
  LogOut,
  Menu,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeSelector } from "@/components/theme-selector";

const allNavigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, permission: null },
  { name: "Vehículos", href: "/vehiculos", icon: Car, permission: "canViewVehiculos" },
  { name: "Gastos", href: "/gastos", icon: DollarSign, permission: "canViewGastos" },
  { name: "Gastos Externos", href: "/gastos-externos", icon: Receipt, permission: "canViewGastosExternos" },
  { name: "Usuarios", href: "/usuarios", icon: Users, permission: "canViewUsuarios" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{
    nombreCompleto: string;
    email: string;
    rol?: string;
    canViewGastos?: boolean;
    canViewGastosExternos?: boolean;
    canViewVehiculos?: boolean;
    canViewUsuarios?: boolean;
  } | null>(null);

  // Cerrar sidebar en móviles al cambiar de ruta
  useEffect(() => {
    // eslint-disable-next-line
    setSidebarOpen(false);
  }, [pathname]);

  // Auto-colapsar sidebar en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Obtener información del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-16" : "md:w-72"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="relative flex items-center justify-center h-24 px-4 border-b border-border">
            {!sidebarCollapsed && (
              <h1 className="text-center text-lg font-bold text-foreground leading-tight">
                Sistema de control
                <br />
                de gastos
              </h1>
            )}
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute top-1/2 right-2 -translate-y-1/2 hidden md:flex h-8 w-8 p-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navegación */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {allNavigation
                .filter((item) => {
                  // Siempre mostrar dashboard
                  if (!item.permission) return true;
                  // Si no hay usuario, no mostrar ningún item con permisos
                  if (!user) return false;
                  // Verificar si el usuario tiene el permiso específico
                  return user[item.permission as keyof typeof user] === true;
                })
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                    >
                      <item.icon
                        className={`shrink-0 h-5 w-5 ${
                          isActive
                            ? "text-muted-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        } ${sidebarCollapsed ? "" : "mr-3"}`}
                      />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Footer con información del usuario y configuración */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Información del usuario */}
            {user && (
              <div
                className={`flex items-center space-x-3 ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.nombreCompleto
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.nombreCompleto}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.rol && (
                      <p className="text-xs text-muted-foreground">
                        {user.rol}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Configuración y logout */}
            <div
              className={`flex ${
                sidebarCollapsed
                  ? "flex-col space-y-2"
                  : "items-center space-x-2"
              }`}
            >
              <div
                className={`${sidebarCollapsed ? "flex justify-center" : ""}`}
              >
                <ThemeSelector />
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className={`${sidebarCollapsed ? "h-8 w-8 p-0" : "flex-1"}`}
              >
                <LogOut className="h-4 w-4" />
                {!sidebarCollapsed && (
                  <span className="ml-2">Cerrar Sesión</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-0"
        }`}
      >
        <div className="md:hidden bg-card border-b border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
