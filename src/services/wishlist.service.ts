import CrudOperations from "@/lib/crud-operations";

export interface WishlistItem {
    id?: string;
    userId: string;
    productId: string;
    createdAt?: string;
}

class WishlistService extends CrudOperations {
    constructor() {
        super("wishlist");
    }

    async getWishlist(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async addToWishlist(userId: string, productId: string) {
        return await this.create({ userId, productId });
    }

    async removeFromWishlist(userId: string, productId: string) {
        const items = await this.findMany({ userId, productId });
        if (items && items.length > 0) {
            return await this.delete(items[0].id);
        }
    }

    async isInWishlist(userId: string, productId: string): Promise<boolean> {
        const items = await this.findMany({ userId, productId });
        return items && items.length > 0;
    }
}

export const wishlistService = new WishlistService();
