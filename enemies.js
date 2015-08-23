Crafty.c('Archer', {
  init: function() {
    this.requires('2D, Canvas, archer_body, Burnable');

    var cooldown = 0;

    var bow = Crafty.e('2D, Canvas, archer_bow')
      .origin(12, 12);
    this.attach(bow);

    var arrow = null;

    this.bind('EnterFrame', function() {
      var dragon = Crafty('DragonCore');
      if (dragon.length == 0 || dragon.isDead()) return;
      var dx = dragon.x - this.x;
      var dy = dragon.y - this.y;
      var d = length(dx, dy);
      var distanceAdjustment = 0.03 * d;
      fireAngle = atan2(dy, dx) + distanceAdjustment;
      fireAngle = canonicalize(fireAngle);
      if (fireAngle > 270) fireAngle = 270;
      bow.rotation = fireAngle - 180;

      if (cooldown > 0) {
        cooldown--;
      } else {
        if (!arrow) {
          arrow = Crafty.e('Arrow, Despawn')
            .attr({x: this.x, y: this.y + 13});
          var bowRotation = bow.rotation;
          bow.rotation = 0;
          bow.attach(arrow);
          bow.rotation = bowRotation;
        }
        if (dx <= 0 && dx >= -W && Math.random() < 0.01) {
          bow.detach(arrow);
          arrow.fire();
          arrow = null;
          cooldown = 60;
        }
      }
    });

    this.one('Burn', function() {
      Crafty('Stats').archersKilled++;
    });

    this.bind('Remove', function() {
      bow.destroy();
    });
  },
});

Crafty.c('Arrow', {
  init: function() {
    this.requires('2D, Velocity, Canvas, arrow_start, Collision, Burnable, Despawn');
    this
      .origin(0, 2);

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
    });
  },

  fire: function() {
    if (this.flying) return this;
    this.vx = -cos(this.rotation) * ARROW_SPEED;
    this.vy = -sin(this.rotation) * ARROW_SPEED;
    this.flying = true;
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

