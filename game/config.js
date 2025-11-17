/**
 * HIGHWAY RUSH - Game Configuration
 * Contains all game constants and initial state
 */

// Canvas reference
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player configuration
const player = {
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

// Game state
const gameState = {
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
    fps: 60,
    debugMode: false
};

// Road configuration
const road = {
    laneWidth: 0,
    laneCount: 5,
    markerHeight: 40,
    markerGap: 20,
    markerOffset: 0,
    edgeWidth: 100
};

// Input state
const keys = {
    left: false,
    right: false,
    space: false,
    spacePressed: false
};

// Dynamic arrays
const obstacles = [];
const particles = [];
