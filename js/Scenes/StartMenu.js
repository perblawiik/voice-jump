
let StartMenu = class extends Phaser.Scene {

    constructor(sceneName) {
        super(sceneName);
        console.log("Start menu loaded!");
    }

    init() {

    }

    preload() {

    }

    create() {

        this.cameras.main.setBackgroundColor("#404040");
        let buttonStyle = {
            fill: '#BE8A0B',
            fontSize: '52px',
            fontStyle: 'bold',
            boundsAlignH: 'center',
            boundsAlignV: 'center'
        };
        this.startButton = this.add.text(400, 300, 'Play', buttonStyle )
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonActiveState() )
            .on('pointerover', () => this.buttonHoverState() )
            .on('pointerout', () => this.buttonIdleState() )
            .on('pointerup', () => {
                this.buttonHoverState();
                this.startGame();
            });
    }

    update() {

    }

    buttonHoverState() {
        this.startButton.setStyle({fill: '#EEAD0E', fontSize: '52px'});
    }

    buttonIdleState() {
        this.startButton.setStyle({fill: '#BE8A0B', fontSize: '52px'});
    }

    buttonActiveState() {
        this.startButton.setStyle({fontSize: '60px'});
    }

    startGame() {
        this.scene.manager.switch('Start Menu', 'Level 01');
    }
};