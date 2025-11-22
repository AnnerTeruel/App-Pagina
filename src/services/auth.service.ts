import CrudOperations from "@/lib/crud-operations";
import { User } from "@/types";

class AuthService extends CrudOperations {
    constructor() {
        super("users");
    }

    async login(email: string, password: string): Promise<User | null> {
        const users = await this.findMany({ email, password });
        return users && users.length > 0 ? users[0] : null;
    }

    async register(user: Omit<User, "id" | "createdAt">): Promise<User> {
        return await this.create(user);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const users = await this.findMany({ email });
        return users && users.length > 0 ? users[0] : null;
    }
}

export const authService = new AuthService();
