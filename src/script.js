const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const winScreen = document.getElementById('win-screen');

canvas.width = Math.min(window.innerWidth, 450);
canvas.height = window.innerHeight;

let score = 0;
const WIN_SCORE = 12;
const BOX_HEIGHT = 60; 
const FIXED_WIDTH = 100; 
const FALL_SPEED = 12; 
let moveSpeed = 6;     
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
    y: 50, 
    w: FIXED_WIDTH, 
    color: colors[0]
};

function update() {
    if (!gameActive) return;

    if (!isFalling) {
        currentBox.x += moveSpeed * direction;
        if (currentBox.x + currentBox.w > canvas.width || currentBox.x < 0) {
            direction *= -1;
        }
    } else {
        currentBox.y += FALL_SPEED;
        let targetY = stack[stack.length - 1].y - BOX_HEIGHT;
        if (currentBox.y >= targetY) {
            checkLanding();
        }
    }

    let targetCameraY = (stack.length - 3) * BOX_HEIGHT;
    if (cameraY < targetCameraY) cameraY += 4;

    draw();
    requestAnimationFrame(update);
}

function checkLanding() {
    let lastBox = stack[stack.length - 1];
    const isOverlapping = (currentBox.x + currentBox.w > lastBox.x) && (currentBox.x < lastBox.x + lastBox.w);

    if (isOverlapping) {
        stack.push({
            x: currentBox.x,
            y: lastBox.y - BOX_HEIGHT,
            w: FIXED_WIDTH, 
            color: currentBox.color
        });

        score++;
        scoreElement.innerText = `Presents: ${score} / ${WIN_SCORE}`;
        
        if (score >= WIN_SCORE) {
            gameActive = false;
            winScreen.classList.remove('hidden');
        } else {
            resetForNextBox();
        }
    } else {
        if (currentBox.y > canvas.height + cameraY) {
            alert("Oh no! The present fell! Try again to see your gift.");
            location.reload();
        }
    }
}

function resetForNextBox() {
    isFalling = false;
    currentBox.y = stack[stack.length - 1].y - (BOX_HEIGHT * 4); 
    currentBox.x = Math.random() * (canvas.width - FIXED_WIDTH);
    currentBox.color = colors[Math.floor(Math.random() * colors.length)];
    moveSpeed += 0.2; 
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, cameraY);

    stack.forEach((box) => {
        drawPresent(box.x, box.y, box.w, BOX_HEIGHT, box.color);
    });

    if (score < WIN_SCORE) {
        drawPresent(currentBox.x, currentBox.y, currentBox.w, BOX_HEIGHT, currentBox.color);
    }
    ctx.restore();
}

function drawPresent(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x + (w / 2) - 8, y, 16, h);
}

const dropAction = (e) => {
    if (gameActive && !isFalling) isFalling = true;
};

window.addEventListener('mousedown', dropAction);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dropAction();
});

update();
