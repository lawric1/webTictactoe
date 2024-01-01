import { preloadImages } from "./preload.js";
import { Animation } from "./animation.js";
import { Line } from "./line.js";

const mainCanvas = document.getElementById("main-layer");
const animCanvas = document.getElementById("anim-layer");
const bgCanvas = document.getElementById("bg-layer");
const ctx = mainCanvas.getContext("2d");
const animCtx = animCanvas.getContext("2d");
const bgCtx = bgCanvas.getContext("2d");


const width = mainCanvas.width;
const height = mainCanvas.height;
const fps = 120;
let deltaTime = 0;
// "START", "RUN", "PAUSE", "GAMEOVER";
let gameState = "START"


let textures = await preloadImages();
let circleAnim = new Animation(textures.sCIRCLE, 161, 23, 1, 7);
let crossAnim = new Animation(textures.sCROSS, 161, 23, 1, 7);
let line = new Line();

let mousePos = {x: 0, y: 0};
let clicked = false;
let board = ["-","-","-","-","-","-","-","-","-"];
const gridPositions = [[122, 52],  [159, 52],  [196, 52],
                       [122, 88],  [159, 88],  [196, 88],
                       [122, 125], [159, 125], [196, 125]];
let hoverPosition = [-10, -10];
let hoverRange = 20;
let turn = choose(["O","X"]);
let previousTurn;
let circleScore = 0;
let crossScore = 0;
let maxScore = 5;


// Main Update calls --------------------------------------------------
function startNewRound() {
    board = ["-","-","-","-","-","-","-","-","-"];
    animCtx.clearRect(0, 0, width, height)
}
function switchTurn() {
    previousTurn = turn;

    if (turn === "O") { turn = "X"; }
    else if (turn === "X") { turn = "O"; }
}
function updateScore() {
    if (previousTurn === "O") {
        circleScore++;
        startNewRound();
    } else if (previousTurn === "X") {
        crossScore++;
        startNewRound();
    }

    if (circleScore === maxScore || crossScore === maxScore) {
        gameState = "GAMEOVER";
    }
}
function checkWinConditions() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Check if board matches any of the combos
    for (const combo of winCombos) {
        if (combo.every(index => board[index] === turn)) {
            playLineAnim(combo);
            line.onAnimationFinished(updateScore);

            return;
        }
    }

    // Check if all the board is filled
    if (board.every(cell => cell !== "-")) {
        startNewRound();
    }
}
function updateBoard(index) {
    board[index] = turn;
    checkWinConditions();
    switchTurn();
}
function place(index) {
    playPlaceAnim(index);

    circleAnim.onAnimationFinished(() => {
        updateBoard(index);
    });

    crossAnim.onAnimationFinished(() => {
        updateBoard(index);
    });
}
function aiMove() {
    let availableCells = [];

    for (let i = 0; i < board.length; i++) {
        let isEmpty = board[i] === "-";
        if (isEmpty) {
            availableCells.push(i);
        }
    }

    let index = choose(availableCells);
    place(index);
}
function update() {
    let isAnimationPlaying = circleAnim.isPlaying || crossAnim.isPlaying || line.isPlaying;

    // Check if mousePos is near grid cells to draw the closest
    for (let i = 0; i < gridPositions.length; i++) {
        let [x, y] = gridPositions[i];
        let a = (mousePos.x - x) ** 2;
        let b = (mousePos.y - y) ** 2;
        let mousePosInRange = (a + b) < (hoverRange ** 2);
        let isEmptyCell = board[i] === "-"

        if (turn === "X" && !isAnimationPlaying) {
            aiMove();
        } else if (mousePosInRange && isEmptyCell && !isAnimationPlaying) {
            hoverPosition = gridPositions[i];
            if (clicked === true) {
                clicked = false;
                place(i);
            }
            return;
        }

    }
    // mousePos is not near any cell, draw point outside screen
    hoverPosition = [-10, -10];
}


// Main Draw calls  --------------------------------------------------
function drawStart() { 
    ctx.drawImage(textures.STARTSCREEN, 0, 0); 
}
function drawGameOver() {
    if (circleScore === maxScore) {
        ctx.drawImage(textures.GO1, 0, 0); 
    } else if (crossScore === maxScore) {
        ctx.drawImage(textures.GO2, 0, 0); 
    }

    circleScore = 0;
    crossScore = 0;
}
function drawPoint() {
    let [x, y] = hoverPosition;
    
    if (turn === "O") {
        ctx.drawImage(textures.BLUE, x - 2, y - 1);
    }
    else if (turn === "X") {
        ctx.drawImage(textures.RED, x - 2, y - 1);
    }
}
function drawBoard() {
    for (let i = 0; i < gridPositions.length; i++) {
        let piece = board[i];
        let [x, y] = gridPositions[i];
        x = x - 10;
        y = y - 10;
        
        if (piece === "O") {
            ctx.drawImage(textures.CIRCLE, x, y);
        }
        else if (piece === "X") {
            ctx.drawImage(textures.CROSS, x, y);
        }
    }
}
function drawScore() {
    for (let i = 0; i < circleScore; i++) {
        const [x, y] = [102, 165];
        ctx.drawImage(textures.BLUE, x + (i * 8), y);
    }
    for (let i = 0; i < crossScore; i++) {
        const [x, y] = [181, 165];
        ctx.drawImage(textures.RED, x + (i * 8), y);
    }
}
function draw() {
    ctx.clearRect(0, 0, width, height);

    drawPoint();
    drawBoard();
    drawScore();
}


let gameInterval = 1000 / fps;
let lastGameTime = 0;
function gameLoop(timestamp) {
    deltaTime = timestamp - lastGameTime;

    if (gameState === "START") { drawStart(); }
    else if (gameState === "GAMEOVER") { drawGameOver(); }
    else if (gameState === "RUN") {
        if (deltaTime > gameInterval) {
            update();
            draw();
    
            lastGameTime = timestamp;
        }
    }
    requestAnimationFrame(gameLoop)
}


//Background --------------------------------------------------
function renderBackground() {
    bgCtx.drawImage(textures.BG, 0, 0);
    bgCtx.drawImage(textures.SCOREBOARD, 0, 0);
}


//Animations --------------------------------------------------
function playLineAnim(combo) {
    let startPos = gridPositions[combo[0]];
    let endPos = gridPositions[combo[2]];
    line.play(startPos, endPos);
}
function playPlaceAnim(index) {
    let [x, y] = gridPositions[index];
    x -= 10;
    y -= 10;
    
    if (turn === "O") {
        circleAnim.play(x, y);
    } else if (turn === "X") {
        crossAnim.play(x, y);
    }
}

let animInterval = 50;
let lastAnimTime = 0;
function animatePiecePlacement(timestamp) {
    let elapsed = timestamp - lastAnimTime;

    if (elapsed > animInterval) {
        circleAnim.update(animCtx);
        crossAnim.update(animCtx);

        lastAnimTime = timestamp;
    }
    requestAnimationFrame(animatePiecePlacement)
}

let lineAnimInterval = 0;
let lastLineAnimTime = 0;
function animateLine(timestamp) {
    let elapsed = timestamp - lastLineAnimTime;

    if (elapsed > lineAnimInterval) {
        line.update(animCtx);

        lastLineAnimTime = timestamp;
    }
    requestAnimationFrame(animateLine)
}


// Execute all frame dependent loops --------------------------------------------------
gameLoop();
renderBackground();
animatePiecePlacement();
animateLine();



// Event handler functions --------------------------------------------------
function handleKeyup(e) {
    e.preventDefault();

    if (gameState === "START") {
        gameState = "RUN";
    }
    if (gameState === "GAMEOVER" && (e.key === 'r' || e.key === 'R')) {
        gameState = "START";
    } 
}
function handlemousePosmove(e) {
    mousePos.x = (e.clientX - mainCanvas.getBoundingClientRect().left) / 2;
    mousePos.y = (e.clientY - mainCanvas.getBoundingClientRect().top) / 2;
}
function handlemousePosdown() {
    clicked = true;
}
function handlemousePosup() {
    clicked = false;

    if (gameState === "START") {
        gameState = "RUN";
    }
}

window.addEventListener("keyup", handleKeyup);
window.addEventListener("mousemove", handlemousePosmove);
window.addEventListener("mousedown", handlemousePosdown);
window.addEventListener("mouseup", handlemousePosup);



// Utils --------------------------------------------------
function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }
  