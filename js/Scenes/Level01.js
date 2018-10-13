
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
        this.worldWidth = 864;

        // Game stuff
        this.score = 0;
        this.gameOver = false;
        this.playerDirectionX = 1;

        // Activate HUD
        this.scene.manager.start("HUD");
    }

    preload () {
        this.load.image('tiles', '../../assets/block.png');
        this.load.tilemapTiledJSON('map', '../../assets/level1_ver2.json');
        this.load.spritesheet('player_sprite', '../../assets/face_sheet.png', {frameWidth: 64, frameHeight: 64});
        this.load.image('soundwave', '../../assets/soundwave.png');
        this.load.image('ice_cream', '../../assets/ice_cream_cone.png');
    }

    create () {

        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('block', 'tiles');

        const niceBlocks = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
        niceBlocks.setCollisionByProperty({ collides: true });

        // Instance for feeding information to the Head-up Display
        this.inGameHUD = this.scene.manager.getScene("HUD");

        // Set outer bounds for the game map
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // The player with start position and spritesheet
        this.player = this.physics.add.sprite(100, 2100, 'player_sprite');

        this.iceCreams = this.physics.add.group({
            key: 'ice_cream',
            repeat: 6,
            setXY: { x: 100, y: 2000, stepX: 100 }
        });
        this.iceCreams.children.iterate(function(child) {
            child.body.setAllowGravity(false);
        });

        // Set camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.02, 0.01);
        this.cameras.main.setDeadzone(this.worldWidth, 100);

        // Player animations
        this.anims.create({
            key: 'open',
            frames: [ { key: 'player_sprite', frame: 0 } ],
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
            scale: {start:0.01, end: 1.25},
            alpha: {start:1.0, end: 0.1},
            quantity: 1, 
            on: false
        });
        this.TICKSPERWAVE = 5;
        this.current_count = 0;

        //  Collide the player and the blocks
        this.physics.add.collider(this.player, niceBlocks);

        // Collision between player and ice creams
        this.physics.add.overlap(this.player, this.iceCreams, this.collectIceCream, null, this);

        //const debugGraphics = this.add.graphics().setAlpha(0.75);
        //niceBlocks.renderDebug(debugGraphics, {
            //tileColor: null, // Color of non-colliding tiles
            //collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            //faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        //});

        this.cameras.main.setBackgroundColor("#00C8FF");
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
            if(this.current_count > (this.TICKSPERWAVE))
            {
                this.soundwave_particles.emitParticle(1, this.player.x, this.player.y);
                this.current_count = 0;
            }
            this.current_count += Math.sqrt(speedY*speedY + speedX*speedX)/500;    
            
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

        // Change player direction when hitting walls
        if(this.player.body.onWall())
        {
            this.playerDirectionX *= -1;
            this.player.body.setVelocityX(this.playerDirectionX * 300);
            this.player.rotation = -this.player.rotation;
        }
    }

    collectIceCream(player, iceCream) {

        iceCream.disableBody(true, true);
        this.score += 10;
        this.inGameHUD.setScoreText(this.score);
    }
};