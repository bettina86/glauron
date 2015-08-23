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

    var data = [
      [0, 12, 23, 27],
      [12, 24, 24, 26],
      [12, 24, 24, 26],
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
      [10, 36, 19, 32],
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
        .collision([top, left], [top, right], [bottom, right], [bottom, left]);
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
            Crafty.e('Fire')
              .velocity(this.vx, this.vy)
              .fire(this.x + cos(this.rotation) * this.tail[0].pieceLength, this.y + sin(this.rotation) * this.tail[0].pieceLength, atan2(this.vy, this.vx));
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
    if (this.isDead()) {
      return;
    }
    this.health -= damage;
    if (this.health < 0) this.health = 0;
    if (this.health <= 0) {
      this.firing = false;
      this.vx = 0;
      this.removeComponent('Input');
      this.trigger('Die');
    }
  },

  heal: function(health) {
    this.health += health;
    if (this.health > 100) this.health = 100;
  },
});

Crafty.c('Fire', {
  init: function() {
    this.requires('2D, Canvas, Color, Velocity, Collision');
    this.color('#ff8000');

    this.lifetime = 0;

    this.bind('EnterFrame', function() {
      this.lifetime++;
      if (this.lifetime >= FIRE_LIFETIME) {
        this.destroy();
        return;
      }
      var s = lerp(FIRE_SIZE_START, FIRE_SIZE_END, this.lifetime / FIRE_LIFETIME);
      this.x -= (s - this.w) / 2;
      this.y -= (s - this.h) / 2;
      this.w = s;
      this.h = s;
    });

    this.onHit('Burnable', function(e) {
      e.forEach(function(item) {
        item.obj.trigger('Burn');
        item.obj.destroy();
      });
    });
  },

  fire: function(x, y, direction) {
    this.attr({w: FIRE_SIZE_START, h: FIRE_SIZE_START});
    this.x = x - this.w/2;
    this.y = y - this.h/2;
    this.vx += cos(direction) * FIRE_SPEED;
    this.vy += sin(direction) * FIRE_SPEED;
  },
});

