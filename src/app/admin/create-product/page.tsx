'use client';

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { barcodeService } from "@/services/barcode.service";
import { fileToBase64 } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";
import { Scan, Barcode } from "lucide-react";


export default function CreateProductAdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!isAdmin) {
    return <div style={{ fontSize: "28px", color: "red" }}>NO SOS ADMIN</div>;
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState(0);
  const [barcode, setBarcode] = useState("");

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

  const [showScanner, setShowScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  // Generate unique barcode on component mount
  useEffect(() => {
    const generateNewBarcode = async () => {
      try {
        const newBarcode = await barcodeService.generateUniqueBarcode();
        setBarcode(newBarcode);
      } catch (error) {
        console.error('Error generating barcode:', error);
        toast.error('Error al generar código de barras');
      }
    };

    if (!barcode) {
      generateNewBarcode();
    }
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = async (scannedCode: string) => {
    setShowScanner(false);
    setIsSearching(true);

    try {
      const product = await barcodeService.findProductByBarcode(scannedCode);

      if (product) {
        // Product found - auto-fill form (except images)
        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(product.price || '');
        setCategory(product.category || '');
        setInventory(product.inventory || 0);
        setBarcode(product.barcode || scannedCode);
        setColors(product.colors || []);
        setSizes(product.sizes || []);
        setMaterials(product.materials || []);

        toast.success(`Producto encontrado: ${product.name}`);
      } else {
        // Product not found - keep barcode, clear other fields
        setBarcode(scannedCode);
        toast.info('Producto no encontrado. Completa los datos para crear uno nuevo.');
      }
    } catch (error) {
      console.error('Error searching product:', error);
      toast.error('Error al buscar producto');
    } finally {
      setIsSearching(false);
    }
  };

  // Manual barcode search
  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) {
      toast.error('Ingresa un código de barras');
      return;
    }

    await handleBarcodeScan(barcode);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !price || !category.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    try {
      await productService.createProduct({
        name,
        description,
        price: Number(price),
        category,
        inventory,
        image: images[0] || "/placeholder.jpg",
        colors,
        colorImages,
        sizes,
        materials,
        isFeatured: false,
        barcode,
      });

      toast.success("Producto creado correctamente");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el producto");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-4xl font-bold mb-4">Crear Producto (ADMIN)</h1>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 mt-6">
              {/* BARCODE SECTION */}
              <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <label className="font-semibold flex items-center gap-2">
                    <Barcode className="h-5 w-5" />
                    Código de Barras
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScanner(true)}
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Escanear
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="SH-XXXXXXXXXX"
                    readOnly={isSearching}
                  />
                  <Button
                    type="button"
                    onClick={handleBarcodeSearch}
                    disabled={isSearching || !barcode}
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Escanea un producto existente para auto-completar los datos, o usa el código generado para un producto nuevo.
                </p>
              </div>

              {/* NOMBRE */}
              <div>
                <label className="font-semibold">Nombre *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="font-semibold">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* PRECIO */}
          <div>
            <label className="font-semibold">Precio *</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
            />
          </div>

          {/* CATEGORÍA */}
          <div>
            <label className="font-semibold">Categoría *</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          {/* INVENTARIO */}
          <div>
            <label className="font-semibold">Inventario inicial</label>
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

          {/* BOTÓN */}
          <Button className="w-full py-3" onClick={handleSubmit}>
            Crear producto
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Sidebar - Barcode Generator */}
    <div className="lg:col-span-1">
      {barcode && (
        <BarcodeGenerator
          barcode={barcode}
          productName={name}
          price={typeof price === 'number' ? price : undefined}
        />
      )}
    </div>
  </div>
</div>
  );
}
