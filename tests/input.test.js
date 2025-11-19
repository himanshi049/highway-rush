/**
 * Unit tests for Highway Rush input and UI functions
 */

// Import the functions to test
const {
    setupEventListeners,
    handleKeyDown,
    handleKeyUp,
    handleSpacePress,
    updateUI,
    showOverlay,
    hideOverlay,
    showGameOverScreen,
    updateHighScoreDisplay
} = require('../game/input.js');

// Mock global objects and functions
beforeEach(() => {
    // Mock document with more complete structure
    global.document = {
        addEventListener: jest.fn(),
        getElementById: jest.fn((id) => ({
            addEventListener: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            },
            style: {},
            textContent: ''
        }))
    };

    // Mock global game state
    global.gameState = {
        score: 0,
        highScore: 0,
        speedMultiplier: 1.0,
        level: 1,
        isPlaying: false,
        isPaused: false
    };

    // Mock keys
    global.keys = {
        left: false,
        right: false,
        space: false,
        spacePressed: false
    };

    // Mock obstacles
    global.obstacles = [];

    // Mock global functions that input.js calls
    global.startGame = jest.fn();
    global.pauseGame = jest.fn();
    global.resumeGame = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('setupEventListeners', () => {
    test('should add keydown event listener to document', () => {
        const mockStartButton = { addEventListener: jest.fn() };
        const mockRestartButton = { addEventListener: jest.fn() };
        const mockAddEventListener = jest.fn();
        document.addEventListener = mockAddEventListener;
        document.getElementById = jest.fn((id) => {
            if (id === 'startButton') return mockStartButton;
            if (id === 'restartButton') return mockRestartButton;
            return null;
        });
        setupEventListeners();
        expect(mockAddEventListener).toHaveBeenCalledWith('keydown', handleKeyDown);
    });

    test('should add keyup event listener to document', () => {
        const mockStartButton = { addEventListener: jest.fn() };
        const mockRestartButton = { addEventListener: jest.fn() };
        const mockAddEventListener = jest.fn();
        document.addEventListener = mockAddEventListener;
        document.getElementById = jest.fn((id) => {
            if (id === 'startButton') return mockStartButton;
            if (id === 'restartButton') return mockRestartButton;
            return null;
        });
        setupEventListeners();
        expect(mockAddEventListener).toHaveBeenCalledWith('keyup', handleKeyUp);
    });

    test('should add click event listener to startButton', () => {
        const mockStartButton = { addEventListener: jest.fn() };
        document.getElementById = jest.fn((id) => {
            if (id === 'startButton') return mockStartButton;
            return { addEventListener: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' };
        });

        setupEventListeners();
        
        expect(document.getElementById).toHaveBeenCalledWith('startButton');
        expect(mockStartButton.addEventListener).toHaveBeenCalledWith('click', startGame);
    });

    test('should add click event listener to restartButton', () => {
        const mockRestartButton = { addEventListener: jest.fn() };
        document.getElementById = jest.fn((id) => {
            if (id === 'restartButton') return mockRestartButton;
            return { addEventListener: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' };
        });

        setupEventListeners();
        
        expect(document.getElementById).toHaveBeenCalledWith('restartButton');
        expect(mockRestartButton.addEventListener).toHaveBeenCalledWith('click', startGame);
    });

    test('should set up all event listeners in one call', () => {
        const mockStartButton = { addEventListener: jest.fn() };
        const mockRestartButton = { addEventListener: jest.fn() };
        document.getElementById = jest.fn((id) => {
            if (id === 'startButton') return mockStartButton;
            if (id === 'restartButton') return mockRestartButton;
            return null;
        });
        setupEventListeners();
        
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(mockStartButton.addEventListener).toHaveBeenCalledTimes(1);
        expect(mockRestartButton.addEventListener).toHaveBeenCalledTimes(1);
    });
});

describe('handleKeyDown', () => {
    test('should set keys.left to true when ArrowLeft is pressed', () => {
        handleKeyDown({ key: 'ArrowLeft', preventDefault: jest.fn() });
        expect(keys.left).toBe(true);
    });

    test('should set keys.left to true when "a" is pressed', () => {
        handleKeyDown({ key: 'a', preventDefault: jest.fn() });
        expect(keys.left).toBe(true);
    });

    test('should set keys.left to true when "A" is pressed', () => {
        handleKeyDown({ key: 'A', preventDefault: jest.fn() });
        expect(keys.left).toBe(true);
    });

    test('should set keys.right to true when ArrowRight is pressed', () => {
        handleKeyDown({ key: 'ArrowRight', preventDefault: jest.fn() });
        expect(keys.right).toBe(true);
    });

    test('should set keys.right to true when "d" is pressed', () => {
        handleKeyDown({ key: 'd', preventDefault: jest.fn() });
        expect(keys.right).toBe(true);
    });

    test('should set keys.right to true when "D" is pressed', () => {
        handleKeyDown({ key: 'D', preventDefault: jest.fn() });
        expect(keys.right).toBe(true);
    });

    test('should handle space key press when not already pressed', () => {
        keys.spacePressed = false;
        handleKeyDown({ key: ' ', preventDefault: jest.fn() });
        expect(keys.space).toBe(true);
        expect(keys.spacePressed).toBe(true);
    });

    test('should not handle space key when already pressed', () => {
        keys.spacePressed = true;
        const preventDefault = jest.fn();
        handleKeyDown({ key: ' ', preventDefault });
        expect(preventDefault).toHaveBeenCalled();
    });

    test('should not trigger any action for unhandled keys', () => {
        const initialKeys = { ...keys };
        handleKeyDown({ key: 'x', preventDefault: jest.fn() });
        expect(keys).toEqual(initialKeys);
    });
});

describe('handleKeyUp', () => {
    test('should set keys.left to false when ArrowLeft is released', () => {
        keys.left = true;
        handleKeyUp({ key: 'ArrowLeft' });
        expect(keys.left).toBe(false);
    });

    test('should set keys.left to false when "a" is released', () => {
        keys.left = true;
        handleKeyUp({ key: 'a' });
        expect(keys.left).toBe(false);
    });

    test('should set keys.left to false when "A" is released', () => {
        keys.left = true;
        handleKeyUp({ key: 'A' });
        expect(keys.left).toBe(false);
    });

    test('should set keys.right to false when ArrowRight is released', () => {
        keys.right = true;
        handleKeyUp({ key: 'ArrowRight' });
        expect(keys.right).toBe(false);
    });

    test('should set keys.right to false when "d" is released', () => {
        keys.right = true;
        handleKeyUp({ key: 'd' });
        expect(keys.right).toBe(false);
    });

    test('should set keys.right to false when "D" is released', () => {
        keys.right = true;
        handleKeyUp({ key: 'D' });
        expect(keys.right).toBe(false);
    });

    test('should reset space keys when space is released', () => {
        keys.space = true;
        keys.spacePressed = true;
        handleKeyUp({ key: ' ' });
        expect(keys.space).toBe(false);
        expect(keys.spacePressed).toBe(false);
    });

    test('should not affect keys when unhandled key is released', () => {
        keys.left = true;
        handleKeyUp({ key: 'x' });
        expect(keys.left).toBe(true);
    });
});

describe('handleSpacePress', () => {
    test('should call startGame when game is not playing', () => {
        gameState.isPlaying = false;
        handleSpacePress();
        expect(startGame).toHaveBeenCalledTimes(1);
    });

    test('should call pauseGame when game is playing and not paused', () => {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        handleSpacePress();
        expect(pauseGame).toHaveBeenCalledTimes(1);
    });

    test('should call resumeGame when game is paused', () => {
        gameState.isPlaying = true;
        gameState.isPaused = true;
        handleSpacePress();
        expect(resumeGame).toHaveBeenCalledTimes(1);
    });

    test('should not call pauseGame when game is not playing', () => {
        gameState.isPlaying = false;
        gameState.isPaused = false;
        handleSpacePress();
        expect(pauseGame).not.toHaveBeenCalled();
    });

    test('should not call resumeGame when game is not paused', () => {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        handleSpacePress();
        expect(resumeGame).not.toHaveBeenCalled();
    });
});

describe('updateUI', () => {
    test('should update score display', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn((id) => id === 'scoreDisplay' ? mockElement : { textContent: '' });
        gameState.score = 1234;
        updateUI();
        expect(mockElement.textContent).toBe(1234);
    });

    test('should update high score display', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn((id) => id === 'highScorePanel' ? mockElement : { textContent: '' });
        gameState.highScore = 5678;
        updateUI();
        expect(mockElement.textContent).toBe(5678);
    });

    test('should update speed display with one decimal place', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn((id) => id === 'speedDisplay' ? mockElement : { textContent: '' });
        gameState.speedMultiplier = 1.567;
        updateUI();
        expect(mockElement.textContent).toBe('1.6x');
    });

    test('should update level display', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn((id) => id === 'levelDisplay' ? mockElement : { textContent: '' });
        gameState.level = 5;
        updateUI();
        expect(mockElement.textContent).toBe(5);
    });
});

describe('showOverlay', () => {
    test('should remove hidden class from overlay', () => {
        const mockElement = { classList: { remove: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        showOverlay('testOverlay');
        expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('should work with different overlay IDs', () => {
        const mockElement = { classList: { remove: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        showOverlay('gameOverScreen');
        expect(document.getElementById).toHaveBeenCalledWith('gameOverScreen');
    });
});

describe('hideOverlay', () => {
    test('should add hidden class to overlay', () => {
        const mockElement = { classList: { add: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        hideOverlay('testOverlay');
        expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('should work with different overlay IDs', () => {
        const mockElement = { classList: { add: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        hideOverlay('pauseScreen');
        expect(document.getElementById).toHaveBeenCalledWith('pauseScreen');
    });
});

describe('showGameOverScreen', () => {
    test('should display final score', () => {
        const mockElement = { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        gameState.score = 1500;
        showGameOverScreen(false);
        expect(document.getElementById).toHaveBeenCalledWith('finalScore');
    });

    test('should display time survived', () => {
        const mockElement = { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        gameState.survivalTime = 45;
        showGameOverScreen(false);
        expect(document.getElementById).toHaveBeenCalledWith('timeSurvived');
    });

    test('should display high score', () => {
        const mockElement = { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } };
        document.getElementById = jest.fn(() => mockElement);
        gameState.highScore = 2000;
        showGameOverScreen(false);
        expect(document.getElementById).toHaveBeenCalledWith('gameOverHighScore');
    });

    test('should show new high score message when isNewHighScore is true', () => {
        const mockElement = { classList: { remove: jest.fn(), add: jest.fn() }, textContent: '' };
        document.getElementById = jest.fn((id) => mockElement);
        showGameOverScreen(true);
        expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('should hide new high score message when isNewHighScore is false', () => {
        const mockElement = { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' };
        document.getElementById = jest.fn((id) => mockElement);
        showGameOverScreen(false);
        expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('should show game over overlay', () => {
        const mockElement = { classList: { remove: jest.fn(), add: jest.fn() }, textContent: '' };
        document.getElementById = jest.fn(() => mockElement);
        showGameOverScreen(false);
        expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
    });
});

describe('updateHighScoreDisplay', () => {
    test('should display high score text when high score exists', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn(() => mockElement);
        gameState.highScore = 1234;
        updateHighScoreDisplay();
        expect(mockElement.textContent).toBe('High Score: 1234');
    });

    test('should display "No high score yet!" when high score is 0', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn(() => mockElement);
        gameState.highScore = 0;
        updateHighScoreDisplay();
        expect(mockElement.textContent).toBe('No high score yet!');
    });

    test('should display "No high score yet!" when high score is negative', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn(() => mockElement);
        gameState.highScore = -1;
        updateHighScoreDisplay();
        expect(mockElement.textContent).toBe('No high score yet!');
    });

    test('should format high score text correctly with large numbers', () => {
        const mockElement = { textContent: '' };
        document.getElementById = jest.fn(() => mockElement);
        gameState.highScore = 999999;
        updateHighScoreDisplay();
        expect(mockElement.textContent).toBe('High Score: 999999');
    });
});
