class Line {
    constructor() {
        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.isPlaying = false;
        this.animationSpeed = 1
        this.progress = 0; // Progress along the path (0 to 1)
        this.animationFinished = false;
        this.callback = null;
    }

    play(start, end) {
        this.startPos = { x: start[0], y: start[1] };
        this.endPos = { x: end[0], y: end[1] };
        this.currentPos = { ...this.startPos };
        this.progress = 0;
        this.isPlaying = true;
    }

    update(ctx) {
        if (this.isPlaying === false) { return; }

        const easingValue = this.easeInOutCubic(this.progress);

        // Interpolate between start and end positions based on easing value
        this.currentPos.x = this.startPos.x + (this.endPos.x - this.startPos.x) * easingValue;
        this.currentPos.y = this.startPos.y + (this.endPos.y - this.startPos.y) * easingValue;

        this.progress += this.animationSpeed / 100;

        // Check if we've reached or passed the end position

        if (this.progress >= 1) {
            this.isPlaying = false;
            this.animationFinished = true;
            ctx.clearRect(0, 0, 320, 180);

            if (this.callback) {
                this.callback();
            }

            return;
        }

        this.draw(ctx);
    }

    draw(ctx) {
        let x = this.currentPos.x + 1;
        let y = this.currentPos.y;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#f0f0dc";
        ctx.fill();
    }

    onAnimationFinished(callback) {
        this.callback = callback;
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
}

export { Line };