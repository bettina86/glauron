Crafty.c('GroundManager', {
  init: function() {
    var segmentWidth = 100;
    var segments = [];
    var left = -W;
    var right = -W;

    this.bind('EnterFrame', function() {
      var viewportLeft = -Crafty.viewport.x - W;
      var viewportRight = left + 2 * W;
      while (left < viewportLeft && segments.length > 0) {
        var segment = segments.shift();
        segment.destroy();
        left += segmentWidth;
      }
      while (right < viewportRight) {
        var segment = Crafty.e('2D, Canvas, Color, Ground')
          .attr({x: right, y: GROUND_Y, w: segmentWidth, h: H - GROUND_Y})
          .color('#ffffff');
        segments.push(segment);
        right += segmentWidth;
      }
    });
  },
});

