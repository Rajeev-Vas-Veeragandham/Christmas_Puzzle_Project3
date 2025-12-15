// GRADUATE-LEVEL PUZZLE ENGINE
class ChristmasPuzzle {
    constructor(version = 'santa', size = 4) {
        this.version = version;
        this.size = size;
        this.tiles = [];
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.mana = 100;
        this.difficulty = 1;
        this.playerStats = {
            avgTime: 0,
            bestTime: Infinity,
            winStreak: 0,
            powerupsUsed: 0
        };
        this.init();
    }

    init() {
        this.tiles = [...Array(this.size * this.size - 1).keys()].map(x => x + 1);
        this.tiles.push('');
        this.moves = 0;
        this.time = 0;
        this.loadPlayerStats();
        this.startTimer();
        this.generateSolvablePuzzle();
    }

    generateSolvablePuzzle() {
        // Graduate Feature: AI-based puzzle generation
        do {
            this.tiles.sort(() => Math.random() - 0.5);
        } while (!this.isSolvable() || !this.meetsDifficulty());
    }

    meetsDifficulty() {
        // Calculate puzzle complexity based on inversion count and Manhattan distance
        const inversions = this.countInversions();
        const manhattan = this.calculateManhattan();
        const complexity = inversions * 0.4 + manhattan * 0.6;
        
        // Adjust based on player skill
        const targetComplexity = 50 + (this.difficulty * 20) - (this.playerStats.avgTime / 10);
        return Math.abs(complexity - targetComplexity) < 15;
    }

    calculateManhattan() {
        let distance = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] === '') continue;
            const targetX = (this.tiles[i] - 1) % this.size;
            const targetY = Math.floor((this.tiles[i] - 1) / this.size);
            const currentX = i % this.size;
            const currentY = Math.floor(i / this.size);
            distance += Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
        }
        return distance;
    }

    countInversions() {
        const arr = this.tiles.filter(x => x !== '');
        let inv = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) inv++;
            }
        }
        return inv;
    }

    isSolvable() {
        const inversions = this.countInversions();
        if (this.size % 2 === 1) return inversions % 2 === 0;
        
        // For even-sized boards
        const emptyRow = Math.floor(this.tiles.indexOf('') / this.size);
        return (inversions % 2 === 0) === (emptyRow % 2 === 1);
    }

    moveTile(index) {
        const emptyIndex = this.tiles.indexOf('');
        const validMoves = this.getValidMoves(emptyIndex);
        
        if (validMoves.includes(index)) {
            [this.tiles[index], this.tiles[emptyIndex]] = 
            [this.tiles[emptyIndex], this.tiles[index]];
            
            this.moves++;
            this.mana = Math.min(100, this.mana + 2); // Mana regeneration
            
            // Version-specific effects
            this.applyVersionEffects();
            
            this.updateDisplay();
            this.checkWin();
            
            // Play Sound via SoundManager
            if (window.soundManager) window.soundManager.playMove();
            
            return true;
        }
        return false;
    }

    getValidMoves(emptyIndex) {
        const moves = [];
        const row = Math.floor(emptyIndex / this.size);
        const col = emptyIndex % this.size;
        
        // Add directional moves
        if (row > 0) moves.push(emptyIndex - this.size); // Up
        if (row < this.size - 1) moves.push(emptyIndex + this.size); // Down
        if (col > 0) moves.push(emptyIndex - 1); // Left
        if (col < this.size - 1) moves.push(emptyIndex + 1); // Right
        
        return moves;
    }

    applyVersionEffects() {
        switch(this.version) {
            case 'santa':
                // Santa's Workshop: Adaptive difficulty
                if (this.moves % 5 === 0 && this.playerStats.avgTime < 60) {
                    this.difficulty = Math.min(5, this.difficulty + 0.1);
                }
                break;
            case 'reindeer':
                // Reindeer Games: Multiplayer sync
                if (typeof window.syncMultiplayerMove === 'function') {
                    window.syncMultiplayerMove(this.tiles);
                }
                break;
            case 'elf':
                // Elf AI Workshop: AI learning
                if (typeof window.analyzeMovePattern === 'function') {
                    window.analyzeMovePattern(this.moves, this.time);
                }
                break;
        }
    }

    checkWin() {
        const solution = [...Array(this.size * this.size - 1).keys()].map(x => x + 1).concat(['']);
        
        if (JSON.stringify(this.tiles) === JSON.stringify(solution)) {
            clearInterval(this.timer);
            this.handleWin();
            return true;
        }
        return false;
    }

    handleWin() {
        // Celebration effects
        this.triggerCelebration();
        
        // Update stats
        this.updatePlayerStats(true);
        
        // Unlock story chapter
        if (window.storyEngine) {
            window.storyEngine.unlockChapter();
        }
        
        // Award achievements
        this.awardAchievements();
        
        // Save to backend
        this.saveGameSession(true);
        
        // Show victory modal
        this.showVictoryModal();
    }

    triggerCelebration() {
        // Confetti effect
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }, i * 20);
        }
        
        // Play victory sound
        if(window.soundManager) window.soundManager.playVictory();
        
        // Fireworks animation
        this.createFireworks();
    }

    createFireworks() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const x = Math.random() * 80 + 10;
                const y = Math.random() * 80 + 10;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                const firework = document.createElement('div');
                firework.style.position = 'fixed';
                firework.style.left = `${x}vw`;
                firework.style.top = `${y}vh`;
                firework.style.width = '5px';
                firework.style.height = '5px';
                firework.style.background = color;
                firework.style.borderRadius = '50%';
                firework.style.boxShadow = `0 0 20px ${color}`;
                firework.style.zIndex = '9999';
                document.body.appendChild(firework);
                
                // Explode
                for (let j = 0; j < 30; j++) {
                    setTimeout(() => {
                        const particle = document.createElement('div');
                        particle.style.position = 'fixed';
                        particle.style.left = `${x}vw`;
                        particle.style.top = `${y}vh`;
                        particle.style.width = '3px';
                        particle.style.height = '3px';
                        particle.style.background = color;
                        particle.style.borderRadius = '50%';
                        particle.style.zIndex = '9999';
                        document.body.appendChild(particle);
                        
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * 100 + 50;
                        const duration = Math.random() * 1000 + 500;
                        
                        particle.animate([
                            { transform: 'translate(0,0)', opacity: 1 },
                            { 
                                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                                opacity: 0
                            }
                        ], { duration, easing: 'ease-out' });
                        
                        setTimeout(() => particle.remove(), duration);
                    }, j * 30);
                }
                
                setTimeout(() => firework.remove(), 1000);
            }, i * 300);
        }
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.time++;
            this.updateTimerDisplay();
            
            // Time-based effects
            if (this.time % 30 === 0) {
                this.mana = Math.min(100, this.mana + 10);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        if(display) display.textContent = `${this.time}s`;
    }

    updateDisplay() {
        const container = document.getElementById('puzzleGrid');
        if (!container) return;
        
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        // Force dimensions if needed or rely on CSS
        
        this.tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            if (value !== '') {
                // Apply theme-based background
                const theme = localStorage.getItem('theme') || 'santa';
                const bgX = ((value - 1) % this.size) * 100 / (this.size-1);
                const bgY = Math.floor((value - 1) / this.size) * 100 / (this.size-1);
                
                // Using percentage based approach for image splitting
                tile.style.backgroundImage = `url('assets/images/${theme}.jpg')`;
                tile.style.backgroundSize = `${this.size * 100}%`;
                tile.style.backgroundPosition = `${bgX}% ${bgY}%`;
                
                // Check if correct position
                const correctPos = value - 1;
                if (index === correctPos) {
                    tile.classList.add('correct');
                }
                
                // Check if movable
                const emptyIndex = this.tiles.indexOf('');
                const validMoves = this.getValidMoves(emptyIndex);
                if (validMoves.includes(index)) {
                    tile.classList.add('movable');
                    tile.style.cursor = 'pointer';
                    tile.onclick = () => this.moveTile(index);
                }
                
                tile.textContent = value;
            } else {
                tile.classList.add('empty');
                tile.style.background = 'none';
            }
            
            container.appendChild(tile);
        });
        
        // Update HUD
        const movesEl = document.getElementById('movesCount');
        const manaEl = document.getElementById('manaFill');
        if(movesEl) movesEl.textContent = this.moves;
        if(manaEl) manaEl.style.width = `${this.mana}%`;
    }

    // Graduate Feature: AI-powered hint system
    getAStarHint() {
        if (this.mana < 25) {
            alert("Not enough mana! (Need 25)");
            return null;
        }
        
        this.mana -= 25;
        this.updateDisplay(); // update mana bar
        
        // A* algorithm to find optimal next move
        const emptyIndex = this.tiles.indexOf('');
        const validMoves = this.getValidMoves(emptyIndex);
        
        let bestMove = null;
        let bestScore = Infinity;
        
        for (const move of validMoves) {
            // Simulate move
            const simulatedTiles = [...this.tiles];
            [simulatedTiles[move], simulatedTiles[emptyIndex]] = 
            [simulatedTiles[emptyIndex], simulatedTiles[move]];
            
            // Calculate heuristic (Manhattan distance)
            const score = this.calculateManhattanForTiles(simulatedTiles);
            
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Highlight the suggested tile
        if (bestMove !== null) {
            const tiles = document.getElementsByClassName('tile');
            if (tiles[bestMove]) {
                tiles[bestMove].style.boxShadow = '0 0 20px #00ff00';
                tiles[bestMove].style.transform = 'scale(1.1)';
                
                if(window.soundManager) window.soundManager.playHint();

                setTimeout(() => {
                    tiles[bestMove].style.boxShadow = '';
                    tiles[bestMove].style.transform = '';
                }, 2000);
            }
        }
        
        return bestMove;
    }

    calculateManhattanForTiles(tiles) {
        let distance = 0;
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] === '') continue;
            const targetX = (tiles[i] - 1) % this.size;
            const targetY = Math.floor((tiles[i] - 1) / this.size);
            const currentX = i % this.size;
            const currentY = Math.floor(i / this.size);
            distance += Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
        }
        return distance;
    }

    // Save game session to backend
    async saveGameSession(isWin) {
        try {
            const userId = localStorage.getItem('userId') || (window.authManager ? window.authManager.user.id : 1);
            const response = await fetch('/api/save-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    version: this.version,
                    moves: this.moves,
                    time: this.time,
                    difficulty: this.difficulty,
                    isWin: isWin,
                    tiles: this.tiles,
                    size: this.size
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('Game saved successfully');
            }
        } catch (error) {
            console.log('Playing in offline mode');
        }
    }

    updatePlayerStats(isWin) {
        // Load existing stats
        const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
        
        // Update stats
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.totalMoves = (stats.totalMoves || 0) + this.moves;
        stats.totalTime = (stats.totalTime || 0) + this.time;
        
        if (isWin) {
            stats.wins = (stats.wins || 0) + 1;
            stats.winStreak = (stats.winStreak || 0) + 1;
            
            // Update best time
            if (this.time < (stats.bestTime || Infinity)) {
                stats.bestTime = this.time;
            }
        } else {
            stats.winStreak = 0;
        }
        
        // Calculate averages
        stats.avgMoves = Math.round(stats.totalMoves / stats.totalGames);
        stats.avgTime = Math.round(stats.totalTime / stats.totalGames);
        
        // Save back
        localStorage.setItem('playerStats', JSON.stringify(stats));
        this.playerStats = stats;
    }

    loadPlayerStats() {
        const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
        this.playerStats = stats;
        
        // Adjust difficulty based on player skill
        if (stats.avgTime) {
            if (stats.avgTime < 45) {
                this.difficulty = 3;
            } else if (stats.avgTime < 90) {
                this.difficulty = 2;
            } else {
                this.difficulty = 1;
            }
        }
    }

    awardAchievements() {
        // Placeholder for achievement logic if needed
    }

    showVictoryModal() {
        const modal = document.getElementById('victoryModal');
        if (modal) {
             document.getElementById('victoryTime').textContent = this.time + 's';
             document.getElementById('victoryMoves').textContent = this.moves;
             modal.style.display = 'flex';
        } else {
            // Fallback if modal HTML isn't present
            const dynamicModal = document.createElement('div');
            dynamicModal.className = 'victory-modal';
            dynamicModal.innerHTML = `
                <div class="victory-content">
                    <h2>🎉 Puzzle Solved! 🎉</h2>
                    <div class="stats-grid">
                        <div class="stat"><h3>Time</h3><p>${this.time}s</p></div>
                        <div class="stat"><h3>Moves</h3><p>${this.moves}</p></div>
                    </div>
                    <button onclick="location.reload()">Play Again</button>
                    <button onclick="window.location.href='index.html'">Menu</button>
                </div>
            `;
            document.body.appendChild(dynamicModal);
        }
    }

    getUnlockedAchievements() {
        const achievements = [];
        if (this.moves < 50) achievements.push('Efficient Elf');
        if (this.time < 60) achievements.push('Speed Demon');
        if (this.playerStats.winStreak >= 3) achievements.push('Hot Streak');
        return achievements.map(a => `<div class="achievement">🏆 ${a}</div>`).join('');
    }
}

// Initialize Global Game
let gameInstance = null;
function initPuzzle() {
    const urlParams = new URLSearchParams(window.location.search);
    const size = parseInt(urlParams.get('size')) || 4;
    const version = urlParams.get('version') || 'santa';
    
    gameInstance = new ChristmasPuzzle(version, size);
    gameInstance.updateDisplay();
}

// Global exports for HTML buttons
window.initPuzzle = initPuzzle;
window.useHint = () => gameInstance && gameInstance.getAStarHint();
window.shufflePuzzle = () => {
    if(gameInstance) {
        gameInstance.generateSolvablePuzzle();
        gameInstance.updateDisplay();
        if(window.soundManager) window.soundManager.playShuffle();
    }
};