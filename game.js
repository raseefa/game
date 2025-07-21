class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // High-resolution canvas setup
        this.setupHighDPI();
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 5, y: 5 }]; // Start away from walls
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Level system
        this.maxLevels = 1000;
        this.targetScore = 200;
        this.baseSpeed = 150;
        this.speedMultiplier = 1; // Speed controller
        
        // Walls system (1997 style)
        this.walls = [];
        this.wallPatterns = this.createWallPatterns();
        
        // UI elements
        this.gameOverlay = document.getElementById('gameOverlay');
        this.levelSelector = document.getElementById('levelSelector');
        this.currentPage = 1;
        this.levelsPerPage = 10;
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadProgress();
        this.generateLevelGrid();
    }
    
    createWallPatterns() {
        return {
            // Level 2-5: Continuous vertical line (center, up to down)
            simple: [
                { x: 20, y: 5 }, { x: 20, y: 6 }, { x: 20, y: 7 }, { x: 20, y: 8 }, 
                { x: 20, y: 9 }, { x: 20, y: 10 }, { x: 20, y: 11 }, { x: 20, y: 12 }, 
                { x: 20, y: 13 }, { x: 20, y: 14 }, { x: 20, y: 15 }, { x: 20, y: 16 }, 
                { x: 20, y: 17 }, { x: 20, y: 18 }, { x: 20, y: 19 }, { x: 20, y: 20 },
                { x: 20, y: 21 }, { x: 20, y: 22 }, { x: 20, y: 23 }, { x: 20, y: 24 }
            ],
            
            // Level 6-10: Continuous horizontal line (center, left to right)
            cross: [
                { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 }, { x: 11, y: 15 }, 
                { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 }, 
                { x: 16, y: 15 }, { x: 17, y: 15 }, { x: 18, y: 15 }, { x: 19, y: 15 }, 
                { x: 20, y: 15 }, { x: 21, y: 15 }, { x: 22, y: 15 }, { x: 23, y: 15 },
                { x: 24, y: 15 }, { x: 25, y: 15 }, { x: 26, y: 15 }, { x: 27, y: 15 },
                { x: 28, y: 15 }, { x: 29, y: 15 }, { x: 30, y: 15 }, { x: 31, y: 15 }
            ],
            
            // Level 11-15: Two continuous vertical lines
            box: [
                // Left continuous vertical line
                { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 12, y: 7 }, { x: 12, y: 8 }, 
                { x: 12, y: 9 }, { x: 12, y: 10 }, { x: 12, y: 11 }, { x: 12, y: 12 }, 
                { x: 12, y: 13 }, { x: 12, y: 14 }, { x: 12, y: 15 }, { x: 12, y: 16 },
                { x: 12, y: 17 }, { x: 12, y: 18 }, { x: 12, y: 19 }, { x: 12, y: 20 },
                { x: 12, y: 21 }, { x: 12, y: 22 }, { x: 12, y: 23 }, { x: 12, y: 24 },
                { x: 12, y: 25 },
                // Right continuous vertical line
                { x: 28, y: 5 }, { x: 28, y: 6 }, { x: 28, y: 7 }, { x: 28, y: 8 }, 
                { x: 28, y: 9 }, { x: 28, y: 10 }, { x: 28, y: 11 }, { x: 28, y: 12 }, 
                { x: 28, y: 13 }, { x: 28, y: 14 }, { x: 28, y: 15 }, { x: 28, y: 16 },
                { x: 28, y: 17 }, { x: 28, y: 18 }, { x: 28, y: 19 }, { x: 28, y: 20 },
                { x: 28, y: 21 }, { x: 28, y: 22 }, { x: 28, y: 23 }, { x: 28, y: 24 },
                { x: 28, y: 25 }
            ],
            
            // Level 16-20: Two continuous horizontal lines
            maze: [
                // Top continuous horizontal line
                { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }, 
                { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, 
                { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 },
                { x: 18, y: 8 }, { x: 19, y: 8 }, { x: 20, y: 8 }, { x: 21, y: 8 },
                { x: 22, y: 8 }, { x: 23, y: 8 }, { x: 24, y: 8 }, { x: 25, y: 8 },
                { x: 26, y: 8 }, { x: 27, y: 8 }, { x: 28, y: 8 }, { x: 29, y: 8 },
                { x: 30, y: 8 }, { x: 31, y: 8 }, { x: 32, y: 8 }, { x: 33, y: 8 },
                // Bottom continuous horizontal line
                { x: 6, y: 22 }, { x: 7, y: 22 }, { x: 8, y: 22 }, { x: 9, y: 22 },
                { x: 10, y: 22 }, { x: 11, y: 22 }, { x: 12, y: 22 }, { x: 13, y: 22 }, 
                { x: 14, y: 22 }, { x: 15, y: 22 }, { x: 16, y: 22 }, { x: 17, y: 22 }, 
                { x: 18, y: 22 }, { x: 19, y: 22 }, { x: 20, y: 22 }, { x: 21, y: 22 },
                { x: 22, y: 22 }, { x: 23, y: 22 }, { x: 24, y: 22 }, { x: 25, y: 22 },
                { x: 26, y: 22 }, { x: 27, y: 22 }, { x: 28, y: 22 }, { x: 29, y: 22 },
                { x: 30, y: 22 }, { x: 31, y: 22 }, { x: 32, y: 22 }, { x: 33, y: 22 }
            ],
            
            // Level 21+: Three continuous lines (one horizontal, two vertical)
            spiral: [
                // Center continuous horizontal line
                { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 }, { x: 11, y: 15 },
                { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 }, 
                { x: 16, y: 15 }, { x: 17, y: 15 }, { x: 18, y: 15 }, { x: 19, y: 15 },
                { x: 20, y: 15 }, { x: 21, y: 15 }, { x: 22, y: 15 }, { x: 23, y: 15 },
                { x: 24, y: 15 }, { x: 25, y: 15 }, { x: 26, y: 15 }, { x: 27, y: 15 },
                { x: 28, y: 15 }, { x: 29, y: 15 }, { x: 30, y: 15 }, { x: 31, y: 15 },
                { x: 32, y: 15 },
                // Left continuous vertical line
                { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 }, 
                { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, 
                { x: 6, y: 14 }, { x: 6, y: 16 }, { x: 6, y: 17 }, { x: 6, y: 18 },
                { x: 6, y: 19 }, { x: 6, y: 20 }, { x: 6, y: 21 }, { x: 6, y: 22 },
                { x: 6, y: 23 }, { x: 6, y: 24 },
                // Right continuous vertical line
                { x: 34, y: 6 }, { x: 34, y: 7 }, { x: 34, y: 8 }, { x: 34, y: 9 }, 
                { x: 34, y: 10 }, { x: 34, y: 11 }, { x: 34, y: 12 }, { x: 34, y: 13 }, 
                { x: 34, y: 14 }, { x: 34, y: 16 }, { x: 34, y: 17 }, { x: 34, y: 18 },
                { x: 34, y: 19 }, { x: 34, y: 20 }, { x: 34, y: 21 }, { x: 34, y: 22 },
                { x: 34, y: 23 }, { x: 34, y: 24 }
            ]
        };
    }
    
    generateWallsForLevel(level) {
        this.walls = [];
        
        if (level === 1) {
            // No walls for level 1
            return;
        }
        
        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);
        
        if (level >= 2 && level <= 5) {
            // Simple vertical wall in center
            this.walls = this.wallPatterns.simple.filter(wall => 
                wall.x < maxX && wall.y < maxY
            );
        } else if (level >= 6 && level <= 10) {
            // Cross pattern
            this.walls = this.wallPatterns.cross.filter(wall => 
                wall.x < maxX && wall.y < maxY
            );
        } else if (level >= 11 && level <= 15) {
            // Box patterns
            this.walls = this.wallPatterns.box.filter(wall => 
                wall.x < maxX && wall.y < maxY
            );
        } else if (level >= 16 && level <= 20) {
            // Maze pattern
            this.walls = this.wallPatterns.maze.filter(wall => 
                wall.x < maxX && wall.y < maxY
            );
        } else {
            // Complex spiral for higher levels
            this.walls = this.wallPatterns.spiral.filter(wall => 
                wall.x < maxX && wall.y < maxY
            );
            
            // Add random walls for very high levels
            if (level > 50) {
                const numRandomWalls = Math.min(Math.floor(level / 10), 20);
                for (let i = 0; i < numRandomWalls; i++) {
                    const randomWall = {
                        x: Math.floor(Math.random() * (maxX - 4)) + 2,
                        y: Math.floor(Math.random() * (maxY - 4)) + 2
                    };
                    
                    // Don't place walls on snake starting position
                    if (randomWall.x !== 5 || randomWall.y !== 5) {
                        this.walls.push(randomWall);
                    }
                }
            }
        }
    }
    
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }
    
    initializeGame() {
        this.snake = [{ x: 5, y: 5 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateWallsForLevel(this.level);
        this.generateFood();
        this.updateUI();
        this.showStartScreen();
    }
    
    generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            
            validPosition = true;
            
            // Check if food spawns on snake
            for (let segment of this.snake) {
                if (segment.x === this.food.x && segment.y === this.food.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if food spawns on walls
            for (let wall of this.walls) {
                if (wall.x === this.food.x && wall.y === this.food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code === 'Space') {
                this.startGame();
                return;
            }
            
            if (this.gameRunning && e.code === 'Space') {
                this.togglePause();
                return;
            }
            
            if (!this.gameRunning || this.gamePaused) return;
            
            const key = e.code;
            
            // Arrow keys and WASD
            if ((key === 'ArrowLeft' || key === 'KeyA') && this.dx === 0) {
                this.dx = -1;
                this.dy = 0;
            } else if ((key === 'ArrowRight' || key === 'KeyD') && this.dx === 0) {
                this.dx = 1;
                this.dy = 0;
            } else if ((key === 'ArrowUp' || key === 'KeyW') && this.dy === 0) {
                this.dx = 0;
                this.dy = -1;
            } else if ((key === 'ArrowDown' || key === 'KeyS') && this.dy === 0) {
                this.dx = 0;
                this.dy = 1;
            }
            
            // Speed controller
            if (key === 'KeyI') {
                this.speedMultiplier += 0.1;
                if (this.speedMultiplier > 5.0) this.speedMultiplier = 5.0;
                this.updateUI();
            } else if (key === 'KeyK') {
                this.speedMultiplier -= 0.1;
                if (this.speedMultiplier < 0.1) this.speedMultiplier = 0.1;
                this.updateUI();
            }
        });
        
        // Button controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.gameRunning) this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('levelSelectBtn').addEventListener('click', () => {
            this.showLevelSelector();
        });
        
        document.getElementById('closeLevelSelector').addEventListener('click', () => {
            this.hideLevelSelector();
        });
        
        document.getElementById('prevPage').addEventListener('click', () => {
            this.changePage(-1);
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            this.changePage(1);
        });
        
        // Quick jump to level functionality
        document.getElementById('jumpToLevel').addEventListener('click', () => {
            const levelInput = document.getElementById('levelInput');
            const targetLevel = parseInt(levelInput.value);
            
            if (targetLevel >= 1 && targetLevel <= this.maxLevels) {
                this.goToLevelPage(targetLevel);
                this.selectLevel(targetLevel);
                levelInput.value = ''; // Clear input
            } else {
                alert(`Please enter a valid level between 1 and ${this.maxLevels}`);
            }
        });
        
        // Allow Enter key to jump to level
        document.getElementById('levelInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('jumpToLevel').click();
            }
        });
        
        // Speed control buttons
        document.getElementById('speedUpBtn').addEventListener('click', () => {
            this.speedMultiplier += 0.2;
            if (this.speedMultiplier > 3.0) this.speedMultiplier = 3.0;
            this.updateUI();
        });
        
        document.getElementById('speedDownBtn').addEventListener('click', () => {
            this.speedMultiplier -= 0.2;
            if (this.speedMultiplier < 0.2) this.speedMultiplier = 0.2;
            this.updateUI();
        });
        
        document.getElementById('resetSpeedBtn').addEventListener('click', () => {
            this.speedMultiplier = 1.0;
            document.getElementById('speedSlider').value = 1.0;
            this.updateUI();
        });
        
        // Speed slider control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            this.updateUI();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.hideOverlay();
        this.gameLoop();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Resume' : 'Pause';
        
        if (this.gamePaused) {
            this.showOverlay('PAUSED', 'Press SPACE to resume');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        this.initializeGame();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawWalls(); // Draw walls before other elements
            this.drawFood();
            this.drawSnake();
            this.checkCollisions();
            this.gameLoop();
        }, this.getGameSpeed());
    }
    
    getGameSpeed() {
        // Manual speed control only - no automatic level-based speed increase
        return this.baseSpeed / this.speedMultiplier;
    }
    
    clearCanvas() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(20, 20, 40, 0.8)');
        gradient.addColorStop(1, 'rgba(40, 20, 60, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }
    
    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Wall wrapping (classic 1997 style - but check for walls first)
        if (head.x < 0) head.x = Math.floor(this.canvas.width / this.gridSize) - 1;
        if (head.x >= Math.floor(this.canvas.width / this.gridSize)) head.x = 0;
        if (head.y < 0) head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
        if (head.y >= Math.floor(this.canvas.height / this.gridSize)) head.y = 0;
        
        this.snake.unshift(head);
        
        // Check if food eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateUI();
            this.checkLevelCompletion();
        } else {
            this.snake.pop();
        }
    }
    
    drawWalls() {
        this.walls.forEach(wall => {
            // Classic 1997 brick-style walls
            const gradient = this.ctx.createLinearGradient(
                wall.x * this.gridSize,
                wall.y * this.gridSize,
                wall.x * this.gridSize + this.gridSize,
                wall.y * this.gridSize + this.gridSize
            );
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(0.5, '#A0522D');
            gradient.addColorStop(1, '#654321');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                wall.x * this.gridSize,
                wall.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
            
            // Add brick texture
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                wall.x * this.gridSize,
                wall.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
            
            // Add highlight for 3D effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(
                wall.x * this.gridSize + 1,
                wall.y * this.gridSize + 1,
                this.gridSize / 4,
                this.gridSize / 4
            );
        });
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            // Gradient for snake body
            const gradient = this.ctx.createRadialGradient(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                0,
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2
            );
            
            if (index === 0) {
                // Head
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#2E7D32');
            } else {
                // Body
                gradient.addColorStop(0, '#8BC34A');
                gradient.addColorStop(1, '#558B2F');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Add shine effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize / 3,
                this.gridSize / 3
            );
        });
    }
    
    drawFood() {
        // Animated food with glow effect
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.2 + 0.8;
        
        // Glow effect
        this.ctx.shadowColor = '#FF5722';
        this.ctx.shadowBlur = 15 * pulse;
        
        // Food gradient
        const gradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            0,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2
        );
        gradient.addColorStop(0, '#FF5722');
        gradient.addColorStop(1, '#D32F2F');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Add sparkle effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(
            this.food.x * this.gridSize + this.gridSize / 2 - 1,
            this.food.y * this.gridSize + this.gridSize / 2 - 1,
            2,
            2
        );
    }
    
    checkCollisions() {
        const head = this.snake[0];
        
        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        
        // Check wall collision (1997 style)
        for (let wall of this.walls) {
            if (head.x === wall.x && head.y === wall.y) {
                this.gameOver();
                return;
            }
        }
    }
    
    checkLevelCompletion() {
        if (this.score >= this.targetScore) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        // Save progress
        this.saveProgress();
        
        // Level completion celebration
        this.showOverlay('LEVEL COMPLETE!', `Level ${this.level} completed! Moving to Level ${this.level + 1}`);
        
        setTimeout(() => {
            this.level++;
            this.score = 0;
            this.snake = [{ x: 5, y: 5 }];
            this.dx = 0;
            this.dy = 0;
            this.generateWallsForLevel(this.level); // Generate new walls for next level
            this.generateFood();
            this.updateUI();
            this.hideOverlay();
            this.gameLoop();
        }, 2000);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.saveProgress();
        this.showOverlay('GAME OVER', `Final Score: ${this.score} | Press SPACE to restart`);
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        this.gameOverlay.classList.add('show');
    }
    
    hideOverlay() {
        this.gameOverlay.classList.remove('show');
    }
    
    showStartScreen() {
        this.showOverlay('SNAKE GAME', 'Press SPACE to start playing!');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('highScore').textContent = this.getHighScore();
        document.getElementById('speedMultiplier').textContent = `${this.speedMultiplier.toFixed(1)}x`;
    }
    
    getHighScore() {
        return localStorage.getItem('snakeHighScore') || 0;
    }
    
    saveProgress() {
        const currentHigh = parseInt(this.getHighScore());
        if (this.score > currentHigh) {
            localStorage.setItem('snakeHighScore', this.score);
        }
        
        // Save level progress
        const progress = JSON.parse(localStorage.getItem('snakeLevelProgress') || '{}');
        progress[this.level] = Math.max(progress[this.level] || 0, this.score);
        localStorage.setItem('snakeLevelProgress', JSON.stringify(progress));
    }
    
    loadProgress() {
        this.updateUI();
    }
    
    // Level selector functionality
    showLevelSelector() {
        this.levelSelector.classList.add('show');
        this.generateLevelGrid();
    }
    
    hideLevelSelector() {
        this.levelSelector.classList.remove('show');
    }
    
    generateLevelGrid() {
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';
        
        const startLevel = (this.currentPage - 1) * this.levelsPerPage + 1;
        const endLevel = Math.min(startLevel + this.levelsPerPage - 1, this.maxLevels);
        
        for (let i = startLevel; i <= endLevel; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            // All levels are unlocked - no restrictions
            btn.disabled = false;
            
            if (i === this.level) {
                btn.classList.add('current');
            }
            
            // Check if level is completed
            const progress = JSON.parse(localStorage.getItem('snakeLevelProgress') || '{}');
            if (progress[i] >= this.targetScore) {
                btn.classList.add('completed');
            }
            
            btn.addEventListener('click', () => {
                this.selectLevel(i);
            });
            
            grid.appendChild(btn);
        }
        
        this.updatePageInfo();
    }
    
    selectLevel(level) {
        // Ensure level is within valid range
        if (level >= 1 && level <= this.maxLevels) {
            this.level = level;
            this.restartGame();
            this.hideLevelSelector();
        }
    }
    
    // Add helper method to jump to specific level page
    goToLevelPage(targetLevel) {
        const targetPage = Math.ceil(targetLevel / this.levelsPerPage);
        this.currentPage = targetPage;
        this.generateLevelGrid();
    }
    
    changePage(direction) {
        const totalPages = Math.ceil(this.maxLevels / this.levelsPerPage);
        this.currentPage += direction;
        
        if (this.currentPage < 1) this.currentPage = 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        
        this.generateLevelGrid();
    }
    
    updatePageInfo() {
        const totalPages = Math.ceil(this.maxLevels / this.levelsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SnakeGame();
});
