
let HeadupDisplay = class extends Phaser.Scene {

    constructor(sceneName) {
        super(sceneName);
        console.log("Scene: <" + sceneName + "> loaded!");
    }

    init() {

    }

    preload() {

    }

    create() {

        let textStyle = {
            fontSize: '32px',
            fill: '#000',
            fontStyle: 'bold'
        };

        this.scoreText = this.add.text(16, 0, 'Score: 0', textStyle);
        this.frequencyText = this.add.text(300, 0, 'Frequency: 0 Hz', textStyle);
    }

    update() {

    }

    setScoreText (score) {
        this.scoreText.setText('Score: ' + score);
    }

    setFrequencyText (freq) {
        this.frequencyText.setText('Frequency: ' + freq + ' Hz');
    }


};