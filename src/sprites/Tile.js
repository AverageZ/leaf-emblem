import Phaser from 'phaser';
import { fromJS } from 'immutable';

export default class Tile extends Phaser.Sprite {
  constructor(game, row, col, type) {
    super(
      game,
      game.globalState.get('tileSize') * col,
      game.globalState.get('tileSize') * row,
      'tiles',
      type
    );

    this.game = game;
    this.state = fromJS({
      isObstacle: !type,
      row,
      col,
      cost: type,
    });

    game.add.existing(this);
  }

  /*
  * Provides a setter for checking if a tile has a player
  * @param {Boolean} value
  */
  setContainsPlayer = (value = false) => {
    this.state.set('containsPlayer', value);
  }
}
