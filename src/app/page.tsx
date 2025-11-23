'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Star, Shield, Truck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const categories = [
  {
    name: 'Camisas',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    href: '/shop?category=camisas'
  },
  {
    name: 'Tazas',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
    href: '/shop?category=tazas'
  },
  {
    name: 'Gorras',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    href: '/shop?category=gorras'
  },
  {
    name: 'Sudaderas',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
    href: '/shop?category=sudaderas'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        const featured = products.filter((p: Product) => p.isFeatured).slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10">
                <Sparkles className="mr-2 h-4 w-4" />
                Nueva Colección 2024
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                Tu Estilo, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Tu Diseño
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-lg">
                Personaliza ropa y accesorios con la mejor calidad de sublimación. Crea productos únicos que expresen quién eres.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href="/shop">
                  <Button size="lg" className="text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Explorar Tienda
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/custom-design">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full border-2">
                    Diseñar Ahora
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              initial={{ opacity: 0, x: 100, rotate: 10 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80"
                alt="Moda Urbana"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="font-semibold text-lg">Colección Urbana</p>
                <p className="text-sm opacity-80">Descubre lo nuevo</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Categorías Populares</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos listos para personalizar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link href={category.href} key={category.name}>
                <motion.div 
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white tracking-wide">{category.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Truck, title: 'Envío Rápido', desc: 'Entrega en 24-48 horas en toda la región' },
              { icon: Shield, title: 'Garantía de Calidad', desc: 'Productos certificados y garantizados' },
              { icon: Star, title: 'Mejor Precio', desc: 'Precios competitivos y descuentos por volumen' }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Productos Destacados</h2>
              <p className="text-muted-foreground text-lg">Lo más vendido de la semana</p>
            </motion.div>
            <Link href="/shop">
              <Button variant="ghost" className="hidden md:flex">
                Ver Todo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
               [1, 2, 3, 4].map((_, i) => (
                <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
              ))
            )}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/shop">
              <Button size="lg" variant="outline" className="w-full">
                Ver Todo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground px-6 py-24 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">¿Listo para crear algo único?</h2>
              <p className="text-xl opacity-90">
                Utiliza nuestro diseñador en línea o solicita una cotización para pedidos al por mayor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/custom-design">
                  <Button size="lg" variant="secondary" className="text-lg h-14 px-8 rounded-full">
                    Empezar a Diseñar
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full bg-transparent border-primary-foreground hover:bg-primary-foreground/10 text-primary-foreground">
                    Contáctanos
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
