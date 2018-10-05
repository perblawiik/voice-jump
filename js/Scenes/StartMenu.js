
let StartMenu = class extends Phaser.Scene {

    constructor(sceneName) {
        super(sceneName);
        console.log("Scene: <" + sceneName + "> loaded!");
    }

    init() {

    }

    preload() {

    }

    create() {
        // Resizeable window
        window.addEventListener('resize', this.resize);
        this.resize();

        this.cameras.main.setBackgroundColor("#00C8FF");

        let buttonStyle = {
            fill: '#EEAD0E',
            fontSize: '52px',
            fontStyle: 'bold',
            boundsAlignH: 'center',
            boundsAlignV: 'center',
        };
        this.startButton = this.add.text(400, 300, 'Play', buttonStyle )
            .setPadding(8, 8, 8, 8)
            .setShadow(2,2,'#000', 2, false, true)
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
        this.startButton.setStyle({fill: '#f8de9e', fontSize: '52px'});
    }

    buttonIdleState() {
        this.startButton.setStyle({fill: '#EEAD0E', fontSize: '52px'});
    }

    buttonActiveState() {
        this.startButton.setStyle({fontSize: '60px'});
    }

    startGame() {
        this.scene.manager.switch('Start Menu', 'Level 01');
    }

    resize() {
        let canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
        let wratio = width / height, ratio = canvas.width / canvas.height;

        if (wratio < ratio) {
            canvas.style.width = width + "px";
            canvas.style.height = (width / ratio) + "px";
        } else {
            canvas.style.width = (height * ratio) + "px";
            canvas.style.height = height + "px";
        }
    }
};