'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/order.service';
import { quoteService } from '@/services/quote.service';
import { pointsService } from '@/services/points.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Package, MapPin, CreditCard, FileText, DollarSign, Trophy, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const [userOrders, userQuotes, userPoints] = await Promise.all([
          orderService.getOrdersByUserId(user.id),
          quoteService.getUserQuotes(user.id),
          pointsService.getUserPoints(user.id)
        ]);
        setOrders(userOrders || []);
        setQuotes(userQuotes || []);
        setPoints(userPoints || 0);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar información');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router]);

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              {user.isAdmin && (
                <Badge variant="secondary" className="w-full justify-center">
                  Administrador
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Trophy className="h-5 w-5" />
                Mis Puntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-yellow-600">{points}</span>
                <p className="text-sm text-yellow-600/80">puntos disponibles</p>
              </div>
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => router.push('/rewards')}
              >
                <Star className="mr-2 h-4 w-4" />
                Ver Recompensas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Historial de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando pedidos...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes pedidos todavía</p>
                  <Button onClick={() => router.push('/shop')}>
                    Ir a la Tienda
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.id?.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : ''}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>

                      <Separator className="my-3" />

                      {/* Order Items */}
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3" />

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mb-3">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{order.shippingAddress.fullName}</p>
                              <p className="text-muted-foreground">
                                {order.shippingAddress.address}, {order.shippingAddress.city}
                              </p>
                              <p className="text-muted-foreground">
                                {order.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Método de pago: <span className="font-medium capitalize">{order.paymentMethod}</span>
                        </span>
                      </div>

                      <Separator className="my-3" />

                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ${order.total?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mis Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando cotizaciones...</p>
            ) : quotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No tienes cotizaciones todavía</p>
                <Button onClick={() => router.push('/quote')}>
                  Solicitar Cotización
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{quote.productType}</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.quantity} unidades
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(quote.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge variant={
                        quote.status === 'completed' ? 'default' :
                        quote.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {quote.status === 'in-progress' && 'En Proceso'}
                        {quote.status === 'completed' && 'Completado'}
                        {(!quote.status || quote.status === 'pending') && 'Pendiente'}
                      </Badge>
                    </div>

                    {quote.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {quote.description}
                      </p>
                    )}

                    {quote.estimatedPrice && (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-primary/5 rounded-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Precio Estimado</p>
                          <p className="text-lg font-bold text-primary">
                            ${quote.estimatedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
