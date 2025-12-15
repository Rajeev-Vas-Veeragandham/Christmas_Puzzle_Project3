// js/powerups-enhanced.js
class PowerUpSystem {
    constructor() {
        this.powerUps = {
            hint: {
                name: "Elf's Wisdom",
                cost: 25,
                effect: "Highlights the optimal next move",
                duration: 5,
                cooldown: 30
            },
            timeFreeze: {
                name: "Frozen Moment",
                cost: 40,
                effect: "Freezes the timer for 10 seconds",
                duration: 10,
                cooldown: 60
            },
            shuffle: {
                name: "Reindeer Shuffle",
                cost: 30,
                effect: "Reshuffles the puzzle while keeping it solvable",
                duration: 0,
                cooldown: 45
            },
            solvePiece: {
                name: "Santa's Magic",
                cost: 50,
                effect: "Instantly solves one misplaced tile",
                duration: 0,
                cooldown: 90
            },
            vision: {
                name: "Crystal Ball",
                cost: 35,
                effect: "Shows the correct position of all tiles",
                duration: 8,
                cooldown: 45
            }
        };
        
        this.activePowerUps = new Map();
        this.cooldowns = new Map();
    }
    
    activatePowerUp(powerUpName, gameInstance) {
        if (!this.canUsePowerUp(powerUpName)) {
            return false;
        }
        
        const powerUp = this.powerUps[powerUpName];
        
        // Deduct mana
        if (gameInstance.mana < powerUp.cost) {
            alert(`Not enough mana! Need ${powerUp.cost}, have ${gameInstance.mana}`);
            return false;
        }
        
        gameInstance.mana -= powerUp.cost;
        
        // Apply effect
        this.applyEffect(powerUpName, gameInstance);
        
        // Set cooldown
        this.cooldowns.set(powerUpName, Date.now() + powerUp.cooldown * 1000);
        
        // Visual feedback
        this.showPowerUpAnimation(powerUpName);
        
        return true;
    }
    
    applyEffect(powerUpName, game) {
        switch(powerUpName) {
            case 'hint':
                const hintTile = game.getAStarHint();
                if (hintTile !== null) {
                    this.highlightTile(hintTile);
                }
                break;
                
            case 'timeFreeze':
                clearInterval(game.timer);
                setTimeout(() => {
                    game.startTimer();
                }, 10000);
                break;
                
            case 'shuffle':
                game.generateSolvablePuzzle();
                game.updateDisplay();
                break;
                
            case 'solvePiece':
                // Find the most misplaced tile and solve it
                const misplaced = this.findMostMisplacedTile(game.tiles, game.size);
                if (misplaced !== -1) {
                    const emptyIndex = game.tiles.indexOf('');
                    [game.tiles[misplaced], game.tiles[emptyIndex]] = 
                    [game.tiles[emptyIndex], game.tiles[misplaced]];
                    game.updateDisplay();
                }
                break;
                
            case 'vision':
                // Show correct positions
                game.tiles.forEach((value, index) => {
                    if (value !== '') {
                        const tile = document.getElementsByClassName('tile')[index];
                        if (tile) {
                            const correctPos = value - 1;
                            const isCorrect = index === correctPos;
                            tile.style.border = isCorrect ? '3px solid #00ff00' : '3px solid #ff0000';
                        }
                    }
                });
                
                setTimeout(() => {
                    game.tiles.forEach((value, index) => {
                        const tile = document.getElementsByClassName('tile')[index];
                        if (tile) {
                            tile.style.border = '';
                        }
                    });
                }, 8000);
                break;
        }
    }
}