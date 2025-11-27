"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";
import { Barcode as BarcodeIcon, X } from "lucide-react";

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar productos");
      }
    };

    fetchProducts();
  }, [isAdmin, isAuthenticated, router]);

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      await productService.deleteProduct(id);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      toast.success("Producto eliminado");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Productos</h1>

      <Link href="/admin/create-product">
        <Button className="mb-6">Crear nuevo producto</Button>
      </Link>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-black text-white">
                <th className="p-3">Imagen</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Inventario</th>
                <th className="p-3">Código</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">
                    <div className="relative w-14 h-14">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">${p.price.toFixed(2)}</td>
                  <td className="p-3">{p.inventory}</td>
                  <td className="p-3">
                    {p.barcode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <BarcodeIcon className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin código</span>
                    )}
                  </td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    <Link href={`/admin/edit-product/${p.id}`}>
                      <Button className="bg-black text-white text-sm px-3 py-1 rounded hover:bg-black/90">Editar</Button>
                    </Link>

                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 text-sm px-3 py-1 rounded"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </CardContent>
      </Card>

      {/* Barcode Viewer Modal */}
      {selectedProduct && selectedProduct.barcode && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
              <BarcodeGenerator
                barcode={selectedProduct.barcode}
                productName={selectedProduct.name}
                price={selectedProduct.price}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
