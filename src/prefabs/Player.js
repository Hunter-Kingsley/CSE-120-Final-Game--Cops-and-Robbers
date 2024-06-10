// Player prefab
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, direction) {
        super(scene, x, y, texture) // call Sprite parent class
        scene.add.existing(this)           // add Player to existing scene
        scene.physics.add.existing(this)   // add physics body to scene

        this.body.setSize(this.width, this.height)
        this.body.setCollideWorldBounds(true)
        this.body.setDrag(0, 0)
        this.body.setFriction(0, 0)

        // set custom player properties
        this.score = 0
        this.direction = direction 
        this.playerVelocity = 100    // in pixels
        this.powerUpDuration = 10000    // in ms

        // initialize state machine managing player (initial state, possible states, state args[])
        scene.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
        }, [scene, this])   // pass these as arguments to maintain scene/object context in the FSM
    }
}

// player-specific state classes
class IdleState extends State {
    execute(scene, player) {
        // use destructuring to make a local copy of the keyboard object
        const { WKey, AKey, SKey, DKey } = scene.keys

        // transition to move if pressing a movement key
        if(WKey.isDown || AKey.isDown || SKey.isDown || DKey.isDown ) {
            this.stateMachine.transition('move')
            return
        }
    }
}

class MoveState extends State {
    execute(scene, player) {
        // use destructuring to make a local copy of the keyboard object
        const { WKey, AKey, SKey, DKey } = scene.keys

        // handle movement
        let moveDirection = new Phaser.Math.Vector2(0, 0)
        if(WKey.isDown) {
            moveDirection.y = -1
            player.direction = 'up'
        } else if(SKey.isDown) {
            moveDirection.y = 1
            player.direction = 'down'
        }
        if(AKey.isDown) {
            moveDirection.x = -1
            player.direction = 'left'
        } else if(DKey.isDown) {
            moveDirection.x = 1
            player.direction = 'right'
        }
        
        if (moveDirection.x !== 0 || moveDirection.y !== 0 ) {
            // set the velocity only if a key is pressed
            player.body.setVelocity(player.playerVelocity * moveDirection.x, player.playerVelocity * moveDirection.y)
        } 
    }
}