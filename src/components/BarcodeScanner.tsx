'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        setCameras(devices);
      }
    }).catch((err) => {
      console.error('Error getting cameras:', err);
      setError('No se pudo acceder a la cámara');
    });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;

      // Better camera configuration
      const config = {
        fps: 30, // Increased from 10 to 30 for better detection
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          // Dynamic box size based on screen
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return {
            width: qrboxSize,
            height: Math.floor(qrboxSize * 0.4) // Wider box for barcodes
          };
        },
        aspectRatio: 1.777778, // 16:9 aspect ratio
        disableFlip: false, // Allow image flipping
      };

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        config,
        async (decodedText) => {
          // Successfully scanned - stop scanner immediately
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
              scannerRef.current.clear();
              scannerRef.current = null;
              setIsScanning(false);
            } catch (err) {
              console.error('Error stopping scanner:', err);
            }
          }
          
          // Call the onScan callback
          onScan(decodedText);
        },
        (errorMessage) => {
          // Scanning error (ignore, happens frequently)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError('Error al iniciar el escáner. Verifica los permisos de cámara.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear Código de Barras
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div 
            id="barcode-reader" 
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          />

          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Escaneo
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="w-full">
                Detener Escaneo
              </Button>
            )}
          </div>

          {isScanning && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary">💡 Consejos para mejor escaneo:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Mantén el código dentro del recuadro</li>
                <li>• Asegúrate de tener buena iluminación</li>
                <li>• Mantén la cámara estable (no muevas)</li>
                <li>• Distancia: 10-20 cm del código</li>
                <li>• Si no funciona, prueba entrada manual</li>
              </ul>
            </div>
          )}

          {!isScanning && (
            <p className="text-xs text-muted-foreground text-center">
              Apunta la cámara al código de barras del producto
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
