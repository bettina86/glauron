Crafty.c('GroundManager', {
  init: function() {
    this.segments = [];
    var left = -W;
    var right = -W;

    this.bind('EnterFrame', function() {
      var viewportLeft = -Crafty.viewport.x - W;
      var viewportRight = left + 2 * W;

      while (left < viewportLeft && this.segments.length > 0) {
        var segment = this.segments.shift();
        left += SEGMENT_WIDTH * cos(segment.rotation);
        segment.destroy();
      }

      while (right < viewportRight) {
        var prevSegment = this.segments[this.segments.length - 1];
        var prevY = prevSegment ? prevSegment.y + SEGMENT_WIDTH * sin(prevSegment.rotation) : GROUND_MAX_Y;
        var prevRotation = prevSegment ? prevSegment.rotation : 0;

        var segment = Crafty.e('2D, Canvas, ground_start, Collision, Ground')
          .attr({x: right - SKIRT_WIDTH, y: prevY, z: 1})
          .origin(SKIRT_WIDTH, SKIRT_HEIGHT)
          .sprite(0, randInt(3))
          .collision(
              [0, 2 * SKIRT_HEIGHT],
              [SKIRT_WIDTH, SKIRT_HEIGHT],
              [SKIRT_WIDTH + SEGMENT_WIDTH, SKIRT_HEIGHT],
              [SKIRT_WIDTH + SEGMENT_WIDTH + SKIRT_WIDTH, 2 * SKIRT_HEIGHT]);
        segment.rotation = clamp(-40, 40, 0.5 * prevRotation + randFloat(-30, 30));
        if (prevY + SKIRT_HEIGHT > GROUND_MAX_Y && segment.rotation > 0) {
          segment.rotation = 0;
        } else if (prevY + SKIRT_HEIGHT < GROUND_MIN_Y && segment.rotation < 0) {
          segment.rotation = 0;
        }

        var bottomY = Math.max(prevY, prevY + SEGMENT_WIDTH * sin(segment.rotation)) + SKIRT_HEIGHT;
        var bottom = Crafty.e('2D, Canvas, Color, Collision, Ground')
          .attr({x: right, y: bottomY, w: SEGMENT_WIDTH * cos(segment.rotation) + 1, h: H - bottomY, z: 1})
          .color('#000');
        segment.bind('Remove', (function(bottom) {
          return function() {
            bottom.destroy();
          }
        }(bottom)));

        this.segments.push(segment);
        right += SEGMENT_WIDTH * cos(segment.rotation);
      }
    });
  },

  heightAt: function(x) {
    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var startX = segment.x + SKIRT_WIDTH;
      var endX = startX + SEGMENT_WIDTH * cos(segment.rotation);
      if (x >= startX && x <= endX) {
        var startY = segment.y + SKIRT_HEIGHT;
        var endY = startY + SEGMENT_WIDTH * sin(segment.rotation);
        return lerp(startY, endY, (x - startX) / (endX - startX));
      }
    }
  },
});

Crafty.c('SnapToGround', {
  snapToGround: function() {
    var groundManager = Crafty('GroundManager');
    var heightLeft = groundManager.heightAt(this.x);
    var heightRight = groundManager.heightAt(this.x + this.w);
    this.y = Math.max(heightLeft, heightRight) - this.h;
  },
});

Crafty.c('House', {
  init: function() {
    this.requires('2D, Canvas, house_start, Collision, Burnable');

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
