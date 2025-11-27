'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { barcodeService } from '@/services/barcode.service';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { Scan, Package, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ScanRecord {
  barcode: string;
  productName: string;
  action: string;
  time: string;
  newInventory: number;
}

export default function QuickInventoryPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  const [showScanner, setShowScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  // Quick create form
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number | ''>('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [initialInventory, setInitialInventory] = useState(1);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isAdmin) {
    return <div className="text-center text-red-500 text-2xl mt-20">Acceso denegado</div>;
  }

  const handleScan = async (barcode: string) => {
    setShowScanner(false);
    
    try {
      const product = await barcodeService.findProductByBarcode(barcode);

      if (product) {
        // Product exists - increment inventory
        const newInventory = (product.inventory || 0) + 1;
        
        await productService.updateProduct(product.id, {
          ...product,
          inventory: newInventory
        });

        // Add to scan history
        const record: ScanRecord = {
          barcode,
          productName: product.name,
          action: '+1',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          newInventory
        };
        setScanHistory([record, ...scanHistory.slice(0, 9)]);

        toast.success(`${product.name}: ${product.inventory} → ${newInventory}`, {
          description: 'Inventario actualizado'
        });

        // Reopen scanner for next scan
        setTimeout(() => setShowScanner(true), 500);
      } else {
        // Product not found - show quick create form
        setScannedBarcode(barcode);
        setShowQuickCreate(true);
        toast.info('Producto no encontrado. Crear nuevo producto.');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      toast.error('Error al procesar el escaneo');
    }
  };

  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Ingresa un código de barras');
      return;
    }

    await handleScan(manualBarcode.trim());
    setManualBarcode('');
  };

  const handleQuickCreate = async () => {
    if (!newProductName.trim() || !newProductPrice || !newProductCategory.trim()) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      await productService.createProduct({
        name: newProductName,
        description: `Producto creado desde inventario rápido`,
        price: Number(newProductPrice),
        category: newProductCategory,
        inventory: initialInventory,
        image: '/placeholder.jpg',
        barcode: scannedBarcode,
        colors: [],
        sizes: [],
        materials: [],
        isFeatured: false
      });

      // Add to scan history
      const record: ScanRecord = {
        barcode: scannedBarcode,
        productName: newProductName,
        action: 'Creado',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        newInventory: initialInventory
      };
      setScanHistory([record, ...scanHistory.slice(0, 9)]);

      toast.success(`Producto "${newProductName}" creado con ${initialInventory} unidad(es)`);

      // Reset form
      setShowQuickCreate(false);
      setScannedBarcode('');
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory('');
      setInitialInventory(1);

      // Reopen scanner
      setTimeout(() => setShowScanner(true), 500);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-4xl font-bold mb-8">Inventario Rápido</h1>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Quick Create Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Crear Producto Nuevo</CardTitle>
              <p className="text-sm text-muted-foreground">Código: {scannedBarcode}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Nombre *</label>
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Precio *</label>
                <Input
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Categoría *</label>
                <Input
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  placeholder="Ej: Camisas, Gorras, Tazas"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Inventario Inicial</label>
                <Input
                  type="number"
                  value={initialInventory}
                  onChange={(e) => setInitialInventory(Number(e.target.value) || 1)}
                  min={1}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleQuickCreate} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Producto
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuickCreate(false);
                    setScannedBarcode('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scan Button */}
          <Card>
            <CardContent className="p-8">
              <Button
                onClick={() => setShowScanner(true)}
                className="w-full h-32 text-xl"
                size="lg"
              >
                <Scan className="h-12 w-12 mr-4" />
                Escanear Código de Barras
              </Button>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entrada Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Ingresa código de barras"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Button onClick={handleManualSearch}>
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Últimos Escaneos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay escaneos todavía
                </p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((record, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{record.productName}</p>
                        <p className="text-xs text-muted-foreground">{record.barcode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{record.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.time} • Stock: {record.newInventory}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas de Hoy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm">Productos Escaneados</span>
                </div>
                <span className="text-2xl font-bold">{scanHistory.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Productos Creados</span>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  {scanHistory.filter(r => r.action === 'Creado').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">💡 Consejo</h3>
              <p className="text-sm text-muted-foreground">
                Escanea productos para actualizar el inventario automáticamente. 
                Si el producto no existe, podrás crearlo rápidamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
