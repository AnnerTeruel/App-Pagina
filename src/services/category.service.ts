import CrudOperations from "@/lib/crud-operations";
import { Category } from "@/types";

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

    async deleteCategory(id: string) {
        return await this.delete(id);
    }
}

export const categoryService = new CategoryService();
