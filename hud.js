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

Crafty.c('FireBar', {
  init: function() {
    this.requires('2D, Canvas, Color');
    this
      .attr({h: 10})
      .color('#ff8000');

    this.bind('EnterFrame', function() {
      var dragon = Crafty('DragonCore');
      if (dragon.length == 0) return;
      this.w = dragon.fireAmount;
    });
  },
});
