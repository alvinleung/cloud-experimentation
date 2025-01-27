import { Vec2 } from "ogl";

export function lerp(target: number, current: number, lerp = 0.05) {
  return current - (current - target) * lerp;
}

export function lerpVec(target: Vec2, position: Vec2, lerp = 0.05) {
  position.x = position.x - (position.x - target.x) * lerp;
  position.y = position.y - (position.y - target.y) * lerp;
}
