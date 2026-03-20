// SETTINGS SYSTEM - 7 SOUND TOGGLES (120+ lines)
const soundSettings = JSON.parse(localStorage.getItem("fluppySoundSettings")) || {
    all: true, bgmusic: true, score: true, fly: true, countdown: true, button: true, gameover: true
};

const audio = {
    countdown: new Audio('sounds/countdown.mp3'),
    go: new Audio('sounds/go.mp3'),
    fly: new Audio('sounds/fly.mp3'),
    button: new Audio('sounds/button.mp3'),
    score: new Audio('sounds/score.mp3'),
    gameover: new Audio('sounds/gameover.mp3'),
    bgmusic: new Audio('sounds/bgmusic.mp3')
};
audio.bgmusic.loop = true;

function playSound(soundName) {
    if (!soundSettings.all || !soundSettings[soundName]) return;
    try {
        audio[soundName].currentTime = 0;
        audio[soundName].play().catch(() => {});
    } catch(e) {}
}

function initSettings() {
    // Load saved settings
    ['allSoundsToggle', 'bgMusicToggle', 'scoreToggle', 'flyToggle', 'countdownToggle', 'buttonToggle', 'gameoverToggle'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            const settingKey = id === 'allSoundsToggle' ? 'all' : id.replace('Toggle','');
            toggle.classList.toggle('active', soundSettings[settingKey]);
        }
    });

    // Difficulty
    const savedDifficulty = localStorage.getItem("fluppyDifficulty") || "Normal";
    document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`).checked = true;
}

// Toggle handlers
document.addEventListener('DOMContentLoaded', () => {
    // Sound toggles
    ['allSoundsToggle', 'bgMusicToggle', 'scoreToggle', 'flyToggle', 'countdownToggle', 'buttonToggle', 'gameoverToggle'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('click', () => {
                const settingKey = id === 'allSoundsToggle' ? 'all' : id.replace('Toggle','');
                soundSettings[settingKey] = !soundSettings[settingKey];
                toggle.classList.toggle('active');
                
                if (settingKey === 'all') {
                    Object.keys(soundSettings).forEach(key => {
                        if (key !== 'all') soundSettings[key] = soundSettings.all;
                    });
                    updateAllToggles();
                }
                
                localStorage.setItem("fluppySoundSettings", JSON.stringify(soundSettings));
                playSound('button');
            });
        }
    });

    function updateAllToggles() {
        ['bgMusicToggle', 'scoreToggle', 'flyToggle', 'countdownToggle', 'buttonToggle', 'gameoverToggle'].forEach(id => {
            const toggle = document.getElementById(id);
            if (toggle) {
                const key = id.replace('Toggle','');
                toggle.classList.toggle('active', soundSettings[key]);
            }
        });
    }
});
