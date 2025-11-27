'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface BarcodeGeneratorProps {
  barcode: string;
  productName?: string;
  price?: number;
}

export function BarcodeGenerator({ barcode, productName, price }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && barcode) {
      try {
        JsBarcode(canvasRef.current, barcode, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [barcode]);

  const printLabel = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 2], // 4x2 inches label
    });

    // Add product name
    if (productName) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(productName.substring(0, 30), 0.2, 0.3);
    }

    // Add price
    if (price) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${price.toFixed(2)}`, 0.2, 0.7);
    }

    // Add barcode image
    if (canvasRef.current) {
      const barcodeImage = canvasRef.current.toDataURL('image/png');
      pdf.addImage(barcodeImage, 'PNG', 0.2, 1.0, 3.6, 0.8);
    }

    // Add barcode number
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(barcode, 2.0, 1.9, { align: 'center' });

    // Print
    pdf.autoPrint();
    window.open(pdf.output('bloburl'), '_blank');
  };

  const downloadLabel = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 2],
    });

    if (productName) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(productName.substring(0, 30), 0.2, 0.3);
    }

    if (price) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`$${price.toFixed(2)}`, 0.2, 0.7);
    }

    if (canvasRef.current) {
      const barcodeImage = canvasRef.current.toDataURL('image/png');
      pdf.addImage(barcodeImage, 'PNG', 0.2, 1.0, 3.6, 0.8);
    }

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(barcode, 2.0, 1.9, { align: 'center' });

    pdf.save(`label-${barcode}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Código de Barras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center bg-white p-4 rounded-lg">
          <canvas ref={canvasRef} />
        </div>

        <div className="flex gap-2">
          <Button onClick={printLabel} variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={downloadLabel} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Etiqueta: 4x2 pulgadas
        </p>
      </CardContent>
    </Card>
  );
}
