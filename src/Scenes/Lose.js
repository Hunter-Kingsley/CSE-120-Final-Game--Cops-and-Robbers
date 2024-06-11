class Lose extends Phaser.Scene {
    constructor() {
        super("loseScene");
    }

    create() {
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.EnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.background = this.add.image(0, 0, "Blue");
        this.background.displayHeight = 2500

        // Create win text
        my.text.lose = this.add.bitmapText(110, 100, "Minecraft0", "You Lose!");
        my.text.lose.setFontSize(150);
        my.text.lose.setBlendMode(Phaser.BlendModes.ADD);

        my.text.goBack = this.add.bitmapText(30, 300, "Minecraft0", "Press [ENTER] to return");
        my.text.goBack.setFontSize(70);
        my.text.goBack.setBlendMode(Phaser.BlendModes.ADD);

        // Add funny image
        this.lose_pic = this.add.image(400, 725, "Lose_pic");
        this.lose_pic.displayHeight = 650
        this.lose_pic.displayWidth = 750
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.EnterKey)) {
            this.scene.start("startGameScene");
        }
    }
}