var W = 1200;
var H = 800;

var SEGMENT_WIDTH = 100;
var SKIRT_WIDTH = 50;
var SKIRT_HEIGHT = 50;

var G = .05;
var FLAP_SPEED = 4;
var FLAP_TIME = 10;
var FLAP_INTERVAL = 30;
var FIRE_INTERVAL = 60;

var GROUND_Y = 650;
var GROUND_MIN_Y = H / 3;
var GROUND_MAX_Y = H - 100;

var ARCHER_WIDTH = 20;
var ARCHER_HEIGHT = 30;
var ARROW_SPEED = 5;
var ARROW_G = 0.01;

var FIRE_AMOUNT = 60;
var FIRE_REPLENISH = 0.3;
var FIRE_SIZE_START = 10;
var FIRE_SIZE_END = 80;
var FIRE_SPEED = 5;
var FIRE_DISTANCE = 300;
var FIRE_LIFETIME = FIRE_DISTANCE / FIRE_SPEED;

var HOUSE_WIDTH = 50;
var HOUSE_HEIGHT = 50;
var HEART_SPAWN_PROB = 0.3;
var HEART_RISE_SPEED = 3;

Crafty.c('Velocity', {
  init: function() {
    this.vx = 0;
    this.vy = 0;

    this.bind('EnterFrame', function() {
      this.x += this.vx;
      this.y += this.vy;
    });
  },

  velocity: function(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  },
});

Crafty.c('Despawn', {
  init: function() {
    this.bind('EnterFrame', function() {
      if (this.x + this.w < -Crafty.viewport.x) {
        this.destroy();
      }
    });
  },
});

Crafty.c('FollowedByCamera', {
  init: function() {
    this.bind('EnterFrame', function() {
      Crafty.viewport.scroll('x', -(this.x - 200));
    });
  },
});

Crafty.c('StaticDom', {
  bindElementVisibility: function(id) {
    this.element = document.getElementById(id);
    this.element.style.display = 'block';

    this.bind('Remove', function() {
      this.element.style.display = 'none';
    });

    return this;
  },

  setElementContent: function(id, content) {
    var element = document.getElementById(id);
    element.innerText = content;
    return this;
  },
});
