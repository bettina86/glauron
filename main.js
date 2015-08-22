var W = 1200;
var H = 800;

var G = .03;
var FLAP_SPEED = 4;
var FLAP_TIME = 10;
var FLAP_INTERVAL = 60;
var FIRE_INTERVAL = 60;

Crafty.init(W, H, document.getElementById('game'));
Crafty.timer.FPS(60);

Crafty.c('Tail', {
  init: function() {
    this.bind('EnterFrame', function() {
      if (!this.dragon) return;

      var pos = this.dragon.trailAt(this.delay);
      this.x = pos.x - this.w/2;
      this.y = pos.y - this.h/2;

      var prevPos = this.dragon.trailAt(this.delay - 1);
      this.rotation = radToDeg(Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x));
    });
  },

  tail: function(dragon, delay) {
    this.dragon = dragon;
    this.delay = delay;
    return this;
  },
});

Crafty.c('Dragon', {
  init: function() {
    this.vx = 3;
    this.vy = 0;
    this.flapDelay = 0;
    this.fireDelay = 0;
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
      this.x += this.vx;
      this.y += this.vy;

      this.rotation = radToDeg(Math.atan2(this.vy, this.vx));

      this.flapDelay--;
      this.fireDelay--;

      this.trail.unshift(this.center());
      if (this.trail.length > 100) {
        this.trail.pop();
      }
    });

    for (var i = 1; i < 10; i++) {
      var c = 255 - 25 * i;
      Crafty.e('2D, Canvas, Color, Tail')
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
    if (this.flapDelay > 0) return;
    this.flapTime = FLAP_TIME;
    this.flapDelay = FLAP_INTERVAL;
    return this;
  },

  fire: function() {
    if (this.fireDelay > 0) return;
    this.fireDelay = FIRE_INTERVAL;
    return this;
  },
});

Crafty.defineScene('game', function() {
  var dragon = Crafty.e('2D, Canvas, Color, Dragon')
    .attr({x: 100, y: 100})
    .color('#ffffff');

  Crafty.bind('KeyDown', function(e) {
    if (e.key == Crafty.keys.UP_ARROW) {
      dragon.flap();
    } else if (e.key == Crafty.keys.SPACE) {
      dragon.fire();
    }
  });

  Crafty.bind('EnterFrame', function() {
    Crafty.viewport.scroll('x', -(dragon.x - 200));
  });

  document.onmousedown = function(e) {
    if (e.button == 0) {
      dragon.flap();
    } else if (e.button == 2) {
      dragon.fire();
    }
  };
});

Crafty.enterScene('game');
