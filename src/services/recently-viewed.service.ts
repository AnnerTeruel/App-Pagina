import CrudOperations from "@/lib/crud-operations";

export interface RecentlyViewed {
    id?: string;
    userId: string;
    productId: string;
    viewedAt?: string;
}

class RecentlyViewedService extends CrudOperations {
    constructor() {
        super("recently_viewed");
    }

    async addView(userId: string, productId: string) {
        try {
            // Try to update existing record first
            const existing = await this.findMany({ userId, productId });

            if (existing && existing.length > 0) {
                // Update viewedAt timestamp
                return await this.update(existing[0].id, { viewedAt: new Date().toISOString() });
            } else {
                // Create new record
                return await this.create({ userId, productId });
            }
        } catch (error) {
            console.error('Error adding view:', error);
            return null;
        }
    }

    async getRecentlyViewed(userId: string, limit: number = 10) {
        try {
            const views = await this.findMany(
                { userId },
                { orderBy: { column: "viewedAt", direction: "desc" }, limit }
            );
            return views || [];
        } catch (error) {
            console.error('Error getting recently viewed:', error);
            return [];
        }
    }
}

export const recentlyViewedService = new RecentlyViewedService();
