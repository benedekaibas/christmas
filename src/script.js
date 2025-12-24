const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const winScreen = document.getElementById('win-screen');

canvas.width = window.innerWidth > 450 ? 450 : window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let score = 0;
let speed = 3;
let direction = 1;
let gameActive = true;
let cameraY = 0; // Tracks the visual scroll

const BOX_HEIGHT = 50;
let currentBox = {
    x: 0,
    y: 0,
    w: 150,
    color: ''
};

let stack = [
    { x: (canvas.width / 2) - 75, y: canvas.height - 50, w: 150, color: '#27ae60' }
];

function initBox() {
    currentBox.w = stack[stack.length - 1].w;
    currentBox.x = 0;
    currentBox.y = canvas.height - (stack.length + 1) * BOX_HEIGHT;
    currentBox.color = stack.length % 2 === 0 ? '#27ae60' : '#c0392b';
}

function update() {
    if (!gameActive) return;

    // Move the current sliding box
    currentBox.x += speed * direction;

    if (currentBox.x + currentBox.w > canvas.width || currentBox.x < 0) {
        direction *= -1;
    }

    // Smoothly adjust camera to follow the stack
    let targetCameraY = (stack.length - 4) * BOX_HEIGHT;
    if (targetCameraY > cameraY) cameraY += 2;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, cameraY); // This is what keeps the boxes from disappearing!

    // Draw existing stack
    stack.forEach((box, i) => {
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.w, BOX_HEIGHT);
        
        // Ribbon
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(box.x + (box.w / 2) - 5, box.y, 10, BOX_HEIGHT);
    });

    // Draw sliding box
    if (score < 25) {
        ctx.fillStyle = currentBox.color;
        ctx.fillRect(currentBox.x, currentBox.y, currentBox.w, BOX_HEIGHT);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(currentBox.x + (currentBox.w / 2) - 5, currentBox.y, 10, BOX_HEIGHT);
    }

    ctx.restore();
}

function handleInput() {
    if (!gameActive || score >= 25) return;

    let lastBox = stack[stack.length - 1];
    
    // Calculate overlap
    let overlapStart = Math.max(currentBox.x, lastBox.x);
    let overlapEnd = Math.min(currentBox.x + currentBox.w, lastBox.x + lastBox.w);
    let overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth > 0) {
        // Success: Add to stack
        stack.push({
            x: overlapStart,
            y: currentBox.y,
            w: overlapWidth,
            color: currentBox.color
        });
        
        score++;
        scoreElement.innerText = `Presents Stacked: ${score} / 25`;
        speed += 0.2; // Increase difficulty
        
        if (score >= 25) {
            gameActive = false;
            winScreen.classList.remove('hidden');
        } else {
            initBox();
        }
    } else {
        // Fail: Reset
        alert("The gift fell! Try again to get your Christmas present.");
        resetGame();
    }
}

function resetGame() {
    score = 0;
    speed = 3;
    cameraY = 0;
    stack = [{ x: (canvas.width / 2) - 75, y: canvas.height - 50, w: 150, color: '#27ae60' }];
    scoreElement.innerText = `Presents Stacked: 0 / 25`;
    initBox();
}

// Controls
window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
});

// Start
initBox();
update();
