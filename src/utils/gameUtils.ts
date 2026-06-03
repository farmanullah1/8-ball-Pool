import type { Ball, BallType } from '../types';
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS } from '../constants/game';

export const createInitialBalls = (): Ball[] => {
  const balls: Ball[] = [];
  const startX = TABLE_WIDTH * 0.75;
  const startY = TABLE_HEIGHT / 2;
  const radius = BALL_RADIUS;

  // Cue ball
  balls.push({
    id: 0,
    type: 'cue',
    position: { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    radius: radius,
    isPocketed: false,
  });

  const ballNumbers = [1, 9, 2, 3, 8, 10, 4, 5, 11, 12, 6, 7, 13, 14, 15]; // Mixed for standard look
  const ballTypes: BallType[] = [
    'solid', 'stripe', 'solid', 'solid', 'black', 'stripe', 'stripe', 'solid', 'stripe', 'solid', 'stripe', 'solid', 'solid', 'stripe', 'stripe'
  ];

  let ballIdx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const x = startX + row * (radius * 1.75);
      const y = startY - (row * radius) + (col * radius * 2);
      
      balls.push({
        id: ballIdx + 1,
        type: ballTypes[ballIdx],
        number: ballNumbers[ballIdx],
        position: { x, y },
        velocity: { x: 0, y: 0 },
        radius: radius,
        isPocketed: false,
      });
      ballIdx++;
    }
  }

  return balls;
};
