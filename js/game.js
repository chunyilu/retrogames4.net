// --- Breakout Arcade Canvas Game Logic ---
const canvas = document.getElementById('arcadeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('gameScore');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySub = document.getElementById('overlaySub');

let animationFrameId;
let score = 0;

// Resize Canvas dynamically
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game state variables
let paddle = { x: 0, width: 100, height: 12, speed: 8 };
let ball = { x: 0, y: 0, dx: 4, dy: -4, radius: 7 };
let bricks = [];
const brickRowCount = 4;
const brickColumnCount = 7;
let rightPressed = false;
let leftPressed = false;

// Initialize Paddle & Bricks
function initGameObjects() {
    paddle.width = Math.max(80, canvas.width * 0.15);
    paddle.x = (canvas.width - paddle.width) / 2;

    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = 4;
    ball.dy = -4;

    bricks = [];
    const brickWidth = (canvas.width - 60) / brickColumnCount;
    const brickHeight = 18;

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 30 + c * (brickWidth + 4),
                y: 40 + r * (brickHeight + 6),
                width: brickWidth,
                height: brickHeight,
                status: 1
            };
        }
    }
}

// Keyboard & Touch Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
});

// Touch Control Triggers
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; });
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
btnRight.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; });

// Collision Detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + b.width && ball.y > b.y && ball.y < b.y + b.height) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 100;
                    scoreEl.innerText = String(score).padStart(4, '0');
                    scoreEl.setAttribute('aria-label', `Game score: ${score}`);
                    playRetroSound('hit');

                    if (score === brickRowCount * brickColumnCount * 100) {
                        endGame(true);
                    }
                }
            }
        }
    }
}

// Draw Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                ctx.beginPath();
                ctx.rect(bricks[c][r].x, bricks[c][r].y, bricks[c][r].width, bricks[c][r].height);
                ctx.fillStyle = r % 2 === 0 ? '#ff007f' : '#00f3ff';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    // Draw Paddle
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
    ctx.fillStyle = '#ffe600';
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.closePath();

    // Collision with left/right walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        playRetroSound('hit');
    }

    // Collision with ceiling
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        playRetroSound('hit');
    }
    // Collision with paddle or bottom
    else if (ball.y + ball.dy > canvas.height - paddle.height - 15) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -Math.abs(ball.dy);
            playRetroSound('hit');
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            endGame(false);
            return;
        }
    }

    // Move Paddle
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    collisionDetection();
    animationFrameId = requestAnimationFrame(draw);
}

function startGame() {
    score = 0;
    scoreEl.innerText = '0000';
    scoreEl.setAttribute('aria-label', 'Game score: 0');
    overlay.classList.add('hidden');
    resizeCanvas();
    initGameObjects();
    cancelAnimationFrame(animationFrameId);
    playRetroSound('click');
    draw();
}

function endGame(isWin) {
    cancelAnimationFrame(animationFrameId);
    overlay.classList.remove('hidden');
    if (isWin) {
        overlayTitle.innerText = "STAGE CLEARED!";
        overlaySub.innerText = `Awesome! Final Score: ${score}`;
        playRetroSound('win');
    } else {
        overlayTitle.innerText = "GAME OVER";
        overlaySub.innerText = `Final Score: ${score}. Try again to break high scores!`;
        playRetroSound('over');
    }

    // Submit score to backend
    if (typeof window.submitGameScore === 'function' && score > 0) {
        window.submitGameScore('breakout', score, {
            onSuccess: () => {
                const notice = document.createElement('div');
                notice.className = 'text-[10px] font-arcade text-neon-cyan mt-2 animate-pulse';
                notice.textContent = `✓ Score ${score} recorded to Hall of Fame!`;
                overlaySub.appendChild(notice);
            },
            onNotLoggedIn: () => {
                const notice = document.createElement('div');
                notice.className = 'text-[9px] font-mono text-gray-400 mt-2';
                notice.innerHTML = '<span class="text-neon-pink">Tip:</span> Login to submit your scores to the Leaderboard!';
                overlaySub.appendChild(notice);
            }
        });
    }
}

// Attach restart button listener if available
const startBtn = document.getElementById('startBtn');
if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

// Fullscreen mode with fallback support
function toggleGameFullscreen() {
    if (typeof playRetroSound === 'function') {
        playRetroSound('click');
    }
    const container = document.querySelector('#arcade .aspect-\\[16\\/9\\]') || (canvas ? canvas.parentElement : null);
    const icon = document.getElementById('fullscreenIcon');

    // Check if currently in native fullscreen or CSS fallback mode
    const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const isCssFs = container ? container.classList.contains('fullscreen-fallback') : false;

    if (!isNativeFs && !isCssFs) {
        // Enter Fullscreen
        if (container) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch(() => enableCssFullscreen(container));
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else {
                enableCssFullscreen(container);
            }
        }
        if (icon) icon.className = 'fa-solid fa-compress';
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                // Silently ignore if orientation lock is not permitted
            });
        }
    } else {
        // Exit Fullscreen
        if (isNativeFs) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        if (container) {
            disableCssFullscreen(container);
        }
        if (icon) icon.className = 'fa-solid fa-expand';
    }
}

function enableCssFullscreen(el) {
    if (!el) return;
    el.classList.add('fullscreen-fallback', 'fixed', 'inset-0', 'z-50', 'w-screen', 'h-screen', 'max-w-none', 'rounded-none');
    document.body.classList.add('overflow-hidden');
    resizeCanvas();
}

function disableCssFullscreen(el) {
    if (!el) return;
    el.classList.remove('fullscreen-fallback', 'fixed', 'inset-0', 'z-50', 'w-screen', 'h-screen', 'max-w-none', 'rounded-none');
    document.body.classList.remove('overflow-hidden');
    resizeCanvas();
}

// Sync icon and canvas size when native fullscreen changes
function handleFullscreenChange() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const icon = document.getElementById('fullscreenIcon');
    if (icon) {
        icon.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    }
    resizeCanvas();
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Export functions needed by other scripts and HTML onclick attributes
window.startGame = startGame;
window.endGame = endGame;
window.toggleGameFullscreen = toggleGameFullscreen;
window.enableCssFullscreen = enableCssFullscreen;
window.disableCssFullscreen = disableCssFullscreen;
window.resizeCanvas = resizeCanvas;