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
        window.open('../browser-games/galaxian/index.html', '_blank');
    } else {
        alert(`Loading demo instance for [${title}] on retrogames4.net!`);
    }
}

// Export functions needed by HTML onclick attributes
window.toggleSound = toggleSound;
window.playRetroSound = playRetroSound;
window.filterVault = filterVault;
window.launchDemo = launchDemo;