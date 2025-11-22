'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    if (!user?.id) {
      setIsInWishlist(false);
      return;
    }

    try {
      const inWishlist = await wishlistService.isInWishlist(user.id, product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user?.id) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    setIsTogglingWishlist(true);

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(user.id, product.id);
        setIsInWishlist(false);
        toast.success('Eliminado de favoritos');
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
        setIsInWishlist(true);
        toast.success('Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.inventory < 10 && product.inventory > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              ¡Últimas unidades!
            </Badge>
          )}
          {product.inventory === 0 && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Agotado
            </Badge>
          )}
          <Button
            variant={isInWishlist ? "default" : "secondary"}
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleWishlist}
            disabled={isTogglingWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            Stock: {product.inventory}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/product/${product.id}`} className="w-full">
          <Button className="w-full" disabled={product.inventory === 0}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
