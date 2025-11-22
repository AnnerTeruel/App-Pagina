'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/services/wishlist.service';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, user, router]);

  const fetchWishlist = async () => {
    if (!user?.id) return;

    try {
      const items = await wishlistService.getWishlist(user.id);
      setWishlistItems(items || []);

      // Fetch product details for each wishlist item
      if (items && items.length > 0) {
        const productPromises = items.map((item: any) => 
          productService.getProductById(item.productId)
        );
        const productsData = await Promise.all(productPromises);
        setProducts(productsData.filter(p => p !== null) as Product[]);
      }
    } catch (error) {
      console.error('Error al cargar wishlist:', error);
      toast.error('Error al cargar tu lista de deseos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!user?.id) return;

    try {
      await wishlistService.removeFromWishlist(user.id, productId);
      toast.success('Producto eliminado de la lista de deseos');
      fetchWishlist();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.sizes || !product.colors) {
      toast.error('Este producto no está disponible');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mi Lista de Deseos</h1>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-20">Cargando...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tu lista de deseos está vacía</h2>
          <p className="text-muted-foreground mb-6">
            Agrega productos a tu lista para guardarlos para más tarde
          </p>
          <Button onClick={() => router.push('/shop')}>
            Explorar Productos
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemove(product.id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-primary mb-3">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inventory === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
