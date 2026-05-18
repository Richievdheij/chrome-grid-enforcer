import { ImageSource, Sound, Loader } from 'excalibur'

const Resources = {
    // menu
    MainMenu: new ImageSource('images/ui/menu-background.png'),
    Logo: new ImageSource('images/ui/logo.png'),

    // gameplay background
    IngameBackground: new ImageSource('images/background/ingame-background.png'),

    // player
    Player:        new ImageSource('images/player/player.png'),

    // drones
    Drone:         new ImageSource('images/enemies/drone.png'),
    FastDrone:     new ImageSource('images/enemies/fast-drone.png'),
    ShootingDrone: new ImageSource('images/enemies/shooting-drone.png'),
    HeavyDrone:    new ImageSource('images/enemies/heavy-drone.png'),

    // projectiles
    Bullet:        new ImageSource('images/projectiles/bullet.png'),
    EnemyLaser:    new ImageSource('images/projectiles/enemy-laser.png'),

    // pickups
    HealthPack:    new ImageSource('images/pickups/healthpack.png'),
    EmpBomb:       new ImageSource('images/pickups/emp-bomb.png'),

    // HUD
    HpIcon:        new ImageSource('images/ui/heart.png'),
    ScoreIcon:     new ImageSource('images/ui/score-icon.png'),

    // explosion animation frames
    Explosion1:    new ImageSource('images/fx/explosion-1.png'),
    Explosion2:    new ImageSource('images/fx/explosion-2.png'),
    Explosion3:    new ImageSource('images/fx/explosion-3.png'),
    Explosion4:    new ImageSource('images/fx/explosion-4.png'),
    Explosion5:    new ImageSource('images/fx/explosion-5.png'),
    Explosion6:    new ImageSource('images/fx/explosion-6.png'),

    // music
    MenuMusic:     new Sound('sounds/menu-music.ogg'),
    GameMusic:     new Sound('sounds/game-music.ogg'),

    // sfx
    BulletShot:    new Sound('sounds/bullet-shoot.ogg'),
    EnemyShot:     new Sound('sounds/enemy-shoot.ogg'),
    ExplosionSound: new Sound('sounds/explosion.ogg'),
    HealthPickup:  new Sound('sounds/health-pickup.ogg'),
    EmpPickup:     new Sound('sounds/emp-pickup.ogg'),
    PlayerHit:     new Sound('sounds/player-hit.ogg'),
}

const ResourceLoader = new Loader(Object.values(Resources))

export { Resources, ResourceLoader }
