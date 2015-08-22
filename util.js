function radToDeg(rad) {
  return 180 / Math.PI * rad;
}

function degToRad(deg) {
  return Math.PI / 180 * deg;
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
