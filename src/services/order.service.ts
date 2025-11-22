import CrudOperations from "@/lib/crud-operations";
import { Order } from "@/types";

class OrderService extends CrudOperations {
    constructor() {
        super("orders");
    }

    async createOrder(order: Omit<Order, 'id'>) {
        return await this.create(order);
    }

    async getOrdersByUserId(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async getAllOrders() {
        return await this.findMany({}, { orderBy: { column: "createdAt", direction: "desc" } });
    }
}

export const orderService = new OrderService();
