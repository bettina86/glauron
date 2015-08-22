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
            var vx = dragon.x - this.x;
            var vy = dragon.y - this.y;
            var f = ARROW_SPEED / length(vx, vy);
            vx *= f;
            vy *= f;
            Crafty.e('Arrow, Despawn')
              .attr({x: this.x, y: this.y})
              .fire(vx, vy);
            cooldown = 60;
          }
        }
      }
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
  },

  fire: function(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.rotation = atan2(-this.vy, -this.vx);
  },
});

