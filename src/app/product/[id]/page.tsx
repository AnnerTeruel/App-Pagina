'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Minus, Plus, Package, Ruler, Palette, Star } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService, Review } from '@/services/review.service';
import { ImageZoom } from '@/components/ImageZoom';
import { recentlyViewedService } from '@/services/recently-viewed.service';
import { ProductCard } from '@/components/ProductCard';


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<string>('');
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const averageRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!params.id) return;
      
      try {
        const [foundProduct, foundReviews] = await Promise.all([
          productService.getProductById(params.id as string),
          reviewService.getReviewsByProductId(params.id as string)
        ]);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setCurrentImage(foundProduct.image);
          if (foundProduct.sizes && foundProduct.sizes.length > 0) setSelectedSize(foundProduct.sizes[0]);
          if (foundProduct.colors && foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0]);
            const colorImg = foundProduct.colorImages?.find((ci: { color: string; image: string }) => ci.color === foundProduct.colors[0]);
            if (colorImg) {
              setCurrentImage(colorImg.image);
            }
          }
        }

        if (foundReviews) {
          setReviews(foundReviews);
        }

        // Track recently viewed
        if (user?.id && foundProduct) {
          await recentlyViewedService.addView(user.id, foundProduct.id);
        }

        // Fetch related products (same category)
        if (foundProduct) {
          const allProducts = await productService.getAllProducts();
          const related = allProducts
            .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el producto");
      }
    };

    fetchProductAndReviews();
  }, [params.id, user]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para dejar una reseña");
      return;
    }
    if (!product || !user) return;

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: product.id,
        userId: user.id,
        userName: user.name || "Usuario",
        rating: newRating,
        comment: newComment,
      });

      toast.success("Reseña agregada");
      setNewComment("");
      setNewRating(5);
      
      const updatedReviews = await reviewService.getReviewsByProductId(product.id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar reseña");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (product) {
      const colorImg = product.colorImages?.find(ci => ci.color === color);
      if (colorImg) {
        setCurrentImage(colorImg.image);
      } else {
        setCurrentImage(product.image);
      }
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      router.push('/login');
      return;
    }

    if (!product) return;

    if (!selectedSize || !selectedColor) {
      toast.error('Por favor selecciona talla y color');
      return;
    }

    if (quantity > product.inventory) {
      toast.error('Cantidad no disponible en inventario');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: currentImage || product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <ImageZoom
            src={currentImage || product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({reviews.length} reseñas)</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              <span className="font-medium">Stock disponible:</span>
              <span className={product.inventory < 10 ? 'text-destructive font-semibold' : ''}>
                {product.inventory} unidades
              </span>
            </div>
          </Card>

          <div>
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Materiales</h3>
            <div className="flex gap-2 flex-wrap">
              {product.materials?.map((material) => (
                <Badge key={material} variant="outline">{material}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Ruler className="h-4 w-4" />
                Talla
              </label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una talla" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Palette className="h-4 w-4" />
                Color
              </label>
              <Select value={selectedColor} onValueChange={handleColorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cantidad</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  disabled={quantity >= product.inventory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.inventory === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </Button>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Reseñas de Clientes</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Review List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No hay reseñas todavía. ¡Sé el primero!</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Escribir una reseña</h3>
              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Inicia sesión para dejar tu opinión</p>
                  <Button onClick={() => router.push('/login')}>Iniciar Sesión</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Calificación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Comentario</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Cuéntanos qué te pareció el producto..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="w-full"
                  >
                    {isSubmittingReview ? 'Enviando...' : 'Publicar Reseña'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
