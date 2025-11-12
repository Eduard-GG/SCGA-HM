"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Gasto {
  id: number;
  transferencia?: string;
}

interface GastoExterno {
  id: number;
  transferencia?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      title: "Total Vehículos",
      value: "0",
      description: "Cargando...",
      icon: Car,
    },
    {
      title: "Gastos Internos",
      value: "$0",
      description: "Cargando...",
      icon: DollarSign,
    },
    {
      title: "Gastos Externos",
      value: "$0",
      description: "Cargando...",
      icon: DollarSign,
    },
    {
      title: "Gastos Totales",
      value: "$0",
      description: "Cargando...",
      icon: TrendingUp,
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener vehículos
        const vehiculosResponse = await fetch("/api/vehiculos");
        const vehiculos = await vehiculosResponse.json();

        // Obtener gastos internos
        const gastosResponse = await fetch("/api/gastos");
        const gastos: Gasto[] = await gastosResponse.json();

        // Obtener gastos externos
        const gastosExternosResponse = await fetch("/api/gastos-externos");
        const gastosExternos: GastoExterno[] =
          await gastosExternosResponse.json();

        // Calcular totales
        const totalVehiculos = vehiculos.length;

        const totalGastosInternos = gastos.reduce(
          (sum: number, gasto: Gasto) => {
            const amount = parseFloat(gasto.transferencia || "0");
            return sum + (isNaN(amount) ? 0 : amount);
          },
          0
        );

        const totalGastosExternos = gastosExternos.reduce(
          (sum: number, gasto: GastoExterno) => {
            const amount = parseFloat(gasto.transferencia || "0");
            return sum + (isNaN(amount) ? 0 : amount);
          },
          0
        );

        const totalGastos = totalGastosInternos + totalGastosExternos;

        setStats([
          {
            title: "Total Vehículos",
            value: totalVehiculos.toString(),
            description: "Vehículos registrados",
            icon: Car,
          },
          {
            title: "Gastos Internos",
            value: formatCurrency(totalGastosInternos.toString()),
            description: "Gastos de vehículos",
            icon: DollarSign,
          },
          {
            title: "Gastos Externos",
            value: formatCurrency(totalGastosExternos.toString()),
            description: "Gastos externos",
            icon: DollarSign,
          },
          {
            title: "Gastos Totales",
            value: formatCurrency(totalGastos.toString()),
            description: "Suma total de gastos",
            icon: TrendingUp,
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prevStats) =>
          prevStats.map((stat) => ({
            ...stat,
            description: "Error al cargar",
          }))
        );
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Bienvenido al sistema de gestión de Hidalmotors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"></div>
    </div>
  );
}
