'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Plus,
  BarChart3,
  Palette,
  FileText,
  Users,
  DollarSign,
  Star,
  LayoutGrid,
  AlertTriangle,
  Scan
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockProducts: [] as any[],
  });
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

    fetchAnalytics();
  }, [isAuthenticated, isAdmin, router]);

  const fetchAnalytics = async () => {
    try {
      const [orders, products] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAllProducts()
      ]);

      const totalSales = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const lowStock = products.filter((p: any) => p.inventory < 10);

      setAnalytics({
        totalSales,
        totalOrders: orders.length,
        lowStockProducts: lowStock,
      });
    } catch (error) {
      console.error('Error al cargar analytics:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona productos y visualiza estadísticas de ventas
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold">Cargando...</p>
            ) : (
              <p className="text-3xl font-bold text-primary">
                ${analytics.totalSales.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold">Cargando...</p>
            ) : (
              <p className="text-3xl font-bold">{analytics.totalOrders}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold">Cargando...</p>
            ) : (
              <div>
                <p className="text-3xl font-bold text-destructive">
                  {analytics.lowStockProducts.length}
                </p>
                {analytics.lowStockProducts.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Productos con menos de 10 unidades
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products Alert */}
      {!isLoading && analytics.lowStockProducts.length > 0 && (
        <Card className="mb-8 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Productos con Bajo Inventario
            </CardTitle>
            <CardDescription>
              Los siguientes productos necesitan reabastecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-destructive font-semibold">
                    {product.inventory} unidades
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Inventario Rápido</CardTitle>
                <CardDescription>
                  Escanea códigos de barras para actualizar inventario
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/inventory">
              <Button className="w-full">
                <Scan className="mr-2 h-4 w-4" />
                Abrir Scanner
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Productos Destacados</CardTitle>
                <CardDescription>
                  Gestiona los productos que aparecen en la página principal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/featured">
              <Button className="w-full">
                Gestionar Destacados
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Reportes Mensuales</CardTitle>
                <CardDescription>
                  Visualiza estadísticas y reportes de ventas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/reports">
              <Button className="w-full">
                Ver Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Crear Producto</CardTitle>
                <CardDescription>
                  Agrega un nuevo producto al inventario
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create-product">
              <Button className="w-full">
                Crear Producto
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>
                  Administra el inventario y productos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/products">
              <Button className="w-full">
                Gestionar Productos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Diseños Personalizados</CardTitle>
                <CardDescription>
                  Gestiona solicitudes y diseños de clientes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/designs">
              <Button className="w-full">
                Ver Diseños
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Cotizaciones</CardTitle>
                <CardDescription>
                  Administra solicitudes de cotización
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/quotes">
              <Button className="w-full">
                Ver Cotizaciones
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Gestiona las categorías de productos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/categories">
              <Button className="w-full">
                Gestionar Categorías
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Contenido Inicio</CardTitle>
                <CardDescription>
                  Edita el banner y textos del inicio
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/content">
              <Button className="w-full">
                Editar Contenido
              </Button>
            </Link>
          </CardContent>
        </Card>
        {/* Users & Points */}
        <Link href="/admin/users">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios y Puntos
              </CardTitle>
              <CardDescription>
                Gestionar usuarios y sistema de puntos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ver lista de usuarios, roles y ajustar balances de puntos.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}