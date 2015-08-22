Crafty.c('Ground', {
  init: function() {
    this.requires('2D, Canvas, Color');
    this
      .attr({y: GROUND_Y, w: W*3, h: H - GROUND_Y})
      .color('#ffffff');
    this.bind('EnterFrame', function() {
      this.x = -Crafty.viewport.x;
    });
  },
});

