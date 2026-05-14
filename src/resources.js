import { ImageSource, Loader } from 'excalibur'

const Resources = {
    // menu
    MainMenu: new ImageSource('images/menu-background.png'),
    Logo: new ImageSource('images/logo.png'),

    // gameplay background
    IngameBackground: new ImageSource('images/ingame-background.png'),

    // gameplay sprites (replace with cyberpunk assets later)
    Player:        new ImageSource('images/fish.png'),
    Drone:         new ImageSource('images/shark.png'),
    ShootingDrone: new ImageSource('images/shark.png'),
    Bullet:        new ImageSource('images/bubble.png'),
    EnemyLaser:    new ImageSource('images/mine.png'),
    HealthPack:    new ImageSource('images/cartridge.png'),
    EmpBomb:       new ImageSource('images/bones.png'),
}

const ResourceLoader = new Loader(Object.values(Resources))

export { Resources, ResourceLoader }
