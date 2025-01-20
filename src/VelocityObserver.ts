import { Vec2 } from "ogl";

export class VelocityObserver {
  private movmentRecordCount = 3;
  private movements: Vec2[] = [];

  constructor() {
    for (let i = 0; i < this.movmentRecordCount; i++) {
      this.movements.push(new Vec2());
    }
  }

  /**
   * Observe movement
   * @param position : ;
   */
  public recordMovement(position: Vec2) {
    // remove the last one
    this.movements.splice(this.movements.length - 1, 1);
    // insert to the beginning
    this.movements.unshift(new Vec2(position.x, position.y));
  }

  /**
   * Get the max Velocity
   * @returns
   */
  public getMaxVelocity() {
    let maxVelX = 0;
    let maxVelY = 0;
    for (let i = 0; i < this.movmentRecordCount; i++) {
      const velX = this.movements[i].x;
      const velY = this.movements[i].y;

      maxVelX = Math.abs(velX) > Math.abs(maxVelX) ? velX : maxVelX;
      maxVelY = Math.abs(velY) > Math.abs(maxVelY) ? velY : maxVelY;
    }

    return new Vec2(maxVelX, maxVelY);
  }

  public getAverageVelocity() {
    let totalVelX = 0;
    let totalVelY = 0;
    for (let i = 1; i < this.movmentRecordCount; i++) {
      const velX = this.movements[i].x - this.movements[i - 1].x;
      const velY = this.movements[i].y - this.movements[i - 1].y;
      totalVelX += velX;
      totalVelY += velY;
    }
    const averageVelX = totalVelX / (this.movmentRecordCount - 1);
    const averageVelY = totalVelY / (this.movmentRecordCount - 1);
    return new Vec2(averageVelX, averageVelY);
  }
}
