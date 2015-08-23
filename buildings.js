Crafty.c('Skirted', {
  skirt: function() {
    this.attach(Crafty.e('2D, Canvas, Color')
        .attr({x: this.x, y: this.y + this.h - 0.5, w: this.w, h: 30})
        .color('black'));
  },
});

Crafty.c('House', {
  init: function() {
    this.requires('2D, Canvas, house_start, Collision, Burnable, Scorable, Skirted');
    this.skirt();

    this.one('Burn', function() {
      if (Math.random() < HEART_SPAWN_PROB) {
        Crafty.e('Heart')
          .attr({x: this.x + this.w/2, y: this.y + this.h/2});
        playSound('heart');
      }
      Crafty('Stats').housesDestroyed++;
      this.score(5);
      playSound('house');
    });
  },
});

Crafty.c('Church', {
  init: function() {
    this.requires('2D, Canvas, church_start, Collision, Burnable, Scorable, Skirted');
    this.skirt();

    this.one('Burn', function() {
      for (var i = 0; i < 3; i++) {
        Crafty.e('Heart')
          .attr({x: this.x + this.w/2, y: this.y + this.h/2 + i * 20});
      }
      playSound('heart');
      Crafty('Stats').churchesDestroyed++;
      this.score(20);
      playSound('house');
    });
  },
});

Crafty.c('Heart', {
  init: function() {
    this.requires('2D, Canvas, Collision, Despawn, heart_full');

    this.bind('EnterFrame', function() {
      this.y -= HEART_RISE_SPEED;
    });

    this.onHit('Dragon', function(e) {
      for (var i = 0; i < e.length; i++) {
        var item = e[i];
        if (item.type == 'MBR') continue;
        var dragon = item.obj.dragon;
        if (!dragon) continue;
        dragon.heal(20);
        break;
      }
      this.destroy();
    });
  },
});
