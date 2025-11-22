'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPostgrestClient } from '@/lib/postgrest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { pointsService } from '@/services/points.service';
import { Trophy, Search, Plus, Minus } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  points: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustPointsOpen, setAdjustPointsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  const fetchUsers = async () => {
    try {
      console.log('--- DEBUG START ---');
      console.log('Current User:', currentUser);
      console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const client = createPostgrestClient();
      
      // Test fetch to products to verify connection
      console.log('Testing connection with products...');
      const { data: products, error: productsError } = await client.from('products').select('id').limit(1);
      console.log('Products check:', { success: !productsError, error: productsError });

      console.log('Fetching users...');
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      console.log('Users fetch result:', { data, error });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
      console.log('--- DEBUG END ---');
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleAdjustPoints = async (type: 'add' | 'subtract') => {
    if (!selectedUser || !pointsAmount || !pointsReason) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Cantidad inválida');
      return;
    }

    const finalAmount = type === 'add' ? amount : -amount;

    try {
      await pointsService.addPoints(
        selectedUser.id,
        finalAmount,
        'bonus', // Using 'bonus' for manual adjustments for now
        pointsReason
      );

      toast.success('Puntos actualizados correctamente');
      setAdjustPointsOpen(false);
      setPointsAmount('');
      setPointsReason('');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error('Error al ajustar puntos');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Role Debug:', { 
    role: currentUser?.role, 
    type: typeof currentUser?.role,
    length: currentUser?.role?.length,
    isAdminProp: currentUser?.isAdmin,
    check: currentUser?.role === 'admin'
  });

  const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos de administrador para ver esta página.</p>
        <p className="text-sm text-muted-foreground mt-2">Role actual: {currentUser?.role || 'Invitado'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Gestión de Usuarios y Puntos
        </h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No se encontraron usuarios</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const level = pointsService.calculateLevel(user.points || 0);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-lg">{user.points || 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={level.color}>
                          {level.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog open={adjustPointsOpen && selectedUser?.id === user.id} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
                          setAdjustPointsOpen(open);
                          if (open) setSelectedUser(user);
                          else setSelectedUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ajustar Puntos
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajustar Puntos para {user.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Cantidad de Puntos</Label>
                                <Input 
                                  type="number" 
                                  placeholder="Ej: 100" 
                                  value={pointsAmount}
                                  onChange={(e) => setPointsAmount(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Motivo</Label>
                                <Input 
                                  placeholder="Ej: Regalo de cumpleaños, Ajuste manual..." 
                                  value={pointsReason}
                                  onChange={(e) => setPointsReason(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button 
                                  variant="outline" 
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleAdjustPoints('subtract')}
                                >
                                  <Minus className="h-4 w-4 mr-1" /> Restar
                                </Button>
                                <Button 
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleAdjustPoints('add')}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Sumar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
