import { ImageSource, Loader } from 'excalibur'

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
}

const ResourceLoader = new Loader(Object.values(Resources))

export { Resources, ResourceLoader }
