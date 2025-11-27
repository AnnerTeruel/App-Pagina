import CrudOperations from "@/lib/crud-operations";
import { Product } from "@/types";
import { categoryService } from "./category.service";

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
        // Auto-create category if it doesn't exist
        if (product.category && product.category.trim()) {
            await this.ensureCategoryExists(product.category.trim());
        }

        return await this.create(product);
    }

    async updateProduct(id: string, product: Partial<Product>) {
        // Auto-create category if it doesn't exist and category is being updated
        if (product.category && product.category.trim()) {
            await this.ensureCategoryExists(product.category.trim());
        }

        return await this.update(id, product);
    }

    async deleteProduct(id: string) {
        return await this.delete(id);
    }

    /**
     * Ensures a category exists in the database
     * If it doesn't exist, creates it automatically
     */
    private async ensureCategoryExists(categoryName: string): Promise<void> {
        try {
            // Get all categories
            const categories = await categoryService.getAllCategoriesAdmin();

            // Check if category already exists (case-insensitive)
            const exists = categories.some(
                (cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase()
            );

            if (!exists) {
                // Create new category
                const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
                await categoryService.createCategory({
                    name: categoryName,
                    slug: slug,
                    image: '/placeholder.jpg',
                    is_active: true
                });
                console.log(`Category "${categoryName}" created automatically`);
            }
        } catch (error) {
            console.error('Error ensuring category exists:', error);
            // Don't throw error - allow product creation to continue
        }
    }

    /**
     * Updates category name in all products
     * Used when a category is renamed
     */
    async updateProductsCategory(oldCategoryName: string, newCategoryName: string): Promise<number> {
        try {
            // Get all products with the old category name
            const allProducts = await this.getAllProducts();
            const productsToUpdate = allProducts.filter(
                (p: any) => p.category?.toLowerCase() === oldCategoryName.toLowerCase()
            );

            // Update each product
            let updatedCount = 0;
            for (const product of productsToUpdate) {
                await this.update(product.id, { category: newCategoryName });
                updatedCount++;
            }

            console.log(`Updated ${updatedCount} products from "${oldCategoryName}" to "${newCategoryName}"`);
            return updatedCount;
        } catch (error) {
            console.error('Error updating products category:', error);
            throw error;
        }
    }
}

export const productService = new ProductService();
