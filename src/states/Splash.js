import Phaser from 'phaser';
import { centerGameObjects } from '../utils';

export default class extends Phaser.State {
  // init() {}

  preload() {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
    centerGameObjects([this.loaderBg, this.loaderBar]);

    this.load.setPreloadSprite(this.loaderBar);
    //
    // load your assets
    //
    // this.load.image('mushroom', 'assets/images/mushroom2.png');
    // this.load.image('game-map-1', 'assets/images/game-map-1.png');
    // this.load.tilemap('desert', 'assets/tilemaps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    // this.load.image('tiles', 'assets/images/tmw_desert_spacing.png');
    this.load.spritesheet('tiles', 'assets/images/basicoutdoor64.png', 64, 64, 126);
    // this.load.spritesheet('chars', 'assets/images/chars.png', 32, 32, 3);
  }

  create() {
    this.state.start('Game');
  }
}
