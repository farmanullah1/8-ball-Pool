import type { Ball, Vector2D as Vector2DType } from '../types';
import { Vector2D } from './vector2d';
import { 
  TABLE_WIDTH, 
  TABLE_HEIGHT, 
  BALL_RADIUS, 
  FRICTION, 
  WALL_BOUNCE, 
  BALL_BOUNCE, 
  MIN_VELOCITY,
  POCKETS,
  POCKET_RADIUS
} from '../constants/game';

export class PhysicsEngine {
  static update(balls: Ball[], onCollision?: (v: number) => void, cueSpin?: Vector2DType): { updatedBalls: Ball[]; pocketedBallIds: number[]; firstBallHitId: number | null } {
    const updatedBalls = balls.map(ball => ({
      ...ball,
      position: { ...ball.position },
      velocity: { ...ball.velocity }
    }));
    
    const pocketedBallIds: number[] = [];
    let firstBallHitId: number | null = null;

    // 1. Position & Advanced Friction
    updatedBalls.forEach(ball => {
      if (ball.isPocketed) return;

      const vel = Vector2D.fromObject(ball.velocity);
      const mag = vel.magnitude();

      if (mag > 0) {
        // Position update
        ball.position.x += ball.velocity.x;
        ball.position.y += ball.velocity.y;

        // Realistic Deceleration (Friction increases slightly at very low speeds)
        const rollingResistance = mag < 2 ? 0.035 : 0.025;
        const drag = 1 - (rollingResistance * FRICTION);
        ball.velocity.x *= drag;
        ball.velocity.y *= drag;

        if (mag < MIN_VELOCITY) {
          ball.velocity = { x: 0, y: 0 };
        }
      }
    });

    // 2. Cushion Collisions with Energy Damping
    updatedBalls.forEach(ball => {
      if (ball.isPocketed) return;

      let hit = false;
      if (ball.position.x - BALL_RADIUS < 0) {
        ball.position.x = BALL_RADIUS; ball.velocity.x *= -WALL_BOUNCE; hit = true;
      } else if (ball.position.x + BALL_RADIUS > TABLE_WIDTH) {
        ball.position.x = TABLE_WIDTH - BALL_RADIUS; ball.velocity.x *= -WALL_BOUNCE; hit = true;
      }

      if (ball.position.y - BALL_RADIUS < 0) {
        ball.position.y = BALL_RADIUS; ball.velocity.y *= -WALL_BOUNCE; hit = true;
      } else if (ball.position.y + BALL_RADIUS > TABLE_HEIGHT) {
        ball.position.y = TABLE_HEIGHT - BALL_RADIUS; ball.velocity.y *= -WALL_BOUNCE; hit = true;
      }
      
      if (hit && onCollision) onCollision(Math.abs(ball.velocity.x + ball.velocity.y) * 2);
    });

    // 3. Ball-to-Ball Elastic Collisions
    for (let i = 0; i < updatedBalls.length; i++) {
      const b1 = updatedBalls[i];
      if (b1.isPocketed) continue;

      for (let j = i + 1; j < updatedBalls.length; j++) {
        const b2 = updatedBalls[j];
        if (b2.isPocketed) continue;

        const pos1 = Vector2D.fromObject(b1.position);
        const pos2 = Vector2D.fromObject(b2.position);
        const dist = pos1.distanceTo(pos2);

        if (dist < BALL_RADIUS * 2) {
          if (firstBallHitId === null) {
            if (b1.id === 0) firstBallHitId = b2.id;
            else if (b2.id === 0) firstBallHitId = b1.id;
          }

          if (onCollision) {
            const v1 = Vector2D.fromObject(b1.velocity);
            const v2 = Vector2D.fromObject(b2.velocity);
            onCollision(v1.sub(v2).magnitude());
          }

          this.resolveBallCollision(b1, b2, cueSpin);
          
          // Static Separation
          const overlap = BALL_RADIUS * 2 - dist;
          const normal = pos1.sub(pos2).normalize();
          const sep = normal.multiply(overlap * 0.505);
          b1.position.x += sep.x; b1.position.y += sep.y;
          b2.position.x -= sep.x; b2.position.y -= sep.y;
        }
      }
    }

    // 4. Pocket Logic (Centripetal suction)
    updatedBalls.forEach(ball => {
      if (ball.isPocketed) return;

      const pos = Vector2D.fromObject(ball.position);
      for (const pocket of POCKETS) {
        const pPos = Vector2D.fromObject(pocket);
        const dist = pos.distanceTo(pPos);
        
        if (dist < POCKET_RADIUS) {
          // Gravitational pull towards center
          const pull = pPos.sub(pos).normalize().multiply(0.4);
          ball.velocity.x += pull.x;
          ball.velocity.y += pull.y;
          
          if (dist < POCKET_RADIUS * 0.6) {
            ball.isPocketed = true;
            ball.velocity = { x: 0, y: 0 };
            pocketedBallIds.push(ball.id);
            break;
          }
        }
      }
    });

    return { updatedBalls, pocketedBallIds, firstBallHitId };
  }

  private static resolveBallCollision(b1: Ball, b2: Ball, cueSpin?: Vector2DType) {
    const p1 = Vector2D.fromObject(b1.position);
    const p2 = Vector2D.fromObject(b2.position);
    const v1 = Vector2D.fromObject(b1.velocity);
    const v2 = Vector2D.fromObject(b2.velocity);

    const normal = p1.sub(p2).normalize();
    const relVel = v1.sub(v2);
    const velAlongNormal = relVel.dot(normal);

    if (velAlongNormal > 0) return;

    // Energy transfer with slight loss
    const impulseMag = -(1 + BALL_BOUNCE) * velAlongNormal / 2;
    const impulse = normal.multiply(impulseMag);
    
    let resV1 = v1.add(impulse);
    let resV2 = v2.sub(impulse);

    // Apply Spin Transfer (Advanced English)
    if (cueSpin && (b1.id === 0 || b2.id === 0)) {
      const tangent = new Vector2D(-normal.y, normal.x);
      const effectScale = 0.7;
      
      if (b1.id === 0) {
        const drawFollow = normal.multiply(-cueSpin.y * impulseMag * effectScale);
        const sideSpin = tangent.multiply(cueSpin.x * impulseMag * effectScale);
        resV1 = resV1.add(drawFollow).add(sideSpin);
      } else {
        const drawFollow = normal.multiply(cueSpin.y * impulseMag * effectScale);
        const sideSpin = tangent.multiply(-cueSpin.x * impulseMag * effectScale);
        resV2 = resV2.add(drawFollow).add(sideSpin);
      }
    }

    b1.velocity = { x: resV1.x, y: resV1.y };
    b2.velocity = { x: resV2.x, y: resV2.y };
  }
}
