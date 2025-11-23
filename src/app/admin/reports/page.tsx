
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { orderService } from '@/services/order.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, ShoppingBag, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Robust admin check
      const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;

      if (!isAdmin) {
        // router.push('/'); // Don't redirect immediately to avoid flash
        return;
      }

      try {
        setLoading(true);
        const allOrders = await orderService.getAllOrders();
        setOrders(allOrders || []);

        const currentDate = new Date();
        setSelectedMonth((currentDate.getMonth() + 1).toString());
        setSelectedYear(currentDate.getFullYear().toString());
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      checkAuthAndFetch();
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;

    const filtered = orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() + 1 === parseInt(selectedMonth) &&
        orderDate.getFullYear() === parseInt(selectedYear)
      );
    });

    setFilteredOrders(filtered);
  }, [selectedMonth, selectedYear, orders]);

  const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos de administrador para ver esta página.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando reportes...</div>;
  }

  const totalTransactions = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const years = ['2024', '2025', '2026'];

  const handleExport = () => {
    const csvContent = [
      ['Fecha', 'ID Pedido', 'Cliente', 'Productos', 'Cantidad Total', 'Método de Pago', 'Total'],
      ...filteredOrders.map(order => [
        new Date(order.createdAt).toLocaleDateString('es-ES'),
        order.id,
        order.shippingAddress.fullName,
        order.items.map(item => `${item.name} (${item.quantity})`).join('; '),
        order.items.reduce((sum, item) => sum + item.quantity, 0),
        order.paymentMethod,
        `$${order.total.toFixed(2)}`,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${selectedYear}_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Reportes Mensuales</h1>
        <p className="text-muted-foreground">
          Visualiza estadísticas y detalles de ventas por mes
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ventas del mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{order.id}
                      </TableCell>
                      <TableCell>{order.shippingAddress.fullName}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {item.name} ({item.quantity})
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </TableCell>
                      <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                      <TableCell className="text-right font-bold">
                        ${order.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay transacciones para el período seleccionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
