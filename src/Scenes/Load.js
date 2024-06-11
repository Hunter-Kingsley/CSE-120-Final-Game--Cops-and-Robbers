class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/Pico_8_City/Tilemap");
        this.load.image("Pico_8_City", "tilemap_packed_bigger.png");

        this.load.setPath("./assets/Tiny_Battle/Tiles");
        this.load.image("Enemy_1", "tile_0132.png");
        this.load.image("Enemy_2", "tile_0133.png");
        this.load.image("Player", "tile_0149.png");
        this.load.image("Better_Player", "tile_0152.png");

        this.load.setPath("./assets/");
        this.load.tilemapTiledJSON("MainMap", "MainMap.tmj");
        this.load.image("Point", "HD_transparent_picture.png");
        this.load.image("Blue", "Pure_blue.png");
        this.load.image("Cat", "cat-thumbs-up.png");
        this.load.image("Status_Bar", "Status_Bar.png");
        this.load.image("Win_pic", "robber_win.png");
        this.load.image("Lose_pic", "robber_lose.png");
        this.load.bitmapFont("Minecraft1", "Minecraft_1.png", "Minecraft.fnt");
        this.load.bitmapFont("Minecraft0", "Minecraft_0.png", "Minecraft.fnt");

        this.load.setPath("./assets/kenney_pixel-platformer/Tilemap/");
        this.load.image("tilemap_basic", "tilemap_packed.png");
        this.load.spritesheet("spritesheet_basic", "tilemap_packed_smaller.png", { frameWidth: 16, frameHeight: 16 });
    }

    create() {

        this.scene.start("startScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}