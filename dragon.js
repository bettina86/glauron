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

    var pivots = [
      [12, 24],
      [12, 24],
      [12, 24],
      [16, 26],
      [12, 26],
      [16, 28],
      [10, 24],
      [10, 26],
      [14, 28],
      [10, 26],
      [10, 26],
      [10, 26],
      [10, 24],
      [10, 30],
    ];
    var d = 0;
    var dragon = this;
    this.tail = [];
    for (var i = 0; i < pivots.length; i++) {
      var p = pivots[pivots.length - 1 - i];
      var piece = Crafty.e('2D, Canvas, dragon_start, Collision, Dragon')
        .sprite(pivots.length - 1 - i, 0)
        .origin(p[0], 25);
      piece.dragon = this;
      piece.leftPivot = p[0];
      piece.rightPivot = p[1];
      piece.pieceLength = p[1] - p[0];
      piece.onHit('Ground', function() {
        dragon.takeDamage(10000);
        this.unbind('EnterFrame');
      });
      this.tail.push(piece);
    }

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

      this.flapCooldown--;

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

