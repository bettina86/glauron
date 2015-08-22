Crafty.c('GroundManager', {
  init: function() {
    var segmentWidth = 100;
    var segments = [];
    var left = -W;
    var right = -W;

    this.bind('EnterFrame', function() {
      var viewportLeft = -Crafty.viewport.x - W;
      var viewportRight = left + 2 * W;
      while (left < viewportLeft && segments.length > 0) {
        var segment = segments.shift();
        segment.destroy();
        left += segmentWidth;
      }
      while (right < viewportRight) {
        var segment = Crafty.e('2D, Canvas, Color, Ground')
          .attr({x: right, y: GROUND_Y, w: segmentWidth, h: H - GROUND_Y})
          .color('#ffffff');
        segments.push(segment);
        right += segmentWidth;
      }
    });
  },
});

Crafty.c('House', {
  init: function() {
    this.requires('2D, Canvas, Color, Collision, Burnable');
    
    this
      .attr({w: HOUSE_WIDTH, h: HOUSE_HEIGHT})
      .color('#dddddd');

    this.bind('Burn', function() {
      if (Math.random() < HEART_SPAWN_PROB) {
        Crafty.e('Heart')
          .attr({x: this.x + this.w/2, y: this.y + this.h/2});
      }
      Crafty('Stats').housesDestroyed++;
    });
  },
});

Crafty.c('Heart', {
  init: function() {
    this.requires('2D, Canvas, Sprite, Collision, Despawn, heart_full');

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
