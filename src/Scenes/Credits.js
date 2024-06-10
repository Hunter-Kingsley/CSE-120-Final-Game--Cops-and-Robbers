class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create() {
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.EnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.background = this.add.image(0, 0, "Blue");
        this.background.displayHeight = 2500

        my.text.credits = this.add.bitmapText(50, 100, "Minecraft0", "Literally Everything:\n   Hunter Kingsley");
        my.text.credits.setFontSize(80);
        my.text.credits.setBlendMode(Phaser.BlendModes.ADD);

        this.cat = this.add.image(400, 550, "Cat");
        this.cat.displayHeight = 500

        my.text.return = this.add.bitmapText(150, 900, "Minecraft0", "Return: [ENTER]");
        my.text.return.setFontSize(80);
        my.text.return.setBlendMode(Phaser.BlendModes.ADD);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.EnterKey)) {
            this.scene.start("startScene");
        }
    }
}