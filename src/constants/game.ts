export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 400;
export const BALL_RADIUS = 10;
export const CUSHION_WIDTH = 20;
export const FRICTION = 0.985; // Rolling friction
export const WALL_BOUNCE = 0.7; // Energy loss on cushion hit
export const BALL_BOUNCE = 0.95; // Energy loss on ball-ball hit
export const MIN_VELOCITY = 0.1; // Velocity below which a ball stops
export const POCKET_RADIUS = 25;

export const POCKETS = [
  { x: 0, y: 0 },
  { x: TABLE_WIDTH / 2, y: 0 },
  { x: TABLE_WIDTH, y: 0 },
  { x: 0, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH, y: TABLE_HEIGHT },
];
