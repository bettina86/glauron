Crafty.init(W, H, document.getElementById('game'));
Crafty.timer.FPS(60);

Crafty.c('Spawner', {
  init: function() {
    var cooldown = 0;
    this.bind('EnterFrame', function() {
      if (cooldown > 0) {
        cooldown--;
      } else {
        if (Math.random() < 0.005) {
          Crafty.e('Archer, Despawn')
            .attr({x: -Crafty.viewport.x + W, y: GROUND_Y - ARCHER_HEIGHT});
          cooldown = 60;
        } else if (Math.random() < 0.01) {
          Crafty.e('House, Despawn')
            .attr({x: -Crafty.viewport.x + W, y: GROUND_Y - HOUSE_HEIGHT});
          cooldown = 60;
        }
      }
    });
  },
});

Crafty.c('Input', {
  init: function() {
    this.requires('Dragon');

    var keyDownHandler = function(e) {
      if (e.key == Crafty.keys.UP_ARROW) {
        this.flap();
      } else if (e.key == Crafty.keys.SPACE) {
        this.fire(true);
      }
    }.bind(this);
    var keyUpHandler = function(e) {
      if (e.key == Crafty.keys.SPACE) {
        this.fire(false);
      }
    }.bind(this);

    var mouseDownHandler = function mouseDownHandler(e) {
      if (e.button == 0) {
        this.flap();
        e.preventDefault();
      } else if (e.button == 2) {
        this.fire(true);
        e.preventDefault();
      }
    }.bind(this);
    var mouseUpHandler = function mouseUpHandler(e) {
      if (e.button == 2) {
        this.fire(false);
        e.preventDefault();
      }
    }.bind(this);

    Crafty.bind('KeyDown', keyDownHandler);
    Crafty.bind('KeyUp', keyUpHandler);
    document.onmousedown = mouseDownHandler;
    document.onmouseup = mouseUpHandler;

    this.bind('Remove', function() {
      Crafty.unbind('KeyDown', keyDownHandler);
      Crafty.unbind('KeyUp', keyUpHandler);
      document.onmousedown = null;
    });
  },
});

Crafty.defineScene('loading', function() {
  Crafty.background('#000');

  var text = Crafty.e('2D, DOM, Text')
    .text('Loading...')
    .textColor('#ffffff')
    .textFont({family: 'EG Dragon Caps', size: '60px'});
  var w = 446;
  var h = 138;
  text.attr({x: (W - w) / 2, y: (H - h) / 2});
});

Crafty.defineScene('game', function() {
  Crafty('*').destroy();

  Crafty.background('#111111');

  var dragon = Crafty.e('DragonCore, Input, FollowedByCamera')
    .attr({x: 100, y: 100})
    .color('#ffffff');

  Crafty.e('GroundManager');

  Crafty.e('Spawner');

  Crafty.e('Hud')
    .attach(Crafty.e('HealthBar').attr({x: 5, y: 5}))
    .attach(Crafty.e('FireBar').attr({x: W - FIRE_AMOUNT - 5, y: 10}));
});

Crafty.enterScene('loading');
Crafty.load(ASSETS, function() {
  Crafty.enterScene('game');
});
