
let Level01 = class extends Phaser.Scene {

    constructor (sceneName) {
        super(sceneName);
        console.log("Scene: <" + sceneName + "> loaded!");
    }

    // Initiate custom variables that is not a part of Phaser API in this function
    init () {
        /** Microphone stuff **/
        // Number of samples to store in the frequency spectrum
        this.samples = 1024;
        // Hz per sample (first index = 20, last index = 20000)
        this.sampleResolution = 19980/this.samples;
        // Fast Fourier Transform
        this.fft = new p5.FFT(0.8, this.samples);
        this.spectrum = [];
        this.frequency = 0;
        // Microphone input
        this.microphone = new p5.AudioIn();
        // Activate microphone input
        this.microphone.start();

        // Game world dimensions
        this.worldHeight = 2400;
        this.worldWidth = 800;

        // Game stuff
        this.score = 0;
        this.gameOver = false;
        this.playerDirectionX = 1;

        // Activate HUD
        this.scene.manager.start("HUD");
    }

    preload () {

        this.load.image('ground', '../../assets/platform3.png');
        this.load.image('wall', '../../assets/wall.png');
        this.load.image('star', '../../assets/star.png');
        this.load.spritesheet('player_sprite', '../../assets/face_sheet.png', {frameWidth: 64, frameHeight: 64});
        this.load.image('soundwave', '../../assets/soundwave.png');
    }

    create () {

        // Instance for feeding information to the Head-up Display
        this.inGameHUD = this.scene.manager.getScene("HUD");

        // Resizeable window
        window.addEventListener('resize', this.resize);
        this.resize();

        // Set outer bounds for the game map
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Background colors (will be used to interpolate from light blue to dark blue)
        this.groundColor = new Phaser.Display.Color(0, 200, 255);
        this.skyColor = new Phaser.Display.Color(0, 0, 55);

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
        this.soundwave_particles = this.add.particles('soundwave');

        this.soundwave_particles.createEmitter({
            x: this.player.x,
            y: this.player.y,
            lifespan:1000,
            speed: 0,
            angle: 180,
            scale: {start:0.1, end: 5.0},
            alpha: {start:1.0, end: 0.0},
            quantity: 1, 
            on: false

        });
        this.TICKSPERWAVE = 5;
        this.current_count = 0;

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

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        //  Changes player direction when player collide with walls
        this.physics.add.collider(this.player, this.walls, this.changePlayerDirection, null, this);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    }

    update () {
        // Break game loop
        if (this.gameOver) {
            return;
        }

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
            this.frequency = Math.round((n + 1) * this.sampleResolution + 20);

            // Set maximum frequency
            let maxFreq = 2000;
            this.frequency = Math.min(maxFreq, this.frequency);

            // Update frequency in HUD
            this.inGameHUD.setFrequency(this.frequency);

            let maxAngle = Math.PI / 2;
            let theta = this.frequency * maxAngle / maxFreq;

            theta = Math.min(maxAngle, theta);
            theta = Math.max(0, theta);

            let speedX = this.playerDirectionX * maxAmplitude * Math.cos(theta);
            let speedY = (-1) * maxAmplitude * Math.sin(theta);

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

            //Particle update
            //this.soundwave_particles.setSpeedX(40*Math.cos(theta + Math.PI));
            //this.soundwave_particles.setSpeedY(40*Math.sin(theta + Math.PI));

            //this.soundwave_particles.setAngle(this.player.angle);
            //this.soundwave_particles.setPosition(this.player.x, this.player.y);
            if(this.current_count%this.TICKSPERWAVE === 0)
            {
                this.soundwave_particles.emitParticle(1, this.player.x, this.player.y);
            }
            this.current_count += 1;    
            
        }
        else {
            // Play closed mouth animation for player
            this.player.anims.play('closed');

            // Deaccelerate the player
            this.player.body.acceleration.x = -this.player.body.velocity.x;

            // Update frequency in HUD (decrease frequency to zero)
            if (this.frequency > 0) {
                this.frequency = this.frequency - 20;
                this.inGameHUD.setFrequency(Math.max(0, this.frequency));
            }
        }

        // Interpolate the background color
        let hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.skyColor, this.groundColor, this.worldHeight, this.player.y);
        this.cameras.main.setBackgroundColor(hexColor);
    }

    collectStar (player, star) {

        star.disableBody(true, true);

        // Add and update the score
        this.score += 10;
        // Update score in HUD
        this.inGameHUD.setScoreText(this.score);

        if (this.stars.countActive(true) === 0)
        {
            // A new batch of stars to collect
            this.stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);
            });
        }
    }

    changePlayerDirection (player) {

        this.playerDirectionX *= -1;
        this.player.body.setVelocityX(this.playerDirectionX * 300);
        this.player.rotation = -this.player.rotation;
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

