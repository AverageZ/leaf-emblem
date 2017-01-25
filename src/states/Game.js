/* globals __DEV__ */
import Phaser from 'phaser';
// import GameMap from 'sprites/GameMap';
import Character from 'sprites/Character';
import Tile from 'sprites/Tile';
import _ from 'lodash';

import {
  resetGameGrid,
  getRangeForCurrentPlayer,
  clearDrawnTiles,
} from 'utils';

const map = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 93, 93, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 88, 89, 88, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 88, 93, 88, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 88, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 93, 2, 2, 2, 88, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 93, 93, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 93, 2, 93, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 28, 21, 21, 21, 29, 46, 28, 21, 21, 21, 21, 21, 21],
  [28, 21, 26, 21, 21, 21, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const units = [
  { moves: 5, range: 1, color: 0x03A9F4, row: 0, col: 19, maxHealth: 10, team: 'player' },
  { moves: 4, range: 1, color: 0x03A9F4, row: 6, col: 9, maxHealth: 10, team: 'player' },
  { moves: 6, range: 1, color: 0xF44336, row: 2, col: 2, maxHealth: 10, team: 'enemy' },
];

// const playerUnits = [];
// const enemyUnits = [];

// const turn = 'player';

export default class extends Phaser.State {
  gameState = {
    units,
    gameMap: map,
    turn: '',
    grid: [],
    drawn: [],
    currentPath: [],
  }

  init() {}
  preload() {}

  updateCurrentStateTiles = (key, tiles) => {
    this.gameState[key] = tiles;
  }

  drawPath = (start, end) => {
    clearDrawnTiles(this.gameState.currentPath);
    this.updateCurrentStateTiles('currentPath', []);

    const tileSize = this.game.globalState.get('tileSize');
    const gamePointer = this.game;
    const newPath = [];
    let destination = end;

    function createPathTile(col, row) {
      const newTile = gamePointer.add.sprite(col, row, 'tiles');
      newTile.frame = 1;
      newTile.tint = 0x00FF00;
      newTile.alpha = 0.5;

      return newTile;
    }

    while (destination.cameFrom) {
      newPath.push(createPathTile(destination.state.get('col') * tileSize, destination.state.get('row') * tileSize));
      destination = destination.cameFrom;
    }

    newPath.push(createPathTile(start.state.get('col') * tileSize, start.state.get('row') * tileSize));

    this.updateCurrentStateTiles('currentPath', newPath);
  }

  drawCharacterRange = (player, range) => {
    const { grid } = this.gameState;
    const self = this;
    const tileSize = this.game.globalState.get('tileSize');
    const drawPath = this.drawPath;
    const gamePointer = this.game;
    const currentLocation = grid[player.state.get('row')][player.state.get('col')];

    /*
    * createTile :: Int, Int, Int -> Object
    */
    function createTile(row, col, color) {
      const newTile = gamePointer.add.sprite(col * tileSize, row * tileSize, 'tiles');
      newTile.frame = 1;
      newTile.alpha = 0.7;
      newTile.tint = color;
      newTile.row = row;
      newTile.col = col;

      /*
      * Used to allow movement
      */
      newTile.inputEnabled = true;

      if (color !== 0xFF0000) {
        newTile.events.onInputOver.add((tile) => {
          drawPath(player, grid[tile.row][tile.col]);
          gamePointer.world.bringToTop(player);
        }, this);

        newTile.events.onInputDown.add((tile) => {
          // player.inputEnabled = false;

          clearDrawnTiles(self.gameState.currentPath);
          clearDrawnTiles(self.gameState.drawn);
          player.move({
            endLocation: grid[tile.row][tile.col],
            currentLocation,
          });
        }, this);
      }

      return newTile;
    }

    /*
    * Iterate over the range
    * If the tile in range has a depth that is less than or equal to the
    * player's moves, we color it blue.
    * Else the tile gets colored red to mark end of the move range for player
    */
    const drawnTiles = _.map(range, (tile) =>
      createTile(
        tile.state.get('row'),
        tile.state.get('col'),
        tile.depth <= player.state.get('moves') ? 0x0000FF : 0xFF0000
      )
    );

    /*
    * Apply the newly created list to the gameState
    */
    this.updateCurrentStateTiles('drawn', drawnTiles);

    /*
    * Move units to top
    */
    this.moveUnitsToTop();
  }

  handlePlayerDown = (player) => {
    clearDrawnTiles(this.gameState.drawn);
    this.updateCurrentStateTiles('drawn', []);
    /*
    * Reset the game grid depth values
    */
    resetGameGrid(this.gameState.grid);

    /* get range */
    this.drawCharacterRange(player, getRangeForCurrentPlayer(player, this.gameState.grid));
  }

  handleEnemyDown = () => {
    console.log('handleEnemyDown');
  }

  createGameMap = (rows, columns) => {
    const { grid, gameMap } = this.gameState;

    for (let i = 0; i < rows; i++) {
      grid[i] = [];

      for (let j = 0; j < columns; j++) {
        grid[i][j] = new Tile(this.game, i, j, gameMap[i][j]);
      }
    }
  }

  createUnits = (unitList) => {
    const { game } = this;
    const handlerFunctions = {
      player: this.handlePlayerDown,
      enemy: this.handleEnemyDown,
    };

    this.gameState.units = _.map(unitList, (unit) => (
      new Character({
        ...unit,
        game,
        onInputDown: handlerFunctions[unit.team],
      })
    ));
  }

  create() {
    const tileSize = this.game.globalState.get('tileSize');
    const columns = this.game.width / tileSize;
    const rows = this.game.height / tileSize;


    this.game.scale.maxWidth = 640 * 2;
    this.game.scale.maxHeight = 480 * 2;
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.game.scale.setScreenSize();

    this.createGameMap(rows, columns);
    this.createUnits(this.gameState.units);
    this.playerTurn();
  }

  playerTurn = () => {
    /*
    * Set the turn type to player
    */
    this.gameState.turn = 'player';

    /*
    * Make the player units clickable
    */
    _.flow([
      (list) => _.filter(list, (unit) => unit.isPlayerType()),
      (list) => _.map(list, (unit) => {
        unit.enableInput();
        unit.resetMovement();
      }),
    ])(this.gameState.units);
  }

  render() {
  }

  moveUnitsToTop = () => {
    _.forEach(this.gameState.units, (unit) => this.game.world.bringToTop(unit));
  }
}
