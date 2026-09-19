// --- Sound Effects using Synth (Tone.js) ---
let soundEnabled = true;
const synth = new Tone.Synth().toDestination();

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    icon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    if (soundEnabled) playRetroSound('click');
}

function playRetroSound(type) {
    if (!soundEnabled) return;
    Tone.start();
    try {
        if (type === 'click') {
            synth.triggerAttackRelease("C5", "16n");
        } else if (type === 'hit') {
            synth.triggerAttackRelease("G4", "16n");
        } else if (type === 'win') {
            synth.triggerAttackRelease("C6", "8n");
        } else if (type === 'over') {
            synth.triggerAttackRelease("C3", "4n");
        }
    } catch (e) {
        // Ignore audio context errors before user interaction
    }
}

// Vault Filtering function
function filterVault(category) {
    playRetroSound('click');
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Launch demo function
function launchDemo(title) {
    playRetroSound('click');
    if (title === 'Galaxian') {
        // Open Galaxian game in new tab
        window.open('../../browser-games/galaxian/index.html', '_blank');
    } else if (title === 'Cyber Maze') {
        // Start Cyber Maze game in-place in the arcade section
        startCyberMazeGame();
    } else {
        alert(`Loading demo instance for [${title}] on retrogames4.net!`);
    }
}

// --- Cyber Maze In-Arcade Game ---
function startCyberMazeGame() {
    playRetroSound('click');

    // Pause Breakout game and use its overlay
    endGame(false); // This stops Breakout loop and shows the overlay

    // Get elements from the existing overlay
    const canvas = document.getElementById('arcadeCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlaySub = document.getElementById('overlaySub');

    // Store original overlay content for restoration
    const originalTitle = overlayTitle.textContent;
    const originalSub = overlaySub.textContent;
    const originalButtonHtml = overlay.innerHTML; // Save full original state

    // Update overlay for Cyber Maze
    overlayTitle.textContent = 'READY PLAYER ONE?';
    overlaySub.textContent = 'Use arrow keys to navigate the maze and reach the green goal!';
    // We'll replace the button content below

    // Cyber Maze game state
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
    maze[13][13] = 2;

    let tileSize;
    let player = { x: 1, y: 1 };
    let gameActive = false;
    let animationFrameId;
    const keys = {};

    // Handle keyboard input
    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Set canvas size and calculate tile size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        tileSize = Math.min(canvas.width / maze[0].length, canvas.height / maze.length);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

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
            if (player.x === 13 && player.y === 13) {
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
        overlay.style.display = 'none';
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
        // Remove keyboard listeners
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        overlay.style.display = 'flex';
        if (won) {
            overlayTitle.textContent = 'You Win!';
            overlaySub.textContent = 'Congratulations! You reached the goal.';
            playRetroSound('win');
        } else {
            overlayTitle.textContent = 'Game Over';
            overlaySub.textContent = 'Try again!';
            playRetroSound('over');
        }

        // Restore original Breakout overlay content and pause state
        setTimeout(() => {
            overlay.innerHTML = originalButtonHtml; // Restore original content
            // Note: Breakout game remains paused (endGame was called initially)
            // User can click START GAME to resume Breakout
        }, 2000);
    }

    // Replace the button in the overlay with our Cyber Maze start button
    const startButton = document.createElement('button');
    startButton.textContent = 'START GAME';
    startButton.className = 'font-arcade text-xs px-6 py-3 bg-neon-cyan text-neon-dark font-bold rounded glow-cyan hover:scale-105 transition-transform';
    startButton.setAttribute('aria-label', 'Start game');
    startButton.onclick = startGame;

    // Set the overlay content
    overlaySub.innerHTML = 'Use arrow keys to navigate the maze and reach the green goal!';
    overlaySub.appendChild(startButton);

    // Play start sound
    playRetroSound('click');
}

// Authentication state
let currentUser = null;
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const authButtons = document.getElementById('authButtons');
const userInfo = document.getElementById('userInfo');
const userEmail = document.getElementById('userEmail');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we have a user in localStorage (for demo purposes)
    const storedUser = localStorage.getItem('retrogames4User');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    // Update auth UI based on current user state (whether null or not)
    updateAuthUI();
});

// Show/Hide modals
loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    loginModal.classList.add('flex');
    loginEmail.value = '';
    loginPassword.value = '';
    loginError.textContent = '';
    loginEmail.focus();
});

registerBtn.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
    registerModal.classList.add('flex');
    registerEmail.value = '';
    registerPassword.value = '';
    registerError.textContent = '';
    registerEmail.focus();
});

closeLoginModal.addEventListener('click', () => {
    loginModal.classList.remove('flex');
    loginModal.classList.add('hidden');
});

closeRegisterModal.addEventListener('click', () => {
    registerModal.classList.remove('flex');
    registerModal.classList.add('hidden');
});

// Close modals when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('flex');
        loginModal.classList.add('hidden');
    }
});

registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
        registerModal.classList.remove('flex');
        registerModal.classList.add('hidden');
    }
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Login successful
        currentUser = data.user;
        localStorage.setItem('retrogames4User', JSON.stringify(currentUser));
        updateAuthUI();

        // Close modal
        loginModal.classList.remove('flex');
        loginModal.classList.add('hidden');

        // Show success message (you could add a toast notification here)
        alert('Login successful!');

    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Handle register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';

    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!email || !password) {
        registerError.textContent = 'Please fill in all fields';
        return;
    }

    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Registration successful
        alert('Registration successful! Please login.');

        // Switch to login modal
        registerModal.classList.remove('flex');
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
        loginModal.classList.add('flex');
        loginEmail.value = email; // Pre-fill email
        loginPassword.focus();

    } catch (error) {
        registerError.textContent = error.message;
    }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('retrogames4User');
    updateAuthUI();
});

// Update UI based on auth state
function updateAuthUI() {
    if (currentUser) {
        // Show user info, hide auth buttons
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userInfo.classList.add('flex');
        userEmail.textContent = currentUser.email;
    } else {
        // Show auth buttons, hide user info
        authButtons.classList.remove('hidden');
        authButtons.classList.add('flex');
        userInfo.classList.add('hidden');
        userInfo.classList.remove('flex');
    }
}

// Export functions needed by HTML onclick attributes
window.toggleSound = toggleSound;
window.playRetroSound = playRetroSound;
window.filterVault = filterVault;
window.launchDemo = launchDemo;