const mysql = require('mysql2');

// WAMP Server MySQL Configuration - Direct connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // WAMP default is empty password
    database: 'christmas_grad_db',
    port: 3306,  // Default MySQL port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}).promise();

// Test connection function
async function testConnection() {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS result');
        console.log('✅ Database connection successful:', rows[0].result);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Initialize database tables if they don't exist
async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database...');
        
        // Create database if not exists
        await pool.execute('CREATE DATABASE IF NOT EXISTS christmas_grad_db');
        await pool.execute('USE christmas_grad_db');
        
        // Users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                xp_points INT DEFAULT 100,
                mana INT DEFAULT 100,
                current_chapter INT DEFAULT 1,
                profile_picture VARCHAR(255) DEFAULT 'default.jpg',
                streak_days INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Game sessions table in sql
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                version VARCHAR(20) NOT NULL,
                difficulty DECIMAL(3,1) DEFAULT 1.0,
                moves INT DEFAULT 0,
                time_seconds INT DEFAULT 0,
                outcome VARCHAR(20) DEFAULT 'loss',
                tiles_state JSON,
                board_size INT DEFAULT 4,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add Rajeev user if user does not exist
        await addRajeevUser();
        
        console.log('✅ Database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

// Add Rajeev user
async function addRajeevUser() {
    try {
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            ['Rajeev']
        );
        
        if (existing.length === 0) {
            await pool.execute(`
                INSERT INTO users (username, email, password_hash, xp_points, mana, current_chapter) 
                VALUES (?, ?, ?, 500, 100, 1)
            `, ['Rajeev', 'rajeev@example.com', 'rajeev123_encrypted', 500]);
            console.log('✅ User Rajeev added to database');
        } else {
            console.log('✅ User Rajeev already exists');
        }
    } catch (error) {
        console.error('❌ Error adding Rajeev user:', error);
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};