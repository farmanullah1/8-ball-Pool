import type { Ball } from '../types';
import { Vector2D } from '../physics/vector2d';
import { POCKETS, TABLE_WIDTH, TABLE_HEIGHT } from '../constants/game';

export class PoolAI {
  static calculateShot(balls: Ball[], suit?: 'solids' | 'stripes'): { angle: number; power: number } | null {
    const cueBall = balls.find(b => b.id === 0);
    if (!cueBall || cueBall.isPocketed) return null;

    // 1. Identify Legal Targets
    const remainingSuitBalls = balls.filter(b => {
      if (b.isPocketed || b.id === 0 || b.type === 'black') return false;
      if (!suit) return true;
      return (suit === 'solids' && b.type === 'solid') || (suit === 'stripes' && b.type === 'stripe');
    });

    let targetBalls = remainingSuitBalls;
    const isEndGame = suit && remainingSuitBalls.length === 0;
    if (isEndGame) {
      const blackBall = balls.find(b => b.type === 'black' && !b.isPocketed);
      if (blackBall) targetBalls = [blackBall];
    }

    if (targetBalls.length === 0) return null;

    // 2. Strategic Evaluation
    let bestShot: { angle: number; power: number } | null = null;
    let highestScore = -Infinity;

    for (const ball of targetBalls) {
      for (const pocket of POCKETS) {
        const bPos = Vector2D.fromObject(ball.position);
        const pPos = Vector2D.fromObject(pocket);
        const cPos = Vector2D.fromObject(cueBall.position);

        // Vector from ball to pocket
        const ballToPocket = pPos.sub(bPos).normalize();
        
        // Impact point for the cue ball
        const impactPoint = bPos.sub(ballToPocket.multiply(ball.radius * 2));
        
        // Vector from cue ball to impact point
        const shotDir = impactPoint.sub(cPos);
        const angle = Math.atan2(shotDir.y, shotDir.x);
        const distToImpact = shotDir.magnitude();
        const distToPocket = bPos.distanceTo(pPos);

        // 3. Collision Path Verification (Simplified)
        let isPathClear = true;
        for (const other of balls) {
           if (other.id === ball.id || other.id === 0 || other.isPocketed) continue;
           // Check if 'other' obstructs cue-ball -> impactPoint
        }

        if (!isPathClear) continue;

        // 4. Strategic Scoring
        // Prefer: Shorter ball-to-pocket distance, straighter angles
        const alignment = ballToPocket.dot(shotDir.normalize());
        if (alignment < 0.2) continue; // Too thin of a cut

        let score = (1 / distToPocket) * 1000 + (alignment * 50);
        
        // Positional Leave Bonus (Prefer staying center-table)
        const predictedCuePos = impactPoint.add(shotDir.normalize().multiply(20)); // Very rough
        const centerDist = Math.sqrt((predictedCuePos.x - TABLE_WIDTH/2)**2 + (predictedCuePos.y - TABLE_HEIGHT/2)**2);
        score += (1 / (centerDist + 1)) * 100;

        if (score > highestScore) {
          highestScore = score;
          const power = Math.min(Math.max(distToImpact / 8 + distToPocket / 10, 15), 50);
          bestShot = { angle, power };
        }
      }
    }

    // Add Human-like variance
    if (bestShot) {
      const difficulty = 0.05; // Lower is harder
      bestShot.angle += (Math.random() - 0.5) * difficulty;
      bestShot.power *= (0.95 + Math.random() * 0.1);
    }

    return bestShot;
  }
}
