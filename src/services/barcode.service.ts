import CrudOperations from '@/lib/crud-operations';
import { createPostgrestClient } from '@/lib/postgrest';
import { Product } from '@/types';

class BarcodeService extends CrudOperations {
    constructor() {
        super('products');
    }

    /**
     * Generate unique barcode for product
     * Format: SH-XXXXXXXXXX (SH = SportHelem)
     */
    generateBarcode(): string {
        const prefix = 'SH';
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const code = `${prefix}-${timestamp}${random}`;
        return code;
    }

    /**
     * Find product by barcode
     */
    async findProductByBarcode(barcode: string): Promise<Product | null> {
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('products')
            .select('*')
            .eq('barcode', barcode)
            .single();

        if (error) {
            console.error('Error finding product by barcode:', error);
            return null;
        }

        return data;
    }

    /**
     * Check if barcode already exists
     */
    async barcodeExists(barcode: string): Promise<boolean> {
        const product = await this.findProductByBarcode(barcode);
        return product !== null;
    }

    /**
     * Generate unique barcode (ensures no duplicates)
     */
    async generateUniqueBarcode(): Promise<string> {
        let barcode = this.generateBarcode();
        let attempts = 0;
        const maxAttempts = 10;

        while (await this.barcodeExists(barcode) && attempts < maxAttempts) {
            barcode = this.generateBarcode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique barcode');
        }

        return barcode;
    }

    /**
     * Validate barcode format
     */
    validateBarcodeFormat(barcode: string): boolean {
        // Format: SH-XXXXXXXXXX (at least 13 characters)
        const regex = /^SH-\d{10,}$/;
        return regex.test(barcode);
    }
}

export const barcodeService = new BarcodeService();
