const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const winScreen = document.getElementById('win-screen');

canvas.width = Math.min(window.innerWidth, 450);
canvas.height = window.innerHeight;

let score = 0;
const WIN_SCORE = 5;
const BOX_HEIGHT = 60; 
const FIXED_WIDTH = 70; 
const FALL_SPEED = 14; 
let moveSpeed = 7;     
let direction = 1;
let gameActive = true;
let isFalling = false;
let cameraY = 0;

const colors = ['#c0392b', '#27ae60', '#2980b9', '#8e44ad', '#d35400'];

let stack = [
    { x: (canvas.width / 2) - (FIXED_WIDTH / 2), y: canvas.height - 80, w: FIXED_WIDTH, color: '#d4af37' }
];

let currentBox = {
    x: 0,
    y: 100, 
    w: FIXED_WIDTH, 
    color: colors[0]
};

function update() {
    if (!gameActive) return;

    if (!isFalling) {
        currentBox.x += moveSpeed * direction;
        if (currentBox.x + currentBox.w >= canvas.width) {
            currentBox.x = canvas.width - currentBox.w;
            direction = -1;
        } else if (currentBox.x <= 0) {
            currentBox.x = 0;
            direction = 1;
        }
    } else {
        currentBox.y += FALL_SPEED;
        let lastBox = stack[stack.length - 1];
        if (currentBox.y >= lastBox.y - BOX_HEIGHT) {
            checkLanding();
        }
    }

    let targetCameraY = (stack.length - 3) * BOX_HEIGHT;
    if (cameraY < targetCameraY) cameraY += 5;

    draw();
    requestAnimationFrame(update);
}

function checkLanding() {
    let lastBox = stack[stack.length - 1];
    let overlap = (currentBox.x + currentBox.w > lastBox.x) && (currentBox.x < lastBox.x + lastBox.w);

    if (overlap) {
        currentBox.y = lastBox.y - BOX_HEIGHT; 
        stack.push({...currentBox});
        score++;
        scoreElement.innerText = `Presents: ${score} / ${WIN_SCORE}`;
        
        if (score >= WIN_SCORE) {
            gameActive = false;
            winScreen.classList.remove('hidden');
        } else {
            resetForNextBox();
        }
    } else {
        gameActive = false;
        alert("Oh no! The present fell! Try again to see your gift.");
        location.reload();
    }
}

function resetForNextBox() {
    isFalling = false;
    currentBox.color = colors[Math.floor(Math.random() * colors.length)];
    currentBox.w = FIXED_WIDTH; 
    currentBox.x = Math.random() * (canvas.width - FIXED_WIDTH);
    currentBox.y = stack[stack.length - 1].y - (BOX_HEIGHT * 5); 
    moveSpeed += 0.4; 
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, cameraY);

    stack.forEach((box) => {
        drawPresent(box.x, box.y, box.w, BOX_HEIGHT, box.color);
    });

    if (score < WIN_SCORE && gameActive) {
        drawPresent(currentBox.x, currentBox.y, currentBox.w, BOX_HEIGHT, currentBox.color);
    }
    ctx.restore();
}

function drawPresent(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x + (w / 2) - 5, y, 10, h); 
    ctx.fillRect(x, y + (h / 2) - 5, w, 10); 
}

const dropAction = (e) => {
    if (gameActive && !isFalling) isFalling = true;
};

window.addEventListener('mousedown', dropAction);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dropAction();
}, { passive: false });

update();
