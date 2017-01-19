import _ from 'lodash';

function tileIsObstacle(tile) {
  tile.state.get('isObstacle');
}

/*
*
* Exports
*
*/

export function centerGameObjects(objects) {
  _.each(objects, (object) => object.anchor.setTo(0.5));
}

/*
* resetGameGrid :: Array -> Mutation
*/
export function resetGameGrid(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      grid[i][j].depth = Infinity;
    }
  }
}

/*
* getNeighborsForTile :: Object, Array -> Array?
*/
export function getNeighborsForTile(tile, gameGrid) {
  const adjacentTiles = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  return _.filter(adjacentTiles, (adjTile, index) => {
    const row = tile.state.get('row') + _.head(adjTile);
    const col = tile.state.get('col') + _.last(adjTile);

    if (row >= 0 && row <= gameGrid.length - 1 && col >= 0 && col <= gameGrid[0].length - 1) {
      return gameGrid[row][col];
    }
  });
}

/*
* getRangeForCurrentPlayer :: Object, Array -> Array?
* @param {Phaser Object} player - The sprite for which we are trying to determine the range
* @param {Array} gameGrid - A nested array of Tiles
*/
export function getRangeForCurrentPlayer(player, gameGrid) {
  /*
  * Constants used to configure method
  */
  const currentTile = gameGrid[player.state.get('row')][player.state.get('col')];

  /*
  * Reset the tile depth
  */
  currentTile.depth = 0;

  /*
  * Set up the local variables
  */
  let visitedTiles = _.fill(Array(1), currentTile);
  let frontier = visitedTiles;

  while (frontier.length !== 0) {
    /*
    * Grab the first item in the array
    * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    * Mutates the array by removing and returning the first element. The array's length is changed
      // Example
      let a = [1, 2, 3];
      let b = a.shift();

      console.log(a, b); // [2, 3], 1
    */
    const activeTile = frontier.shift();

    console.log({activeTile})

    /*
    * As long as the tile is not already in the visited list and its not
    * an obstacle, we can add it to the visited list
    */
    if (visitedTiles.indexOf(activeTile) === -1 && !tileIsObstacle(activeTile)) {
      visitedTiles.push(activeTile);
    }

    /*
    * Create a list of the neighbors to iterate over
    */
    const neighbors = getNeighborsForTile(activeTile, gameGrid);

    _.forEach(neighbors, (neighbor) => {
      let nextDepth = activeTile.depth + Math.max(neighbor.cost, activeTile.cost);

      console.log({ neighbor, neighbors })

      if (tileIsObstacle(neighbor) /* || neighbor.containsEnemy */ || nextDepth > player.moves) {
        nextDepth = Math.max(activeTile.depth + 1, player.moves + 1);

        if (nextDepth > player.moves + player.range) {
          return;
        }
      }

      console.log('this')

      if (nextDepth < neighbor.depth) {
        neighbor.depth = nextDepth;
        neighbor.cameFrom = activeTile;
        frontier.push(neighbor);
      }
    });
  }

  console.log({ visitedTiles })

  return visitedTiles;
}
