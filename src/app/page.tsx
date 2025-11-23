'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category, ContentBlock } from '@/types';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { contentService } from '@/services/content.service';
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroContent, setHeroContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const products = await productService.getAllProducts();
        const featured = products.filter((p: Product) => p.isFeatured).slice(0, 4);
        setFeaturedProducts(featured);

        // Fetch Categories
        const cats = await categoryService.getAllCategories();
        setCategories(cats || []);

        // Fetch Hero Content
        const heroBlock = await contentService.getContentBlock('hero_home');
        if (heroBlock && heroBlock.content) {
          setHeroContent(heroBlock.content);
        } else {
          // Set default if no content in DB
          setHeroContent({
            title: 'Tu Estilo, Tu Diseño',
            subtitle: 'Personaliza ropa y accesorios con la mejor calidad de sublimación. Crea productos únicos que expresen quién eres.',
            image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80',
            ctaText: 'Explorar Tienda',
            ctaLink: '/shop'
          });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        // Set default on error
        setHeroContent({
          title: 'Tu Estilo, Tu Diseño',
          subtitle: 'Personaliza ropa y accesorios con la mejor calidad de sublimación. Crea productos únicos que expresen quién eres.',
          image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80',
          ctaText: 'Explorar Tienda',
          ctaLink: '/shop'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Don't render until content is loaded
  if (isLoading || !heroContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hero = heroContent;

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
                {hero.title}
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-lg">
                {hero.subtitle}
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href={hero.ctaLink || '/shop'}>
                  <Button size="lg" className="text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    {hero.ctaText}
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
                src={hero.image}
                alt="Hero Image"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Link href={`/shop?category=${category.slug}`} key={category.id}>
                  <motion.div 
                    className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Image
                      src={category.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'}
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
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No hay categorías activas. Ve al panel de administración para crear algunas.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tres simples pasos para obtener tus productos personalizados
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-30 -translate-y-1/2"></div>

            {[
              {
                step: '01',
                icon: '🛍️',
                title: 'Elige tu Producto',
                description: 'Selecciona de nuestra amplia variedad de productos: camisas, tazas, gorras y más.'
              },
              {
                step: '02',
                icon: '🎨',
                title: 'Personaliza el Diseño',
                description: 'Sube tu diseño o elige de nuestra galería. Ajusta colores, tamaños y detalles.'
              },
              {
                step: '03',
                icon: '📦',
                title: 'Recibe en Casa',
                description: 'Producimos con la mejor calidad y enviamos directo a tu puerta en 24-48 horas.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="glass rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 relative z-10 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="text-6xl mb-6 float">
                    {item.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Truck, title: 'Envío Rápido', desc: 'Entrega en 24-48 horas en toda la región', delay: '' },
              { icon: Shield, title: 'Garantía de Calidad', desc: 'Productos certificados y garantizados', delay: 'float-delay-1' },
              { icon: Star, title: 'Mejor Precio', desc: 'Precios competitivos y descuentos por volumen', delay: 'float-delay-2' }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={`h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ${feature.delay}`}>
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
