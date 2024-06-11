class Win extends Phaser.Scene {
    constructor() {
        super("winScene");
    }

    create() {
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.EnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.background = this.add.image(0, 0, "Blue");
        this.background.displayHeight = 2500

        // Create win text
        my.text.win = this.add.bitmapText(150, 100, "Minecraft0", "You Win!");
        my.text.win.setFontSize(150);
        my.text.win.setBlendMode(Phaser.BlendModes.ADD);

        my.text.goBack = this.add.bitmapText(30, 300, "Minecraft0", "Press [ENTER] to return");
        my.text.goBack.setFontSize(70);
        my.text.goBack.setBlendMode(Phaser.BlendModes.ADD);

        // Add funny image
        this.win_pic = this.add.image(400, 725, "Win_pic");
        this.win_pic.displayHeight = 650
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.EnterKey)) {
            this.scene.start("startGameScene");
        }
    }
}