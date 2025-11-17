/**
 * All Canvas API drawing functions
 */

/**
 * Draw the road background
 */
function drawRoad() {
    // Draw road base with gradient
    const roadGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    roadGradient.addColorStop(0, '#2d3748');
    roadGradient.addColorStop(0.5, '#1a202c');
    roadGradient.addColorStop(1, '#171923');
    ctx.fillStyle = roadGradient;
    ctx.fillRect(road.edgeWidth, 0, canvas.width - road.edgeWidth * 2, canvas.height);
    
    // Draw road edges (darker areas)
    const grassGradient = ctx.createLinearGradient(0, 0, road.edgeWidth, 0);
    grassGradient.addColorStop(0, '#1a202c');
    grassGradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, road.edgeWidth, canvas.height);
    
    const grassGradient2 = ctx.createLinearGradient(canvas.width - road.edgeWidth, 0, canvas.width, 0);
    grassGradient2.addColorStop(0, '#2d3748');
    grassGradient2.addColorStop(1, '#1a202c');
    ctx.fillStyle = grassGradient2;
    ctx.fillRect(canvas.width - road.edgeWidth, 0, road.edgeWidth, canvas.height);
    
    // Draw edge lines
    ctx.strokeStyle = 'rgba(99, 179, 237, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(road.edgeWidth, 0);
    ctx.lineTo(road.edgeWidth, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - road.edgeWidth, 0);
    ctx.lineTo(canvas.width - road.edgeWidth, canvas.height);
    ctx.stroke();
    
    // Draw lane markers (animated)
    ctx.strokeStyle = 'rgba(99, 179, 237, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([road.markerHeight, road.markerGap]);
    ctx.lineDashOffset = -road.markerOffset;
    
    for (let i = 1; i < road.laneCount; i++) {
        const x = road.edgeWidth + i * road.laneWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Animate lane markers
    road.markerOffset += gameState.speed * gameState.speedMultiplier;
    if (road.markerOffset > road.markerHeight + road.markerGap) {
        road.markerOffset = 0;
    }
    
    // Speed lines effect when going fast
    if (gameState.speedMultiplier > 1.5 && gameState.isPlaying && !gameState.isPaused) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const x = road.edgeWidth + Math.random() * (canvas.width - road.edgeWidth * 2);
            const y = (road.markerOffset * 3 + i * 60) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 30);
            ctx.stroke();
        }
    }
}

/**
 * Draw the player's car
 */
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 2, y + 2, w, h);
    
    // Car body with gradient
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, '#4299e1');
    gradient.addColorStop(0.5, '#63b3ed');
    gradient.addColorStop(1, '#4299e1');
    ctx.fillStyle = gradient;
    
    // Main body
    ctx.fillRect(x, y + 15, w, h - 25);
    
    // Car roof (smaller)
    ctx.fillRect(x + 3, y + 5, w - 6, 20);
    
    // Body outline
    ctx.strokeStyle = '#2c5282';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 15, w, h - 25);
    ctx.strokeRect(x + 3, y + 5, w - 6, 20);
    
    // Front windshield
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 5, y + 7, w - 10, 8);
    
    // Rear windshield
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 5, y + 17, w - 10, 8);
    
    // Side windows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 3, y + 28, 5, 15);
    ctx.fillRect(x + w - 8, y + 28, 5, 15);
    
    // Wheels
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x - 3, y + 10, 6, 12);
    ctx.fillRect(x + w - 3, y + 10, 6, 12);
    ctx.fillRect(x - 3, y + h - 20, 6, 12);
    ctx.fillRect(x + w - 3, y + h - 20, 6, 12);
    
    // Wheel rims
    ctx.fillStyle = '#cbd5e0';
    ctx.fillRect(x - 2, y + 12, 4, 8);
    ctx.fillRect(x + w - 2, y + 12, 4, 8);
    ctx.fillRect(x - 2, y + h - 18, 4, 8);
    ctx.fillRect(x + w - 2, y + h - 18, 4, 8);
    
    // Headlights
    ctx.fillStyle = '#faf089';
    ctx.fillRect(x + 4, y, 5, 3);
    ctx.fillRect(x + w - 9, y, 5, 3);
    
    // Headlight glow
    ctx.fillStyle = 'rgba(250, 240, 137, 0.3)';
    ctx.fillRect(x + 2, y - 5, 8, 8);
    ctx.fillRect(x + w - 10, y - 5, 8, 8);
    
    // Tail lights
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(x + 5, y + h - 3, 5, 3);
    ctx.fillRect(x + w - 10, y + h - 3, 5, 3);
    
    // Hood detail line
    ctx.strokeStyle = '#2c5282';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w/2, y + 5);
    ctx.lineTo(x + w/2, y + 25);
    ctx.stroke();
    
    // Debug hitbox
    if (gameState.debugMode) {
        ctx.strokeStyle = '#2ECC71';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
    }
}

/**
 * Draw all obstacles
 */
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const x = obstacle.x;
        const y = obstacle.y;
        const w = obstacle.width;
        const h = obstacle.height;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, w, h);
        
        // Body gradient
        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        const darkerColor = adjustBrightness(obstacle.color, -20);
        gradient.addColorStop(0, darkerColor);
        gradient.addColorStop(0.5, obstacle.color);
        gradient.addColorStop(1, darkerColor);
        ctx.fillStyle = gradient;
        
        // Main body
        ctx.fillRect(x, y + 10, w, h - 15);
        
        // Roof
        ctx.fillRect(x + 2, y, w - 4, 15);
        
        // Outline
        ctx.strokeStyle = darkerColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 10, w, h - 15);
        ctx.strokeRect(x + 2, y, w - 4, 15);
        
        // Windows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 4, y + 2, w - 8, 8);
        
        // Tail lights
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(x + 4, y + h - 4, 5, 3);
        ctx.fillRect(x + w - 9, y + h - 4, 5, 3);
        
        // Debug hitbox
        if (gameState.debugMode) {
            ctx.strokeStyle = '#E74C3C';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
        }
    });
}

/**
 * Draw UI elements on canvas
 */
function drawCanvasUI() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 40);
    
    ctx.fillStyle = '#63b3ed';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
}

/**
 * Utility: Adjust color brightness
 */
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}
