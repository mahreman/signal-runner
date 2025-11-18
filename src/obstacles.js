const WALL_COUNT = 4;

export class Obstacles {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.items = [];
    this.spawnTimer = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.items = [];
  }

  update(delta, speed) {
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0 && this.items.length < WALL_COUNT) {
      this.items.push({
        x: (Math.random() - 0.5) * this.width * 0.5,
        y: -this.height,
        type: Math.random() > 0.5 ? 'wall' : 'bonus',
      });
      this.spawnTimer = 2 + Math.random();
    }

    this.items.forEach((item) => {
      item.y += speed * delta;
    });
    this.items = this.items.filter((item) => item.y < this.height * 1.2);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.width / 2, this.height);
    this.items.forEach((item) => {
      ctx.fillStyle = item.type === 'wall' ? 'rgba(255,92,143,0.4)' : 'rgba(22,224,184,0.4)';
      ctx.fillRect(item.x - 15, item.y - 30, 30, 30);
    });
    ctx.restore();
  }
}
