
let HeadupDisplay = class extends Phaser.Scene {

    constructor(sceneName) {
        super(sceneName);
        console.log("Scene: <" + sceneName + "> loaded!");
    }

    init() {

        this.innerBarLenght = 235;
        this.innerBarPartLength = 235/20;
    }

    preload() {

        this.load.image('freq_bar_outer', '../../assets/frequency_bar_outer1.png');
        this.load.image('freq_bar_inner', '../../assets/frequency_bar_inner_20_parts.png');
    }

    create() {

        let textStyle = {
            fontSize: '32px',
            fill: '#000',
            fontStyle: 'bold'
        };

        this.add.image(620,20, 'freq_bar_outer').setScale(0.5);
        this.frequencyBarInner = this.add.image(503,20, 'freq_bar_inner').setScale(0.5).setOrigin(0, 0.5);

        // The geometry for the mask
        this.frequencyMaskGeometry = new Phaser.GameObjects.Graphics(this);
        this.frequencyMaskGeometry.fillRect(503, 0, this.innerBarLenght, 50);
        // Attach a mask to the inner bar
        this.frequencyBarInner.mask = new Phaser.Display.Masks.GeometryMask(this, this.frequencyMaskGeometry);
        // Hide the inner bar
        this.frequencyMaskGeometry.x = -this.innerBarLenght;

        this.scoreText = this.add.text(16, 6, 'Score: 0', textStyle);
        this.add.text(300, 6, 'Frequency:', textStyle);
    }

    update() {

    }

    setScoreText (score) {

        this.scoreText.setText('Score: ' + score);
    }

    setFrequency (freq) {

        this.frequencyMaskGeometry.x = Math.round(freq/100)*this.innerBarPartLength - this.innerBarLenght;
    }


};