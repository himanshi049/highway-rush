/**
 * Core game mechanics and algorithms
 */

/**
 * Update player position based on input
 */
function updatePlayer() {
    if (keys.left && player.targetLane > 0) {
        player.targetLane--;
        keys.left = false;
    }
    if (keys.right && player.targetLane < player.maxLanes - 1) {
        player.targetLane++;
        keys.right = false;
    }
    
    const targetX = road.edgeWidth + player.targetLane * road.laneWidth + (road.laneWidth - player.width) / 2;
    
    if (Math.abs(player.x - targetX) > 2) {
        if (player.x < targetX) {
            player.x += player.speed;
        } else {
            player.x -= player.speed;
        }
    } else {
        player.x = targetX;
        player.lane = player.targetLane;
    }
}

/**
 * Update player X position based on current lane
 */
function updatePlayerPosition() {
    player.x = road.edgeWidth + player.lane * road.laneWidth + (road.laneWidth - player.width) / 2;
}

/**
 * Create a new obstacle
 */
function createObstacle() {
    const lane = randomLane();
    const types = [
        { color: '#fc8181', width: 40, height: 80 },
        { color: '#f687b3', width: 45, height: 90 },
        { color: '#b794f4', width: 38, height: 75 },
        { color: '#f56565', width: 50, height: 100 }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
        x: road.edgeWidth + lane * road.laneWidth + (road.laneWidth - type.width) / 2,
        y: -type.height,
        width: type.width,
        height: type.height,
        color: type.color,
        lane: lane,
        speed: gameState.speed * gameState.speedMultiplier,
        passed: false
    };
}

/**
 * Random lane generation with anti-clustering
 */
function randomLane() {
    if (obstacles.length > 0) {
        const recentObstacle = obstacles[obstacles.length - 1];
        if (recentObstacle.y < 100) {
            let lane;
            let attempts = 0;
            do {
                lane = Math.floor(Math.random() * player.maxLanes);
                attempts++;
            } while (lane === recentObstacle.lane && attempts < 5);
            return lane;
        }
    }
    
    return Math.floor(Math.random() * player.maxLanes);
}

/**
 * Update all obstacles
 */
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed;
        
        if (!obstacles[i].passed && obstacles[i].y > player.y + player.height) {
            obstacles[i].passed = true;
            gameState.obstaclesDodged++;
            gameState.score += 10;
        }
        
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    gameState.framesSinceSpawn++;
    if (gameState.framesSinceSpawn >= gameState.obstacleSpawnRate) {
        obstacles.push(createObstacle());
        gameState.framesSinceSpawn = 0;
    }
}

/**
 * AABB Collision Detection
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Check collisions between player and obstacles
 */
function checkPlayerCollisions() {
    const playerHitbox = {
        x: player.x + 5,
        y: player.y + 5,
        width: player.width - 10,
        height: player.height - 10
    };
    
    for (let obstacle of obstacles) {
        if (checkCollision(playerHitbox, obstacle)) {
            return true;
        }
    }
    return false;
}

/**
 * Update difficulty over time
 */
function updateDifficulty() {
    const timeElapsed = (Date.now() - gameState.startTime) / 1000;
    const newLevel = Math.floor(timeElapsed / 10) + 1;
    
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.speedMultiplier += 0.15;
        gameState.obstacleSpawnRate = Math.max(40, 120 - (gameState.level * 8));
    }
}
