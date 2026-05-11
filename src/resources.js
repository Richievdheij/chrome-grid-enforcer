import { ImageSource, Loader } from 'excalibur'

const Resources = {
    Fish: new ImageSource('images/fish.png'),
    Shark: new ImageSource('images/shark.png'),
    Cartridge: new ImageSource('images/cartridge.png'),
    MainMenu: new ImageSource('images/menu-background.png'),
    Logo: new ImageSource('images/logo.png')
}

const ResourceLoader = new Loader(Object.values(Resources))

export { Resources, ResourceLoader }
