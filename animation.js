class Animation {
    constructor(spritesheet, width, height, rows, cols) {
        this.spritesheet = spritesheet;
        this.spritesheetWidth = width;
        this.spritesheetHeight = height;
        this.rows = rows;
        this.cols = cols
        this.frameWidth = width / cols;
        this.frameHeight = height / rows;
        this.isPlaying = false;
        this.currentFrame = 0;
        this.lastFrame = cols - 1;
        this.callback = null;
    }

    play(x, y) {
        this.isPlaying = true;
        this.originX = x;
        this.originY = y;
    }

    update(ctx) {
        if (this.isPlaying === false) { return; }

        if (this.currentFrame > this.lastFrame)
        {
            this.isPlaying = false;
            this.currentFrame = 0;
            
            if (this.callback) {
                this.callback();
            }

            return;
        }
        
        this.drawFrame(ctx, this.currentFrame);
        this.currentFrame += 1;
    }

    drawFrame(ctx, col) {
        ctx.clearRect(0, 0, 320, 180);
        ctx.drawImage(this.spritesheet, 
                    col * this.frameWidth, 
                    0,
                    this.frameWidth, this.frameHeight,
                    this.originX, this.originY,
                    this.frameWidth, this.frameHeight);
    }

    onAnimationFinished(callback) {
        this.callback = callback;
    }
}

export { Animation };