'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Filter, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        const uniqueCategories = Array.from(new Set(allProducts.map((p: Product) => p.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Availability filter
    if (availabilityFilter === 'in-stock') {
      filtered = filtered.filter(p => p.inventory > 0);
    } else if (availabilityFilter === 'out-of-stock') {
      filtered = filtered.filter(p => p.inventory === 0);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, sortBy, products, searchQuery, availabilityFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tienda</h1>
        <p className="text-muted-foreground">
          Explora nuestra colección completa de productos
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todas las categorías
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Disponibilidad</label>
                <div className="space-y-2">
                  <Button
                    variant={availabilityFilter === 'all' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setAvailabilityFilter('all')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Todos
                  </Button>
                  <Button
                    variant={availabilityFilter === 'in-stock' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setAvailabilityFilter('in-stock')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    En stock
                  </Button>
                  <Button
                    variant={availabilityFilter === 'out-of-stock' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setAvailabilityFilter('out-of-stock')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Agotado
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Mostrando {filteredProducts.length} productos
              </p>
              {searchQuery && (
                <Badge variant="secondary">
                  Búsqueda: "{searchQuery}"
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ordenar por:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="newest">Más nuevos</SelectItem>
                  <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-2">
                No se encontraron productos
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No hay resultados para "${searchQuery}"`
                  : "Intenta ajustar los filtros"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
