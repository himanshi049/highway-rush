/**
 * Game initialization and main loop
 */


function initGame() {
    road.laneWidth = (canvas.width - road.edgeWidth * 2) / road.laneCount;
    player.y = canvas.height - player.height - 30;
    updatePlayerPosition();
    loadHighScore();
    updateHighScoreDisplay();
    updateUI(); // Update the info panel with loaded high score
    setupEventListeners();
    requestAnimationFrame(gameLoop);
}

/**
 * Reset game state for new game
 */
function resetGame() {
    player.lane = 2;
    player.targetLane = 2;
    updatePlayerPosition();
    
    obstacles.length = 0;
    
    gameState.score = 0;
    gameState.speed = 3;
    gameState.speedMultiplier = 1.0;
    gameState.level = 1;
    gameState.obstacleSpawnRate = 120;
    gameState.framesSinceSpawn = 0;
    gameState.obstaclesDodged = 0;
    gameState.startTime = Date.now();
    gameState.survivalTime = 0;
    
    updateUI();
}

function startGame() {
    hideOverlay('startScreen');
    hideOverlay('gameOverScreen');
    resetGame();
    gameState.isPlaying = true;
    gameState.isPaused = false;
}

function pauseGame() {
    gameState.isPaused = true;
    showOverlay('pauseScreen');
}

function resumeGame() {
    gameState.isPaused = false;
    hideOverlay('pauseScreen');
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.survivalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    const currentScore = Number(gameState.score);
    const currentHighScore = Number(gameState.highScore);
    
    let isNewHighScore = false;
    if (currentScore > currentHighScore) {
        gameState.highScore = currentScore;
        saveHighScore();
        isNewHighScore = true;
    }
    
    showGameOverScreen(isNewHighScore);
}


function saveHighScore() {
    try {
        localStorage.setItem('highwayRushHighScore', gameState.highScore.toString());
    } catch (e) {
        console.warn('Could not save high score:', e);
    }
}


function loadHighScore() {
    try {
        const saved = localStorage.getItem('highwayRushHighScore');
        if (saved !== null && saved !== '') {
            gameState.highScore = parseInt(saved, 10);
        } else {
            gameState.highScore = 0;
        }
    } catch (e) {
        console.warn('Could not load high score:', e);
        gameState.highScore = 0;
    }
}


function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastFrameTime;
    gameState.lastFrameTime = timestamp;
    gameState.fps = 1000 / deltaTime;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    
    if (gameState.isPlaying && !gameState.isPaused) {
        updatePlayer();
        updateObstacles();
        updateDifficulty();
        
        if (checkPlayerCollisions()) {
            gameOver();
        }
        
        gameState.score += Math.floor(gameState.speedMultiplier);
        updateUI();
    }
    
    drawObstacles();
    drawPlayer();
    drawCanvasUI();
    
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', initGame);

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        resetGame,
        startGame,
        pauseGame,
        resumeGame,
        gameOver,
        saveHighScore,
        loadHighScore,
        gameLoop
    };
}
