function radToDeg(rad) {
  return 180 / Math.PI * rad;
}

function degToRad(deg) {
  return Math.PI / 180 * deg;
}

function canonicalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function length(dx, dy) {
  return Math.sqrt(dx*dx + dy*dy);
}

function sin(degrees) {
  return Math.sin(degToRad(degrees));
}

function cos(degrees) {
  return Math.cos(degToRad(degrees));
}

function atan2(y, x) {
  return radToDeg(Math.atan2(y, x));
}

function lerp(a, b, f) {
  return (1 - f) * a + f * b;
}

function clamp(min, max, x) {
  return x < min ? min : (x > max ? max : x);
}

function randInt(max) {
  return Math.floor(max * Math.random());
}

function randFloat(min, max) {
  return min + (max - min) * Math.random();
}

function weightedRandom(map) {
  var keys = Object.keys(map);
  var sum = 0;
  for (var i = 0; i < keys.length; i++) {
    sum += map[keys[i]];
  }
  var index = randInt(sum);
  var count = 0;
  for (var i = 0; i < keys.length; i++) {
    count += map[keys[i]];
    if (count > index) {
      return keys[i];
    }
  }
}
