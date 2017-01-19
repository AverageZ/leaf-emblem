import _ from 'lodash';

/*
* tileIsObstacle :: Object -> Boolean
*/
function tileIsObstacle(tile) {
  return tile.state.get('isObstacle');
}

/*
*
* Exports
* centerGameObjects :: Array -> Mutation
* resetGameGrid :: Array -> Mutation
* getNeighborsForTile :: Object, Array -> Array
* getRangeForCurrentPlayer :: Object, Array -> Array
*
*/

/*
* centerGameObjects :: Array -> Mutation
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

  return _.reduce(adjacentTiles, (acc, adjTile) => {
    const row = tile.state.get('row') + adjTile[0];
    const col = tile.state.get('col') + adjTile[1];

    if (row >= 0 && row <= gameGrid.length - 1 && col >= 0 && col <= gameGrid[0].length - 1) {
      return _.concat(acc, gameGrid[row][col]);
    }

    return acc;
  }, []);
}

/*
* TODO: Possibly break this up into smaller chunks, the neighbor iteration towards the end
* could be pulled apart
* getRangeForCurrentPlayer :: Object, Array -> Array
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
  let frontier = _.fill(Array(1), currentTile);

  /* A set of training wheels, if you will */
  let i = 0;

  while (frontier.length !== 0 && i < 1000) {
    i++;
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
      let nextDepth = activeTile.depth + Math.max(neighbor.state.get('cost'), activeTile.state.get('cost'));

      if (tileIsObstacle(neighbor) /* || neighbor.containsEnemy */ || nextDepth > player.state.get('moves')) {
        nextDepth = Math.max(activeTile.depth + 1, player.state.get('moves') + 1);

        if (nextDepth > player.state.get('moves') + player.state.get('range')) {
          return;
        }
      }

      if (nextDepth < neighbor.depth) {
        neighbor.depth = nextDepth;
        neighbor.cameFrom = activeTile;
        frontier.push(neighbor);
      }
    });
  }

  return visitedTiles;
}
