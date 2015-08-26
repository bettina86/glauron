Crafty.c('HealthBar', {
  init: function() {
    this.requires('2D');

    var health = null;

    var hearts = [];
    for (var i = 0; i < 5; i++) {
      hearts[i] = Crafty.e('2D, Canvas, Sprite, heart_full')
        .attr({x: 20 * i, y: 0});
      this.attach(hearts[i]);
    }

    function update(health) {
      health = Math.round(health / 10);
      for (var i = 0; i < 5; i++) {
        var heart = hearts[i];
        heart.removeComponent('heart_empty');
        heart.removeComponent('heart_half');
        heart.removeComponent('heart_full');
        if (health <= 2*i) {
          heart.addComponent('heart_empty');
        } else if (health <= 2 * i + 1) {
          heart.addComponent('heart_half');
        } else {
          heart.addComponent('heart_full');
        }
      }
    }

    this.bind('EnterFrame', function() {
      var dragon = Crafty('DragonCore');
      if (dragon.length == 0) {
        health = 0;
        update(health);
        return;
      }
      if (health !== dragon.health) {
        health = dragon.health;
        update(health);
      }
    });
  },
});

Crafty.c('ScoreBar', {
  init: function() {
    this.requires('2D, Canvas, Text');
    this
      .textColor('#cccccc')
      .textFont({family: 'Bilbo', size: '32px', weight: 'bold'});
    this.bind('EnterFrame', function() {
      var stats = Crafty('Stats');
      this.text('Score: ' + stats.score);
    });
  },
});

Crafty.c('FireBar', {
  init: function() {
    this.requires('2D');
    this.w = FIRE_AMOUNT;
    var bar = Crafty.e('2D, Canvas, Color')
      .attr({h: 10})
      .color('#ff8000');
    this.attach(bar);

    this.bind('EnterFrame', function() {
      var dragon = Crafty('DragonCore');
      if (dragon.length == 0) return;
      bar.w = dragon.fireAmount;
    });
  },
});

Crafty.c('Left', {
  init: function() {
    this.requires('2D');
    this.bind('EnterFrame', function() {
      this.x = -Crafty.viewport.x + 5;
    });
  },
});

Crafty.c('Center', {
  init: function() {
    this.requires('2D');
    this.bind('EnterFrame', function() {
      this.x = -Crafty.viewport.x + 0.5 * (Crafty.viewport.width / Crafty.viewport._scale - this.w);
    });
  },
});

Crafty.c('Right', {
  init: function() {
    this.requires('2D');
    this.bind('EnterFrame', function() {
      this.x = -Crafty.viewport.x + Crafty.viewport.width / Crafty.viewport._scale - this.w - 5;
    });
  },
});
