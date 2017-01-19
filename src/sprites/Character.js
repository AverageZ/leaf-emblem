import Phaser from 'phaser';
import { fromJS } from 'immutable';

export default class Character extends Phaser.Sprite {
  constructor({ game, moves, range, color, col, row, maxHealth, team, onInputDown }) {
    super(
      game,
      game.globalState.get('tileSize') * col,
      game.globalState.get('tileSize') * row,
      'tiles'
    );

    this.frame = 1;
    this.anchor.setTo(-0.5,-0.5);
    this.scale.setTo(0.5);
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

  addHealthBar = () => {
    console.log('addHealthBar')
  }

  isPlayerType = () => {
    return this.state.get('team') === 'player';
  }

  resetMovement = () => {
    this.state.set('didMove', false);
  }

  enableInput = () => {
    this.inputEnabled = true;
  }

  updateHealth = () => {
    console.log('updateHealth')
  }

  followPath = () => {
    console.log('followPath')
  }

  move = () => {
    console.log('move')
  }
}
