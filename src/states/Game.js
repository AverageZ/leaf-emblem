/* globals __DEV__ */
import Phaser from 'phaser';
// import GameMap from 'sprites/GameMap';
import Character from 'sprites/Character';
import Tile from 'sprites/Tile';
import _ from 'lodash';

import {
  resetGameGrid,
  getRangeForCurrentPlayer,
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
  { moves: 5, range: 1, color: 0x2196F3, row: 1, col: 12, maxHealth: 10, team: 'player' },
  { moves: 4, range: 1, color: 0x2196F3, row: 6, col: 9, maxHealth: 10, team: 'player' },
  { moves: 6, range: 1, color: 0xEF5350, row: 2, col: 2, maxHealth: 10, team: 'enemy' },
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
    drawn: {},
  }

  // updateState = (newState) => {
  //   this.gameState = this.gameState.merge(newState);
  // }

  init() {}
  preload() {}

  handlePlayerDown = (player) => {
    /*
    * clear the current draw
    * clear the path
    */
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
    const range = getRangeForCurrentPlayer(player, this.gameState.grid);
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
}
