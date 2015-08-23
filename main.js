Crafty.init(W, H, document.getElementById('game'));
Crafty.timer.FPS(60);

Crafty.c('Spawner', {
  init: function() {
    var cooldown = 0;
    this.bind('EnterFrame', function() {
      if (cooldown > 0) {
        cooldown--;
      } else {
        if (Math.random() < 0.05) {
          Crafty.e('Archer, SnapToGround, Despawn')
            .attr({x: -Crafty.viewport.x + W})
            .snapToGround();
          cooldown = 60;
        } else if (Math.random() < 0.01) {
          Crafty.e('House, SnapToGround, Despawn')
            .attr({x: -Crafty.viewport.x + W})
            .snapToGround();
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
      if (e.keyCode == 38) {
        this.flap();
        e.preventDefault();
      } else if (e.keyCode == 32) {
        this.fire(true);
        e.preventDefault();
      }
    }.bind(this);
    var keyUpHandler = function(e) {
      if (e.keyCode == 32) {
        this.fire(false);
        e.preventDefault();
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

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    this.bind('Remove', function() {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    });
  },
});

Crafty.c('Stats', {
  init: function() {
    this.archersKilled = 0;
    this.arrowsDestroyed = 0;
    this.housesDestroyed = 0;
    this.heartsCollected = 0;
    this.distanceFlown = 0;
  },

  archersKilledScore: function() { return this.archersKilled * 10; },

  arrowsDestroyedScore: function() { return this.arrowsDestroyed * 2; },

  housesDestroyedScore: function() { return this.housesDestroyed * 5; },

  score: function() {
    return this.archersKilledScore() + this.arrowsDestroyedScore() + this.housesDestroyedScore();
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

  Crafty.background('#333333');

  Crafty.e('Stats');

  var dragon = Crafty.e('DragonCore, Input, FollowedByCamera')
    .attr({x: 100, y: 100});
  dragon.bind('Die', function() {
    Crafty('Spawner').destroy();
    Crafty.e('Delay').delay(function() {
      Crafty.e('GameOver, AnyKey')
        .bind('AnyKey', function() {
          Crafty.enterScene('game');
        });
    }, 1000);
  });

  Crafty.e('GroundManager');

  Crafty.e('Spawner');

  Crafty.e('Hud')
    .attach(Crafty.e('HealthBar').attr({x: 5, y: 5}))
    .attach(Crafty.e('FireBar').attr({x: W - FIRE_AMOUNT - 5, y: 10}));
});

Crafty.c('GameOver', {
  init: function() {
    this.requires('StaticDom');

    var stats = Crafty('Stats');
    this
      .bindElementVisibility('game-over')
      .setElementContent('archers-killed', stats.archersKilled)
      .setElementContent('archers-killed-score', stats.archersKilledScore())
      .setElementContent('arrows-destroyed', stats.arrowsDestroyed)
      .setElementContent('arrows-destroyed-score', stats.arrowsDestroyedScore())
      .setElementContent('houses-destroyed', stats.housesDestroyed)
      .setElementContent('houses-destroyed-score', stats.housesDestroyedScore())
      .setElementContent('distance-flown', stats.distanceFlown)
      .setElementContent('score', stats.score());
  },
});

Crafty.c('AnyKey', {
  init: function() {
    var keyDownHandler = function(e) {
      if (e.keyCode != 32) return;
      this.trigger('AnyKey');
      e.preventDefault();
    }.bind(this);

    var mouseDownHandler = function(e) {
      if (e.button != 0) return;
      this.trigger('AnyKey');
      e.preventDefault();
    }.bind(this);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('mousedown', mouseDownHandler);
    
    this.bind('Remove', function() {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('mousedown', mouseDownHandler);
    });
  },
});

Crafty.enterScene('loading');
Crafty.load(ASSETS, function() {
  Crafty.enterScene('game');
});
