Crafty.c('Stats', {
  init: function() {
    this.archersKilled = 0;
    this.arrowsDestroyed = 0;
    this.housesDestroyed = 0;
    this.churchesDestroyed = 0;
    this.heartsCollected = 0;
    this.distanceFlown = 0;
    this.highestMultiplier = 1;
    this.score = 0;
    this.multiplier = 1;
    this.multiplierLifetime = 0;
    this.level = 0;

    this.bind('EnterFrame', function() {
      if (this.multiplierLifetime > 0) {
        this.multiplierLifetime--;
        if (this.multiplierLifetime <= 0) {
          this.multiplier = 1;
        }
      }
    });
  },

  addPoints: function(points) {
    points *= this.multiplier;
    this.highestMultiplier = Math.max(this.multiplier, this.highestMultiplier);
    this.score += points;
    this.multiplier++;
    this.multiplierLifetime = MULTIPLIER_LIFETIME;
    return points;
  },
});

Crafty.c('Scorable', {
  score: function(points) {
    var stats = Crafty('Stats');
    var prevMultiplier = stats.multiplier;
    points = stats.addPoints(points);

    var score = Crafty.e('2D, Canvas, Text, Float')
      .textColor('white')
      .textFont({family: 'Bilbo', size: '32px', weight: 'bold'})
      .text('+' + points);
    score.attr({x: this.x + this.w/2 - score.w/2, y: this.y + this.h/2 - score.h/2, z: 5});
    
    if (prevMultiplier > 1) {
      var multiplier = Crafty.e('2D, Canvas, Text, Float')
        .textColor('#ff8000')
        .textFont({family: 'Bilbo', size: '24px', weight: 'bold'})
        .text('x' + prevMultiplier);
      multiplier.attr({x: this.x + this.w/2 - multiplier.w/2, y: score.y + score.h - 10, z: 5});
    }
  },
});

Crafty.c('Float', {
  init: function() {
    var lifetime = 120;
    this.bind('EnterFrame', function() {
      lifetime--;
      if (lifetime <= 0) this.destroy();
      this.y--;
      this.alpha = Math.min(1, 3 * (1 - lifetime / 120));
    });
  },
});
