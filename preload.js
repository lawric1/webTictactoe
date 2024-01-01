let urls = {
    STARTSCREEN: "./assets/startscreen.png",
    BG: "./assets/background.png",
    SCOREBOARD: "./assets/scoreboard.png",
    CIRCLE: "./assets/circle.png",
    CROSS: "./assets/cross.png",
    BLUE: "./assets/bluepoint.png",
    RED: "./assets/redpoint.png",
    sCIRCLE: "./assets/circlesheet.png",
    sCROSS: "./assets/crosssheet.png",
    GO1: "./assets/gameover1.png",
    GO2: "./assets/gameover2.png",

}


export async function preloadImages() {
    const loadedImages = {};
  
    const promises = Object.entries(urls).map(([name, url]) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
  
        image.onload = () => {
          loadedImages[name] = image;
          resolve();
        };
  
        image.onerror = () => reject(`Image '${name}' failed to load: ${url}`);
      });
    });
  
    await Promise.all(promises);
  
    return loadedImages;
}

export {
    urls
}