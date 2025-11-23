import CrudOperations from "@/lib/crud-operations";
import { ContentBlock } from "@/types";

class ContentService extends CrudOperations<ContentBlock> {
    constructor() {
        super("content_blocks");
    }

    async getContentBlock(sectionName: string) {
        const blocks = await this.findMany({ section_name: sectionName });
        return blocks && blocks.length > 0 ? blocks[0] : null;
    }

    async updateContentBlock(sectionName: string, content: any) {
        const existing = await this.getContentBlock(sectionName);

        if (existing) {
            return await this.update(existing.id, { content, updatedAt: new Date().toISOString() });
        } else {
            return await this.create({
                section_name: sectionName,
                content,
                updatedAt: new Date().toISOString()
            } as any);
        }
    }
}

export const contentService = new ContentService();
