// enemy prefab
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, finderObject, enemyType) {
        super(scene, x, y, texture) // call Sprite parent class
        scene.add.existing(this)           // add enemy to existing scene
        scene.physics.add.existing(this)   // add physics body to scene

        this.body.setSize(this.width-2, this.height-2)
        this.body.setCollideWorldBounds(true)

        // set custom enemy properties
        this.chaseTimer = 15000    // in ms
        this.patrolTimer = 7000    // in ms
        this.type = enemyType
        console.log("I am type ", this.type);

        // Initialize EasyStar pathfinder
        this.finder = finderObject

        // Create grid of visible tiles for use with path planning
        let MainMapGrid = this.layersToGrid(scene, [scene.roadLayer, scene.policeHouseLayer, scene.wallsLayer]);

        let walkables = [45, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 312, 313, 134, 315, 316, 317, 318, 319, 320, 321, 322, 337, 338, 339, 304, 341, 342, 343, 344, 345, 346, 347];

        // Pass grid information to EasyStar
        // EasyStar doesn't natively understand what is currently on-screen,
        // so, you need to provide it that information
        this.finder.setGrid(MainMapGrid);

        // Tell EasyStar which tiles can be walked on
        this.finder.setAcceptableTiles(walkables);

        // initialize state machine managing enemy (initial state, possible states, state args[])
        this.enemyFSM = new StateMachine('patrol', {
            chase: new ChaseState(),
            patrol: new PatrolState(),
        }, [scene, this])   // pass these as arguments to maintain scene/object context in the FSM

        //Store the current player location
        this.currentPlayerX = Math.floor(scene.player.x/scene.TILESIZE);
        this.currentPlayerY = Math.floor(scene.player.y/scene.TILESIZE);
        this.tempX = 1;
        this.tempY = 1;
        this.modifierX = 0;
        this.modifierY = 0;
    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid(scene) {
        let grid = [];
        // Initialize grid as two-dimensional array
        // TODO: write initialization code
        for (let i = 0; i < scene.fillerLayer.layer.height; i++) {
            grid[i] = [];
        }
        // Loop over layers to find tile IDs, store in grid
        // TODO: write this loop
        for (let i = 0; i < scene.fillerLayer.layer.height; ++i) {
            for (let j = 0; j < scene.fillerLayer.layer.width; ++j) {
                let tile = scene.fillerLayer.getTileAt(j, i);
                let tileID = tile.index;

                grid[i].push(tileID);
                //console.log(grid[i])
            }
        }

        for (let i = 0; i < scene.wallsLayer.layer.height; ++i) {
            for (let j = 0; j < scene.wallsLayer.layer.width; ++j) {
                let tile = scene.wallsLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                //console.log(grid[i])
                } else {
                    continue;
                }
            }
        }

        for (let i = 0; i < scene.policeHouseLayer.layer.height; ++i) {
            for (let j = 0; j < scene.policeHouseLayer.layer.width; ++j) {
                let tile = scene.policeHouseLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                //console.log(grid[i])
                } else {
                    continue;
                }
            }
        }

        for (let i = 0; i < scene.roadLayer.layer.height; ++i) {
            for (let j = 0; j < scene.roadLayer.layer.width; ++j) {
                let tile = scene.roadLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                //console.log(grid[i])
                } else {
                    continue;
                }
            }
        }

        return grid;
    }

    handleMove(pointer, enemy, scene) {
        let x = pointer.x*2;
        let y = pointer.y*2;
        if ((Math.floor(x/scene.TILESIZE) + enemy.modifierX > 24) || Math.floor(x/scene.TILESIZE) + enemy.modifierX < 1) {
            enemy.modifierX = 0;
        }
        if ((Math.floor(y/scene.TILESIZE) + enemy.modifierY > 29) || Math.floor(y/scene.TILESIZE) + enemy.modifierY < 1) {
            enemy.modifierY = 0;
        }
        let toX = Math.floor(x/scene.TILESIZE) + enemy.modifierX;
        var toY = Math.floor(y/scene.TILESIZE) + enemy.modifierY;
        var fromX = Math.floor(this.x/(scene.TILESIZE/2));
        var fromY = Math.floor(this.y/(scene.TILESIZE/2));
        console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
    
        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                console.log(path);
                this.moveCharacter(path, this, scene);
            }
        });
        this.finder.calculate(); // ask EasyStar to compute the path
        // When the path computing is done, the arrow function given with
        // this.finder.findPath() will be called.
    }
    
    moveCharacter(path, character, scene) {

        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                x: ex*scene.map.tileWidth,
                y: ey*scene.map.tileHeight,
                duration: 200
            });
        }
    
        scene.tweens.chain({
            targets: character,
            tweens: tweens
        });

    }

    // A function which takes as input a tileset and then iterates through all
    // of the tiles in the tileset to retrieve the cost property, and then 
    // uses the value of the cost property to inform EasyStar, using EasyStar's
    // setTileCost(tileID, tileCost) function.
    setCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.total; tileID++) {
            let props = tileset.getTileProperties(tileID);
            if (props != null) {
                if (props.cost != null) {
                    this.finder.setTileCost(tileID, props.cost);
                }
            }
        }
    }
}

// enemy-specific state classes
class ChaseState extends State {
    enter(scene, enemy) {

    // Set up the chase timer using a promise
    this.chasePromise = new Promise((resolve) => {
            scene.time.delayedCall(enemy.chaseTimer, resolve)
        })
    
        this.chasePromise.then(() => {
            this.stateMachine.transition('patrol')
        })
    }

    execute(scene, enemy) {

        if (enemy.type == "1") {
            //console.log("YIPPIEE A")
            enemy.tempX = Math.floor(scene.player.x/scene.TILESIZE);
            enemy.tempY = Math.floor(scene.player.y/scene.TILESIZE);
            enemy.modifierX = 0;
            enemy.modifierY = 0;
        } else {
            //console.log("YIPPIEE B")
            switch(scene.player.direction) {
                case "up":
                    enemy.modifierY = -4;
                    enemy.modifierX = 0;
                    break;
                case "down":
                    enemy.modifierY = 4;
                    enemy.modifierX = 0;
                    break;
                case "left":
                    enemy.modifierX = -4;
                    enemy.modifierY = 0;
                    break;
                case "right":
                    enemy.modifierX = 4;
                    enemy.modifierY = 0;
                    break;
            }
        }

        enemy.tempX = Math.floor(scene.player.x/scene.TILESIZE);
        enemy.tempY = Math.floor(scene.player.y/scene.TILESIZE);

        if ((enemy.tempX != enemy.currentPlayerX) || (enemy.tempY != enemy.currentPlayerY)) {
            enemy.currentPlayerX = enemy.tempX;
            enemy.currentPlayerY = enemy.tempY;

            scene.tweens.killTweensOf(enemy);
            enemy.handleMove(scene.player, enemy, scene);
        }
    }
}

class PatrolState extends State {
    enter(scene, enemy) {
        console.log("RAAAAAAAAAAHHHHHHHHHHHHHH")
        
        scene.tweens.killTweensOf(enemy);
        if (enemy.type == "1") {
            enemy.handleMove(scene.patrol_point_1, enemy, scene);
        } else {
            enemy.handleMove(scene.patrol_point_2, enemy, scene);
        }

        // set patrol timer
        scene.time.delayedCall(enemy.patrolTimer, () => {
            this.stateMachine.transition('chase')
        })
    }
}
