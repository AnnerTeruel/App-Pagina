'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { quoteService } from '@/services/quote.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Calendar, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminQuotesPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchQuotes();
  }, [isAuthenticated, isAdmin, router]);

  const fetchQuotes = async () => {
    try {
      const allQuotes = await quoteService.getAllQuotes();
      setQuotes(allQuotes || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast.error('Error al cargar cotizaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      console.log('Updating quote status:', { id, status });
      const result = await quoteService.update(id, { status });
      console.log('Quote update result:', result);
      toast.success('Estado actualizado');
      await fetchQuotes(); // Refetch to get updated data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const updatePrice = async (id: string) => {
    try {
      const newPrice = editingPrice[id];
      if (newPrice === undefined || newPrice === null) return;

      console.log('Updating price:', { id, newPrice });
      const result = await quoteService.update(id, { estimatedPrice: newPrice });
      console.log('Price update result:', result);
      
      toast.success('Precio actualizado');
      
      // Clear the editing state for this quote
      const newEditingState = { ...editingPrice };
      delete newEditingState[id];
      setEditingPrice(newEditingState);
      
      await fetchQuotes(); // Refetch to get updated data
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error(`Error al actualizar precio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gestión de Cotizaciones</h1>
        <p className="text-muted-foreground">
          Administra solicitudes de cotización de clientes
        </p>
      </div>

      {isLoading ? (
        <p className="text-center py-10">Cargando...</p>
      ) : quotes.length > 0 ? (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {quote.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {quote.productType} - {quote.quantity} unidades
                    </CardDescription>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{quote.email}</span>
                  </div>
                  {quote.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{quote.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {quote.description && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm"><strong>Detalles:</strong> {quote.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`price-${quote.id}`}>Precio Final</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`price-${quote.id}`}
                          type="number"
                          step="0.01"
                          placeholder={quote.estimatedPrice?.toString() || 'Precio estimado'}
                          value={editingPrice[quote.id] !== undefined ? editingPrice[quote.id] : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditingPrice({
                              ...editingPrice,
                              [quote.id]: value === '' ? undefined : parseFloat(value)
                            });
                          }}
                          className="pl-9"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => updatePrice(quote.id)}
                        disabled={editingPrice[quote.id] === undefined}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={(!quote.status || quote.status === 'pending') ? 'default' : 'outline'}
                    onClick={() => updateStatus(quote.id, 'pending')}
                    disabled={!quote.status || quote.status === 'pending'}
                  >
                    Pendiente
                  </Button>
                  <Button
                    size="sm"
                    variant={quote.status === 'in-progress' ? 'default' : 'outline'}
                    onClick={() => updateStatus(quote.id, 'in-progress')}
                    disabled={quote.status === 'in-progress'}
                  >
                    En Proceso
                  </Button>
                  <Button
                    size="sm"
                    variant={quote.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => updateStatus(quote.id, 'completed')}
                    disabled={quote.status === 'completed'}
                  >
                    Completado
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No hay cotizaciones pendientes</p>
        </Card>
      )}
    </div>
  );
}
