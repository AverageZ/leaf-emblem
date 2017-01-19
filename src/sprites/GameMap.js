import Phaser from 'phaser';

export default class GameMap extends Phaser.Tilemap {
  constructor({ game, key, tileWidth, tileHeight, width, height }) {
    super(game, key, tileWidth, tileHeight, width, height);

    this.game = game;
  }
}
