const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const winScreen = document.getElementById('win-screen');

canvas.width = Math.min(window.innerWidth, 450);
canvas.height = window.innerHeight;

// --- CONFIGURATION ---
let score = 0;
const WIN_SCORE = 10;
const BOX_HEIGHT = 60; // Thicker boxes
const FALL_SPEED = 12; // Speed of falling straight down
let moveSpeed = 3;     // Speed of side-to-side movement
let direction = 1;
let gameActive = true;
let isFalling = false;
let cameraY = 0;

// Colors for the presents
const colors = ['#c0392b', '#27ae60', '#2980b9', '#8e44ad', '#d35400'];

// Initial stack base
let stack = [
    { x: (canvas.width / 2) - 80, y: canvas.height - 80, w: 160, color: '#d4af37' }
];

let currentBox = {
    x: 0,
    y: 50, // Starting height
    w: 120, // Nice big boxes
    color: colors[0]
};

function update() {
    if (!gameActive) return;

    if (!isFalling) {
        // Move side to side at the top
        currentBox.x += moveSpeed * direction;
        if (currentBox.x + currentBox.w > canvas.width || currentBox.x < 0) {
            direction *= -1;
        }
    } else {
        // Fall down
        currentBox.y += FALL_SPEED;

        // Check for collision with the top of the stack
        let targetY = stack[stack.length - 1].y - BOX_HEIGHT;
        if (currentBox.y >= targetY) {
            checkLanding();
        }
    }

    // Camera follow
    let targetCameraY = (stack.length - 3) * BOX_HEIGHT;
    if (cameraY < targetCameraY) cameraY += 4;

    draw();
    requestAnimationFrame(update);
}

function checkLanding() {
    let lastBox = stack[stack.length - 1];
    
    // Check if it's hitting the box below (at least partially)
    const isOverlapping = (currentBox.x + currentBox.w > lastBox.x) && (currentBox.x < lastBox.x + lastBox.w);

    if (isOverlapping) {
        // Successful landing
        stack.push({
            x: currentBox.x,
            y: lastBox.y - BOX_HEIGHT,
            w: currentBox.w,
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
        // It missed the stack
        if (currentBox.y > canvas.height + cameraY) {
            alert("Oh no! The present fell into the snow. Try again!");
            location.reload();
        }
    }
}

function resetForNextBox() {
    isFalling = false;
    currentBox.y = stack[stack.length - 1].y - (BOX_HEIGHT * 4); // New box appears above
    currentBox.x = Math.random() * (canvas.width - currentBox.w);
    currentBox.color = colors[Math.floor(Math.random() * colors.length)];
    currentBox.w = 100 + Math.random() * 40; // Random big widths
    moveSpeed += 0.15; // Very slight increase in difficulty
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(0, cameraY);

    // Draw stack
    stack.forEach((box) => {
        drawPresent(box.x, box.y, box.w, BOX_HEIGHT, box.color);
    });

    // Draw active falling box
    if (score < WIN_SCORE) {
        drawPresent(currentBox.x, currentBox.y, currentBox.w, BOX_HEIGHT, currentBox.color);
    }

    ctx.restore();
}

function drawPresent(x, y, w, h, color) {
    // Main Box
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeRect(x, y, w, h);

    // Ribbon (Vertical)
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x + (w / 2) - 8, y, 16, h);
}

// Input listeners
const dropAction = (e) => {
    if (gameActive && !isFalling) isFalling = true;
};

window.addEventListener('mousedown', dropAction);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dropAction();
});

update();
