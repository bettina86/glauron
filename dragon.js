Crafty.c('Dragon', {
  init: function() {
    this.dragon = null;
  },
});

Crafty.c('Tail', {
  init: function() {
    this.requires('2D, Canvas, Color, Dragon');
    this.bind('EnterFrame', function() {
      if (!this.dragon) return;

      var pos = this.dragon.trailAt(this.delay);
      this.x = pos.x - this.w/2;
      this.y = pos.y - this.h/2;

      var prevPos = this.dragon.trailAt(this.delay - 1);
      this.rotation = atan2(pos.y - prevPos.y, pos.x - prevPos.x);
    });
  },

  tail: function(dragon, delay) {
    this.dragon = dragon;
    this.delay = delay;
    this.dragon.bind('Remove', function() {
      this.destroy();
    }.bind(this));
    return this;
  },
});

Crafty.c('DragonCore', {
  init: function() {
    this.requires('2D, Velocity, Canvas, Color, Collision, Dragon');
    this.vx = 3;
    this.vy = 0;
    this.fireAmount = FIRE_AMOUNT;
    this.flapCooldown = 0;
    this.fireCooldown = 0;
    this.dragon = this;
    this.trail = [];

    this
      .attr({w: 50, h: 50})
      .origin(25, 25);

    this.bind('EnterFrame', function() {
      this.vy += G;
      if (this.flapTime > 0) {
        this.vy -= FLAP_SPEED / FLAP_TIME;
        this.flapTime--;
      }

      this.rotation = atan2(this.vy, this.vx);

      this.flapCooldown--;

      this.trail.unshift(this.center());
      if (this.trail.length > 100) {
        this.trail.pop();
      }

      if (this.fireCooldown > 0) {
        this.fireCooldown--;
      }
      if (this.firing) {
        if (this.fireAmount >= 1) {
          this.fireAmount--;
          if (this.fireCooldown <= 0) {
            Crafty.e('Fire')
              .velocity(this.vx, this.vy)
              .fire(this.center(), atan2(this.vy, this.vx));
            this.fireCooldown = 5;
          }
        }
      } else {
        this.fireAmount += FIRE_REPLENISH;
        if (this.fireAmount > FIRE_AMOUNT) this.fireAmount = FIRE_AMOUNT;
      }
    });

    this.onHit('Ground', function() {
      this.die();
    });

    for (var i = 1; i < 10; i++) {
      var c = 255 - 25 * i;
      Crafty.e('Tail')
        .attr({w: 40, h: 40})
        .origin(20, 20)
        .color(c, c, c)
        .tail(this, 5 * i);
    }
  },

  center: function() {
    return {x: this.x + this.w/2, y: this.y + this.h/2};
  },

  trailAt: function(delay) {
    if (this.trail.length == 0) return this.center();
    return this.trail[Math.min(delay, this.trail.length - 1)];
  },

  flap: function() {
    if (this.y < 0) return;
    if (this.flapCooldown > 0) return;
    this.flapTime = FLAP_TIME;
    this.flapCooldown = FLAP_INTERVAL;
    return this;
  },

  fire: function(firing) {
    this.firing = firing;
  },

  takeDamage: function(damage) {
    this.die();
  },

  die: function() {
    this.destroy();
    Crafty.e('Delay').delay(function() {
      Crafty.enterScene('game');
    }, 1000);
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
        item.obj.destroy();
      });
    });
  },

  fire: function(pos, direction) {
    this.attr({w: FIRE_SIZE_START, h: FIRE_SIZE_START});
    this.x = pos.x - this.w/2;
    this.y = pos.y - this.h/2;
    this.vx += cos(direction) * FIRE_SPEED;
    this.vy += sin(direction) * FIRE_SPEED;
  },
});

