
function loadScene01 () {

    // create a new scene named "Game"
    let scene = new Phaser.Scene('Game');

    // Initiate custom variables that is not a part of Phaser API in this function
    scene.init = function () {

        /** Microphone stuff **/
        // Number of samples to store in the frequency spectrum
        this.samples = 1024;
        // Hz per sample (first index = 20, last index = 20000)
        this.sampleResolution = 19980/this.samples;
        // Fast Fourier Transform
        this.fft = new p5.FFT(0.8, this.samples);
        this.spectrum = [];
        // Microphone input
        this.microphone = new p5.AudioIn();
        // Activate microphone input
        this.microphone.start();

        // Game world dimensions
        this.worldHeight = 2400;
        this.worldWidth = 800;

        // Background colors (will be used to interpolate from light blue to dark blue)
        this.groundColor = new Phaser.Display.Color(0, 200, 255);
        this.skyColor = new Phaser.Display.Color(0, 0, 55);

        // Game stuff
        this.score = 0;
        this.gameOver = false;
        this.playerDirectionX = 1;
    };

    scene.preload = function() {

        this.load.image('ground', 'assets/platform3.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('star', 'assets/star.png');
        this.load.spritesheet('player_sprite', 'assets/face_sheet.png', {frameWidth: 64, frameHeight: 64});
        this.load.image('soundwave', 'assets/soundwave.png');
    };

    scene.create = function () {

        // Set outer bounds for the game map
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // The platforms
        this.platforms = this.physics.add.staticGroup();
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, this.worldHeight, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 2200, 'ground');
        this.platforms.create(50, 2050, 'ground');
        this.platforms.create(750, 2020, 'ground');

        // The walls
        this.walls = this.physics.add.staticGroup();
        this.walls.create(0, this.worldHeight/2, 'wall').setScale(1,6).refreshBody();
        this.walls.create(800, this.worldHeight/2, 'wall').setScale(1,6).refreshBody();

        // The player with start position and spritesheet
        this.player = this.physics.add.sprite(100, 2200, 'player_sprite');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Set camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.02, 0.01);
        this.cameras.main.setDeadzone(this.worldWidth, 200);

        // Player animations
        this.anims.create({
            key: 'open',
            frames: [ { key: 'player_sprite', frame: 2 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'closed',
            frames: [ { key: 'player_sprite', frame: 1 } ],
            frameRate: 20
        });

        //Particle effects from player


        // Stars to collect, 12 in total
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 50, y: 1800, stepX: 60 }
        });

        this.stars.children.iterate(function (child) {

            // Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
        });

        // The score
        this.scoreText = this.add.text(16, 1800, 'Score: 0', { fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        //  Changes player direction when player collide with walls
        this.physics.add.collider(this.player, this.walls, changePlayerDirection, null, this);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
    };

    scene.update = function () {

        // Break game loop
        if (this.gameOver) {
            return;
        }

        this.scoreText.y = this.cameras.main.worldView.y;

        // Set which audio source to analyze
        this.fft.setInput(this.microphone);
        // Get frequency spectrum
        this.spectrum = this.fft.analyze();
        // Find the most dominating frequency
        let maxAmplitude = Math.max.apply(null, this.spectrum);

        if (maxAmplitude > 50) {
            //Scream Animation
            this.player.anims.play('open');

            // Find the index of the frequency
            let n = this.spectrum.indexOf(maxAmplitude);

            // Calculate the frequency
            let frequency = Math.round((n + 1) * this.sampleResolution + 20);

            // Set maximum frequency
            let maxFreq = 2000;
            frequency = Math.min(maxFreq, frequency);

            let maxAngle = Math.PI / 2;
            let theta = frequency * maxAngle / maxFreq;

            theta = Math.min(maxAngle, theta);
            theta = Math.max(0, theta);

            let speedX = this.playerDirectionX * maxAmplitude * Math.cos(theta);
            let speedY = -1 * maxAmplitude * Math.sin(theta);

            this.player.setVelocity(speedX, speedY);

            // Add rotation to the player sprite
            let playerRotation = this.playerDirectionX*Math.PI/2 - this.playerDirectionX*theta;
            let threshold = Math.PI/180;
            if (Math.abs(playerRotation - this.player.rotation) > threshold) {
                if (playerRotation > this.player.rotation) {
                    this.player.rotation = this.player.rotation + threshold;
                }
                else {
                    this.player.rotation = this.player.rotation - threshold;
                }
            }
        }
        else {
            // If no audio is detected deaccelerate player
            this.player.body.acceleration.x = -this.player.body.velocity.x;
            this.player.anims.play('closed');
        }

        // Interpolate the background color
        let hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.skyColor, this.groundColor, this.worldHeight, this.player.y);
        this.cameras.main.setBackgroundColor(hexColor);
    };

    function collectStar (player, star)
    {
        star.disableBody(true, true);

        // Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0)
        {
            // A new batch of stars to collect
            this.stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);
            });
        }
    }

    function changePlayerDirection (player) {

        this.playerDirectionX *= -1;
        this.player.body.setVelocityX(this.playerDirectionX * 300);
        this.player.rotation = -this.player.rotation;
    }

    return scene;
}

