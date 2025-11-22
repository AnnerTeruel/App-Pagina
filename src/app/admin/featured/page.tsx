
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function FeaturedProductsPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }

    loadProducts();
  }, [isAuthenticated, isAdmin, router]);

  const loadProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
      setFeaturedCount(allProducts.filter((p: Product) => p.isFeatured).length);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar productos");
    }
  };

  const toggleFeatured = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!product.isFeatured && featuredCount >= 5) {
      toast.error('Solo puedes tener 5 productos destacados');
      return;
    }

    try {
      await productService.updateProduct(productId, { isFeatured: !product.isFeatured });
      
      // Reload products to get fresh state
      await loadProducts();

      toast.success(
        !product.isFeatured
          ? 'Producto agregado a destacados'
          : 'Producto removido de destacados'
      );
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar producto");
    }
  };

  if (!isAdmin) {
    return null;
  }

  const featuredProducts = products.filter(p => p.isFeatured);
  const nonFeaturedProducts = products.filter(p => !p.isFeatured);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gestión de Productos Destacados</h1>
        <p className="text-muted-foreground">
          Selecciona hasta 5 productos para destacar en la página principal
        </p>
        <div className="mt-4">
          <Badge variant={featuredCount >= 5 ? 'destructive' : 'default'} className="text-lg px-4 py-2">
            {featuredCount} / 5 productos destacados
          </Badge>
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Productos Destacados Actuales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Destacado
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(product.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Todos los Productos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonFeaturedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => toggleFeatured(product.id)}
                    disabled={featuredCount >= 5}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Destacar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
