import type { Vector2D as Vector2DType } from '../types';

export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return this.multiply(1 / mag);
  }

  distanceTo(v: Vector2D): number {
    return this.sub(v).magnitude();
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  static fromObject(obj: Vector2DType): Vector2D {
    return new Vector2D(obj.x, obj.y);
  }
}
