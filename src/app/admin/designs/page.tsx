'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { customDesignService, designRequestService } from '@/services/design.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Mail, Phone, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDesignsPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [customDesigns, setCustomDesigns] = useState<any[]>([]);
  const [designRequests, setDesignRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, isAdmin, router]);

  const fetchData = async () => {
    try {
      const [designs, requests] = await Promise.all([
        customDesignService.findMany({}, { orderBy: { column: 'createdAt', direction: 'desc' } }),
        designRequestService.getAllRequests(),
      ]);

      setCustomDesigns(designs || []);
      setDesignRequests(requests || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, type: 'design' | 'request') => {
    try {
      console.log('Updating:', { id, status, type });
      
      if (type === 'design') {
        const result = await customDesignService.update(id, { status });
        console.log('Design update result:', result);
      } else {
        const result = await designRequestService.update(id, { status });
        console.log('Request update result:', result);
      }
      
      toast.success('Estado actualizado');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gestión de Diseños</h1>
        <p className="text-muted-foreground">
          Administra diseños personalizados y solicitudes de clientes
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">
            Solicitudes de Diseño ({designRequests.length})
          </TabsTrigger>
          <TabsTrigger value="designs">
            Diseños Enviados ({customDesigns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {isLoading ? (
            <p className="text-center py-10">Cargando...</p>
          ) : designRequests.length > 0 ? (
            designRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        {request.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {request.description}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      request.status === 'completed' ? 'default' :
                      request.status === 'in-progress' ? 'secondary' :
                      'outline'
                    }>
                      {request.status === 'pending' && 'Pendiente'}
                      {request.status === 'in-progress' && 'En Proceso'}
                      {request.status === 'completed' && 'Completado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{request.phone}</span>
                      </div>
                    )}
                    {request.productType && (
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>Producto: {request.productType}</span>
                      </div>
                    )}
                    {request.quantity && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Cantidad: {request.quantity}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={request.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => updateStatus(request.id, 'pending', 'request')}
                      disabled={request.status === 'pending'}
                    >
                      Pendiente
                    </Button>
                    <Button
                      size="sm"
                      variant={request.status === 'in-progress' ? 'default' : 'outline'}
                      onClick={() => updateStatus(request.id, 'in-progress', 'request')}
                      disabled={request.status === 'in-progress'}
                    >
                      En Proceso
                    </Button>
                    <Button
                      size="sm"
                      variant={request.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => updateStatus(request.id, 'completed', 'request')}
                      disabled={request.status === 'completed'}
                    >
                      Completado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="designs" className="space-y-4">
          {isLoading ? (
            <p className="text-center py-10">Cargando...</p>
          ) : customDesigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customDesigns.map((design) => (
                <Card key={design.id}>
                  {design.imageUrl && (
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={design.imageUrl}
                        alt={design.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                    {design.description && (
                      <CardDescription>{design.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={design.status === 'approved' ? 'default' : design.status === 'rejected' ? 'destructive' : 'outline'}>
                      {design.status === 'pending' && 'Pendiente'}
                      {design.status === 'approved' && 'Aprobado'}
                      {design.status === 'rejected' && 'Rechazado'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={design.status === 'approved' ? 'default' : 'outline'}
                        onClick={() => updateStatus(design.id, 'approved', 'design')}
                        disabled={design.status === 'approved'}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant={design.status === 'rejected' ? 'destructive' : 'outline'}
                        onClick={() => updateStatus(design.id, 'rejected', 'design')}
                        disabled={design.status === 'rejected'}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant={design.status === 'pending' ? 'secondary' : 'outline'}
                        onClick={() => updateStatus(design.id, 'pending', 'design')}
                        disabled={design.status === 'pending'}
                      >
                        Pendiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No hay diseños enviados</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
