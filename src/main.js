import 'pixi';
import 'p2';
import Phaser from 'phaser';
import { fromJS } from 'immutable';

import BootState from './states/Boot';
import SplashState from './states/Splash';
import GameState from './states/Game';

class Game extends Phaser.Game {
  constructor () {
    const width = document.documentElement.clientWidth > 1280 ? 1280 : document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight > 1024 ? 1024 : document.documentElement.clientHeight;
    const multiplier = 1;

    /*
    * TODO: set up dynamic creation of height/width with map
    */
    // super(64 * 20, 48 * 20, Phaser.CANVAS, 'content', null);
    super(640 * 2, 480 * 2, Phaser.CANVAS, 'content', null);

    this.state.add('Boot', BootState, false);
    this.state.add('Splash', SplashState, false);
    this.state.add('Game', GameState, false);

    this.globalState = fromJS({
      tileSize: 64 / multiplier,
    });

    this.state.start('Boot');
  }
}

window.game = new Game();
