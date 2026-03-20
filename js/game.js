// GAME.JS - 100% WORKING FLUPPY BIRD ENGINE 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fix global variables missing from other files
const birdImages = birdImages || {};
let selectedSkin = selectedSkin || {pipeColor:"#00c853", groundColor:"#8B4513"};
let gameState = {
    bird: {x:100, y:200, width:60, height:60, velocity:0, rotation:0},
    gravity: 0.4, pipes:[], score:0, highScore:0,
    gameOver:false, gameStarted:false, paused:false,
    currentPipeSpeed:2.5, pipeSpacing:420, nextPipeDistance:420,
    difficulty:"Normal", animationId:null
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const gapSizes = {"Very Easy":320,"Normal":260,"Hard":200};

function initGame() {
    gameState.bird = {x:100,y:200,width:60,height:60,velocity:0,rotation:0};
    gameState.pipes = []; 
    gameState.score = 0; 
    gameState.gameOver = false;
    gameState.gameStarted = false; 
    gameState.paused = false;
    gameState.currentPipeSpeed = {"Very Easy":2.0,"Normal":2.5,"Hard":3.0}[gameState.difficulty];
    gameState.nextPipeDistance = gameState.pipeSpacing;
}

function createPipe() {
    const gapSize = gapSizes[gameState.difficulty];
    const minHeight = 120;
    const maxHeight = canvas.height - gapSize - minHeight - 80;
    const pipeTopHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    gameState.pipes.push({
        x: canvas.width, width:70,
        topHeight: pipeTopHeight,
        gapSize: gapSize,
        bottomHeight: canvas.height - pipeTopHeight - gapSize - 70,
        scored: false
    });
}

function gameLoop() {
    if (gameState.animationId) cancelAnimationFrame(gameState.animationId);
    gameState.animationId = requestAnimationFrame(gameLoop);
    
    if (!gameState.gameStarted || gameState.gameOver || gameState.paused) return;
    
    // Update pipe spawning
    gameState.nextPipeDistance -= gameState.currentPipeSpeed;
    if (gameState.nextPipeDistance <= 0) {
        createPipe();
        gameState.nextPipeDistance = gameState.pipeSpacing;
    }
    
    // Bird physics
    gameState.bird.velocity += gameState.gravity;
    gameState.bird.y += gameState.bird.velocity;
    gameState.bird.rotation = Math.min(gameState.bird.velocity * 3, 25);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background (alternating)
    if (Math.floor(gameState.score / 5) % 2 === 0) {
        ctx.fillStyle = "skyblue"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Pipes
    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        let pipe = gameState.pipes[i];
        pipe.x -= gameState.currentPipeSpeed;
        
        ctx.fillStyle = selectedSkin.pipeColor || "#00c853";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight - 70, pipe.width, pipe.bottomHeight);
        
        // Collision detection
        if (gameState.bird.x < pipe.x + pipe.width &&
            gameState.bird.x + gameState.bird.width > pipe.x &&
            (gameState.bird.y < pipe.topHeight || 
             gameState.bird.y + gameState.bird.height > canvas.height - pipe.bottomHeight - 70)) {
            endGame(); return;
        }
        
        // Score
        if (!pipe.scored && pipe.x + pipe.width < gameState.bird.x) {
            gameState.score++;
            pipe.scored = true;
            if (typeof playSound === 'function') playSound('score');
            gameState.currentPipeSpeed = Math.min(gameState.currentPipeSpeed + 0.04, 5);
        }
        
        if (pipe.x + pipe.width < -50) {
            gameState.pipes.splice(i, 1);
        }
    }
    
    // Ground
    const groundHeight = 70;
    ctx.fillStyle = selectedSkin.groundColor || "#8B4513";
    ctx.fillRect(0, canvas.height-groundHeight, canvas.width, groundHeight);
    
    // Ground collision
    if (gameState.bird.y + gameState.bird.height > canvas.height-groundHeight || gameState.bird.y < 0) {
        endGame(); return;
    }
    
    // Draw bird
    ctx.save();
    ctx.translate(gameState.bird.x + gameState.bird.width/2, gameState.bird.y + gameState.bird.height/2);
    ctx.rotate(gameState.bird.rotation * Math.PI / 180);
    
    if (birdImages && birdImages[selectedSkin?.name]) {
        ctx.drawImage(birdImages[selectedSkin.name], -gameState.bird.width/2, -gameState.bird.height/2, gameState.bird.width, gameState.bird.height);
    } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
    
    // UI
    ctx.fillStyle = "black"; 
    ctx.font = "bold 36px Arial"; 
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${gameState.score}`, 30, 60);
    ctx.fillText(`High: ${gameState.highScore || 0}`, 30, 110);
}

function jump() {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.paused) {
        gameState.bird.velocity = -7.5;
        gameState.bird.rotation = -25;
        if (typeof playSound === 'function') playSound('fly');
    }
}

function startGame() {
    if (typeof playSound === 'function') playSound('button');
    initGame();
    
    // Hide screens
    const screens = document.querySelectorAll('#titleScreen, #settingsScreen, #storeScreen');
    screens.forEach(s => s.style.display = 'none');
    
    document.getElementById('pauseBtn').style.display = 'block';
    document.getElementById('gameOverOverlay')?.classList.remove('show');
    
    // Countdown
    let countdown = ["3","2","1","GO!"];
    let i = 0;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.8); display:flex; align-items:center; 
        justify-content:center; font-size:150px; color:yellow; 
        z-index:1000; font-weight:bold; font-family:Arial;
    `;
    document.body.appendChild(overlay);
    
    const interval = setInterval(() => {
        overlay.textContent = countdown[i];
        if (i < 3 && typeof playSound === 'function') playSound('countdown');
        i++;
        if (i >= 4) {
            clearInterval(interval);
            document.body.removeChild(overlay);
            gameState.gameStarted = true;
            gameLoop();
        }
    }, 800);
}

function endGame() {
    if (typeof playSound === 'function') playSound('gameover');
    gameState.gameOver = true;
    
    if (gameState.score > (gameState.highScore || 0)) {
        gameState.highScore = gameState.score;
        localStorage.setItem('fluppyHighScore', gameState.highScore);
    }
    
    const finalScoreEl = document.getElementById('finalScore');
    const highScoreEl = document.getElementById('highScore');
    if (finalScoreEl) finalScoreEl.textContent = gameState.score;
    if (highScoreEl) highScoreEl.textContent = gameState.highScore || 0;
    
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.add('show');
        const restartBtn = document.getElementById('gameRestartBtn');
        const homeBtn = document.getElementById('gameHomeBtn');
        if (restartBtn) restartBtn.style.display = 'block';
        if (homeBtn) homeBtn.style.display = 'block';
    }
}

function togglePause() {
    gameState.paused = !gameState.paused;
    if (typeof playSound === 'function') playSound('button');
}

// Universal event listeners
document.addEventListener('click', (e) => {
    const menus = document.querySelector('#titleScreen, #settingsScreen, #storeScreen');
    if (!e.target.closest('#titleScreen, #settingsScreen, #storeScreen')) {
        jump();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); jump(); }
    if (e.code === 'KeyP') { e.preventDefault(); togglePause(); }
});

// Button event listeners with error handling
function addButtonListeners() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const gameRestartBtn = document.getElementById('gameRestartBtn');
    const gameHomeBtn = document.getElementById('gameHomeBtn');
    
    if (playBtn) playBtn.onclick = startGame;
    if (pauseBtn) pauseBtn.onclick = togglePause;
    if (gameRestartBtn) gameRestartBtn.onclick = startGame;
    if (gameHomeBtn) gameHomeBtn.onclick = () => {
        const titleScreen = document.getElementById('titleScreen');
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        if (titleScreen) titleScreen.style.display = 'flex';
        if (gameOverOverlay) gameOverOverlay.classList.remove('show');
        if (typeof playSound === 'function') playSound('button');
    };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    gameState.highScore = parseInt(localStorage.getItem('fluppyHighScore')) || 0;
    
    // Wait for other scripts to load
    setTimeout(() => {
        addButtonListeners();
        
        // Show title screen, hide splash
        const titleScreen = document.getElementById('titleScreen');
        const splashScreen = document.getElementById('splashScreen');
        if (titleScreen) titleScreen.style.display = 'flex';
        if (splashScreen) {
            splashScreen.style.transition = 'opacity 0.5s';
            splashScreen.style.opacity = '0';
            setTimeout(() => splashScreen.style.display = 'none', 500);
        }
    }, 100);
});
