Crafty.c('Enemy', {
  init: function() {
    this.requires('2D, Canvas, Burnable, Scorable');

    this.one('Burn', function() {
      Crafty('Stats').archersKilled++;
      this.score(10);
      playSound('archer');
    });

    this.bind('Remove', function() {
      if (this.bow) this.bow.destroy();
    });
  },
});

Crafty.c('Launcher', {
  init: function() {
    this.requires('2D');
    this.projectileType = null;

    var projectile = null;
    var cooldown = 0;

    this.bind('EnterFrame', function() {
      if (!this.projectileType) return;
      var dragon = Crafty('DragonCore');
      if (dragon.length == 0 || dragon.isDead()) return;
      var dx = dragon.x - this.x;
      var dy = dragon.y - this.y;
      var d = length(dx, dy);
      var distanceAdjustment = 0.03 * d;
      fireAngle = atan2(dy, dx) + distanceAdjustment;
      fireAngle = canonicalize(fireAngle);
      if (fireAngle > 270) fireAngle = 270;
      this.rotation = fireAngle - 180;

      if (cooldown > 0) {
        cooldown--;
      } else {
        if (!projectile) {
          projectile = Crafty.e(this.projectileType + ', Despawn')
            .attr({x: this.x - 4, y: this.y + 11});
          var prevRot = this.rotation;
          this.rotation = 0;
          this.attach(projectile);
          this.rotation = prevRot;
        }
        if (dx <= 0 && dx >= -1200 && Math.random() < 0.01) {
          this.detach(projectile);
          projectile.fire();
          projectile = null;
          cooldown = 60;
        }
      }
    });
  },

  projectile: function(p) {
    this.projectileType = p;
    return this;
  }
});

Crafty.c('Archer', {
  init: function() {
    this.requires('Enemy, archer_body');

    this.attach(Crafty.e('2D, Canvas, Launcher, archer_bow')
      .origin(12, 12)
      .projectile('Arrow'));
  },
});

Crafty.c('Longbowman', {
  init: function() {
    this.requires('Enemy, archer_body');

    this.attach(Crafty.e('2D, Canvas, Launcher, archer_bow')
      .origin(12, 12)
      .projectile('SilverArrow'));
  },
});

Crafty.c('Arrow', {
  init: function() {
    this.requires('Projectile, arrow_start, Burnable');
  },
});

Crafty.c('SilverArrow', {
  init: function() {
    this.requires('Projectile, arrow_silver');
    this.z = 4;
  },
});

Crafty.c('Projectile', {
  init: function() {
    this.requires('2D, Velocity, Canvas, Collision, Despawn, Scorable');
    this.origin(0, 2);

    //this.requires('Canvas, Color');
    //this.attr({w: 6, h: 6}).color('#ff00ff');

    this.flying = false;
    this.falling = false;

    this.bind('EnterFrame', function() {
      if (!this.flying) return;
      if (this.falling) {
        this.vy += G;
        var r = ((this.rotation % 360) + 360) % 360;
        if (90 < r && r < 270) {
          this.rotation += 1;
        } else {
          this.rotation -= 1;
        }
      } else {
        this.vy += ARROW_G;
        this.rotation = atan2(-this.vy, -this.vx);
      }
    });

    this.onHit('Dragon', function(e) {
      if (!this.flying || this.falling) return;
      for (var i = 0; i < e.length; i++) {
        var item = e[i];
        if (item.type != 'SAT') continue;
        var dragon = item.obj.dragon;
        if (!dragon) continue;

        this.x += this.vx;
        this.y += this.vy;
        dragon.takeDamage(10);
        this.vx = 0;
        this.vy = 0;
        this.flying = false;
        item.obj.attach(this);
        dragon.arrows.push(this);

        break;
      }
    });

    this.onHit('Ground', function(e) {
      this.flying = false;
      this.falling = false;
    });

    this.one('Burn', function() {
      Crafty('Stats').arrowsDestroyed++;
      this.score(2);
      playSound('arrow');
    });
  },

  fire: function() {
    if (this.flying) return this;
    this.vx = -cos(this.rotation) * ARROW_SPEED;
    this.vy = -sin(this.rotation) * ARROW_SPEED;
    this.flying = true;
    playSound('shoot');
    return this;
  },

  fall: function(vx, vy) {
    this.flying = true;
    this.falling = true;
    if (this._parent) this._parent.detach(this);
    this.vx = vx;
    this.vy = vy + 1;
  },
});

