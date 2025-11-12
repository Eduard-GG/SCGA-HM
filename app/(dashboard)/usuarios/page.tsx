"use client";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  canViewGastos: boolean;
  canViewGastosExternos: boolean;
  canViewVehiculos: boolean;
  canViewUsuarios: boolean;
  createdAt: string;
}

interface CurrentUser {
  id: number;
  rol: string;
}

interface AxiosError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    rol: "user",
    canViewGastos: true,
    canViewGastosExternos: true,
    canViewVehiculos: true,
    canViewUsuarios: false,
  });
  const router = useRouter();

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await axios.get("/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      toast.error("Error al cargar usuarios");
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get("/api/user");
      const user = response.data;
      setCurrentUser(user);
      // Si el usuario es admin, cargar usuarios
      if (user.rol === "admin") {
        await fetchUsuarios();
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Si no está autorizado, redirigir al login
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        router.push("/login");
      }
    }
  }, [fetchUsuarios, router]);

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      setLoading(false);
    };
    loadData();
  }, [fetchCurrentUser]);

  const handleCreate = async () => {
    try {
      await axios.post("/api/usuarios", formData);
      toast.success("Usuario creado correctamente");
      setIsCreateDialogOpen(false);
      setFormData({ nombreCompleto: "", email: "", password: "", rol: "user", canViewGastos: true, canViewGastosExternos: true, canViewVehiculos: true, canViewUsuarios: false });
      fetchUsuarios();
    } catch (error) {
      console.error("Error creating user:", error);
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.error || "Error al crear usuario");
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setFormData({
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      canViewGastos: usuario.canViewGastos,
      canViewGastosExternos: usuario.canViewGastosExternos,
      canViewVehiculos: usuario.canViewVehiculos,
      canViewUsuarios: usuario.canViewUsuarios,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const updateData: {
        nombreCompleto: string;
        email: string;
        rol: string;
        password?: string;
      } = { ...formData };
      if (!updateData.password) delete updateData.password;
      await axios.put(`/api/usuarios/${selectedUser.id}`, updateData);
      toast.success("Usuario actualizado correctamente");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ nombreCompleto: "", email: "", password: "", rol: "user", canViewGastos: true, canViewGastosExternos: true, canViewVehiculos: true, canViewUsuarios: false });
      fetchUsuarios();
    } catch (error) {
      console.error("Error updating user:", error);
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.error || "Error al actualizar usuario");
    }
  };

  const handleDelete = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    // Prevenir que un usuario se elimine a sí mismo
    if (currentUser && userToDelete.id === currentUser.id) {
      toast.error("No puedes eliminar tu propia cuenta de usuario");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      await axios.delete(`/api/usuarios/${userToDelete.id}`);
      toast.success("Usuario eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsuarios();
    } catch (error) {
      console.error("Error deleting user:", error);
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.error || "Error al eliminar usuario");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
            <p className="mt-2 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.rol !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="mt-2 text-muted-foreground">
            Gestión de usuarios del sistema ({usuarios.length} usuarios)
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Usuario</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                <Input
                  id="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreCompleto: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rol: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permisos</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canViewGastos"
                      checked={formData.canViewGastos}
                      onChange={(e) =>
                        setFormData({ ...formData, canViewGastos: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="canViewGastos">Puede ver gastos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canViewGastosExternos"
                      checked={formData.canViewGastosExternos}
                      onChange={(e) =>
                        setFormData({ ...formData, canViewGastosExternos: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="canViewGastosExternos">Puede ver gastos externos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canViewVehiculos"
                      checked={formData.canViewVehiculos}
                      onChange={(e) =>
                        setFormData({ ...formData, canViewVehiculos: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="canViewVehiculos">Puede ver vehículos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canViewUsuarios"
                      checked={formData.canViewUsuarios}
                      onChange={(e) =>
                        setFormData({ ...formData, canViewUsuarios: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="canViewUsuarios">Puede ver usuarios</Label>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                Rol: {usuario.rol === "admin" ? "Administrador" : "Usuario"}
              </p>
              <p className="text-sm text-muted-foreground">
                Creado: {new Date(usuario.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(usuario)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Editar
                </Button>
                {currentUser && usuario.id !== currentUser.id && (
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(usuario)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de{" "}
                          <span className="font-semibold">{userToDelete?.nombreCompleto}</span> y removerá todos sus datos del sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de edición fuera del map */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-nombreCompleto">Nombre Completo</Label>
              <Input
                id="edit-nombreCompleto"
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Deja vacío para mantener la actual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) =>
                  setFormData({ ...formData, rol: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Permisos</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-canViewGastos"
                    checked={formData.canViewGastos}
                    onChange={(e) =>
                      setFormData({ ...formData, canViewGastos: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-canViewGastos">Puede ver gastos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-canViewGastosExternos"
                    checked={formData.canViewGastosExternos}
                    onChange={(e) =>
                      setFormData({ ...formData, canViewGastosExternos: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-canViewGastosExternos">Puede ver gastos externos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-canViewVehiculos"
                    checked={formData.canViewVehiculos}
                    onChange={(e) =>
                      setFormData({ ...formData, canViewVehiculos: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-canViewVehiculos">Puede ver vehículos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-canViewUsuarios"
                    checked={formData.canViewUsuarios}
                    onChange={(e) =>
                      setFormData({ ...formData, canViewUsuarios: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-canViewUsuarios">Puede ver usuarios</Label>
                </div>
              </div>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Actualizar Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
