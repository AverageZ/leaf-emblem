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
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,2,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,2,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
    gameMap: map,
    grid: [],
    turn: '',
    units,
    currentPath: {},
    drawn: [],
  }

  init() {}
  preload() {}

  updateCurrentDrawnTiles = (tiles) => {
    this.gameState.drawn = tiles;
  }

  drawCharacterRange = (player, range) => {
    const tileSize = this.game.globalState.get('tileSize');
    const gamePointer = this.game;

    /*
    * createTile :: Int, Int, Int -> Object
    */
    function createTile(row, col, color) {
      const newTile = gamePointer.add.sprite(col * tileSize, row * tileSize, 'tiles');
      newTile.frame = 1;
      newTile.tint = color;
      newTile.alpha = 0.7;
      newTile.row = row,
      newTile.col = col;

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
    this.updateCurrentDrawnTiles(drawnTiles);

    /*
    * Move units to top
    */
    this.moveUnitsToTop();
  }

  handlePlayerDown = (player) => {
    clearDrawnTiles(this.gameState.drawn);
    this.updateCurrentDrawnTiles([]);

    const playerPosition = {
      row: player.state.get('row'),
      col: player.state.get('col'),
    };

    const playerTile = this.gameState.grid[playerPosition.row][playerPosition.col];

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
    const handlerFunctions = {
      player: this.handlePlayerDown,
      enemy: this.handleEnemyDown,
    };

    this.gameState.units = _.map(unitList, (unit) => {
      return new Character({
        ...unit,
        game,
        onInputDown: handlerFunctions[unit.team],
      });
    });
  }

  create() {
    const tileSize = this.game.globalState.get('tileSize');
    const columns = this.game.width / tileSize;
    const rows = this.game.height / tileSize;

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
      (units) => _.filter(units, (unit) => unit.isPlayerType()),
      (units) => _.map(units, (unit) => {
        unit.enableInput();
        unit.resetMovement();
      })
    ])(this.gameState.units);
  }

  render() {
  }

  moveUnitsToTop = () => {
    _.forEach(this.gameState.units, (unit) => this.game.world.bringToTop(unit));
  }
}
