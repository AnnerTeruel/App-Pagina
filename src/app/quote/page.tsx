'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { quoteService } from '@/services/quote.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function QuotePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    productType: '',
    quantity: 1,
    description: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (quoteForm.productType && quoteForm.quantity > 0) {
      const price = quoteService.calculateEstimatedPrice(quoteForm.productType, quoteForm.quantity);
      setEstimatedPrice(price);
    } else {
      setEstimatedPrice(null);
    }
  }, [quoteForm.productType, quoteForm.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);

    try {
      await quoteService.submitQuote({
        userId: user.id,
        ...quoteForm,
        estimatedPrice: estimatedPrice || undefined,
      });

      toast.success('¡Cotización enviada! Te contactaremos pronto con más detalles.');
      setQuoteForm({
        name: '',
        email: '',
        phone: '',
        productType: '',
        quantity: 1,
        description: '',
      });
      setEstimatedPrice(null);
    } catch (error) {
      toast.error('Error al enviar cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Cotizador de Pedidos</h1>
          <p className="text-muted-foreground">
            Solicita una cotización para pedidos al por mayor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                10-19 unidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">10% OFF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                20-49 unidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">20% OFF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                50+ unidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">30% OFF</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitar Cotización</CardTitle>
            <CardDescription>
              Completa el formulario y te enviaremos una cotización personalizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={quoteForm.phone}
                  onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de Producto *</Label>
                  <Select
                    value={quoteForm.productType}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, productType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camiseta">Camiseta</SelectItem>
                      <SelectItem value="taza">Taza</SelectItem>
                      <SelectItem value="gorra">Gorra</SelectItem>
                      <SelectItem value="sudadera">Sudadera</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detalles Adicionales</Label>
                <textarea
                  id="description"
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                  placeholder="Especificaciones, colores, diseño personalizado, etc."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {estimatedPrice !== null && (
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <span className="font-medium">Precio Estimado:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          {estimatedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Este es un precio estimado. El precio final puede variar según especificaciones.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Solicitar Cotización'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
