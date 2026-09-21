// --- Sound Effects using Synth (Tone.js) ---
let soundEnabled = true;
const synth = new Tone.Synth().toDestination();

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icons = [document.getElementById('soundIcon'), document.getElementById('mobileSoundIcon')];
    icons.forEach(icon => {
        if (icon) {
            icon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
    });
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
    } else if (title === 'Moon Festival' || title === 'Jade Rabbit' || title === 'Moon Festival: Jade Rabbit') {
        // Open Moon Festival game
        window.location.href = 'games/moon-festival/index.html';
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
        const mazeScore = won ? 1000 : 100;
        if (won) {
            overlayTitle.textContent = 'You Win!';
            overlaySub.textContent = `Congratulations! You reached the goal. Score: ${mazeScore}`;
            playRetroSound('win');
        } else {
            overlayTitle.textContent = 'Game Over';
            overlaySub.textContent = `Try again! Score: ${mazeScore}`;
            playRetroSound('over');
        }

        if (typeof submitGameScore === 'function') {
            submitGameScore('cyber-maze', mazeScore, {
                onSuccess: () => {
                    const notice = document.createElement('div');
                    notice.className = 'text-[9px] font-arcade text-neon-cyan mt-1 animate-pulse';
                    notice.textContent = '✓ Score recorded!';
                    overlaySub.appendChild(notice);
                }
            });
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

// Authentication & Score state
let currentUser = null;
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
let currentLeaderboardGame = 'breakout';
let userScoresData = [];

// Game Display Names Map
const GAME_NAMES = {
    'breakout': 'Retro Breakout',
    'cyber-maze': 'Cyber Maze',
    'moon-festival': 'Moon Festival',
    'neon-defender': 'Neon Defender',
    'block-stacker': 'Block Stacker',
    'galaxian': 'Galaxian'
};

function getGameDisplayName(gameId) {
    if (!gameId) return 'Arcade Game';
    return GAME_NAMES[gameId] || gameId.replace(/[-_]/g, ' ').toUpperCase();
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- POST /scores: Submit a new score for a player and game ---
async function submitGameScore(gameId, score, options = {}) {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0) {
        return { success: false, message: 'Invalid score' };
    }

    if (!currentUser) {
        if (typeof options.onNotLoggedIn === 'function') {
            options.onNotLoggedIn();
        }
        return { success: false, message: 'User not logged in' };
    }

    const userId = currentUser.id || currentUser.userId || currentUser._id;
    const email = currentUser.email || '';

    const payload = {
        user_id: userId,
        userId: userId,
        game_id: gameId,
        gameId: gameId,
        score: numScore,
        email: email
    };

    try {
        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit score');
        }

        // Cache score in local storage for the user
        if (userId) {
            const cachedKey = `retrogames4_scores_${userId}`;
            let cached = [];
            try {
                cached = JSON.parse(localStorage.getItem(cachedKey) || '[]');
            } catch (e) { cached = []; }
            cached.unshift({
                id: data.id || Date.now(),
                user_id: userId,
                userId: userId,
                game_id: gameId,
                gameId: gameId,
                score: numScore,
                created_at: new Date().toISOString()
            });
            localStorage.setItem(cachedKey, JSON.stringify(cached));
        }

        // Refresh user score list and leaderboard
        loadUserScores();
        loadLeaderboard(currentLeaderboardGame);

        if (typeof options.onSuccess === 'function') {
            options.onSuccess(data);
        }

        return { success: true, data };
    } catch (error) {
        console.warn('Error submitting score to server:', error.message);

        // Fallback: cache score in local storage so user doesn't lose progress offline
        if (userId) {
            const cachedKey = `retrogames4_scores_${userId}`;
            let cached = [];
            try {
                cached = JSON.parse(localStorage.getItem(cachedKey) || '[]');
            } catch (e) { cached = []; }
            cached.unshift({
                id: Date.now(),
                user_id: userId,
                userId: userId,
                game_id: gameId,
                gameId: gameId,
                score: numScore,
                created_at: new Date().toISOString()
            });
            localStorage.setItem(cachedKey, JSON.stringify(cached));
            renderUserScores(cached);
        }

        if (typeof options.onError === 'function') {
            options.onError(error);
        }
        return { success: false, error: error.message };
    }
}

// --- GET /scores/<game_id> or GET /scores/leaderboard/<game_id>: Retrieve top scores ---
async function loadLeaderboard(gameId = currentLeaderboardGame) {
    currentLeaderboardGame = gameId;
    updateLeaderboardTabUI(gameId);

    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;

    listEl.innerHTML = `
        <div class="p-6 text-center text-neon-cyan font-arcade text-xs">
            <i class="fa-solid fa-spinner fa-spin mr-2"></i> FETCHING SCORES...
        </div>
    `;

    try {
        let response = await fetch(`${API_BASE_URL}/scores/${encodeURIComponent(gameId)}`);
        if (!response.ok) {
            // Fallback to /scores/leaderboard/<game_id>
            response = await fetch(`${API_BASE_URL}/scores/leaderboard/${encodeURIComponent(gameId)}`);
        }

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        let scores = Array.isArray(data) ? data : (data.leaderboard || data.scores || data.topScores || data.data || []);

        // Sort descending by score
        scores.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));

        renderLeaderboard(scores, gameId);
    } catch (error) {
        console.warn('Leaderboard API fetch error, using fallback high scores:', error.message);
        renderFallbackLeaderboard(gameId);
    }
}

function updateLeaderboardTabUI(activeGameId) {
    const tabs = document.querySelectorAll('.leaderboard-tab-btn');
    tabs.forEach(tab => {
        const tabGameId = tab.id.replace('leaderboardTab-', '');
        if (tabGameId === activeGameId) {
            tab.className = 'leaderboard-tab-btn px-3.5 py-1.5 rounded bg-neon-pink text-white font-bold transition-all';
        } else {
            tab.className = 'leaderboard-tab-btn px-3.5 py-1.5 rounded bg-neon-card text-gray-300 border border-gray-700 hover:border-neon-cyan transition-all';
        }
    });
}

function renderLeaderboard(scores, gameId) {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;

    if (!scores || scores.length === 0) {
        listEl.innerHTML = `
            <div class="p-8 text-center text-gray-400 font-arcade text-xs space-y-2">
                <i class="fa-solid fa-gamepad text-2xl text-gray-600 mb-1 block"></i>
                <div>NO SCORES RECORDED YET FOR ${getGameDisplayName(gameId).toUpperCase()}</div>
                <p class="text-[10px] text-neon-cyan">Be the first player to set a high score!</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = scores.slice(0, 10).map((item, index) => {
        const rank = index + 1;
        let rankBadge = `${rank}TH`;
        let rankClass = 'text-gray-400';
        if (rank === 1) { rankBadge = '1ST'; rankClass = 'text-neon-yellow'; }
        else if (rank === 2) { rankBadge = '2ND'; rankClass = 'text-gray-300'; }
        else if (rank === 3) { rankBadge = '3RD'; rankClass = 'text-amber-600'; }

        const playerName = item.username || item.player || item.email || (item.user_id ? `PLAYER #${item.user_id}` : (item.userId ? `PLAYER #${item.userId}` : 'RETRO_PLAYER'));
        const scoreVal = (Number(item.score) || 0).toLocaleString();
        const dateStr = item.created_at || item.date || item.timestamp ? new Date(item.created_at || item.date || item.timestamp).toLocaleDateString() : '';

        return `
            <div class="p-4 flex justify-between items-center hover:bg-neon-pink/10 transition-colors">
                <span class="flex items-center gap-3">
                    <span class="font-arcade text-xs ${rankClass} w-8">${rankBadge}</span>
                    <span class="text-white font-bold font-mono tracking-wide">${escapeHtml(playerName)}</span>
                    ${dateStr ? `<span class="hidden sm:inline text-[10px] text-gray-500 font-mono">(${dateStr})</span>` : ''}
                </span>
                <span class="text-neon-pink font-bold font-mono text-base sm:text-lg">${scoreVal}</span>
            </div>
        `;
    }).join('');
}

function renderFallbackLeaderboard(gameId) {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;

    const fallbackData = {
        'breakout': [
            { player: 'CYBER_KING99', score: 999850 },
            { player: 'PIXEL_QUEEN', score: 874200 },
            { player: 'NEON_WAVE', score: 752110 }
        ],
        'cyber-maze': [
            { player: 'MAZE_MASTER', score: 1000 },
            { player: 'NEO_RUNNER', score: 1000 },
            { player: 'BYTE_SURFER', score: 100 }
        ],
        'moon-festival': [
            { player: 'JADE_BUNNY', score: 125400 },
            { player: 'MOON_DEFENDER', score: 98300 },
            { player: 'RABBIT_ONE', score: 65100 }
        ]
    };

    const scores = fallbackData[gameId] || fallbackData['breakout'];
    renderLeaderboard(scores, gameId);
}

function switchLeaderboardTab(gameId) {
    playRetroSound('click');
    loadLeaderboard(gameId);
}

function refreshCurrentLeaderboard() {
    playRetroSound('click');
    loadLeaderboard(currentLeaderboardGame);
}

// --- GET /users/<user_id>/scores: Retrieve all scores recorded for player ---
async function loadUserScores() {
    if (!currentUser) {
        userScoresData = [];
        renderUserScores([]);
        return;
    }

    const userId = currentUser.id || currentUser.userId || currentUser._id;
    if (!userId) {
        renderUserScores([]);
        return;
    }

    const loadingEl = document.getElementById('userScoresLoading');
    const listEl = document.getElementById('userScoresList');
    const emptyEl = document.getElementById('userScoresEmpty');
    const emailEl = document.getElementById('userScoresEmail');

    if (emailEl) emailEl.textContent = currentUser.email || `Player #${userId}`;
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (listEl) listEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/scores`);
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        userScoresData = Array.isArray(data) ? data : (data.scores || data.userScores || data.data || []);

        // Cache user scores locally
        localStorage.setItem(`retrogames4_scores_${userId}`, JSON.stringify(userScoresData));
        renderUserScores(userScoresData);
    } catch (error) {
        console.warn('Error loading user scores from server:', error.message);
        // Load cached scores if available
        const cached = localStorage.getItem(`retrogames4_scores_${userId}`);
        if (cached) {
            try {
                userScoresData = JSON.parse(cached);
            } catch (e) {
                userScoresData = [];
            }
        } else {
            userScoresData = [];
        }
        renderUserScores(userScoresData);
    }
}

function renderUserScores(scores) {
    const loadingEl = document.getElementById('userScoresLoading');
    const listEl = document.getElementById('userScoresList');
    const emptyEl = document.getElementById('userScoresEmpty');
    const totalEl = document.getElementById('userStatsTotalGames');
    const bestEl = document.getElementById('userStatsBestScore');
    const recentEl = document.getElementById('userStatsRecentScore');

    if (loadingEl) loadingEl.classList.add('hidden');

    // Sort by date or id descending
    scores.sort((a, b) => {
        const timeA = new Date(a.created_at || a.date || a.timestamp || 0).getTime();
        const timeB = new Date(b.created_at || b.date || b.timestamp || 0).getTime();
        return (timeB - timeA) || ((b.id || 0) - (a.id || 0));
    });

    const totalCount = scores.length;
    const bestScore = totalCount > 0 ? Math.max(...scores.map(s => Number(s.score) || 0)) : 0;
    const recentScore = totalCount > 0 ? (Number(scores[0]?.score) || 0) : 0;

    if (totalEl) totalEl.textContent = totalCount;
    if (bestEl) bestEl.textContent = bestScore.toLocaleString();
    if (recentEl) recentEl.textContent = recentScore.toLocaleString();

    if (!listEl || !emptyEl) return;

    if (scores.length === 0) {
        emptyEl.classList.remove('hidden');
        listEl.classList.add('hidden');
    } else {
        emptyEl.classList.add('hidden');
        listEl.classList.remove('hidden');

        listEl.innerHTML = scores.map(item => {
            const gameId = item.game_id || item.gameId || item.game || 'breakout';
            const gameName = getGameDisplayName(gameId);
            const scoreVal = (Number(item.score) || 0).toLocaleString();
            const dateStr = item.created_at || item.date || item.timestamp ? new Date(item.created_at || item.date || item.timestamp).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Recent';

            return `
                <div class="p-3 bg-neon-dark/80 rounded border border-neon-purple/30 flex justify-between items-center hover:border-neon-cyan transition-colors">
                    <div class="space-y-1">
                        <div class="font-arcade text-[10px] text-neon-cyan uppercase">${escapeHtml(gameName)}</div>
                        <div class="text-[10px] text-gray-500 font-mono">${escapeHtml(dateStr)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-neon-pink font-bold font-mono text-base">${scoreVal}</div>
                        <div class="text-[9px] text-gray-400 font-mono">PTS</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function openUserScoresModal() {
    playRetroSound('click');
    const modal = document.getElementById('userScoresModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        loadUserScores();
    }
}

function closeUserScoresModal() {
    const modal = document.getElementById('userScoresModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

function initAuth() {
    // DOM Elements - Desktop
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myScoresBtn = document.getElementById('myScoresBtn');

    // DOM Elements - Mobile
    const mobileAuthButtons = document.getElementById('mobileAuthButtons');
    const mobileUserInfo = document.getElementById('mobileUserInfo');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const mobileMyScoresBtn = document.getElementById('mobileMyScoresBtn');

    // Modals & Forms
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const userScoresModal = document.getElementById('userScoresModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const closeUserScoresModalBtn = document.getElementById('closeUserScoresModal');
    const closeUserScoresBottomBtn = document.getElementById('closeUserScoresBottomBtn');
    const refreshUserScoresBtn = document.getElementById('refreshUserScoresBtn');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');

    // Update UI based on auth state
    function updateAuthUI() {
        if (currentUser) {
            // Desktop
            if (authButtons) {
                authButtons.classList.add('hidden');
                authButtons.classList.remove('flex');
            }
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            if (userEmail) userEmail.textContent = currentUser.email;

            // Mobile
            if (mobileAuthButtons) {
                mobileAuthButtons.classList.add('hidden');
                mobileAuthButtons.classList.remove('flex');
            }
            if (mobileUserInfo) {
                mobileUserInfo.classList.remove('hidden');
                mobileUserInfo.classList.add('flex');
            }
            if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;

            // Load player scores after login
            loadUserScores();
        } else {
            // Desktop
            if (authButtons) {
                authButtons.classList.remove('hidden');
                authButtons.classList.add('flex');
            }
            if (userInfo) {
                userInfo.classList.add('hidden');
                userInfo.classList.remove('flex');
            }

            // Mobile
            if (mobileAuthButtons) {
                mobileAuthButtons.classList.remove('hidden');
                mobileAuthButtons.classList.add('flex');
            }
            if (mobileUserInfo) {
                mobileUserInfo.classList.add('hidden');
                mobileUserInfo.classList.remove('flex');
            }

            // Clear scores modal state
            renderUserScores([]);
        }
    }

    // Check if we have a user in localStorage
    const storedUser = localStorage.getItem('retrogames4User');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch (e) {
            currentUser = null;
        }
    }
    // Update auth UI based on current user state
    updateAuthUI();

    function openLogin() {
        if (loginModal) {
            loginModal.classList.remove('hidden');
            loginModal.classList.add('flex');
            if (loginEmail) loginEmail.value = '';
            if (loginPassword) loginPassword.value = '';
            if (loginError) loginError.textContent = '';
            if (loginEmail) loginEmail.focus();
        }
    }

    function openRegister() {
        if (registerModal) {
            registerModal.classList.remove('hidden');
            registerModal.classList.add('flex');
            if (registerEmail) registerEmail.value = '';
            if (registerPassword) registerPassword.value = '';
            if (registerError) registerError.textContent = '';
            if (registerEmail) registerEmail.focus();
        }
    }

    function closeMobileMenuIfOpen() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const mobileMenuIcon = document.getElementById('mobileMenuIcon');
            if (mobileMenuIcon) mobileMenuIcon.className = 'fa-solid fa-bars text-lg';
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // Show/Hide modals
    if (loginBtn) {
        loginBtn.addEventListener('click', openLogin);
    }
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            playRetroSound('click');
            closeMobileMenuIfOpen();
            openLogin();
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', openRegister);
    }
    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', () => {
            playRetroSound('click');
            closeMobileMenuIfOpen();
            openRegister();
        });
    }

    if (myScoresBtn) {
        myScoresBtn.addEventListener('click', openUserScoresModal);
    }
    if (mobileMyScoresBtn) {
        mobileMyScoresBtn.addEventListener('click', () => {
            closeMobileMenuIfOpen();
            openUserScoresModal();
        });
    }

    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('flex');
            loginModal.classList.add('hidden');
        });
    }

    if (closeRegisterModal && registerModal) {
        closeRegisterModal.addEventListener('click', () => {
            registerModal.classList.remove('flex');
            registerModal.classList.add('hidden');
        });
    }

    if (closeUserScoresModalBtn && userScoresModal) {
        closeUserScoresModalBtn.addEventListener('click', closeUserScoresModal);
    }

    if (closeUserScoresBottomBtn && userScoresModal) {
        closeUserScoresBottomBtn.addEventListener('click', closeUserScoresModal);
    }

    if (refreshUserScoresBtn) {
        refreshUserScoresBtn.addEventListener('click', () => {
            playRetroSound('click');
            loadUserScores();
        });
    }

    // Close modals when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('flex');
                loginModal.classList.add('hidden');
            }
        });
    }

    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                registerModal.classList.remove('flex');
                registerModal.classList.add('hidden');
            }
        });
    }

    if (userScoresModal) {
        userScoresModal.addEventListener('click', (e) => {
            if (e.target === userScoresModal) {
                closeUserScoresModal();
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = '';

            const email = loginEmail ? loginEmail.value.trim() : '';
            const password = loginPassword ? loginPassword.value : '';

            if (!email || !password) {
                if (loginError) loginError.textContent = 'Please fill in all fields';
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
                if (loginModal) {
                    loginModal.classList.remove('flex');
                    loginModal.classList.add('hidden');
                }

                alert('Login successful! You can now record and view your game scores.');

            } catch (error) {
                if (loginError) loginError.textContent = error.message;
            }
        });
    }

    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (registerError) registerError.textContent = '';

            const email = registerEmail ? registerEmail.value.trim() : '';
            const password = registerPassword ? registerPassword.value : '';

            if (!email || !password) {
                if (registerError) registerError.textContent = 'Please fill in all fields';
                return;
            }

            if (password.length < 6) {
                if (registerError) registerError.textContent = 'Password must be at least 6 characters';
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
                if (registerModal) {
                    registerModal.classList.remove('flex');
                    registerModal.classList.add('hidden');
                }
                if (loginModal) {
                    loginModal.classList.remove('hidden');
                    loginModal.classList.add('flex');
                }
                if (loginEmail) loginEmail.value = email; // Pre-fill email
                if (loginPassword) loginPassword.focus();

            } catch (error) {
                if (registerError) registerError.textContent = error.message;
            }
        });
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('retrogames4User');
        updateAuthUI();
        closeUserScoresModal();
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            playRetroSound('click');
            handleLogout();
        });
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuIcon = document.getElementById('mobileMenuIcon');

    if (!mobileMenuBtn || !mobileMenu) return;

    function toggleMenu(forceOpen) {
        const shouldOpen = forceOpen !== undefined ? forceOpen : mobileMenu.classList.contains('hidden');
        if (shouldOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            if (mobileMenuIcon) {
                mobileMenuIcon.className = 'fa-solid fa-xmark text-lg';
            }
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            if (mobileMenuIcon) {
                mobileMenuIcon.className = 'fa-solid fa-bars text-lg';
            }
        }
    }

    mobileMenuBtn.addEventListener('click', () => {
        playRetroSound('click');
        toggleMenu();
    });

    // Close menu when clicking any mobile nav link or mobile arcade launch button
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link, #mobileLaunchArcadeBtn');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });

    // Automatically close mobile menu if resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
            toggleMenu(false);
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAuth();
        initMobileMenu();
        loadLeaderboard('breakout');
    });
} else {
    initAuth();
    initMobileMenu();
    loadLeaderboard('breakout');
}

// Export functions needed by HTML onclick attributes and games
window.toggleSound = toggleSound;
window.playRetroSound = playRetroSound;
window.filterVault = filterVault;
window.launchDemo = launchDemo;
window.initMobileMenu = initMobileMenu;
window.submitGameScore = submitGameScore;
window.recordScore = submitGameScore;
window.loadLeaderboard = loadLeaderboard;
window.switchLeaderboardTab = switchLeaderboardTab;
window.refreshCurrentLeaderboard = refreshCurrentLeaderboard;
window.loadUserScores = loadUserScores;
window.openUserScoresModal = openUserScoresModal;
window.closeUserScoresModal = closeUserScoresModal;