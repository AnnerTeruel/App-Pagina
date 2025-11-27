import CrudOperations from "@/lib/crud-operations";
import { Category } from "@/types";
import { productService } from "./product.service";

class CategoryService extends CrudOperations<Category> {
    constructor() {
        super("categories");
    }

    async getAllCategories() {
        return await this.findMany({ is_active: true }, {
            orderBy: { column: "name", direction: "asc" },
        });
    }

    async getAllCategoriesAdmin() {
        return await this.findMany(undefined, {
            orderBy: { column: "createdAt", direction: "desc" },
        });
    }

    async createCategory(category: Omit<Category, "id" | "createdAt">) {
        return await this.create(category);
    }

    async updateCategory(id: string, category: Partial<Category>) {
        return await this.update(id, category);
    }

    /**
     * Updates a category and cascades the name change to all products
     */
    async updateCategoryWithCascade(
        id: string,
        oldName: string,
        newData: Partial<Category>
    ): Promise<{ category: any; productsUpdated: number }> {
        // Update the category
        const updatedCategory = await this.update(id, newData);

        let productsUpdated = 0;

        // If name changed, update all products with this category
        if (newData.name && newData.name !== oldName) {
            productsUpdated = await productService.updateProductsCategory(oldName, newData.name);
        }

        return {
            category: updatedCategory,
            productsUpdated
        };
    }

    async deleteCategory(id: string) {
        return await this.delete(id);
    }
}

export const categoryService = new CategoryService();
