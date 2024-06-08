class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGameScene");
    }

    init() {
        this.TILESIZE = 32;
        this.SCALE = 2.0;
        this.TILEWIDTH = 25;
        this.TILEHEIGHT = 30;
    }

    create() {
        //Test Log
        console.log("what da dog doin");

        // Create a new tilemap which uses 32x32 tiles, and is 25 tiles wide and 30 tiles tall
        this.map = this.add.tilemap("MainMap", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);

        // Add a tileset to the map
        this.tileset_Pico = this.map.addTilesetImage("Roads", "Pico_8_City");

        // Create the layers
        this.wallsLayer = this.map.createLayer("Walls", this.tileset_Pico, 0, 0);
        this.roadLayer = this.map.createLayer("Roads", this.tileset_Pico, 0, 0);
        this.policeHouseLayer = this.map.createLayer("Pico_Police_House", this.tileset_Pico, 0, 0);

        // Create Player Car Sprite
        // Use setOrigin() to ensure the tile space computations work well
        my.sprite.PlayerCar = this.add.sprite(this.tileXtoWorld(12), this.tileYtoWorld(25), "Player").setOrigin(0,0);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // Create grid of visible tiles for use with path planning
        let MainMapGrid = this.layersToGrid([this.roadLayer, this.policeHouseLayer, this.wallsLayer]);

        let walkables = [45, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 312, 313, 134, 315, 316, 317, 318, 319, 320, 321, 322, 337, 338, 339, 304, 341, 342, 343, 344, 345, 346, 347];
    
        // Initialize EasyStar pathfinder
        this.finder = new EasyStar.js();

        // Pass grid information to EasyStar
        // EasyStar doesn't natively understand what is currently on-screen,
        // so, you need to provide it that information
        this.finder.setGrid(MainMapGrid);

        // Tell EasyStar which tiles can be walked on
        this.finder.setAcceptableTiles(walkables);

        this.activeCharacter = my.sprite.PlayerCar;

        // Handle mouse clicks
        // Handles the clicks on the map to make the character move
        // The this parameter passes the current "this" context to the
        // function this.handleClick()
        this.input.on('pointerup',this.handleClick, this);
    }

    update() {

    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE/2;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE/2;
    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid() {
        let grid = [];
        // Initialize grid as two-dimensional array
        // TODO: write initialization code
        for (let i = 0; i < this.wallsLayer.layer.height; i++) {
            grid[i] = [];
        }
        // Loop over layers to find tile IDs, store in grid
        // TODO: write this loop
        for (let i = 0; i < this.wallsLayer.layer.height; ++i) {
            for (let j = 0; j < this.wallsLayer.layer.width; ++j) {
                let tile = this.wallsLayer.getTileAt(j, i);
                let tileID = tile.index;

                grid[i].push(tileID);
                console.log(grid[i])
            }
        }

        for (let i = 0; i < this.policeHouseLayer.layer.height; ++i) {
            for (let j = 0; j < this.policeHouseLayer.layer.width; ++j) {
                let tile = this.policeHouseLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                console.log(grid[i])
                } else {
                    continue;
                }
            }
        }

        for (let i = 0; i < this.roadLayer.layer.height; ++i) {
            for (let j = 0; j < this.roadLayer.layer.width; ++j) {
                let tile = this.roadLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                console.log(grid[i])
                } else {
                    continue;
                }
            }
        }

        return grid;
    }

    handleClick(pointer) {
        let x = pointer.x;
        let y = pointer.y;
        let toX = Math.floor(x/this.TILESIZE);
        var toY = Math.floor(y/this.TILESIZE);
        var fromX = Math.floor(this.activeCharacter.x/(this.TILESIZE/2));
        var fromY = Math.floor(this.activeCharacter.y/(this.TILESIZE/2));
        console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
    
        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                console.log(path);
                this.moveCharacter(path, this.activeCharacter);
            }
        });
        this.finder.calculate(); // ask EasyStar to compute the path
        // When the path computing is done, the arrow function given with
        // this.finder.findPath() will be called.
    }
    
    moveCharacter(path, character) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                x: ex*this.map.tileWidth,
                y: ey*this.map.tileHeight,
                duration: 200
            });
        }
    
        this.tweens.chain({
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