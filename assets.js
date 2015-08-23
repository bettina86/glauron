var ASSETS = {
  sprites: {
    'hearts.png': {
      tile: 20,
      tileh: 20,
      map: {
        heart_full: [0, 0],
        heart_half: [1, 0],
        heart_empty: [2, 0],
      },
    },
    'ground.png': {
      tile: 200,
      tileh: 100,
      map: {
        ground_start: [0, 0],
      },
    },
    'dragon.png': {
      tile: 40,
      tileh: 50,
      map: {
        dragon_start: [0, 0],
      },
    },
    'wing.png': {
      tile: 60,
      tileh: 80,
      map: {
        wing_start: [0, 0],
      },
    },
    'house.png': {
      tile: 50,
      tileh: 50,
      map: {
        house_start: [0, 0],
      },
    },
    'church.png': {
      tile: 100,
      tileh: 150,
      map: {
        church_start: [0, 0],
      },
    },
    'archer.png': {
      tile: 20,
      tileh: 30,
      map: {
        archer_body: [0, 0],
        archer_bow: [1, 0],
      },
    },
    'arrow.png': {
      tile: 20,
      tileh: 4,
      map: {
        arrow_start: [0, 0],
        arrow_silver: [0, 1],
      },
    },
    'fire.png': {
      tile: 80,
      tileh: 80,
      map: {
        fire_start: [0, 0],
      },
    },
    'smoke.png': {
      tile: 100,
      tileh: 100,
      map: {
        smoke_start: [0, 0],
      },
    },
    'background.png': {
      tile: 1200,
      tileh: 800,
      map: {
        background_start: [0, 0],
      },
    }
  },
};

var SOUNDS = {
  archer: {volume: 0.5},
  arrow: {volume: 0.5},
  die: {volume: 0.5},
  fire: {volume: 0.1},
  flap: {volume: 0.2},
  heal: {volume: 0.4},
  heart: {volume: 0.8},
  hit: {volume: 0.4},
  house: {volume: 0.3},
  shoot: {volume: 0.1},
  start: {volume: 0.5},
};
