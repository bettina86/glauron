Crafty.init(W, H, document.getElementById('game'));
Crafty.timer.FPS(60);

var LEVELS = [
  {
    archer: 4,
    house: 4,
    village: 2,
  },
  {
    archer: 2,
    longbowman: 1,
    house: 3,
    village: 2,
    army: 2,
  },
  {
    archer: 1,
    longbowman: 1,
    house: 2,
    village: 3,
    army: 3,
  },
  {
    longbowman: 1,
    house: 1,
    village: 3,
    army: 3,
    largeArmy: 2,
  },
  {
    longbowman: 1,
    village: 2,
    army: 3,
    largeArmy: 4,
  }
];

Crafty.c('Spawner', {
  init: function() {
    this.nextX = 1.5 * W;
    var lastLevel = -1;

    this.bind('EnterFrame', function() {
      var levelNumber = Crafty('Stats').level;
      if (levelNumber > lastLevel) {
        lastLevel = levelNumber;
        Crafty.e('LevelBar, Despawn')
          .attr({x: -Crafty.viewport.x + W, y: 100})
          .text('Level ' + (levelNumber + 1));
      }
      if (this.nextX <= -Crafty.viewport.x + W) {
        var level = LEVELS[levelNumber] || LEVELS[LEVELS.length - 1];
        var type = weightedRandom(level);
        switch (type) {
          case 'archer':
            this.spawn('Archer');
            break;
          case 'longbowman':
            this.spawn('Longbowman');
            break;
          case 'house':
            this.spawn('House');
            break;
          case 'village':
            for (var i = 1 + randInt(2); i > 0; i--) {
              this.spawn(Math.random() < 0.05 ? 'Longbowman' : 'Archer', randFloat(30, 60));
            }
            for (var i = 2 + randInt(2); i > 0; i--) {
              this.spawn('House', randFloat(20, 40));
            }
            for (var i = 1 + randInt(2); i > 0; i--) {
              this.spawn(Math.random() < 0.05 ? 'Longbowman' : 'Archer', randFloat(30, 60));
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
                this.spawn(j == 1 ? 'Longbowman' : 'Archer', randFloat(20, 30));
              }
              this.nextX += randFloat(80, 160);
            }
            break;
        }
        this.nextX += randFloat(300, 800);
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

Crafty.c('LevelBar', {
  init: function() {
    this.requires('2D, Canvas, Text');
    this
      .textColor('#ffffff')
      .textFont({family: 'Bilbo', size: '64px', weight: 'bold'});
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

Crafty.defineScene('intro', function() {
  Crafty.e('StaticDom')
    .bindElementVisibility('loading');
});

Crafty.defineScene('game', function() {
  Crafty('*').destroy();

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

  Crafty.e('Fixed')
    .attach(Crafty.e('HealthBar').attr({x: 5, y: 5}))
    .attach(Crafty.e('ScoreBar'))
    .attach(Crafty.e('FireBar').attr({x: W - FIRE_AMOUNT - 5, y: 10}));
});

Crafty.c('GameOver', {
  init: function() {
    this.requires('StaticDom');

    var stats = Crafty('Stats');
    this
      .bindElementVisibility('game-over')
      .setElementContent('archers-killed', stats.archersKilled)
      .setElementContent('arrows-destroyed', stats.arrowsDestroyed)
      .setElementContent('houses-destroyed', stats.housesDestroyed)
      .setElementContent('distance-flown', stats.distanceFlown)
      .setElementContent('level-reached', stats.level + 1)
      .setElementContent('highest-multiplier', stats.highestMultiplier)
      .setElementContent('score', stats.score);
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

Crafty.enterScene('intro');

var thingsLoading = 0;

Crafty.load(ASSETS, doneLoading);
thingsLoading++;

for (var key in SOUNDS) {
  var sound = SOUNDS[key];
  SOUNDS[key] = new Howl({
    urls: [key + '.wav'],
    onload: loadedOne,
    onloaderror: loadedOne,
    volume: sound.volume,
  });
  thingsLoading++;
}

function loadedOne() {
  thingsLoading--;
  if (!thingsLoading) doneLoading();
}
    
function doneLoading() {
  Crafty.e('AnyKey, StaticDom, Delay')
    .bind('AnyKey', function() {
      Crafty.enterScene('game');
    })
    .setElementContent('loading-text', 'Click or press space to start');
}
