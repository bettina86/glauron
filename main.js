var LEVELS = [
  {
  },
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
    longbowman: 1,
    house: 2,
    church: 1,
    village: 3,
    army: 3,
  },
  {
    longbowman: 1,
    house: 1,
    church: 2,
    village: 2,
    army: 2,
    largeArmy: 2,
  },
  {
    church: 2,
    village: 1,
    city: 2,
    army: 2,
    largeArmy: 3,
  },
  {
    church: 1,
    city: 3,
    army: 2,
    largeArmy: 4,
  },
  {
    church: 1,
    city: 2,
    army: 3,
    largeArmy: 4,
  },
  {
    city: 2,
    army: 3,
    largeArmy: 5,
  },
  {
    city: 1,
    army: 2,
    largeArmy: 6,
  },
  {
    largeArmy: 10,
  },
];

Crafty.c('Spawner', {
  init: function() {
    this.nextX = W;
    var spawns = [];

    this.bind('EnterFrame', function() {
      if (spawns.length == 0) {
        var stats = Crafty('Stats');
        stats.level++;
        var level = LEVELS[stats.level] || LEVELS[LEVELS.length - 1];
        for (var key in level) {
          for (var i = 0; i < level[key]; i++) {
            spawns.push(key);
          }
        }
        shuffle(spawns);
        spawns.push('levelbar');
      }
      if (this.nextX <= -Crafty.viewport.x + W) {
        var type = spawns.pop();
        switch (type) {
          case 'levelbar':
            Crafty.e('LevelBar, Despawn');
            break;
          case 'archer':
            this.spawn('Archer');
            break;
          case 'longbowman':
            this.spawn('Longbowman');
            break;
          case 'house':
            this.spawn('House');
            break;
          case 'church':
            this.spawn('Church');
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
          case 'city':
            for (var i = 2 + randInt(2); i > 0; i--) {
              this.spawn(Math.random() < 0.05 ? 'Longbowman' : 'Archer', randFloat(30, 60));
            }
            for (var i = 2 + randInt(2); i > 0; i--) {
              this.spawn(i == 1 ? 'Church' : 'House', randFloat(20, 40));
            }
            for (var i = 2 + randInt(2); i > 0; i--) {
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
    this.requires('2D, Canvas, Text, Despawn');
    this
      .textColor('#ffffff')
      .textFont({family: 'Bilbo', size: '64px', weight: 'bold'})
      .attr({x: -Crafty.viewport.x + W, y: 100, z: -5})
      .text('Level ' + Crafty('Stats').level);
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
      } else if (e.keyCode == 83) {
        this.vx *= 2;
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

  Crafty.e('HealthBar, Left').attr({y: 5});
  Crafty.e('ScoreBar, Center').attr({y: 0});
  Crafty.e('FireBar, Right').attr({y: 10});
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
      .setElementContent('churches-destroyed', stats.churchesDestroyed)
      .setElementContent('distance-flown', stats.distanceFlown)
      .setElementContent('level-reached', stats.level)
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
      if (e.target.tagName == 'A') return;
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

document.addEventListener('DOMContentLoaded', function() {
  var container = document.getElementById('container');
  Crafty.init(undefined, undefined, document.getElementById('game'));
  Crafty.timer.FPS(60);

  var oldW = null;
  var oldH = null;
  Crafty.bind('EnterFrame', function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var blackBars = w > h * W / H;
    if (blackBars) {
      w = h * W / H;
    }
    var scale = h / H;
    if (Math.abs(Crafty.viewport._scale - scale) > 0.00001
        || Crafty.viewport._width != oldW
        || Crafty.viewport._height != oldH) {
      Crafty.viewport.width = w;
      Crafty.viewport.height = h;
      Crafty.viewport.scale(scale);
      oldW = w;
      oldH = h;
      if (blackBars) {
        container.style.width = Math.round(w) + 'px';
      } else {
        container.style.width = null;
      }
    }
  });

  Crafty.enterScene('intro');

  var thingsLoading = 0;

  Crafty.load(ASSETS, loadedOne.bind(null, 'Crafty assets'));
  thingsLoading++;

  for (var key in SOUNDS) {
    var sound = SOUNDS[key];
    SOUNDS[key] = new Howl({
      urls: [key + '.ogg', key + '.mp3'],
      onload: loadedOne.bind(null ,key),
      onloaderror: loadedOne.bind(null ,key),
      volume: sound.volume,
    });
    thingsLoading++;
  }

  function loadedOne(what) {
    thingsLoading--;
    // console.log('Loaded ' + what);
    if (!thingsLoading) doneLoading();
  }
      
  function doneLoading() {
    Crafty.e('AnyKey, StaticDom, Delay')
      .bind('AnyKey', function() {
        Crafty.enterScene('game');
      })
      .setElementContent('loading-text', 'Click or press space to start');
  }

  window.addEventListener('focus', function() {
    Crafty.pause(false);
  });

  window.addEventListener('blur', function() {
    Crafty.pause(true);
  });
});
