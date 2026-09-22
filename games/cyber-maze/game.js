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
let offsetX = 0;
let offsetY = 0;
let player = { x: 1, y: 1 }; // Starting position (in tiles)
let lastMoveTime = 0;
const moveCooldown = 130; // ms between continuous steps

// Set canvas size to match container
function resizeCanvas() {
    const container = document.getElementById('game-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    tileSize = Math.floor(Math.min((canvas.width - 20) / maze[0].length, (canvas.height - 20) / maze.length));
    offsetX = Math.floor((canvas.width - maze[0].length * tileSize) / 2);
    offsetY = Math.floor((canvas.height - maze.length * tileSize) / 2);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameActive = false;
let animationFrameId;

// Draw the maze
function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const x = offsetX + col * tileSize;
            const y = offsetY + row * tileSize;

            if (maze[row][col] === 0) {
                // Wall
                ctx.fillStyle = '#121225';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = '#2a2a4a';
                ctx.strokeRect(x, y, tileSize, tileSize);
            } else if (maze[row][col] === 2) {
                // Goal
                ctx.fillStyle = '#00ff00';
                ctx.shadowColor = '#00ff00';
                ctx.shadowBlur = 10;
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                ctx.shadowBlur = 0;
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
    const x = offsetX + player.x * tileSize;
    const y = offsetY + player.y * tileSize;
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
    ctx.shadowBlur = 0;
}

// Handle movement
function movePlayer(dx, dy) {
    if (!gameActive) return;
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
        if (maze[newY][newX] !== 0) {
            player.x = newX;
            player.y = newY;

            // Check if reached goal
            if (player.x === goal.x && player.y === goal.y) {
                gameOver(true);
            }
        }
    }
}

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key] = true;

    if (gameActive) {
        const now = Date.now();
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            movePlayer(0, -1);
            lastMoveTime = now;
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            movePlayer(0, 1);
            lastMoveTime = now;
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            movePlayer(-1, 0);
            lastMoveTime = now;
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            movePlayer(1, 0);
            lastMoveTime = now;
        }
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update player position continuously when holding keys
function updatePlayer() {
    if (!gameActive) return;
    const now = Date.now();
    if (now - lastMoveTime < moveCooldown) return;

    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        dy = -1;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        dy = 1;
    } else if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        dx = -1;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        dx = 1;
    }

    if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy);
        lastMoveTime = now;
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
    const score = won ? 1000 : 100;
    if (won) {
        uiOverlay.querySelector('h1').textContent = 'You Win!';
        uiOverlay.querySelector('p').textContent = `Congratulations! You reached the goal. Final Score: ${score}`;
    } else {
        uiOverlay.querySelector('h1').textContent = 'Game Over';
        uiOverlay.querySelector('p').textContent = `Try again! Final Score: ${score}`;
    }

    // Submit score if user is logged in
    recordGameScore('cyber-maze', score);
}

function recordGameScore(gameId, score) {
    try {
        const storedUser = localStorage.getItem('retrogames4User');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const userId = user.id || user.userId || user._id;
        if (!userId) return;

        const API_BASE_URL = window.API_BASE_URL || 'https://retrogames-service.onrender.com';
        fetch(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                userId: userId,
                game_id: gameId,
                gameId: gameId,
                score: Number(score),
                email: user.email
            })
        }).then(res => res.json()).then(data => {
            const statusMsg = document.createElement('div');
            statusMsg.style.color = '#00f3ff';
            statusMsg.style.fontSize = '12px';
            statusMsg.style.marginTop = '8px';
            statusMsg.textContent = '✓ Score recorded to leaderboard!';
            uiOverlay.appendChild(statusMsg);
        }).catch(err => {
            console.warn('Could not record score:', err);
        });
    } catch (e) {
        console.warn('Error in recordGameScore:', e);
    }
}

// Event listener for start button
startButton.addEventListener('click', startGame);