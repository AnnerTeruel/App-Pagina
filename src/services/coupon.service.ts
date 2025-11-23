import CrudOperations from '@/lib/crud-operations';
import { createPostgrestClient } from '@/lib/postgrest';

export interface Coupon {
    id: string;
    code: string;
    userId: string;
    discount: number;
    isUsed: boolean;
    usedAt?: string;
    orderId?: string;
    createdAt: string;
}

class CouponService extends CrudOperations<Coupon> {
    constructor() {
        super('coupons');
    }

    /**
     * Create a new coupon
     */
    async createCoupon(userId: string, code: string, discount: number): Promise<Coupon> {
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('coupons')
            .insert({
                userId,
                code,
                discount,
                isUsed: false
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create coupon: ${error.message}`);
        }

        return data;
    }

    /**
     * Validate a coupon code
     * Returns the coupon if valid, throws error if invalid
     */
    async validateCoupon(code: string, userId: string): Promise<Coupon> {
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('userId', userId)
            .eq('isUsed', false)
            .single();

        if (error || !data) {
            throw new Error('Cupón inválido o ya utilizado');
        }

        return data;
    }

    /**
     * Mark coupon as used
     */
    async applyCoupon(code: string, orderId: string): Promise<Coupon> {
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('coupons')
            .update({
                isUsed: true,
                usedAt: new Date().toISOString(),
                orderId
            })
            .eq('code', code)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to apply coupon: ${error.message}`);
        }

        return data;
    }

    /**
     * Get all coupons for a user
     */
    async getUserCoupons(userId: string, includeUsed: boolean = false): Promise<Coupon[]> {
        const client = createPostgrestClient();

        let query = client
            .from('coupons')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

        if (!includeUsed) {
            query = query.eq('isUsed', false);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get user coupons: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get available (unused) coupons for a user
     */
    async getAvailableCoupons(userId: string): Promise<Coupon[]> {
        return this.getUserCoupons(userId, false);
    }
}

export const couponService = new CouponService();
