Crafty.c('Archer', {
  init: function() {
    this.requires('2D, Canvas, Color, Burnable');
    this
      .attr({w: ARCHER_WIDTH, h: ARCHER_HEIGHT})
      .color('#dddddd');

    var cooldown = 0;

    this.bind('EnterFrame', function() {
      if (cooldown > 0) {
        cooldown--;
      } else {
        if (Math.random() < 0.01) {
          var dragon = Crafty('DragonCore');
          if (dragon.length > 0 && !dragon.isDead()) {
            var dx = dragon.x - this.x;
            var dy = dragon.y - this.y;
            var d = length(dx, dy);
            var distanceAdjustment = 0.02 * d;
            Crafty.e('Arrow, Despawn')
              .attr({x: this.x, y: this.y})
              .fire(atan2(dy, dx) + distanceAdjustment);
            cooldown = 60;
          }
        }
      }
    });

    this.bind('Burn', function() {
      Crafty('Stats').archersKilled++;
    });
  },
});

Crafty.c('Arrow', {
  init: function() {
    this.requires('2D, Velocity, Collision, Burnable');
    this.attr({w: 1, h: 1});

    this.sprite = Crafty.e('2D, Canvas, Color')
      .attr({x: 0, y: -2, w: 30, h: 4})
      .origin(0, 2)
      .color('#ff0000');
    this.attach(this.sprite);

    this.bind('EnterFrame', function() {
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

  fire: function(direction) {
    this.vx = cos(direction) * ARROW_SPEED;
    this.vy = sin(direction) * ARROW_SPEED;
    this.rotation = direction;
  },
});

