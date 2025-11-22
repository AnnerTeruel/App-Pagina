'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pointsService, UserLevel } from '@/services/points.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Gift, Star, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RewardsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<UserLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      if (user?.id) {
        try {
          const userPoints = await pointsService.getUserPoints(user.id);
          setPoints(userPoints);
          setCurrentLevel(pointsService.calculateLevel(userPoints));
          setNextLevel(pointsService.getNextLevel(userPoints));
        } catch (error) {
          console.error('Error fetching points:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [user]);

  const levels = pointsService.getLevels();

  const calculateProgress = () => {
    if (!currentLevel || !nextLevel) return 100;
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const progress = points - currentLevel.minPoints;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Programa de Recompensas</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Gana puntos con cada compra y desbloquea beneficios exclusivos. 
          ¡Cuanto más compras, más ganas!
        </p>
      </div>

      {!isAuthenticated ? (
        <Card className="max-w-md mx-auto text-center p-8">
          <CardContent>
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Únete al Club</h2>
            <p className="text-muted-foreground mb-6">
              Regístrate ahora y comienza a ganar puntos desde tu primera compra.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Iniciar Sesión o Registrarse
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {/* Status Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tu Nivel Actual</p>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h2 className="text-4xl font-bold text-primary">{currentLevel?.name}</h2>
                    <Badge className={currentLevel?.color}>{currentLevel?.name}</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {points} <span className="text-sm font-normal text-muted-foreground">puntos</span>
                  </p>
                </div>

                {nextLevel && (
                  <div className="flex-1 w-full max-w-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso a {nextLevel.name}</span>
                      <span>{points} / {nextLevel.minPoints}</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      Te faltan {nextLevel.minPoints - points} puntos para subir de nivel
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Levels Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level) => {
              const isCurrent = currentLevel?.name === level.name;
              const isLocked = points < level.minPoints;

              return (
                <Card key={level.name} className={`relative ${isCurrent ? 'border-primary ring-1 ring-primary' : ''} ${isLocked ? 'opacity-75' : ''}`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      Nivel Actual
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <Badge className={level.color}>{level.name}</Badge>
                      {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <CardTitle className="text-2xl">{level.minPoints}+ pts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Rewards Catalog */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Recompensas Disponibles
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { points: 500, discount: 5, title: 'Cupón de $5' },
                { points: 1000, discount: 12, title: 'Cupón de $12' },
                { points: 2500, discount: 35, title: 'Cupón de $35' },
                { points: 5000, discount: 80, title: 'Cupón de $80' },
              ].map((reward) => (
                <Card key={reward.points}>
                  <CardHeader>
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                    <CardDescription>{reward.points} puntos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      disabled={points < reward.points}
                      variant={points >= reward.points ? 'default' : 'outline'}
                    >
                      {points >= reward.points ? 'Canjear' : 'Puntos insuficientes'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
