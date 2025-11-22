import CrudOperations from "@/lib/crud-operations";

export interface PredefinedDesign {
    id?: string;
    name: string;
    description?: string;
    imageUrl: string;
    category?: string;
    createdAt?: string;
}

export interface CustomDesign {
    id?: string;
    userId: string;
    name: string;
    description?: string;
    designData?: any;
    imageUrl?: string;
    status?: string;
    createdAt?: string;
}

export interface DesignRequest {
    id?: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    description: string;
    productType?: string;
    quantity?: number;
    status?: string;
    createdAt?: string;
}

class DesignService extends CrudOperations {
    constructor(tableName: string) {
        super(tableName);
    }
}

// Predefined Designs Service
class PredefinedDesignService extends DesignService {
    constructor() {
        super("predefined_designs");
    }

    async getAllDesigns() {
        return await this.findMany({}, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async getDesignsByCategory(category: string) {
        return await this.findMany({ category }, { orderBy: { column: "createdAt", direction: "desc" } });
    }
}

// Custom Designs Service
class CustomDesignService extends DesignService {
    constructor() {
        super("custom_designs");
    }

    async getUserDesigns(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async submitDesign(design: Omit<CustomDesign, 'id' | 'createdAt'>) {
        return await this.create(design);
    }
}

// Design Requests Service
class DesignRequestService extends DesignService {
    constructor() {
        super("design_requests");
    }

    async getUserRequests(userId: string) {
        return await this.findMany({ userId }, { orderBy: { column: "createdAt", direction: "desc" } });
    }

    async submitRequest(request: Omit<DesignRequest, 'id' | 'createdAt'>) {
        return await this.create(request);
    }

    async getAllRequests() {
        return await this.findMany({}, { orderBy: { column: "createdAt", direction: "desc" } });
    }
}

export const predefinedDesignService = new PredefinedDesignService();
export const customDesignService = new CustomDesignService();
export const designRequestService = new DesignRequestService();
