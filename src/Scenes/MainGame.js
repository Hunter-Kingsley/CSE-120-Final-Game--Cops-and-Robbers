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

        this.gems = this.map.createFromObjects("Power_Ups", {
            name: "Gem",
            key: "spritesheet_basic",
            frame: 67
        }); 

        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);

        this.gemGroup = this.add.group(this.gems);

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

        this.physics.add.overlap(this.player, this.gemGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.player.score += 24;
            this.playerFSM.transition('idle');
            this.playerFSM.transition('power');
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
        my.text.score = this.add.bitmapText(10, 500, "Minecraft0", "Score: " + "00000");
        my.text.score.setFontSize(30);
        my.text.score.setBlendMode(Phaser.BlendModes.ADD);

        my.text.power = this.add.bitmapText(180, 500, "Minecraft0", "Power:");
        my.text.power.setFontSize(30);
        my.text.power.setBlendMode(Phaser.BlendModes.ADD);

        // Add Power Up status bar
        this.status_bar = this.add.sprite(325, 517, "Status_Bar");
        console.log(this.status_bar)

        console.log(this.player)
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
}