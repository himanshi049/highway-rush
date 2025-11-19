/**
 * Unit tests for Highway Rush renderer functions
 */

// Mock canvas and context
const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    textAlign: '',
    font: '',
    lineDashOffset: 0,
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    setLineDash: jest.fn()
};

const mockCanvas = {
    width: 800,
    height: 600,
    getContext: jest.fn(() => mockCtx)
};

global.canvas = mockCanvas;
global.ctx = mockCtx;
global.document = {
    getElementById: jest.fn(() => mockCanvas)
};

// Setup global variables
global.player = {
    x: 300,
    y: 400,
    width: 40,
    height: 80,
    color: '#63b3ed'
};

global.gameState = {
    speed: 3,
    speedMultiplier: 1.0,
    isPlaying: true,
    isPaused: false,
    score: 100
};

global.road = {
    edgeWidth: 100,
    laneWidth: 120,
    laneCount: 5,
    markerHeight: 40,
    markerGap: 20,
    markerOffset: 0
};

global.obstacles = [];

// Import renderer functions
const {
    drawRoad,
    drawPlayer,
    drawObstacles,
    drawCanvasUI,
    adjustBrightness
} = require('../game/renderer.js');

describe('Renderer Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCtx.fillStyle = '';
        mockCtx.strokeStyle = '';
        mockCtx.lineWidth = 0;
        mockCtx.lineDashOffset = 0;
        global.road.markerOffset = 0;
        global.obstacles = [];
        global.gameState.speedMultiplier = 1.0;
        global.gameState.isPlaying = true;
        global.gameState.isPaused = false;
    });

    describe('drawRoad', () => {
        test('should create linear gradients for road', () => {
            drawRoad();
            expect(mockCtx.createLinearGradient).toHaveBeenCalled();
        });

        test('should draw road base', () => {
            drawRoad();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                global.road.edgeWidth,
                0,
                mockCanvas.width - global.road.edgeWidth * 2,
                mockCanvas.height
            );
        });

        test('should draw left edge', () => {
            drawRoad();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                0,
                0,
                global.road.edgeWidth,
                mockCanvas.height
            );
        });

        test('should draw right edge', () => {
            drawRoad();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                mockCanvas.width - global.road.edgeWidth,
                0,
                global.road.edgeWidth,
                mockCanvas.height
            );
        });

        test('should draw edge lines', () => {
            drawRoad();
            expect(mockCtx.stroke).toHaveBeenCalled();
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalled();
        });

        test('should set line dash for lane markers', () => {
            drawRoad();
            expect(mockCtx.setLineDash).toHaveBeenCalledWith([
                global.road.markerHeight,
                global.road.markerGap
            ]);
        });

        test('should reset line dash after drawing', () => {
            drawRoad();
            expect(mockCtx.setLineDash).toHaveBeenCalledWith([]);
        });

        test('should draw lane markers for each lane', () => {
            const initialBeginPathCalls = mockCtx.beginPath.mock.calls.length;
            drawRoad();
            // Should have multiple beginPath calls for lane markers
            expect(mockCtx.beginPath.mock.calls.length).toBeGreaterThan(initialBeginPathCalls);
        });

        test('should animate lane markers by updating markerOffset', () => {
            const initialOffset = global.road.markerOffset;
            drawRoad();
            expect(global.road.markerOffset).toBeGreaterThan(initialOffset);
        });

        test('should reset markerOffset when it exceeds threshold', () => {
            global.road.markerOffset = 100;
            drawRoad();
            expect(global.road.markerOffset).toBeLessThan(100);
        });

        test('should draw speed lines when speedMultiplier > 1.5 and playing', () => {
            global.gameState.speedMultiplier = 2.0;
            global.gameState.isPlaying = true;
            global.gameState.isPaused = false;
            const initialFillRectCalls = mockCtx.fillRect.mock.calls.length;
            drawRoad();
            // Should have additional calls for speed lines
            expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(initialFillRectCalls);
        });

        test('should not draw speed lines when speedMultiplier <= 1.5', () => {
            global.gameState.speedMultiplier = 1.0;
            const callsBefore = mockCtx.fillRect.mock.calls.length;
            drawRoad();
            const callsAfter = mockCtx.fillRect.mock.calls.length;
            // Speed lines should not be drawn
            expect(callsAfter).toBeLessThan(callsBefore + 10);
        });

        test('should not draw speed lines when paused', () => {
            global.gameState.speedMultiplier = 2.0;
            global.gameState.isPlaying = true;
            global.gameState.isPaused = true;
            const callsBefore = mockCtx.fillRect.mock.calls.length;
            drawRoad();
            const callsAfter = mockCtx.fillRect.mock.calls.length;
            // Should only have basic road fillRect calls (not speed lines)
            expect(callsAfter - callsBefore).toBeLessThan(10);
        });
    });

    describe('drawPlayer', () => {
        test('should draw player shadow', () => {
            drawPlayer();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                global.player.x + 2,
                global.player.y + 2,
                global.player.width,
                global.player.height
            );
        });

        test('should create gradient for player body', () => {
            drawPlayer();
            expect(mockCtx.createLinearGradient).toHaveBeenCalled();
        });

        test('should draw player main body', () => {
            drawPlayer();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                global.player.x,
                global.player.y + 15,
                global.player.width,
                global.player.height - 25
            );
        });

        test('should draw player roof', () => {
            drawPlayer();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                global.player.x + 3,
                global.player.y + 5,
                global.player.width - 6,
                20
            );
        });

        test('should draw body outlines', () => {
            drawPlayer();
            expect(mockCtx.strokeRect).toHaveBeenCalled();
        });

        test('should draw windshields', () => {
            const fillRectCalls = mockCtx.fillRect.mock.calls;
            drawPlayer();
            expect(fillRectCalls.length).toBeGreaterThan(5);
        });

        test('should draw wheels', () => {
            drawPlayer();
            // Check for wheel drawings (4 wheels + rims)
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        test('should draw headlights', () => {
            drawPlayer();
            const fillRectCalls = mockCtx.fillRect.mock.calls;
            expect(fillRectCalls.length).toBeGreaterThan(10);
        });

        test('should draw tail lights', () => {
            drawPlayer();
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        test('should draw hood detail line', () => {
            drawPlayer();
            expect(mockCtx.stroke).toHaveBeenCalled();
        });
    });

    describe('drawObstacles', () => {
        test('should not draw anything when obstacles array is empty', () => {
            global.obstacles = [];
            const fillRectCallsBefore = mockCtx.fillRect.mock.calls.length;
            drawObstacles();
            const fillRectCallsAfter = mockCtx.fillRect.mock.calls.length;
            expect(fillRectCallsAfter).toBe(fillRectCallsBefore);
        });

        test('should draw obstacles when present', () => {
            global.obstacles = [{
                x: 200,
                y: 100,
                width: 40,
                height: 80,
                color: '#fc8181'
            }];
            drawObstacles();
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        test('should draw shadow for each obstacle', () => {
            global.obstacles = [{
                x: 200,
                y: 100,
                width: 40,
                height: 80,
                color: '#fc8181'
            }];
            drawObstacles();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(202, 102, 40, 80);
        });

        test('should create gradient for obstacle body', () => {
            global.obstacles = [{
                x: 200,
                y: 100,
                width: 40,
                height: 80,
                color: '#fc8181'
            }];
            drawObstacles();
            expect(mockCtx.createLinearGradient).toHaveBeenCalled();
        });

        test('should draw multiple obstacles', () => {
            global.obstacles = [
                { x: 200, y: 100, width: 40, height: 80, color: '#fc8181' },
                { x: 300, y: 200, width: 45, height: 90, color: '#f687b3' }
            ];
            const fillRectCallsBefore = mockCtx.fillRect.mock.calls.length;
            drawObstacles();
            const fillRectCallsAfter = mockCtx.fillRect.mock.calls.length;
            expect(fillRectCallsAfter).toBeGreaterThan(fillRectCallsBefore);
        });

        test('should draw obstacle main body', () => {
            const obstacle = { x: 200, y: 100, width: 40, height: 80, color: '#fc8181' };
            global.obstacles = [obstacle];
            drawObstacles();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                obstacle.x,
                obstacle.y + 10,
                obstacle.width,
                obstacle.height - 15
            );
        });

        test('should draw obstacle roof', () => {
            const obstacle = { x: 200, y: 100, width: 40, height: 80, color: '#fc8181' };
            global.obstacles = [obstacle];
            drawObstacles();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                obstacle.x + 2,
                obstacle.y,
                obstacle.width - 4,
                15
            );
        });
    });

    describe('drawCanvasUI', () => {
        test('should draw UI background', () => {
            drawCanvasUI();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(10, 10, 200, 40);
        });

        test('should set font style', () => {
            drawCanvasUI();
            expect(mockCtx.font).toBe('bold 20px Arial');
        });

        test('should set text alignment', () => {
            drawCanvasUI();
            expect(mockCtx.textAlign).toBe('left');
        });

        test('should draw score text', () => {
            global.gameState.score = 1500;
            drawCanvasUI();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Score: 1500', 20, 35);
        });

        test('should display score of 0 correctly', () => {
            global.gameState.score = 0;
            drawCanvasUI();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Score: 0', 20, 35);
        });

        test('should display large scores correctly', () => {
            global.gameState.score = 999999;
            drawCanvasUI();
            expect(mockCtx.fillText).toHaveBeenCalledWith('Score: 999999', 20, 35);
        });
    });

    describe('adjustBrightness', () => {
        test('should darken color with negative percent', () => {
            const result = adjustBrightness('#ffffff', -20);
            expect(result).not.toBe('#ffffff');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should brighten color with positive percent', () => {
            const result = adjustBrightness('#000000', 20);
            expect(result).not.toBe('#000000');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should return valid hex color format', () => {
            const result = adjustBrightness('#63b3ed', -10);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should handle red color', () => {
            const result = adjustBrightness('#ff0000', -20);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should handle green color', () => {
            const result = adjustBrightness('#00ff00', -20);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should handle blue color', () => {
            const result = adjustBrightness('#0000ff', -20);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should not exceed maximum brightness (255)', () => {
            const result = adjustBrightness('#ffffff', 50);
            expect(result).toBe('#ffffff');
        });

        test('should not go below minimum brightness (0)', () => {
            const result = adjustBrightness('#000000', -50);
            expect(result).toBe('#000000');
        });

        test('should work with lowercase hex colors', () => {
            const result = adjustBrightness('#abc123', 10);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        test('should work with uppercase hex colors', () => {
            const result = adjustBrightness('#ABC123', 10);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});
