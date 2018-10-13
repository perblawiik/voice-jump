
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
        this.load.image('freq_bar_inner', '../../assets/frequency_bar_inner_20_parts_gradient_01.png');
        this.load.image('score_icon', '../../assets/ice_cream_icon_01.png');
    }

    create() {

        let textStyle = {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        };

        // Frequency label
        this.add.text(385, 6, 'Frequency:', textStyle);
        // Outer frequency bar
        this.add.image(705,24, 'freq_bar_outer').setScale(0.5);
        // Inner frequency bar
        this.frequencyBarInner = this.add.image(588,24, 'freq_bar_inner').setScale(0.5).setOrigin(0, 0.5);

        // The geometry for the mask
        this.frequencyMaskGeometry = new Phaser.GameObjects.Graphics(this);
        this.frequencyMaskGeometry.fillRect(588, 0, this.innerBarLenght, 50);
        // Attach a mask to the inner bar
        this.frequencyBarInner.mask = new Phaser.Display.Masks.GeometryMask(this, this.frequencyMaskGeometry);
        // Hide the inner bar
        this.frequencyMaskGeometry.x = -this.innerBarLenght;

        // Score
        this.scoreText = this.add.text(75, 8, '0', textStyle);
        // Score icon
        this.add.image(55, 24, 'score_icon');

    }

    update() {

    }

    setScoreText (score) {

        this.scoreText.setText(score);
    }

    setFrequency (freq) {

        this.frequencyMaskGeometry.x = Math.round(freq/100)*this.innerBarPartLength - this.innerBarLenght;
    }


};