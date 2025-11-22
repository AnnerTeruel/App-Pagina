"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { productService } from "@/services/product.service";
import { fileToBase64 } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { isAdmin, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState(0);

  const [images, setImages] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<{ color: string; image: string }[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  const [imageInput, setImageInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colorImageInput, setColorImageInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchProduct = async () => {
      try {
        const p = await productService.getProductById(id as string);
        if (!p) {
          router.push("/admin/products");
          return;
        }

        setProduct(p);
        setName(p.name);
        setDescription(p.description);
        setPrice(p.price);
        setCategory(p.category);
        setInventory(p.inventory);
        setImages(p.images || []);
        setColors(p.colors || []);
        setColorImages(p.colorImages || []);
        setSizes(p.sizes || []);
        setMaterials(p.materials || []);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el producto");
      }
    };

    fetchProduct();
  }, [isAdmin, isAuthenticated, id, router]);

  const addToList = (value: string, list: string[], setList: any, setInput: any) => {
    if (!value.trim()) return;
    setList([...list, value.trim()]);
    setInput("");
  };

  const removeFromList = (index: number, list: string[], setList: any) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, setInput: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setInput(base64);
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la imagen");
    }
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    setColors([...colors, colorInput.trim()]);
    
    if (colorImageInput.trim()) {
      setColorImages([...colorImages, { color: colorInput.trim(), image: colorImageInput.trim() }]);
    }
    
    setColorInput("");
    setColorImageInput("");
  };

  const removeColor = (index: number) => {
    const colorToRemove = colors[index];
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
    setColors(updatedColors);

    const updatedColorImages = colorImages.filter(ci => ci.color !== colorToRemove);
    setColorImages(updatedColorImages);
  };

  const updateProduct = async () => {
    try {
      await productService.updateProduct(id as string, {
        name,
        description,
        price: Number(price),
        category,
        inventory,
        images,
        colors,
        colorImages,
        sizes,
        materials,
      });

      toast.success("Producto actualizado");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el producto");
    }
  };

  if (!product) return <p>Cargando...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Editar Producto</h1>

      <Card>
        <CardContent className="space-y-6 mt-6">
          {/* Nombre */}
          <div>
            <label className="font-semibold">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Descripción */}
          <div>
            <label className="font-semibold">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="font-semibold">Precio</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="font-semibold">Categoría</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          {/* Inventario */}
          <div>
            <label className="font-semibold">Inventario</label>
            <Input
              type="number"
              value={inventory}
              onChange={(e) => setInventory(Number(e.target.value))}
            />
          </div>

          {/* IMÁGENES */}
          <div>
            <label className="font-semibold">Imágenes (URL)</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://imagen.jpg"
              />
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-10"
                  onChange={(e) => handleImageUpload(e, setImageInput)}
                />
                <Button variant="outline" size="icon" className="pointer-events-none">
                  <span className="text-xs">📂</span>
                </Button>
              </div>
              <Button onClick={() => addToList(imageInput, images, setImages, setImageInput)}>
                Añadir
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              {images.map((img, i) => (
                <Badge key={i} onClick={() => removeFromList(i, images, setImages)}>
                  {img} ✕
                </Badge>
              ))}
            </div>
          </div>

          {/* COLORES */}
          <div>
            <label className="font-semibold">Colores</label>
            <div className="flex gap-2 mt-1 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Nombre del Color</label>
                <Input 
                  value={colorInput} 
                  onChange={(e) => setColorInput(e.target.value)} 
                  placeholder="Ej: Rojo"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Imagen del Color (Opcional)</label>
                <div className="flex gap-2">
                  <Input 
                    value={colorImageInput} 
                    onChange={(e) => setColorImageInput(e.target.value)} 
                    placeholder="https://..."
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-10"
                      onChange={(e) => handleImageUpload(e, setColorImageInput)}
                    />
                    <Button variant="outline" size="icon" className="pointer-events-none">
                      <span className="text-xs">📂</span>
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={addColor}>
                Añadir
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              {colors.map((c, i) => {
                const colorImg = colorImages.find(ci => ci.color === c);
                return (
                  <Badge key={i} onClick={() => removeColor(i)} className="flex items-center gap-2 cursor-pointer hover:bg-destructive">
                    {colorImg && (
                      <img src={colorImg.image} alt={c} className="w-4 h-4 rounded-full object-cover" />
                    )}
                    {c} ✕
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* TALLAS */}
          <div>
            <label className="font-semibold">Tallas</label>
            <div className="flex gap-2 mt-1">
              <Input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} />
              <Button onClick={() => addToList(sizeInput, sizes, setSizes, setSizeInput)}>
                Añadir
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              {sizes.map((s, i) => (
                <Badge key={i} onClick={() => removeFromList(i, sizes, setSizes)}>
                  {s} ✕
                </Badge>
              ))}
            </div>
          </div>

          {/* MATERIALES */}
          <div>
            <label className="font-semibold">Materiales</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
              />
              <Button
                onClick={() =>
                  addToList(materialInput, materials, setMaterials, setMaterialInput)
                }
              >
                Añadir
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              {materials.map((m, i) => (
                <Badge key={i} onClick={() => removeFromList(i, materials, setMaterials)}>
                  {m} ✕
                </Badge>
              ))}
            </div>
          </div>
 
          {/* Botón actualizar */}
          <Button className="w-full py-3" onClick={updateProduct}>
            Actualizar producto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
