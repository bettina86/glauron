Crafty.init(W, H, document.getElementById('game'));
Crafty.timer.FPS(60);

var LEVELS = [
  {
    archer: 4,
    house: 4,
    village: 2,
  },
  {
    archer: 3,
    house: 3,
    village: 2,
    army: 2,
  },
  {
    archer: 2,
    house: 2,
    village: 3,
    army: 3,
  },
  {
    archer: 1,
    house: 1,
    village: 3,
    army: 3,
    largeArmy: 2,
  },
  {
    archer: 1,
    village: 2,
    army: 3,
    largeArmy: 4,
  }
];

Crafty.c('Spawner', {
  init: function() {
    this.nextX = 1.5 * W;

    this.bind('EnterFrame', function() {
      if (this.nextX <= -Crafty.viewport.x + W) {
        var levelNumber = Math.floor(this.nextX / 10000);
        var level = LEVELS[levelNumber] || LEVELS[LEVELS.length - 1];
        var type = weightedRandom(level);
        switch (type) {
          case 'archer':
            this.spawn('Archer');
            break;
          case 'house':
            this.spawn('House');
            break;
          case 'village':
            for (var i = 1 + randInt(2); i > 0; i--) {
              this.spawn('Archer', randFloat(30, 60));
            }
            for (var i = 2 + randInt(2); i > 0; i--) {
              this.spawn('House', randFloat(20, 40));
            }
            for (var i = 1 + randInt(2); i > 0; i--) {
              this.spawn('Archer', randFloat(30, 60));
            }
            break;
          case 'army':
            for (var i = 2 + randInt(2); i > 0; i--) {
              for (var j = 2 + randInt(2); j > 0; j--) {
                this.spawn('Archer', randFloat(20, 40));
              }
              this.nextX += randFloat(50, 100);
            }
            break;
          case 'largeArmy':
            for (var i = 2 + randInt(3); i > 0; i--) {
              for (var j = 2 + randInt(3); j > 0; j--) {
                this.spawn('Archer', randFloat(20, 30));
              }
              this.nextX += randFloat(80, 160);
            }
            break;
        }
        this.nextX += randFloat(300, W);
      }
    });
  },

  spawn: function(type, advance) {
    var entity = Crafty.e(type + ', SnapToGround, Despawn')
      .attr({x: this.nextX})
      .snapToGround();
    this.nextX += entity.w + (advance || 0);
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
      // DEBUG
      if (e.keyCode == 72) {
        this.heal(100);
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

  Crafty.background('#aaaaaa');

  Crafty.e('Stats');

  var dragon = Crafty.e('DragonCore, Input, FollowedByCamera')
    .attr({x: 100, y: 100});
  dragon.bind('Die', function() {
    Crafty('Spawner').destroy();
    Crafty.e('Delay').delay(function() {
      Crafty.e('GameOver');
    }, 1000);
    Crafty.e('Delay').delay(function() {
      Crafty.e('AnyKey')
        .bind('AnyKey', function() {
          Crafty.enterScene('game');
        });
    }, 2000);
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
