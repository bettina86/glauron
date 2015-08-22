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
    });
  },
});

Crafty.c('Arrow', {
  init: function() {
    this.requires('2D, Velocity, Canvas, Color, Collision, Burnable');

    this.sprite = Crafty.e('2D, Canvas, Color')
      .attr({x: 15, y: 2, w: 30, h: 4})
      .color('#ffffff');
    this.attach(this.sprite);

    this.onHit('Dragon', function(e) {
      for (var i = 0; i < e.length; i++) {
        var item = e[i];
        var dragon = item.obj.dragon;
        if (!dragon) return;
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
    this.sprite.rotation = atan2(this.vy, this.vx);
  },
});

