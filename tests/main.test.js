/**
 * Unit tests for Highway Rush main game functions
 */

// Mock dependencies first
jest.mock('../game/gameLogic.js', () => ({
    updatePlayer: jest.fn(),
    updatePlayerPosition: jest.fn(),
    updateObstacles: jest.fn(),
    updateDifficulty: jest.fn(),
    checkPlayerCollisions: jest.fn(() => false)
}));

jest.mock('../game/input.js', () => ({
    setupEventListeners: jest.fn(),
    updateUI: jest.fn(),
    updateHighScoreDisplay: jest.fn(),
    showOverlay: jest.fn(),
    hideOverlay: jest.fn(),
    showGameOverScreen: jest.fn()
}));

jest.mock('../game/renderer.js', () => ({
    drawRoad: jest.fn(),
    drawObstacles: jest.fn(),
    drawPlayer: jest.fn(),
    drawCanvasUI: jest.fn()
}));

// Mock global objects
let mockCanvas, mockCtx;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
    return setTimeout(() => callback(Date.now()), 16);
});

// Mock window.addEventListener
global.window = {
    addEventListener: jest.fn()
};

// Mock console methods
global.console.warn = jest.fn();

// Mock Date.now
global.Date.now = jest.fn(() => 1000000);

// Mock DOM elements first
global.document = {
    getElementById: jest.fn(() => null)
};

// Import functions after mocks are set up
const gameLogic = require('../game/gameLogic.js');
const input = require('../game/input.js');
const renderer = require('../game/renderer.js');

// Make mocked functions available globally for main.js to use
global.updatePlayerPosition = gameLogic.updatePlayerPosition;
global.setupEventListeners = input.setupEventListeners;
global.updateHighScoreDisplay = input.updateHighScoreDisplay;
global.updateUI = input.updateUI;
global.showOverlay = input.showOverlay;
global.hideOverlay = input.hideOverlay;
global.showGameOverScreen = input.showGameOverScreen;
global.updatePlayer = gameLogic.updatePlayer;
global.updateObstacles = gameLogic.updateObstacles;
global.updateDifficulty = gameLogic.updateDifficulty;
global.checkPlayerCollisions = gameLogic.checkPlayerCollisions;
global.drawRoad = renderer.drawRoad;
global.drawObstacles = renderer.drawObstacles;
global.drawPlayer = renderer.drawPlayer;
global.drawCanvasUI = renderer.drawCanvasUI;

// Import main functions
const {
    initGame,
    resetGame,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    saveHighScore,
    loadHighScore,
    gameLoop
} = require('../game/main.js');

beforeAll(() => {
    // Mock canvas
    const mockCanvas = {
        width: 800,
        height: 600
    };
    
    const mockCtx = {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn()
    };
    
    global.canvas = mockCanvas;
    global.ctx = mockCtx;
});

// Test variables
let player, gameState, road, obstacles;

describe('Main Game Tests', () => {
    beforeEach(() => {
        // Reset global state
        player = {
            x: 0,
            y: 0,
            width: 40,
            height: 80,
            speed: 8,
            lane: 2,
            targetLane: 2,
            color: '#63b3ed',
            maxLanes: 5
        };
        
        gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            highScore: 0,
            speed: 3,
            speedMultiplier: 1.0,
            level: 1,
            obstacleSpawnRate: 120,
            framesSinceSpawn: 0,
            obstaclesDodged: 0,
            startTime: 0,
            survivalTime: 0,
            lastFrameTime: 0,
            fps: 60
        };
        
        road = {
            laneWidth: 0,
            laneCount: 5,
            markerHeight: 40,
            markerGap: 20,
            markerOffset: 0,
            edgeWidth: 100
        };
        
        obstacles = [];
        
        // Set globals
        global.player = player;
        global.gameState = gameState;
        global.road = road;
        global.obstacles = obstacles;
        
        // Clear mocks
        jest.clearAllMocks();
        console.log.mockClear && console.log.mockClear();
        console.warn.mockClear && console.warn.mockClear();
    });

    describe('initGame', () => {
        test('should calculate lane width correctly', () => {
            initGame();
            const expectedLaneWidth = (global.canvas.width - road.edgeWidth * 2) / road.laneCount;
            expect(road.laneWidth).toBe(expectedLaneWidth);
        });

        test('should set player Y position near bottom of canvas', () => {
            initGame();
            expect(player.y).toBe(global.canvas.height - player.height - 30);
        });

        test('should call updatePlayerPosition', () => {
            initGame();
            expect(gameLogic.updatePlayerPosition).toHaveBeenCalled();
        });

        test('should call updateHighScoreDisplay', () => {
            initGame();
            expect(input.updateHighScoreDisplay).toHaveBeenCalled();
        });

        test('should call setupEventListeners', () => {
            initGame();
            expect(input.setupEventListeners).toHaveBeenCalled();
        });

        test('should start game loop with requestAnimationFrame', () => {
            initGame();
            expect(requestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('resetGame', () => {
        test('should reset player lane to center (lane 2)', () => {
            player.lane = 4;
            player.targetLane = 4;
            resetGame();
            expect(player.lane).toBe(2);
            expect(player.targetLane).toBe(2);
        });

        test('should call updatePlayerPosition', () => {
            resetGame();
            expect(gameLogic.updatePlayerPosition).toHaveBeenCalled();
        });

        test('should clear all obstacles', () => {
            obstacles.push({ x: 100, y: 100 });
            obstacles.push({ x: 200, y: 200 });
            resetGame();
            expect(obstacles.length).toBe(0);
        });

        test('should reset score to 0', () => {
            gameState.score = 1000;
            resetGame();
            expect(gameState.score).toBe(0);
        });

        test('should reset speed to initial value', () => {
            gameState.speed = 10;
            resetGame();
            expect(gameState.speed).toBe(3);
        });

        test('should reset speedMultiplier to 1.0', () => {
            gameState.speedMultiplier = 2.5;
            resetGame();
            expect(gameState.speedMultiplier).toBe(1.0);
        });

        test('should reset level to 1', () => {
            gameState.level = 5;
            resetGame();
            expect(gameState.level).toBe(1);
        });

        test('should reset obstacleSpawnRate to 120', () => {
            gameState.obstacleSpawnRate = 60;
            resetGame();
            expect(gameState.obstacleSpawnRate).toBe(120);
        });

        test('should reset framesSinceSpawn to 0', () => {
            gameState.framesSinceSpawn = 50;
            resetGame();
            expect(gameState.framesSinceSpawn).toBe(0);
        });

        test('should reset obstaclesDodged to 0', () => {
            gameState.obstaclesDodged = 20;
            resetGame();
            expect(gameState.obstaclesDodged).toBe(0);
        });

        test('should set startTime to current timestamp', () => {
            resetGame();
            expect(gameState.startTime).toBe(Date.now());
        });

        test('should reset survivalTime to 0', () => {
            gameState.survivalTime = 45;
            resetGame();
            expect(gameState.survivalTime).toBe(0);
        });

        test('should call updateUI', () => {
            resetGame();
            expect(input.updateUI).toHaveBeenCalled();
        });
    });

    describe('startGame', () => {
        test('should hide start screen overlay', () => {
            startGame();
            expect(input.hideOverlay).toHaveBeenCalledWith('startScreen');
        });

        test('should hide game over screen overlay', () => {
            startGame();
            expect(input.hideOverlay).toHaveBeenCalledWith('gameOverScreen');
        });

        test('should call resetGame', () => {
            const initialScore = gameState.score;
            gameState.score = 1000;
            startGame();
            expect(gameState.score).toBe(0);
        });

        test('should set isPlaying to true', () => {
            gameState.isPlaying = false;
            startGame();
            expect(gameState.isPlaying).toBe(true);
        });

        test('should set isPaused to false', () => {
            gameState.isPaused = true;
            startGame();
            expect(gameState.isPaused).toBe(false);
        });
    });

    describe('pauseGame', () => {
        test('should set isPaused to true', () => {
            gameState.isPaused = false;
            pauseGame();
            expect(gameState.isPaused).toBe(true);
        });

        test('should show pause screen overlay', () => {
            pauseGame();
            expect(input.showOverlay).toHaveBeenCalledWith('pauseScreen');
        });
    });

    describe('resumeGame', () => {
        test('should set isPaused to false', () => {
            gameState.isPaused = true;
            resumeGame();
            expect(gameState.isPaused).toBe(false);
        });

        test('should hide pause screen overlay', () => {
            resumeGame();
            expect(input.hideOverlay).toHaveBeenCalledWith('pauseScreen');
        });
    });

    describe('gameOver', () => {
        test('should set isPlaying to false', () => {
            gameState.isPlaying = true;
            gameOver();
            expect(gameState.isPlaying).toBe(false);
        });

        test('should calculate survival time in seconds', () => {
            gameState.startTime = Date.now() - 45000; // 45 seconds ago
            gameOver();
            expect(gameState.survivalTime).toBe(45);
        });

        test('should not update high score if current score is lower', () => {
            gameState.score = 100;
            gameState.highScore = 500;
            gameOver();
            expect(gameState.highScore).toBe(500);
        });

        test('should update high score if current score is higher', () => {
            gameState.score = 1000;
            gameState.highScore = 500;
            gameOver();
            expect(gameState.highScore).toBe(1000);
        });

        test('should show game over screen with isNewHighScore=true when high score beaten', () => {
            gameState.score = 1000;
            gameState.highScore = 500;
            gameOver();
            expect(input.showGameOverScreen).toHaveBeenCalledWith(true);
        });

        test('should show game over screen with isNewHighScore=false when high score not beaten', () => {
            gameState.score = 100;
            gameState.highScore = 500;
            gameOver();
            expect(input.showGameOverScreen).toHaveBeenCalledWith(false);
        });

        test('should update high score when current score equals high score', () => {
            gameState.score = 500;
            gameState.highScore = 500;
            gameOver();
            expect(gameState.highScore).toBe(500);
        });
    });

    describe('gameLoop', () => {
        test('should calculate deltaTime correctly', () => {
            gameState.lastFrameTime = 1000;
            gameLoop(1016);
            expect(gameState.fps).toBeCloseTo(1000 / 16, 1);
        });

        test('should update lastFrameTime', () => {
            gameState.lastFrameTime = 1000;
            gameLoop(1016);
            expect(gameState.lastFrameTime).toBe(1016);
        });

        test('should clear canvas', () => {
            gameLoop(1000);
            expect(global.ctx.clearRect).toHaveBeenCalledWith(0, 0, global.canvas.width, global.canvas.height);
        });

        test('should always draw road', () => {
            gameLoop(1000);
            expect(renderer.drawRoad).toHaveBeenCalled();
        });

        test('should update player when playing and not paused', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(gameLogic.updatePlayer).toHaveBeenCalled();
        });

        test('should not update player when not playing', () => {
            gameState.isPlaying = false;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(gameLogic.updatePlayer).not.toHaveBeenCalled();
        });

        test('should not update player when paused', () => {
            gameState.isPlaying = true;
            gameState.isPaused = true;
            gameLoop(1000);
            expect(gameLogic.updatePlayer).not.toHaveBeenCalled();
        });

        test('should update obstacles when playing and not paused', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(gameLogic.updateObstacles).toHaveBeenCalled();
        });

        test('should update difficulty when playing and not paused', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(gameLogic.updateDifficulty).toHaveBeenCalled();
        });

        test('should check player collisions when playing and not paused', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(gameLogic.checkPlayerCollisions).toHaveBeenCalled();
        });

        test('should call gameOver when collision is detected', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLogic.checkPlayerCollisions.mockReturnValueOnce(true);
            gameLoop(1000);
            expect(gameState.isPlaying).toBe(false);
        });

        test('should not call gameOver when no collision', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLogic.checkPlayerCollisions.mockReturnValueOnce(false);
            gameLoop(1000);
            expect(gameState.isPlaying).toBe(true);
        });

        test('should increment score based on speed multiplier', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameState.score = 100;
            gameState.speedMultiplier = 1.5;
            gameLoop(1000);
            expect(gameState.score).toBe(101); // 100 + floor(1.5)
        });

        test('should call updateUI when playing', () => {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            gameLoop(1000);
            expect(input.updateUI).toHaveBeenCalled();
        });

        test('should always draw obstacles', () => {
            gameLoop(1000);
            expect(renderer.drawObstacles).toHaveBeenCalled();
        });

        test('should always draw player', () => {
            gameLoop(1000);
            expect(renderer.drawPlayer).toHaveBeenCalled();
        });

        test('should always draw canvas UI', () => {
            gameLoop(1000);
            expect(renderer.drawCanvasUI).toHaveBeenCalled();
        });

        test('should call requestAnimationFrame for next frame', () => {
            gameLoop(1000);
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
        });

        test('should handle first frame with lastFrameTime = 0', () => {
            gameState.lastFrameTime = 0;
            expect(() => gameLoop(1000)).not.toThrow();
        });
    });
});
