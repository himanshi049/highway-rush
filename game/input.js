/**
 * HIGHWAY RUSH - Input & UI Module
 * Event handlers and UI updates
 */

/**
 * Set up event listeners
 */
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            toggleDebugMode();
        }
    });
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = true;
            e.preventDefault();
            break;
        case ' ':
            if (!keys.spacePressed) {
                keys.space = true;
                keys.spacePressed = true;
                handleSpacePress();
            }
            e.preventDefault();
            break;
    }
}

/**
 * Handle keyup events
 */
function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = false;
            break;
        case ' ':
            keys.space = false;
            keys.spacePressed = false;
            break;
    }
}

/**
 * Handle space bar press
 */
function handleSpacePress() {
    if (!gameState.isPlaying) {
        startGame();
    } else if (gameState.isPlaying && !gameState.isPaused) {
        pauseGame();
    } else if (gameState.isPaused) {
        resumeGame();
    }
}

/**
 * Update HTML UI elements
 */
function updateUI() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('highScorePanel').textContent = gameState.highScore;
    document.getElementById('speedDisplay').textContent = gameState.speedMultiplier.toFixed(1) + 'x';
    document.getElementById('levelDisplay').textContent = gameState.level;
    
    if (gameState.debugMode) {
        document.getElementById('fpsDisplay').textContent = Math.round(gameState.fps);
        document.getElementById('obstacleCount').textContent = obstacles.length;
        document.getElementById('playerLane').textContent = player.lane;
    }
}

/**
 * Show overlay screen
 */
function showOverlay(overlayId) {
    document.getElementById(overlayId).classList.remove('hidden');
}

/**
 * Hide overlay screen
 */
function hideOverlay(overlayId) {
    document.getElementById(overlayId).classList.add('hidden');
}

/**
 * Display game over screen
 */
function showGameOverScreen(isNewHighScore) {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('timeSurvived').textContent = gameState.survivalTime;
    document.getElementById('gameOverHighScore').textContent = gameState.highScore;
    
    if (isNewHighScore) {
        document.getElementById('newHighScore').classList.remove('hidden');
    } else {
        document.getElementById('newHighScore').classList.add('hidden');
    }
    
    showOverlay('gameOverScreen');
}

/**
 * Update high score display on start screen
 */
function updateHighScoreDisplay() {
    const highScoreText = gameState.highScore > 0 
        ? `High Score: ${gameState.highScore}` 
        : 'No high score yet!';
    document.getElementById('highScoreDisplay').textContent = highScoreText;
}

/**
 * Toggle debug mode
 */
function toggleDebugMode() {
    gameState.debugMode = !gameState.debugMode;
    const debugPanel = document.getElementById('debugPanel');
    debugPanel.style.display = gameState.debugMode ? 'block' : 'none';
    console.log('Debug mode:', gameState.debugMode ? 'ON' : 'OFF');
}
