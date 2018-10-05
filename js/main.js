
// Load scenes
let scenes = [
    new StartMenu("Start Menu"),
    new Level01("Level 01")
];

// Game configurations
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: scenes
};

// Instantiate the game
let game = new Phaser.Game(config);