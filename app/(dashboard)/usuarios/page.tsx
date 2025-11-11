import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

export default function UsuariosPage() {
  // Aquí se conectaría con la API para obtener usuarios
  const usuarios = [
    {
      id: 1,
      nombreCompleto: "Eduardo Guerrero Gallardo",
      email: "admin@admin.com",
      rol: "admin",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="mt-2 text-muted-foreground">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {usuarios.map((usuario) => (
          <Card key={usuario.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                {usuario.nombreCompleto}
              </CardTitle>
              <CardDescription>Email: {usuario.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rol: {usuario.rol}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  Ver Detalles
                </Button>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
