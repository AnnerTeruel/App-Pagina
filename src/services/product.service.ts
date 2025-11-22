import CrudOperations from "@/lib/crud-operations";
import { Product } from "@/types";

class ProductService extends CrudOperations {
    constructor() {
        super("products");
    }

    async getAllProducts() {
        return await this.findMany(undefined, {
            orderBy: { column: "createdAt", direction: "desc" },
        });
    }

    async getProductById(id: string) {
        return await this.findById(id);
    }

    async createProduct(product: Omit<Product, "id" | "createdAt">) {
        return await this.create(product);
    }

    async updateProduct(id: string, product: Partial<Product>) {
        return await this.update(id, product);
    }

    async deleteProduct(id: string) {
        return await this.delete(id);
    }
}

export const productService = new ProductService();
