class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/Pico_8_City/Tilemap");
        this.load.image("Pico_8_City", "tilemap_packed_bigger.png");

        this.load.setPath("./assets/Tiny_Battle/Tiles");
        this.load.image("Enemy_1", "tile_0024.png");
        this.load.image("Enemy_2", "tile_0006.png");
        this.load.image("Player", "tile_0149.png");

        this.load.setPath("./assets/");
        this.load.tilemapTiledJSON("MainMap", "MainMap.tmj");
    }

    create() {


        this.scene.start("mainGameScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}