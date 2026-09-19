// Simple Maze Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const uiOverlay = document.getElementById('ui-overlay');

// Maze definition (0 = wall, 1 = path, 2 = goal)
const maze = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// Set goal
const goal = { x: 13, y: 13 };
maze[goal.y][goal.x] = 2;

let tileSize;
let player = { x: 1, y: 1 }; // Starting position (in tiles)
// goal already defined above
// Set canvas size to match container
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    tileSize = Math.min(canvas.width / maze[0].length, canvas.height / maze.length);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameActive = false;
let animationFrameId;

// Draw the maze
function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const x = col * tileSize;
            const y = row * tileSize;

            if (maze[row][col] === 0) {
                // Wall
                ctx.fillStyle = '#121225';
                ctx.fillRect(x, y, tileSize, tileSize);
            } else if (maze[row][col] === 2) {
                // Goal
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(x, y, tileSize, tileSize);
            } else {
                // Path
                ctx.fillStyle = '#0a0a12';
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
    }
}

// Draw the player
function drawPlayer() {
    const x = player.x * tileSize;
    const y = player.y * tileSize;
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(x, y, tileSize, tileSize);
}

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update player position
function updatePlayer() {
    let moved = false;
    const newX = player.x;
    const newY = player.y;

    if (keys['ArrowUp'] && player.y > 0) {
        newY--;
        moved = true;
    } else if (keys['ArrowDown'] && player.y < maze.length - 1) {
        newY++;
        moved = true;
    } else if (keys['ArrowLeft'] && player.x > 0) {
        newX--;
        moved = true;
    } else if (keys['ArrowRight'] && player.x < maze[0].length - 1) {
        newX++;
        moved = true;
    }

    // Check if the new position is a wall
    if (moved && maze[newY][newX] !== 0) {
        player.x = newX;
        player.y = newY;

        // Check if reached goal
        if (player.x === goal.x && player.y === goal.y) {
            gameOver(true);
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameActive) return;

    updatePlayer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPlayer();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    gameActive = true;
    uiOverlay.style.display = 'none';
    resetGame();
    gameLoop();
}

// Reset game state
function resetGame() {
    player.x = 1;
    player.y = 1;
}

// Game over
function gameOver(won) {
    gameActive = false;
    cancelAnimationFrame(animationFrameId);
    uiOverlay.style.display = 'flex';
    if (won) {
        uiOverlay.querySelector('h1').textContent = 'You Win!';
        uiOverlay.querySelector('p').textContent = 'Congratulations! You reached the goal.';
    } else {
        uiOverlay.querySelector('h1').textContent = 'Game Over';
        uiOverlay.querySelector('p').textContent = 'Try again!';
    }
}

// Event listener for start button
startButton.addEventListener('click', startGame);