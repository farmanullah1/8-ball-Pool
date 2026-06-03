export interface Vector2D {
  x: number;
  y: number;
}

export type BallType = 'cue' | 'solid' | 'stripe' | 'black';

export interface Ball {
  id: number;
  type: BallType;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  isPocketed: boolean;
  number?: number;
}

export type PlayerId = 1 | 2;

export interface Player {
  id: PlayerId;
  name: string;
  suit?: 'solids' | 'stripes';
  score: number;
  isAI: boolean;
}

export type GamePhase = 'menu' | 'aiming' | 'moving' | 'foul' | 'gameOver';

export interface GameState {
  phase: GamePhase;
  turn: PlayerId;
  players: [Player, Player];
  balls: Ball[];
  cueBallInHand: boolean;
  winner?: PlayerId;
  lastFoul?: string;
  isMuted: boolean;
  cueSpin: Vector2D; // x: horizontal spin (side), y: vertical spin (top/bottom)
}
