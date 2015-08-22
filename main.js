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
      } else if (e.button == 2) {
        this.fire(true);
      }
    }.bind(this);
    var mouseUpHandler = function mouseUpHandler(e) {
      if (e.button == 2) {
        this.fire(false);
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

Crafty.defineScene('game', function() {
  Crafty('*').destroy();

  var dragon = Crafty.e('DragonCore, Input, FollowedByCamera')
    .attr({x: 100, y: 100})
    .color('#ffffff');

  Crafty.e('Ground');

  Crafty.e('Spawner');
});

Crafty.enterScene('game');
