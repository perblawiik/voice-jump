let InGameMenu = class extends Phaser.Scene {

    constructor(sceneName) {
        super(sceneName);
        console.log("Scene: <" + sceneName + "> loaded!");

        this.currentLevel = "";
    }

    create () {

        let buttonStyle = {
            fill: '#EEAD0E',
            fontSize: '52px',
            fontStyle: 'bold',
            boundsAlignH: 'center',
            boundsAlignV: 'center',
        };
        this.resetButton = this.add.text(400, 300, 'Try Again', buttonStyle )
            .setPadding(8, 8, 8, 8)
            .setShadow(2,2,'#000', 2, false, true)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonActiveState() )
            .on('pointerover', () => this.buttonHoverState() )
            .on('pointerout', () => this.buttonIdleState() )
            .on('pointerup', () => {
                this.buttonHoverState();
                this.resetLevel();
            });
        // Black background color
        this.cameras.main.setBackgroundColor("#000000");
        // Transparent background color
        this.cameras.main.backgroundColor.alphaGL  = 0.7;
    }

    buttonHoverState() {
        this.resetButton.setStyle({fill: '#f8de9e', fontSize: '52px'});
    }

    buttonIdleState() {
        this.resetButton.setStyle({fill: '#EEAD0E', fontSize: '52px'});
    }

    buttonActiveState() {
        this.resetButton.setStyle({fontSize: '60px'});
    }

    resetLevel() {
        this.scene.manager.getScene(this.currentLevel).resetLevel();
    }
};