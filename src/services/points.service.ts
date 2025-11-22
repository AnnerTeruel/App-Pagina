import CrudOperations from '@/lib/crud-operations';
import { createPostgrestClient } from '@/lib/postgrest';

export interface PointsHistory {
    id: string;
    userId: string;
    amount: number;
    reason: 'purchase' | 'redemption' | 'bonus' | 'refund';
    description?: string;
    createdAt: string;
}

export interface UserLevel {
    name: 'Bronze' | 'Silver' | 'Gold';
    minPoints: number;
    benefits: string[];
    color: string;
}

const LEVELS: UserLevel[] = [
    {
        name: 'Bronze',
        minPoints: 0,
        benefits: ['1 punto por cada $10', 'Acceso a ofertas básicas'],
        color: 'bg-orange-500'
    },
    {
        name: 'Silver',
        minPoints: 1000,
        benefits: ['1.5 puntos por cada $10', 'Envíos gratis > $50', 'Ofertas exclusivas'],
        color: 'bg-slate-400'
    },
    {
        name: 'Gold',
        minPoints: 5000,
        benefits: ['2 puntos por cada $10', 'Envíos gratis siempre', 'Regalo de cumpleaños', 'Soporte prioritario'],
        color: 'bg-yellow-500'
    }
];

class PointsService extends CrudOperations<PointsHistory> {
    constructor() {
        super('points_history');
    }

    calculateLevel(points: number): UserLevel {
        return LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
    }

    getNextLevel(points: number): UserLevel | null {
        const currentLevel = this.calculateLevel(points);
        const nextLevelIndex = LEVELS.findIndex(l => l.name === currentLevel.name) + 1;
        return LEVELS[nextLevelIndex] || null;
    }

    getLevels(): UserLevel[] {
        return LEVELS;
    }

    async getUserPoints(userId: string): Promise<number> {
        const client = createPostgrestClient();
        const { data, error } = await client
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user points:', error);
            return 0;
        }

        return data?.points || 0;
    }

    async addPoints(userId: string, amount: number, reason: PointsHistory['reason'], description?: string) {
        const client = createPostgrestClient();

        // 1. Add to history
        await this.create({
            userId,
            amount,
            reason,
            description
        });

        // 2. Update user balance
        const currentPoints = await this.getUserPoints(userId);
        const { error } = await client
            .from('users')
            .update({ points: currentPoints + amount })
            .eq('id', userId);

        if (error) throw error;

        return currentPoints + amount;
    }

    async redeemPoints(userId: string, amount: number, description: string = 'Canje de recompensas') {
        const currentPoints = await this.getUserPoints(userId);

        if (currentPoints < amount) {
            throw new Error('Puntos insuficientes');
        }

        return this.addPoints(userId, -amount, 'redemption', description);
    }

    async getHistory(userId: string) {
        return this.findMany({ userId }, { orderBy: { column: 'createdAt', direction: 'desc' } });
    }
}

export const pointsService = new PointsService();
