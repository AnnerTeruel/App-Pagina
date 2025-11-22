'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { predefinedDesignService, designRequestService, PredefinedDesign } from '@/services/design.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomDesignPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [designs, setDesigns] = useState<PredefinedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    productType: '',
    quantity: 1,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDesigns();
  }, [isAuthenticated, router]);

  const fetchDesigns = async () => {
    try {
      const allDesigns = await predefinedDesignService.getAllDesigns();
      setDesigns(allDesigns || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);

    try {
      await designRequestService.submitRequest({
        userId: user.id,
        ...requestForm,
      });

      toast.success('¡Solicitud enviada! Te contactaremos pronto.');
      setRequestForm({
        name: '',
        email: '',
        phone: '',
        description: '',
        productType: '',
        quantity: 1,
      });
    } catch (error) {
      toast.error('Error al enviar solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Diseños Personalizados</h1>
        <p className="text-muted-foreground">
          Explora nuestros diseños predefinidos o solicita un diseño personalizado
        </p>
      </div>

      {/* Predefined Designs Gallery */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Diseños Predefinidos</h2>
        </div>

        {isLoading ? (
          <p className="text-center py-10">Cargando diseños...</p>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={design.imageUrl}
                    alt={design.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{design.name}</h3>
                  {design.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {design.description}
                    </p>
                  )}
                  {design.category && (
                    <p className="text-xs text-primary mt-2">{design.category}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay diseños disponibles aún. ¡Pronto agregaremos más!
            </p>
          </Card>
        )}
      </section>

      {/* Custom Design Request Form */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Send className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Solicitar Diseño Personalizado</h2>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Cuéntanos tu idea</CardTitle>
            <CardDescription>
              Completa el formulario y nuestro equipo creará un diseño único para ti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={requestForm.name}
                    onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={requestForm.email}
                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={requestForm.phone}
                    onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de Producto</Label>
                  <Input
                    id="productType"
                    placeholder="Ej: Camiseta, Taza, Gorra"
                    value={requestForm.productType}
                    onChange={(e) => setRequestForm({ ...requestForm, productType: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad Aproximada</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del Diseño *</Label>
                <textarea
                  id="description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Describe tu idea: colores, estilo, elementos que quieres incluir..."
                  rows={5}
                  required
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
