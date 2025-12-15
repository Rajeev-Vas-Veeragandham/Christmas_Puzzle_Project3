// frontend/js/main.js
// Main JavaScript file for the application

console.log('🎄 Christmas Puzzle - Main Application Loaded');

// Global application state
const AppState = {
    currentUser: null,
    currentTheme: 'santa',
    boardSize: 4,
    difficulty: 2.0,
    musicEnabled: true,
    selectedVersion: 'santa'
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎅 Initializing Christmas Puzzle...');
    
    // Load user state
    loadUserState();
    
    // Initialize components
    initializeSnowflakes();
    initializeEventListeners();
    
    // Initialize Audio (if SoundManager is loaded)
    if (window.soundManager) window.soundManager.initialize();
    
    // Update UI
    updateUI();
    
    // Load Analytics if on dashboard
    loadAnalytics();
    
    console.log('✅ Application initialized');
});

// Load user state from localStorage
function loadUserState() {
    // Load user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    // Load preferences
    AppState.currentTheme = localStorage.getItem('theme') || 'santa';
    AppState.boardSize = parseInt(localStorage.getItem('boardSize') || '4');
    AppState.difficulty = parseFloat(localStorage.getItem('difficulty') || '2.0');
    AppState.musicEnabled = localStorage.getItem('soundEnabled') !== 'false';
    AppState.selectedVersion = localStorage.getItem('selectedVersion') || 'santa';
    
    // Apply theme
    applyTheme(AppState.currentTheme);
}

// Create snowflake animation
function initializeSnowflakes() {
    const container = document.getElementById('snowContainer');
    if (!container) return;
    
    // Clear existing snowflakes
    container.innerHTML = '';
    
    // Create new snowflakes
    for (let i = 0; i < 80; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.width = Math.random() * 8 + 4 + 'px';
        flake.style.height = flake.style.width;
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDuration = Math.random() * 8 + 4 + 's';
        flake.style.animationDelay = Math.random() * 3 + 's';
        flake.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(flake);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = AppState.currentTheme;
        themeSelect.addEventListener('change', function(e) {
            AppState.currentTheme = e.target.value;
            localStorage.setItem('theme', AppState.currentTheme);
            applyTheme(AppState.currentTheme);
            playSound('click');
        });
    }
    
    // Board size selector
    const boardSizeSelect = document.getElementById('boardSize');
    if (boardSizeSelect) {
        boardSizeSelect.value = AppState.boardSize;
        boardSizeSelect.addEventListener('change', function(e) {
            AppState.boardSize = parseInt(e.target.value);
            localStorage.setItem('boardSize', AppState.boardSize);
            playSound('click');
        });
    }
    
    // Difficulty slider
    const difficultySlider = document.getElementById('difficulty');
    const diffValueDisplay = document.getElementById('diffValue');
    
    if (difficultySlider && diffValueDisplay) {
        difficultySlider.value = AppState.difficulty;
        diffValueDisplay.textContent = AppState.difficulty.toFixed(1);
        
        difficultySlider.addEventListener('input', function(e) {
            AppState.difficulty = parseFloat(e.target.value);
            diffValueDisplay.textContent = AppState.difficulty.toFixed(1);
            localStorage.setItem('difficulty', AppState.difficulty);
        });
    }
    
    // Version cards selection
    const versionCards = document.querySelectorAll('.version-card');
    versionCards.forEach(card => {
        card.addEventListener('click', function() {
            const version = this.dataset.version || 'santa';
            AppState.selectedVersion = version;
            localStorage.setItem('selectedVersion', version);
            
            // Visual feedback
            versionCards.forEach(c => c.style.borderColor = 'transparent');
            this.style.borderColor = 'var(--christmas-gold)';
            
            playSound('click');
        });
    });
    
    // Add data-version attributes to version cards
    document.querySelectorAll('.version-card').forEach((card, index) => {
        const versions = ['santa', 'reindeer', 'elf'];
        if (index < versions.length) {
            card.dataset.version = versions[index];
        }
    });
}

// Update UI based on state
function updateUI() {
    // Update theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = AppState.currentTheme;
    
    // Update board size selector
    const boardSizeSelect = document.getElementById('boardSize');
    if (boardSizeSelect) boardSizeSelect.value = AppState.boardSize;
    
    // Update difficulty display
    const difficultySlider = document.getElementById('difficulty');
    const diffValueDisplay = document.getElementById('diffValue');
    
    if (difficultySlider && diffValueDisplay) {
        difficultySlider.value = AppState.difficulty;
        diffValueDisplay.textContent = AppState.difficulty.toFixed(1);
    }
    
    // Update auth UI
    updateAuthUI();
}

// Update authentication UI
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;
    
    if (AppState.currentUser) {
        const firstLetter = AppState.currentUser.username.charAt(0).toUpperCase();
        authSection.innerHTML = `
            <div class="auth-user" style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.1);border-radius:20px;border:2px solid rgba(255,215,0,0.3);">
                <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ff6b6b);display:flex;align-items:center;justify-content:center;font-weight:bold;">
                    ${firstLetter}
                </div>
                <div>
                    <div style="font-weight:600;color:white;">${AppState.currentUser.username}</div>
                    <div style="color:#ffd700;font-size:0.9rem;">${AppState.currentUser.xp_points || 100} XP</div>
                </div>
                <button onclick="logout()" style="background:transparent;border:1px solid #ff6b6b;color:#ff6b6b;border-radius:50%;width:30px;height:30px;cursor:pointer;">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <button class="auth-btn" onclick="showAuthModal()" style="background:linear-gradient(135deg,#d42426,#a00);color:white;border:none;padding:12px 25px;border-radius:25px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.3s;box-shadow:0 4px 15px rgba(212,36,38,0.3);">
                <i class="fas fa-user"></i> Login / Register
            </button>
        `;
    }
}

// Apply theme to page
function applyTheme(themeName) {
    AppState.currentTheme = themeName;
    
    const themes = {
        'santa': 'linear-gradient(rgba(0, 20, 40, 0.9), rgba(0, 10, 30, 0.9))',
        'reindeer': 'linear-gradient(rgba(0, 50, 100, 0.8), rgba(0, 100, 50, 0.8))',
        'candy': 'linear-gradient(rgba(255, 105, 180, 0.8), rgba(255, 20, 147, 0.8))',
        'cozy': 'linear-gradient(rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.8))',
        'northern': 'linear-gradient(rgba(0, 20, 40, 0.9), rgba(0, 10, 30, 0.9))',
        'frost': 'linear-gradient(rgba(135, 206, 235, 0.8), rgba(176, 224, 230, 0.8))'
    };
    
    document.body.style.background = themes[themeName] || themes['northern'];
}

// Start game with selected version
function startGame(version) {
    AppState.selectedVersion = version;
    
    // Save preferences
    localStorage.setItem('gameVersion', version);
    localStorage.setItem('gameSize', AppState.boardSize);
    localStorage.setItem('gameDifficulty', AppState.difficulty);
    localStorage.setItem('theme', AppState.currentTheme);
    localStorage.setItem('selectedVersion', version);
    
    // Play sound
    playSound('click');
    
    // Redirect to game page
    window.location.href = `puzzle.html?version=${version}&size=${AppState.boardSize}`;
}

// Start custom game with current settings
function startCustomGame() {
    startGame(AppState.selectedVersion);
}

// Toggle music
function toggleMusic() {
    if(window.soundManager) {
        const isPlaying = window.soundManager.toggleMusic();
        if (isPlaying) {
            showNotification('Music turned ON', 'success');
        } else {
            showNotification('Music turned OFF', 'info');
        }
    }
}

// Play sound effect wrapper
function playSound(soundType) {
    if(window.soundManager) {
        window.soundManager.playSound(soundType);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border-left: 4px solid ${type === 'success' ? '#16a34a' : '#2563eb'};
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Show authentication modal
function showAuthModal() {
    playSound('click');
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a);
                   padding: 40px;
                   border-radius: 20px;
                   width: 90%;
                   max-width: 400px;
                   border: 3px solid var(--christmas-gold);">
            <h2 style="color: var(--christmas-gold); text-align: center; margin-bottom: 30px;">
                <i class="fas fa-user"></i> Authentication
            </h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <input type="text" id="authUsername" placeholder="Username" 
                       style="padding: 15px; background: rgba(255,255,255,0.05); 
                              border: 2px solid rgba(255,255,255,0.2); border-radius: 10px; color: white;"
                       value="Rajeev">
                <input type="password" id="authPassword" placeholder="Password" 
                       style="padding: 15px; background: rgba(255,255,255,0.05); 
                              border: 2px solid rgba(255,255,255,0.2); border-radius: 10px; color: white;"
                       value="rajeev123">
                <button onclick="handleLogin()" 
                        style="background: linear-gradient(135deg, var(--christmas-gold), #ffaa00); 
                               color: black; padding: 15px; border-radius: 10px; font-weight: bold; 
                               border: none; cursor: pointer; margin-top: 10px;">
                    Sign In
                </button>
                <div style="text-align: center; color: #94a3b8; font-size: 0.9rem;">
                   Demo Accounts: Rajeev, Santa_Claus, Elf_Master
                </div>
            </div>
        </div>
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    document.body.appendChild(modal);
    
    // Focus username input
    setTimeout(() => {
        const input = document.getElementById('authUsername');
        if (input) input.focus();
    }, 100);
}

// Handle login
async function handleLogin() {
    const username = document.getElementById('authUsername').value || 'Demo_Player';
    const password = document.getElementById('authPassword').value || '';
    
    try {
        // Call your backend API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(AppState.currentUser));
            updateAuthUI();
            
            // Close modal
            const modal = document.querySelector('div[style*="position: fixed; top: 0"]');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            showNotification(`Welcome back, ${username}!`, 'success');
            playSound('success');
            
            // Reload analytics with real user data
            loadAnalytics();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error("Login error", error);
        // Fallback for demo if server is offline
        AppState.currentUser = {
            id: 1,
            username: username,
            xp_points: 500,
            mana: 100
        };
        localStorage.setItem('user', JSON.stringify(AppState.currentUser));
        updateAuthUI();
        
        const modal = document.querySelector('div[style*="position: fixed; top: 0"]');
        if (modal) document.body.removeChild(modal);
        
        showNotification('Demo Login Active (Offline)', 'info');
    }
}

// Logout function
function logout() {
    AppState.currentUser = null;
    localStorage.removeItem('user');
    updateAuthUI();
    showNotification('Logged out successfully', 'info');
    // Clear analytics view
    document.getElementById('analyticsContent').innerHTML = '<p>Please log in to view analytics</p>';
}

// Load analytics data
async function loadAnalytics() {
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    try {
        // Try to fetch from backend using real ID
        const userId = AppState.currentUser ? AppState.currentUser.id : 1;
        const response = await fetch(`/api/analytics/${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateAnalyticsDisplay(data);
                return;
            }
        }
    } catch (error) {
        console.log('Using offline analytics data');
    }
    
    // Fallback analytics
    const fallbackAnalytics = {
        statistics: {
            winRate: 65,
            avgTime: 85,
            avgMoves: 52,
            bestTime: 42,
            streak: 3
        },
        recommendation: {
            tip: "You're improving! Try 5×5 puzzles next."
        }
    };
    
    updateAnalyticsDisplay(fallbackAnalytics);
}

// Update analytics display
function updateAnalyticsDisplay(data) {
    const analyticsContent = document.getElementById('analyticsContent');
    if (!analyticsContent) return;
    
    const stats = data.statistics || {};
    
    analyticsContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 0.9rem;">Win Rate</div>
                <div style="color: var(--christmas-gold); font-size: 1.5rem; font-weight: bold;">
                    ${stats.winRate || 65}%
                </div>
            </div>
            <div style="background: rgba(59,130,246,0.1); padding: 15px; border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 0.9rem;">Avg Time</div>
                <div style="color: #3b82f6; font-size: 1.5rem; font-weight: bold;">
                    ${stats.avg_time || stats.avgTime || 85}s
                </div>
            </div>
            <div style="background: rgba(34,197,94,0.1); padding: 15px; border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 0.9rem;">Avg Moves</div>
                <div style="color: #22c55e; font-size: 1.5rem; font-weight: bold;">
                    ${stats.avg_moves || stats.avgMoves || 52}
                </div>
            </div>
            <div style="background: rgba(139,92,246,0.1); padding: 15px; border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 0.9rem;">Best Time</div>
                <div style="color: #8b5cf6; font-size: 1.5rem; font-weight: bold;">
                    ${stats.best_time || stats.bestTime || 42}s
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: rgba(56,189,248,0.1); border-radius: 10px; border-left: 4px solid #38bdf8;">
            <div style="color: #94a3b8; font-size: 0.9rem;">AI Prediction</div>
            <div style="color: white; margin-top: 5px;">${data.recommendation?.tip || "Try planning 3 moves ahead for better efficiency"}</div>
        </div>
    `;
}

// Open leaderboard
function openLeaderboard() {
    playSound('click');
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center;
        align-items: center; z-index: 2000; backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: linear-gradient(45deg, #1e293b, #0f172a); padding: 30px; border-radius: 20px; width: 90%; max-width: 800px; border: 3px solid var(--christmas-gold);">
            <button class="modal-close" style="float:right; background:none; border:none; color:gold; font-size:1.5rem; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h2 style="color: var(--christmas-gold); text-align: center; margin-bottom: 30px;">
                <i class="fas fa-crown"></i> Global Leaderboard
            </h2>
            <div id="leaderboardContent">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                    <thead>
                        <tr style="background: rgba(255,215,0,0.2);">
                            <th style="padding: 15px; text-align: left;">Rank</th>
                            <th style="padding: 15px; text-align: left;">Player</th>
                            <th style="padding: 15px; text-align: left;">XP</th>
                            <th style="padding: 15px; text-align: left;">Best Time</th>
                            <th style="padding: 15px; text-align: left;">Wins</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboardBody">
                        <tr><td colspan="5" style="text-align:center; padding:20px;">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load leaderboard data
    loadLeaderboardData();
}

// Load leaderboard data
async function loadLeaderboardData() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (data.success) {
            populateLeaderboard(data.leaderboard);
            return;
        }
    } catch (error) {
        console.log('Using offline leaderboard data');
    }
    
    // Fallback data
    const fallbackData = [
        { username: 'Santa_Claus', xp_points: 5000, best_time: 42, wins: 25 },
        { username: 'Elf_Master', xp_points: 4500, best_time: 45, wins: 22 },
        { username: 'Rudolph', xp_points: 3200, best_time: 48, wins: 18 },
        { username: 'Snow_Queen', xp_points: 2800, best_time: 52, wins: 15 },
        { username: 'Frosty', xp_points: 1900, best_time: 55, wins: 12 }
    ];
    
    populateLeaderboard(fallbackData);
}

// Populate leaderboard
function populateLeaderboard(leaderboard) {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    leaderboard.forEach((player, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        row.innerHTML = `
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold; color: ${index < 3 ? 'var(--christmas-gold)' : 'white'}">
                        ${index + 1}
                    </span>
                    ${index < 3 ? medals[index] : ''}
                </div>
            </td>
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 35px; height: 35px; border-radius: 50%; 
                                background: linear-gradient(45deg, var(--christmas-gold), var(--christmas-red)); 
                                display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${player.username.charAt(0)}
                    </div>
                    ${player.username}
                </div>
            </td>
            <td style="padding: 15px; font-weight: bold; color: var(--christmas-gold);">
                ${player.xp_points}
            </td>
            <td style="padding: 15px;">
                ${player.best_time || '--'}s
            </td>
            <td style="padding: 15px;">
                ${player.wins || 0}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show development journal
function showDevJournal() {
    alert('📘 Development Journal - Graduate Requirement\n\nComplete document detailing:\n\n✓ Database design decisions\n✓ Algorithm implementations\n✓ Predictive analytics system\n✓ Magic power-up mechanics\n✓ Interactive story engine\n✓ Sound system integration\n✓ Technical challenges overcome\n\nLocated in: docs/development-journal.md');
}

// Show features list
function showFeatures() {
    alert('✅ All 6 Graduate Features Implemented:\n\n1. 🧠 Predictive Analytics & Behavior Analysis\n2. ⚡ Magic Power-up System\n3. 📖 Interactive Christmas Story\n4. 👥 Social Features & Leaderboards\n5. 🎵 Sound & Music System\n6. 📊 MySQL Database Integration\n\nPlus: Three unique puzzle versions, responsive design, and animations.');
}

// Make functions available globally
window.startGame = startGame;
window.startCustomGame = startCustomGame;
window.toggleMusic = toggleMusic;
window.showAuthModal = showAuthModal;
window.handleLogin = handleLogin;
window.logout = logout;
window.openLeaderboard = openLeaderboard;
window.showDevJournal = showDevJournal;
window.showFeatures = showFeatures;
window.loadAnalytics = loadAnalytics;