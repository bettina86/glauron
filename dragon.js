Crafty.c('Dragon', {
  init: function() {
    this.dragon = null;
  },
});

Crafty.c('DragonCore', {
  init: function() {
    this.requires('2D, Velocity');
    this.vx = 3;
    this.vy = 0;
    this.fireAmount = FIRE_AMOUNT;
    this.flapCooldown = 0;
    this.fireCooldown = 0;
    this.dragon = this;
    this.health = 100;
    this.arrows = [];

    var data = [
      [0, 12, 23, 27],
      [12, 24, 23, 27],
      [12, 24, 23, 27],
      [16, 26, 23, 27],
      [12, 26, 23, 27],
      [16, 28, 22, 28],
      [10, 24, 22, 28],
      [10, 26, 21, 30],
      [14, 28, 18, 36],
      [10, 26, 17, 33],
      [10, 26, 20, 31],
      [10, 26, 20, 30],
      [10, 24, 21, 29],
      [10, 36, 21, 32],
    ];
    var d = 0;
    var dragon = this;
    this.tail = [];
    for (var i = 0; i < data.length; i++) {
      var p = data[data.length - 1 - i];
      var left = p[0];
      var right = p[1];
      var top = p[2];
      var bottom = p[3];
      var piece = Crafty.e('2D, Canvas, dragon_start, Collision, Dragon')
        .sprite(data.length - 1 - i, 0)
        .origin(left, 25)
        .collision([left, top], [right, top], [right, bottom], [left, bottom]);
      piece.dragon = this;
      piece.leftPivot = left;
      piece.rightPivot = right;
      piece.pieceLength = right - left;
      piece.onHit('Ground', function() {
        dragon.takeDamage(10000);
        this.unbind('EnterFrame');
      });
      this.tail.push(piece);
    }

    this.wings = [];
    for (var i = 0; i < 2; i++) {
      this.wings[i] = Crafty.e('2D, Canvas, wing_start');
    }
    this.wings[0].attr({x: -40 + this.tail[3].leftPivot, y: -80 + 25});
    this.tail[3].attach(this.wings[0]);
    this.wings[1].attr({x: -40 + this.tail[4].rightPivot, y: -80 + 25});
    this.tail[4].attach(this.wings[1]);

    this.bind('EnterFrame', function() {
      this.vy += G;
      if (this.flapTime > 0) {
        this.vy -= FLAP_SPEED / FLAP_TIME;
        this.flapTime--;
      }
      if (this.isDead()) {
        this.vx = Math.max(0, this.vx - 0.02);
      }
      this.rotation = atan2(this.vy, this.vx);

      this.tail[0].attr({
        x: this.x - this.tail[0].leftPivot,
        y: this.y - 25,
        rotation: atan2(this.vy, this.vx),
      });
      var prevX = this.tail[0].x + this.tail[0].leftPivot;
      var prevY = this.tail[0].y + 25;
      for (var i = 1; i < this.tail.length; i++) {
        var piece = this.tail[i];
        var dx = piece.x + piece.leftPivot - prevX;
        var dy = piece.y + 25 - prevY;
        var currentDistance = length(dx, dy);
        var angle = atan2(dy, dx);
        var x = prevX + cos(angle) * piece.pieceLength;
        var y = prevY + sin(angle) * piece.pieceLength;
        piece.attr({
          x: x - piece.leftPivot,
          y: y - 25,
          rotation: 180 + angle,
        });
        prevX = x;
        prevY = y;
      }

      if (this.flapCooldown > 0) {
        this.flapCooldown--;
      }
      var wingHeight;
      if (this.flapTime > 0) {
        wingHeight = -1 + 2 * this.flapTime / FLAP_TIME;
      } else {
        wingHeight = 1 - 2 * this.flapCooldown / FLAP_INTERVAL;
      }
      wingHeight *= 80;
      for (var i = 0; i < this.wings.length; i++) {
        var wing = this.wings[i];
        var parent = wing._parent;
        var parentX = parent._x;
        var parentY = parent._y;
        var parentRotation = parent._rotation;
        parent.x = 0;
        parent.y = 0;
        parent.rotation = 0;
        wing.attr({h: wingHeight, y: 25 - wingHeight})
        parent.x = parentX;
        parent.y = parentY;
        parent.rotation = parentRotation;
      }

      Crafty('Stats').distanceFlown = Math.floor(this.x / 100);

      if (this.fireCooldown > 0) {
        this.fireCooldown--;
      }
      if (this.firing) {
        if (this.fireAmount >= 1) {
          this.fireAmount--;
          if (this.fireCooldown <= 0) {
            for (var i = 0; i < 4; i++) {
              Crafty.e('Fire')
                .velocity(this.vx, this.vy)
                .fire(this.x + cos(this.rotation) * 0.7 * this.tail[0].pieceLength, this.y + sin(this.rotation) * 0.7 * this.tail[0].pieceLength, atan2(this.vy, this.vx), i);
            }
            this.fireCooldown = 5;
          }
        }
      } else {
        if (!this.isDead()) {
          this.fireAmount += FIRE_REPLENISH;
          if (this.fireAmount > FIRE_AMOUNT) this.fireAmount = FIRE_AMOUNT;
        } else {
          this.fireAmount = Math.max(0, this.fireAmount - 5*FIRE_REPLENISH);
        }
      }
    });
  },

  flap: function() {
    if (this.isDead()) return;
    if (this.y < 0) return;
    if (this.flapCooldown > 0) return;
    this.flapTime = FLAP_TIME;
    this.flapCooldown = FLAP_INTERVAL;
    return this;
  },

  fire: function(firing) {
    if (this.isDead()) return;
    this.firing = firing;
  },

  isDead: function() {
    return this.health <= 0;
  },

  takeDamage: function(damage) {
    if (this.isDead()) return;
    this.health -= damage;
    if (this.health < 0) this.health = 0;
    if (this.health <= 0) {
      this.firing = false;
      this.removeComponent('Input');
      this.trigger('Die');
    }
  },

  heal: function(health) {
    if (this.isDead()) return;
    this.health += health;
    if (this.health > 100) this.health = 100;
    while (health >= 10) {
      health -= 10;
      var arrow = this.arrows.shift();
      if (!arrow) continue;
      arrow.fall(this.vx, this.vy);
    }
  },
});

var FIRE_SIZES = [0.4, 0.6, 0.8, 1.0];
var FIRE_SPEEDS = [1.0, 0.98, 0.96, 0.94];

Crafty.c('Fire', {
  init: function() {
    this.requires('2D, Canvas, fire_start, Velocity, Collision');

    this.lifetime = 0;
    this.spriteNumber = 0;

    this.bind('EnterFrame', function() {
      this.lifetime++;
      if (this.lifetime >= FIRE_LIFETIME) {
        this.destroy();
        return;
      }
      var s = FIRE_SIZES[this.spriteNumber] * lerp(FIRE_SIZE_START, FIRE_SIZE_END, this.lifetime / FIRE_LIFETIME);
      this.x -= (s - this.w) / 2;
      this.y -= (s - this.h) / 2;
      this.w = s;
      this.h = s;
      this.origin(s / 2, s / 2);
      this.rotation = atan2(this.vy, this.vx);
      this.alpha = Math.min(1, (this.spriteNumber + 1) * (1 - this.lifetime / FIRE_LIFETIME));
    });
  },

  fire: function(x, y, direction, spriteNumber) {
    var s = FIRE_SIZE_START * FIRE_SIZES[spriteNumber];
    this.attr({w: s, h: s});
    this.x = x - this.w/2;
    this.y = y - this.h/2;
    this.z = 4 - spriteNumber;
    this.vx += cos(direction) * FIRE_SPEED * FIRE_SPEEDS[spriteNumber];
    this.vy += sin(direction) * FIRE_SPEED * FIRE_SPEEDS[spriteNumber];
    this.sprite(spriteNumber, 0);
    this.spriteNumber = spriteNumber;
    if (spriteNumber == 2) {
      this.addComponent('Collision');

      this.onHit('Burnable', function(e) {
        e.forEach(function(item) {
          item.obj.trigger('Burn');
          item.obj.destroy();
        });
      });
    }
  },
});

Crafty.c('Burnable', {
  init: function() {
    this.one('Burn', function() {
      for (var i = 0; i < 3; i++) {
        var s = 1.3 * Math.sqrt(this.w * this.h);
        Crafty.e('Smoke')
          .attr({
            x: this.x + this.w/2 - s/2 + randFloat(-0.3, 0.3) * this.w,
            y: this.y + this.h/2 - s/2 + randFloat(-0.3, 0.3) * this.h,
            w: s, h: s});
      }
    });
  },
});

var SMOKE_LIFETIME = 120;

Crafty.c('Smoke', {
  init: function() {
    this.requires('2D, Canvas, smoke_start, Velocity');

    this.vy = randFloat(-1.2, -0.8);
    this.vx = randFloat(-0.3, 0.3);
    this.rotation = randFloat(0, 360);
    var rotationSpeed = randFloat(-1, 1);
    var growth = 1;

    var lifetime = 0;
    this.bind('EnterFrame', function() {
      lifetime++;
      if (lifetime > SMOKE_LIFETIME) {
        this.destroy();
        return;
      }
      this.rotation += rotationSpeed;
      this.w += growth;
      this.h += growth;
      this.x -= growth/2;
      this.y -= growth/2;
      this.alpha = Math.min(1, 2 * (1 - lifetime / SMOKE_LIFETIME));
    });
    this.bind('Move', function() {
      this.origin(this.w / 2, this.h / 2);
    });
    this.trigger('EnterFrame');
  },
});
