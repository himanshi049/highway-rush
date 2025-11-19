/**
 * Unit tests for Highway Rush game logic functions
 */

// Import functions from actual source file
const {
    updatePlayer,
    updatePlayerPosition,
    checkCollision,
    randomLane,
    createObstacle,
    updateObstacles,
    checkPlayerCollisions,
    updateDifficulty
} = require('../game/gameLogic.js');

// Test variables
let keys, player, road, obstacles, gameState, canvas;

// Make globals available
global.keys = {};
global.player = {};
global.road = {};
global.obstacles = [];
global.gameState = {};
global.canvas = {
    width: 800,
    height: 600
};

// Mock Date.now for consistent testing
const originalDateNow = Date.now;

describe('Game Logic Tests', () => {
    beforeEach(() => {
        // Reset test state before each test
        keys = { left: false, right: false };
        player = {
            x: 200,
            targetLane: 1,
            lane: 1,
            maxLanes: 5,
            width: 40,
            speed: 10,
            height: 80,
            y: 400
        };
        road = {
            edgeWidth: 100,
            laneWidth: 120,
            laneCount: 5
        };
        obstacles = [];
        gameState = {
            speed: 3,
            speedMultiplier: 1.0,
            level: 1,
            framesSinceSpawn: 0,
            obstacleSpawnRate: 120,
            obstaclesDodged: 0,
            score: 0,
            startTime: Date.now()
        };
        canvas = {
            width: 800,
            height: 600
        };
        
        // Set global variables for imported functions to use
        global.keys = keys;
        global.player = player;
        global.road = road;
        global.obstacles = obstacles;
        global.gameState = gameState;
        global.canvas = canvas;
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
            player.targetLane = 4; // maxLanes is 5, so max targetLane is 4
            keys.right = true;
            updatePlayer();
            expect(player.targetLane).toBe(4);
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

    describe('createObstacle', () => {
        test('should create obstacle with valid properties', () => {
            const obstacle = createObstacle();
            expect(obstacle).toHaveProperty('x');
            expect(obstacle).toHaveProperty('y');
            expect(obstacle).toHaveProperty('width');
            expect(obstacle).toHaveProperty('height');
            expect(obstacle).toHaveProperty('color');
            expect(obstacle).toHaveProperty('lane');
            expect(obstacle).toHaveProperty('speed');
            expect(obstacle).toHaveProperty('passed');
        });

        test('should create obstacle with negative y position', () => {
            const obstacle = createObstacle();
            expect(obstacle.y).toBeLessThan(0);
        });

        test('should set passed flag to false initially', () => {
            const obstacle = createObstacle();
            expect(obstacle.passed).toBe(false);
        });

        test('should set speed based on gameState', () => {
            global.gameState.speed = 5;
            global.gameState.speedMultiplier = 2.0;
            const obstacle = createObstacle();
            expect(obstacle.speed).toBe(10);
        });

        test('should create obstacle with valid lane number', () => {
            const obstacle = createObstacle();
            expect(obstacle.lane).toBeGreaterThanOrEqual(0);
            expect(obstacle.lane).toBeLessThan(global.player.maxLanes);
        });

        test('should create obstacle with valid width', () => {
            const obstacle = createObstacle();
            expect(obstacle.width).toBeGreaterThan(0);
            expect(obstacle.width).toBeLessThanOrEqual(50);
        });

        test('should create obstacle with valid height', () => {
            const obstacle = createObstacle();
            expect(obstacle.height).toBeGreaterThan(0);
            expect(obstacle.height).toBeLessThanOrEqual(100);
        });

        test('should position obstacle in correct lane', () => {
            const obstacle = createObstacle();
            const expectedX = global.road.edgeWidth + obstacle.lane * global.road.laneWidth + 
                            (global.road.laneWidth - obstacle.width) / 2;
            expect(obstacle.x).toBeCloseTo(expectedX, 0);
        });

        test('should create obstacles with different colors', () => {
            const colors = new Set();
            for (let i = 0; i < 20; i++) {
                const obstacle = createObstacle();
                colors.add(obstacle.color);
            }
            expect(colors.size).toBeGreaterThan(1);
        });
    });

    describe('randomLane', () => {
        test('should return valid lane number', () => {
            const lane = randomLane();
            expect(lane).toBeGreaterThanOrEqual(0);
            expect(lane).toBeLessThan(global.player.maxLanes);
        });

        test('should avoid same lane as recent obstacle', () => {
            global.obstacles = [{
                lane: 2,
                y: 50
            }];
            const lanes = [];
            for (let i = 0; i < 10; i++) {
                lanes.push(randomLane());
            }
            // Should have variety, not all lane 2
            const uniqueLanes = new Set(lanes);
            expect(uniqueLanes.size).toBeGreaterThan(1);
        });

        test('should return random lane when no recent obstacles', () => {
            global.obstacles = [];
            const lane = randomLane();
            expect(lane).toBeGreaterThanOrEqual(0);
            expect(lane).toBeLessThan(global.player.maxLanes);
        });

        test('should allow same lane if recent obstacle is far down', () => {
            global.obstacles = [{
                lane: 2,
                y: 200
            }];
            const lane = randomLane();
            expect(lane).toBeGreaterThanOrEqual(0);
            expect(lane).toBeLessThan(global.player.maxLanes);
        });
    });

    describe('updateObstacles', () => {
        test('should move obstacles down based on their speed', () => {
            const initialY = -50;
            global.obstacles = [{
                x: 200,
                y: initialY,
                speed: 5,
                passed: false
            }];
            updateObstacles();
            expect(global.obstacles[0].y).toBe(initialY + 5);
        });

        test('should mark obstacle as passed when it goes below player', () => {
            global.obstacles = [{
                x: 200,
                y: global.player.y + global.player.height - 5,
                speed: 10,
                passed: false
            }];
            updateObstacles();
            expect(global.obstacles[0].passed).toBe(true);
        });

        test('should increase score when obstacle is passed', () => {
            const initialScore = global.gameState.score;
            global.obstacles = [{
                x: 200,
                y: global.player.y + global.player.height - 5,
                speed: 10,
                passed: false
            }];
            updateObstacles();
            expect(global.gameState.score).toBe(initialScore + 10);
        });

        test('should increment obstaclesDodged when obstacle is passed', () => {
            const initialDodged = global.gameState.obstaclesDodged;
            global.obstacles = [{
                x: 200,
                y: global.player.y + global.player.height - 5,
                speed: 10,
                passed: false
            }];
            updateObstacles();
            expect(global.gameState.obstaclesDodged).toBe(initialDodged + 1);
        });

        test('should remove obstacles that go off screen', () => {
            global.obstacles = [{
                x: 200,
                y: global.canvas.height + 100,
                speed: 5,
                passed: true
            }];
            updateObstacles();
            expect(global.obstacles.length).toBe(0);
        });

        test('should not remove obstacles still on screen', () => {
            global.obstacles = [{
                x: 200,
                y: 300,
                speed: 5,
                passed: false
            }];
            updateObstacles();
            expect(global.obstacles.length).toBe(1);
        });

        test('should increment framesSinceSpawn', () => {
            global.gameState.framesSinceSpawn = 0;
            updateObstacles();
            expect(global.gameState.framesSinceSpawn).toBe(1);
        });

        test('should spawn new obstacle when framesSinceSpawn >= obstacleSpawnRate', () => {
            global.gameState.framesSinceSpawn = 120;
            global.gameState.obstacleSpawnRate = 120;
            const initialLength = global.obstacles.length;
            updateObstacles();
            expect(global.obstacles.length).toBe(initialLength + 1);
        });

        test('should reset framesSinceSpawn after spawning obstacle', () => {
            global.gameState.framesSinceSpawn = 120;
            global.gameState.obstacleSpawnRate = 120;
            updateObstacles();
            expect(global.gameState.framesSinceSpawn).toBe(0);
        });

        test('should not spawn obstacle when framesSinceSpawn < obstacleSpawnRate', () => {
            global.gameState.framesSinceSpawn = 50;
            global.gameState.obstacleSpawnRate = 120;
            const initialLength = global.obstacles.length;
            updateObstacles();
            expect(global.obstacles.length).toBe(initialLength);
        });

        test('should only mark obstacle as passed once', () => {
            global.obstacles = [{
                x: 200,
                y: global.player.y + global.player.height + 10,
                speed: 5,
                passed: true
            }];
            const initialScore = global.gameState.score;
            updateObstacles();
            expect(global.gameState.score).toBe(initialScore);
        });

        test('should handle multiple obstacles correctly', () => {
            global.obstacles = [
                { x: 200, y: 100, speed: 5, passed: false },
                { x: 300, y: 200, speed: 4, passed: false }
            ];
            updateObstacles();
            expect(global.obstacles[0].y).toBe(105);
            expect(global.obstacles[1].y).toBe(204);
        });
    });

    describe('checkPlayerCollisions', () => {
        test('should return false when no obstacles', () => {
            global.obstacles = [];
            expect(checkPlayerCollisions()).toBe(false);
        });

        test('should return false when obstacle is far from player', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.obstacles = [{
                x: 500,
                y: 100,
                width: 40,
                height: 80
            }];
            expect(checkPlayerCollisions()).toBe(false);
        });

        test('should return true when player collides with obstacle', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.player.width = 40;
            global.player.height = 80;
            global.obstacles = [{
                x: 310,
                y: 410,
                width: 40,
                height: 80
            }];
            expect(checkPlayerCollisions()).toBe(true);
        });

        test('should use reduced hitbox for player (margin of 5 pixels)', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.player.width = 40;
            global.player.height = 80;
            global.obstacles = [{
                x: 340,
                y: 400,
                width: 40,
                height: 80
            }];
            expect(checkPlayerCollisions()).toBe(false);
        });

        test('should check all obstacles', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.player.width = 40;
            global.player.height = 80;
            global.obstacles = [
                { x: 500, y: 100, width: 40, height: 80 },
                { x: 310, y: 410, width: 40, height: 80 }
            ];
            expect(checkPlayerCollisions()).toBe(true);
        });

        test('should return false for near miss on the left', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.player.width = 40;
            global.player.height = 80;
            global.obstacles = [{
                x: 250,
                y: 400,
                width: 40,
                height: 80
            }];
            expect(checkPlayerCollisions()).toBe(false);
        });

        test('should return false for near miss on the right', () => {
            global.player.x = 300;
            global.player.y = 400;
            global.player.width = 40;
            global.player.height = 80;
            global.obstacles = [{
                x: 350,
                y: 400,
                width: 40,
                height: 80
            }];
            expect(checkPlayerCollisions()).toBe(false);
        });
    });

    describe('updateDifficulty', () => {
        beforeEach(() => {
            // Mock Date.now
            Date.now = jest.fn();
        });

        afterEach(() => {
            Date.now = originalDateNow;
        });

        test('should increase level after 10 seconds', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            Date.now.mockReturnValue(11000);
            updateDifficulty();
            expect(global.gameState.level).toBe(2);
        });

        test('should increase speedMultiplier when level increases', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            global.gameState.speedMultiplier = 1.0;
            Date.now.mockReturnValue(11000);
            updateDifficulty();
            expect(global.gameState.speedMultiplier).toBe(1.15);
        });

        test('should decrease obstacleSpawnRate when level increases', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            global.gameState.obstacleSpawnRate = 120;
            Date.now.mockReturnValue(11000);
            updateDifficulty();
            expect(global.gameState.obstacleSpawnRate).toBeLessThan(120);
        });

        test('should not decrease obstacleSpawnRate below 40', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 15;
            Date.now.mockReturnValue(200000);
            updateDifficulty();
            expect(global.gameState.obstacleSpawnRate).toBeGreaterThanOrEqual(40);
        });

        test('should not change level if less than 10 seconds elapsed', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            Date.now.mockReturnValue(5000);
            updateDifficulty();
            expect(global.gameState.level).toBe(1);
        });

        test('should calculate correct level based on time', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            Date.now.mockReturnValue(31000);
            updateDifficulty();
            expect(global.gameState.level).toBe(4);
        });

        test('should handle multiple level increases', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 1;
            global.gameState.speedMultiplier = 1.0;
            Date.now.mockReturnValue(21000);
            updateDifficulty();
            expect(global.gameState.level).toBe(3);
            expect(global.gameState.speedMultiplier).toBeCloseTo(1.15, 1);
        });

        test('should not update if level already matches time elapsed', () => {
            global.gameState.startTime = 1000;
            global.gameState.level = 3;
            global.gameState.speedMultiplier = 1.3;
            Date.now.mockReturnValue(21000);
            const initialSpeed = global.gameState.speedMultiplier;
            updateDifficulty();
            expect(global.gameState.speedMultiplier).toBe(initialSpeed);
        });
    });
});
