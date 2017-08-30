import canvas from './canvas';
import map from './map';
import Path from './path';
import {
  BELT_L,
  TILE_TYPE_BELT,
  TILE_TYPE_BELT_START,
  TILE_TYPE_BELT_END,
  TILE_TYPE_PATH } from './constants';

export default class Belt {
  constructor(start, end, pos) {
    this.ctx = canvas.getContext('2d');

    this.start = start;
    this.end = end;
    this.pos = pos;
    this.path = null;
    this.luggages = [];

    this.generate();
  }

  generate() {
    map.grid.forEach((row, index) => {
      if (index === 0) {
        row.forEach((x, ridx) => {
          if (this.end[1] <= ridx && this.start[1] >= ridx) {
            map.grid[index][ridx] = TILE_TYPE_BELT;
          }
        });
      }
    });

    for (let x = 0; x < BELT_L; x++) {
      map.grid[x][this.pos] = TILE_TYPE_BELT;
    }

    map.grid[BELT_L - 1][this.pos - 1] = TILE_TYPE_BELT;
    map.grid[0][this.pos - 1] = TILE_TYPE_PATH;


    for (let x = 0; x < BELT_L; x++) {
      map.grid[x][this.pos - 2] = TILE_TYPE_BELT;
    }

    map.grid[this.start[0]][this.start[1]] = TILE_TYPE_BELT_START;
    map.grid[this.end[0]][this.end[1]] = TILE_TYPE_BELT_END;

    const path = new Path(
      this.start,
      this.end,
      map.grid,
      [TILE_TYPE_BELT, TILE_TYPE_BELT_START, TILE_TYPE_BELT_END],
    );

    this.path = path.findShortestPath();
  }

  update() {
    if (this.luggages.length) {
      this.luggages.forEach(l => {
        if (!l.ready) {
          // TODO: add timeout
          const currentTile = map
            .getTile(this.path.grid[0][0], this.path.grid[0][1]);
          l.x = currentTile.centerX;
          l.y = currentTile.centerY;
          l.path = {
            directions: [...this.path.directions],
            grid: [...this.path.grid],
          };
          l.ready = true;
          l.updatePath = true;
          l.loop--;
        }

        if (l.ready) l.update();
      });
    }
  }

  render() {
    if (this.luggages.length) {
      this.luggages.forEach(l => {
        if (l.ready) l.render();
      });
    }
  }
}