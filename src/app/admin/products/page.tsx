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

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);

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
    </div>
  );
}
