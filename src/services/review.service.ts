import CrudOperations from "@/lib/crud-operations";

export interface Review {
    id?: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    userName: string;
    createdAt?: string;
}

class ReviewService extends CrudOperations {
    constructor() {
        super("reviews");
    }

    async getReviewsByProductId(productId: string) {
        return await this.findMany({ productId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async createReview(review: Review) {
        return await this.create(review);
    }
}

export const reviewService = new ReviewService();
