import Phaser from 'phaser';
import { fromJS } from 'immutable';
import { createPlayerPath } from 'utils';
import _ from 'lodash';

export default class Character extends Phaser.Sprite {
  constructor({ game, moves, range, color, col, row, maxHealth, team, onInputDown }) {
    super(
      game,
      game.globalState.get('tileSize') * col,
      game.globalState.get('tileSize') * row,
      'tiles'
    );

    this.frame = 1;
    this.color = color;
    this.tint = color;

    this.state = fromJS({
      moves,
      range,
      color,
      col,
      row,
      maxHealth,
      team,
      didMove: false,
    });

    this.game = game;
    this.events.onInputDown.add(onInputDown, this);
    game.add.existing(this);
  }

  addHealthBar = () => {}

  isPlayerType = () => (
    this.state.get('team') === 'player'
  )

  resetMovement = () => {
    this.state.set('didMove', false);
  }

  enableInput = () => {
    this.inputEnabled = true;
  }

  updateHealth = () => {}

  followPath = (path) => {
    const unitTween = this.game.add.tween(this);
    const tileSize = this.game.globalState.get('tileSize');
    let currentCost = 0;

    /*
    * TODO: update moves pool
    */
    // while (path.length > 0) {
    //   const nextTile = path.pop();
    //   console.log({ nextTile })

    //   unitTween.to({
    //     x: nextTile.state.get('col') * tileSize,
    //     y: nextTile.state.get('row') * tileSize,
    //   }, 300 * Math.max(nextTile.cost, currentCost), Phaser.Easing.Linear.None);

    //   currentCost = nextTile.cost;
    // }

    // console.log('getting here?')

    _.forEach(_.reverse(path), (tile) => {
      unitTween.to({
        x: tile.state.get('col') * tileSize,
        y: tile.state.get('row') * tileSize,
      }, 300 * Math.max(tile.state.get('cost'), currentCost), Phaser.Easing.Linear.None);

      currentCost = tile.state.get('cost');
    });

    unitTween.start();

    /*
    * Grey out moved player
    */
    // unitTween.onComplete.add(onComplete);
  }

  move = ({ endLocation, currentLocation }) => {
    const playerPath = createPlayerPath(endLocation);
    /*
    * The current tile now no longer has player
    */
    currentLocation.setContainsPlayer(false);

    this.followPath(playerPath);
  }
}
