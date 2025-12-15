const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Required for WebSocket integration
const WebSocket = require('ws'); // Added WebSocket library
const { pool, testConnection, initializeDatabase } = require('./db');

const app = express();
const server = http.createServer(app); // Wrap express in HTTP server
const wss = new WebSocket.Server({ server }); // Attach WebSocket server

// Middleware
app.use(cors());
app.use(express.json());
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Store connected clients for real-time features
const clients = new Map();

// ==================== WEBSOCKET HANDLING ====================
wss.on('connection', (ws) => {
    console.log('🔌 New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'auth':
                    // Store connection with userId
                    if (data.userId) {
                        clients.set(data.userId, ws);
                        ws.userId = data.userId;
                        broadcastOnlineUsers();
                    }
                    break;

                case 'get_online_users':
                    broadcastOnlineUsers();
                    break;

                case 'send_challenge':
                    const opponentWs = clients.get(data.opponentId);
                    if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
                        opponentWs.send(JSON.stringify({
                            type: 'challenge_received',
                            challengerName: 'Player ' + (ws.userId || '?'),
                            challengeId: data.challengeId
                        }));
                    }
                    break;
            }
        } catch (e) {
            console.error('WebSocket message error:', e);
        }
    });

    ws.on('close', () => {
        if (ws.userId) {
            clients.delete(ws.userId);
            broadcastOnlineUsers();
        }
        console.log('🔌 Client disconnected');
    });
});

function broadcastOnlineUsers() {
    const onlineUserIds = Array.from(clients.keys());
    const message = JSON.stringify({
        type: 'online_users',
        users: onlineUserIds.map(id => ({ id, status: 'online' }))
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Initialize database on server start
async function initializeServer() {
    console.log('🚀 Starting Christmas Puzzle Server...');
    const connected = await testConnection();
    if (!connected) {
        console.log('⚠️ Running in offline mode - database not available');
        return;
    }
    await initializeDatabase();
    console.log('✅ Server initialization complete');
}

initializeServer();

// ==================== API ENDPOINTS ====================

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS result');
        res.json({ success: true, message: 'Server is running', database: 'Connected' });
    } catch (error) {
        res.json({ success: true, message: 'Server is running (offline)', database: 'Offline' });
    }
});

// -- LOGIN ENDPOINTS LOGIC--
app.post('/api/login', async (req, res) => {
    try {
        const { username } = req.body;
        const demoUsername = username || 'Demo_Player';
        
        // Check/Create User Logic
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?', [demoUsername]
        );
        
        let user;
        if (users.length === 0) {
            const [result] = await pool.execute(
                `INSERT INTO users (username, email, password_hash, xp_points, mana, current_chapter) 
                 VALUES (?, ?, 'demo_hash', 100, 100, 1)`,
                [demoUsername, `${demoUsername}@demo.com`]
            );
            user = { id: result.insertId, username: demoUsername, xp_points: 100, mana: 100, current_chapter: 1 };
        } else {
            user = users[0];
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: true, user: { id: 1, username: req.body.username || 'Demo', xp_points: 100, mana: 100, current_chapter: 1 }, offline: true });
    }
});

// -- GAME SAVE ENDPOINT --
app.post('/api/save-game', async (req, res) => {
    try {
        const { moves, time, difficulty, isWin, tiles, size, version, userId = 1 } = req.body;
        await pool.execute(
            `INSERT INTO game_sessions (user_id, version, difficulty, moves, time_seconds, outcome, tiles_state, board_size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, version || 'santa', difficulty || 1, moves, time, isWin ? 'win' : 'loss', JSON.stringify(tiles), size || 4]
        );
        
        if (isWin) {
            const xpGain = Math.max(10, 100 - time);
            await pool.execute('UPDATE users SET xp_points = xp_points + ?, mana = LEAST(100, mana + 20) WHERE id = ?', [xpGain, userId]);
        }
        res.json({ success: true, message: 'Game saved' });
    } catch (error) {
        res.json({ success: true, message: 'Saved locally', offline: true });
    }
});

// -- ANALYTICS ENDPOINT --
app.get('/api/analytics/:userId', async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT COUNT(*) as total_games, SUM(CASE WHEN outcome = 'win' THEN 1 ELSE 0 END) as wins,
            AVG(time_seconds) as avg_time, AVG(moves) as avg_moves, MIN(CASE WHEN outcome = 'win' THEN time_seconds END) as best_time
            FROM game_sessions WHERE user_id = ?`, [req.params.userId || 1]);
        
        const data = stats[0] || {};
        res.json({ 
            success: true, 
            statistics: {
                total_games: data.total_games || 0,
                wins: data.wins || 0,
                avg_time: Math.round(data.avg_time || 0),
                avg_moves: Math.round(data.avg_moves || 0),
                best_time: data.best_time || 0,
                winRate: data.total_games ? Math.round((data.wins/data.total_games)*100) : 0
            },
            recommendation: { tip: data.avg_time > 120 ? 'Focus on efficiency' : 'Increase difficulty!' }
        });
    } catch (error) {
        res.json({ success: true, statistics: { winRate: 0, avgTime: 0 }, offline: true });
    }
});

// -- LEADERBOARD ENDPOINT --
app.get('/api/leaderboard', async (req, res) => {
    try {
        const [leaderboard] = await pool.execute(`
            SELECT username, xp_points, COUNT(DISTINCT g.id) as games_played,
            SUM(CASE WHEN g.outcome = 'win' THEN 1 ELSE 0 END) as wins
            FROM users u LEFT JOIN game_sessions g ON u.id = g.user_id
            GROUP BY u.id ORDER BY xp_points DESC LIMIT 10
        `);
        res.json({ success: true, leaderboard });
    } catch (error) {
        res.json({ success: true, leaderboard: [], offline: true });
    }
});

// -- FRIENDS ENDPOINT --
app.get('/api/friends/:userId', async (req, res) => {
    try {
        const [friends] = await pool.execute(
            'SELECT id, username, xp_points FROM users WHERE id != ? ORDER BY xp_points DESC LIMIT 5',
            [req.params.userId]
        );
        res.json({ success: true, friends });
    } catch (e) {
        res.json({ success: true, friends: [], offline: true });
    }
});

// Serve frontend pages
app.get('*', (req, res) => {
    let filePath = path.join(__dirname, '../frontend', req.path === '/' ? 'index.html' : req.path);
    if (!path.extname(filePath)) filePath += '.html';
    
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🎄 Christmas Puzzle Server running on port ${PORT}`);
    console.log(`📡 WebSocket Server ready`);
});