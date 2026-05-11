import { ImageSource, Loader } from 'excalibur'

const Resources = {
    Fish: new ImageSource('images/fish.png'),
    Shark: new ImageSource('images/shark.png'),
    Cartridge: new ImageSource('images/cartridge.png'),
    MainMenu: new ImageSource('images/main-menu.png'),
}

const ResourceLoader = new Loader()
for (let res of Object.values(Resources)) {
    ResourceLoader.addResource(res)
}

export { Resources, ResourceLoader }