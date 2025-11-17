/**
 * Unit tests for Highway Rush game logic functions
 */

// Test variables
let keys, player, road, obstacles, gameState;

// Copy of the updatePlayer function from gameLogic.js for testing
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

// Copy of the checkCollision function from gameLogic.js for testing
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Copy of the randomLane function from gameLogic.js for testing
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

describe('Game Logic Tests', () => {
    beforeEach(() => {
        // Reset test state before each test
        keys = { left: false, right: false };
        player = {
            x: 200,
            targetLane: 1,
            lane: 1,
            maxLanes: 3,
            width: 40,
            speed: 10,
            height: 80,
            y: 400
        };
        road = {
            edgeWidth: 50,
            laneWidth: 100
        };
        obstacles = [];
        gameState = {
            speed: 3,
            speedMultiplier: 1.0
        };
    });

    describe('updatePlayer', () => {
        test('should move left when keys.left is true and targetLane > 0', () => {
            keys.left = true;
            updatePlayer();
            expect(player.targetLane).toBe(0);
            expect(keys.left).toBe(false);
        });

        test('should not move left when targetLane is 0', () => {
            player.targetLane = 0;
            keys.left = true;
            updatePlayer();
            expect(player.targetLane).toBe(0);
            expect(keys.left).toBe(true);
        });

        test('should move right when keys.right is true and targetLane < maxLanes - 1', () => {
            keys.right = true;
            updatePlayer();
            expect(player.targetLane).toBe(2);
            expect(keys.right).toBe(false);
        });

        test('should not move right when targetLane is at maxLanes - 1', () => {
            player.targetLane = 2;
            keys.right = true;
            updatePlayer();
            expect(player.targetLane).toBe(2);
            expect(keys.right).toBe(true);
        });

        test('should smoothly move player.x towards targetX when difference > 2', () => {
            player.x = 100;
            player.targetLane = 1;
            const initialX = player.x;
            updatePlayer();
            expect(player.x).toBe(initialX + player.speed);
        });

        test('should smoothly move player.x left towards targetX', () => {
            player.x = 300;
            player.targetLane = 1;
            const initialX = player.x;
            updatePlayer();
            expect(player.x).toBe(initialX - player.speed);
        });

        test('should snap player.x to targetX when difference <= 2', () => {
            player.targetLane = 1;
            const targetX = road.edgeWidth + player.targetLane * road.laneWidth + (road.laneWidth - player.width) / 2;
            player.x = targetX - 1;
            updatePlayer();
            expect(player.x).toBe(targetX);
            expect(player.lane).toBe(player.targetLane);
        });

        test('should update player.lane when snapped to target position', () => {
            player.lane = 0;
            player.targetLane = 2;
            const targetX = road.edgeWidth + player.targetLane * road.laneWidth + (road.laneWidth - player.width) / 2;
            player.x = targetX;
            updatePlayer();
            expect(player.lane).toBe(2);
        });

        test('should calculate correct targetX position', () => {
            player.targetLane = 1;
            const expectedX = road.edgeWidth + player.targetLane * road.laneWidth + (road.laneWidth - player.width) / 2;
            player.x = expectedX;
            updatePlayer();
            expect(player.x).toBe(expectedX);
        });
    });

    describe('checkCollision', () => {
        test('should detect collision when rectangles overlap', () => {
            const rect1 = { x: 100, y: 100, width: 50, height: 50 };
            const rect2 = { x: 120, y: 120, width: 50, height: 50 };
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should not detect collision when rectangles do not overlap', () => {
            const rect1 = { x: 100, y: 100, width: 50, height: 50 };
            const rect2 = { x: 200, y: 200, width: 50, height: 50 };
            expect(checkCollision(rect1, rect2)).toBe(false);
        });
    });
});
