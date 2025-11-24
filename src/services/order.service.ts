import CrudOperations from "@/lib/crud-operations";
import { Order } from "@/types";
import { pointsService } from './points.service';
import { validateEnv } from "@/lib/api-utils";
import { createPostgrestClient } from '@/lib/postgrest';

class OrderService extends CrudOperations {
    constructor() {
        super("orders");
    }

    async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>) {
        validateEnv();

        const { data: createdOrder, error } = await this.client
            .from(this.tableName)
            .insert([orderData])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }

        // Award points (1 point per $10 spent)
        if (createdOrder && createdOrder.userId) {
            try {
                const pointsToAward = Math.floor(createdOrder.total / 10);
                if (pointsToAward > 0) {
                    await pointsService.addPoints(
                        createdOrder.userId,
                        pointsToAward,
                        'purchase',
                        `Compra #${createdOrder.id.slice(0, 8)}`
                    );
                }
            } catch (pointsError: any) {
                console.error('Error awarding points:', pointsError);
            }
        }

        return createdOrder;
    }

    async getOrdersByUserId(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async getAllOrders() {
        return await this.findMany({}, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    /**
     * Get all orders for a specific user (alias for getOrdersByUserId)
     */
    async getUserOrders(userId: string): Promise<Order[]> {
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('orders')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

        if (error) {
            throw new Error(`Failed to get user orders: ${error.message}`);
        }

        return data || [];
    }
}

export const orderService = new OrderService();
