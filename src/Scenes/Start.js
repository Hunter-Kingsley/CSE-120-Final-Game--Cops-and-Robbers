class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    create() {
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.EnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keys.CKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        this.background = this.add.image(0, 0, "Blue");
        this.background.displayHeight = 2500

        // Add title text
        my.text.title = this.add.bitmapText(40, 5, "Minecraft0", "Cops\n   and\n    Robbers");
        my.text.title.setFontSize(150);
        my.text.title.setBlendMode(Phaser.BlendModes.ADD);

        my.text.options = this.add.bitmapText(130, 600, "Minecraft0", "Start: [ENTER]\nCredits: [C]");
        my.text.options.setFontSize(100);
        my.text.options.setBlendMode(Phaser.BlendModes.ADD);

        my.text.controls = this.add.bitmapText(130, 900, "Minecraft0", "Controls: [WASD]\nDebug On/Off: [F]");
        my.text.controls.setFontSize(70);
        my.text.controls.setBlendMode(Phaser.BlendModes.ADD);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.EnterKey)) {
            this.scene.start("mainGameScene");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.CKey)) {
            //this.scene.start("creditsScene");
            this.scene.start("loseScene");
        }
    }
}