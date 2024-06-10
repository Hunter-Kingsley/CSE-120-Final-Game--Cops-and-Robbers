class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGameScene");
    }

    init() {
        this.TILESIZE = 32;
        this.SCALE = 2.0;
        this.TILEWIDTH = 25;
        this.TILEHEIGHT = 30;
        this.COINS_COLLECTED = 0; // 334 Total
    }

    updateScore() {
        my.text.score.setText("Score: " + this.player.score);
    }

    create() {
        //Test Log
        console.log("what da dog doin");

        // Create a new tilemap which uses 32x32 tiles, and is 25 tiles wide and 30 tiles tall
        this.map = this.add.tilemap("MainMap", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);

        // Add a tileset to the map
        this.tileset_Pico = this.map.addTilesetImage("Roads", "Pico_8_City");

        // Create the layers
        this.fillerLayer = this.map.createLayer("Filler", this.tileset_Pico, 0, 0);
        this.wallsLayer = this.map.createLayer("Walls", this.tileset_Pico, 0, 0);
        this.roadLayer = this.map.createLayer("Roads", this.tileset_Pico, 0, 0);
        this.policeHouseLayer = this.map.createLayer("Pico_Police_House", this.tileset_Pico, 0, 0);

        // Make non-player-accessable layers collidable
        this.wallsLayer.setCollisionByProperty({
            collides: true
        });
        this.policeHouseLayer.setCollisionByProperty({
            collides: true
        });

        // Initialize EasyStar pathfinder
        this.finder_1 = new EasyStar.js();
        this.finder_2 = new EasyStar.js();

        // Create Collectible Objects
        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "spritesheet_basic",
            frame: 151
        }); 

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);

        // Create Player and Enemy Car Sprites
        // Use setOrigin() to ensure the tile space computations work well
        this.player = new Player(this, this.tileXtoWorld(12), this.tileYtoWorld(25), "Player", 0, 'right').setOrigin(0,0);

        this.enemy_1 = new Enemy(this, this.tileXtoWorld(14), this.tileYtoWorld(14), "Enemy_1", this.finder_1, "1").setOrigin(0,0);

        this.enemy_2 = new Enemy(this, this.tileXtoWorld(10), this.tileYtoWorld(14), "Enemy_2", this.finder_2, "2").setOrigin(0,0);

        // Add invisible patrol points
        this.patrol_point_1 = this.add.sprite(this.tileXtoWorld(12), this.tileYtoWorld(4), "Point");
        this.patrol_point_2 = this.add.sprite(this.tileXtoWorld(12), this.tileYtoWorld(23), "Point");

        // Add invisible respawn points
        this.respawn_point_1 = this.add.sprite(this.tileXtoWorld(14), this.tileYtoWorld(14), "Point");
        this.respawn_point_2 = this.add.sprite(this.tileXtoWorld(10), this.tileYtoWorld(14), "Point");

        // Add collider for player and walls
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.policeHouseLayer);

        // Add Colision for Collectibles
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.player.score += 12;
            this.COINS_COLLECTED += 1;
            this.updateScore();
        });

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // setup keyboard input
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.SKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Create Info Text
        my.text.score = this.add.bitmapText(10, 500, "Minecraft0", "Score: " + 0);
        my.text.score.setFontSize(35);
        my.text.score.setBlendMode(Phaser.BlendModes.ADD);

        console.log(this)
    }

    update() {
        this.playerFSM.step();
        this.enemy_1.enemyFSM.step();
        this.enemy_2.enemyFSM.step();
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
        for (let i = 0; i < this.fillerLayer.layer.height; i++) {
            grid[i] = [];
        }
        // Loop over layers to find tile IDs, store in grid
        // TODO: write this loop
        for (let i = 0; i < this.fillerLayer.layer.height; ++i) {
            for (let j = 0; j < this.fillerLayer.layer.width; ++j) {
                let tile = this.fillerLayer.getTileAt(j, i);
                let tileID = tile.index;

                grid[i].push(tileID);
                console.log(grid[i])
            }
        }

        for (let i = 0; i < this.wallsLayer.layer.height; ++i) {
            for (let j = 0; j < this.wallsLayer.layer.width; ++j) {
                let tile = this.wallsLayer.getTileAt(j, i);
                if (tile) {
                let tileID = tile.index;

                grid[i][j] = tileID;  
                console.log(grid[i])
                } else {
                    continue;
                }
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