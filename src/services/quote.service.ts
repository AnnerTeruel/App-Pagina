import CrudOperations from "@/lib/crud-operations";

export interface Quote {
    id?: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    productType: string;
    quantity: number;
    description?: string;
    estimatedPrice?: number;
    status?: string;
    createdAt?: string;
}

class QuoteService extends CrudOperations {
    constructor() {
        super("quotes");
    }

    async getUserQuotes(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async submitQuote(quote: Omit<Quote, 'id' | 'createdAt'>) {
        return await this.create(quote);
    }

    async getAllQuotes() {
        return await this.findMany({}, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    calculateEstimatedPrice(productType: string, quantity: number): number {
        // Base prices por tipo de producto
        const basePrices: Record<string, number> = {
            'camiseta': 150,
            'taza': 80,
            'gorra': 120,
            'sudadera': 250,
            'otro': 100,
        };

        const basePrice = basePrices[productType.toLowerCase()] || basePrices['otro'];

        // Descuentos por volumen
        let discount = 1;
        if (quantity >= 50) discount = 0.7; // 30% descuento
        else if (quantity >= 20) discount = 0.8; // 20% descuento
        else if (quantity >= 10) discount = 0.9; // 10% descuento

        return basePrice * quantity * discount;
    }
}

export const quoteService = new QuoteService();
