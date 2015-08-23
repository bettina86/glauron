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
      var distanceAdjustment = 0.02 * d;
      fireAngle = atan2(dy, dx) + distanceAdjustment;
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

    this.bind('Burn', function() {
      Crafty('Stats').archersKilled++;
    });

    this.bind('Remove', function() {
      bow.destroy();
    });
  },
});

Crafty.c('Arrow', {
  init: function() {
    this.requires('2D, Velocity, Collision, Burnable');
    this.attr({w: 20, h: 4})
      .origin(0, 2);

    //this.requires('Canvas, Color');
    //this.attr({w: 6, h: 6}).color('#ff00ff');

    this.sprite = Crafty.e('2D, Canvas, arrow_start');
    this.attach(this.sprite);

    this.fired = false;

    this.bind('EnterFrame', function() {
      if (!this.fired) return;
      this.vy += ARROW_G;
      this.rotation = atan2(-this.vy, -this.vx);
    });

    this.onHit('Dragon', function(e) {
      for (var i = 0; i < e.length; i++) {
        var item = e[i];
        if (item.type == 'MBR') continue;
        var dragon = item.obj.dragon;
        if (!dragon) continue;
        dragon.takeDamage(10);
        item.obj.attach(this.sprite);
        this.destroy();
        break;
      }
    });

    this.onHit('Ground', function(e) {
      e[0].obj.attach(this.sprite);
      this.destroy();
    });

    this.bind('Burn', function() {
      Crafty('Stats').arrowsDestroyed++;
    });
  },

  fire: function() {
    if (this.fired) return this;
    this.vx = -cos(this.rotation) * ARROW_SPEED;
    this.vy = -sin(this.rotation) * ARROW_SPEED;
    this.fired = true;
    return this;
  },
});

