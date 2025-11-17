/**
 * Game initialization and main loop
 */


 // Initialize the game
function initGame() {
    road.laneWidth = (canvas.width - road.edgeWidth * 2) / road.laneCount;
    player.y = canvas.height - player.height - 30;
    updatePlayerPosition();
    loadHighScore();
    updateHighScoreDisplay();
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

 // Start a new game
function startGame() {
    hideOverlay('startScreen');
    hideOverlay('gameOverScreen');
    resetGame();
    gameState.isPlaying = true;
    gameState.isPaused = false;
}

 // Pause the game
function pauseGame() {
    gameState.isPaused = true;
    showOverlay('pauseScreen');
}

 // Resume the game
function resumeGame() {
    gameState.isPaused = false;
    hideOverlay('pauseScreen');
}
  
//End the game
function gameOver() {
    gameState.isPlaying = false;
    gameState.survivalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    let isNewHighScore = false;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
        isNewHighScore = true;
    }
    
    showGameOverScreen(isNewHighScore);
}


 // Save high score to localStorage
function saveHighScore() {
    try {
        localStorage.setItem('highwayRushHighScore', gameState.highScore.toString());
    } catch (e) {
        console.warn('Could not save high score:', e);
    }
}


 // Load high score from localStorage
function loadHighScore() {
    try {
        const saved = localStorage.getItem('highwayRushHighScore');
        if (saved) {
            gameState.highScore = parseInt(saved, 10);
        }
    } catch (e) {
        console.warn('Could not load high score:', e);
    }
}


 // Main game loop
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
