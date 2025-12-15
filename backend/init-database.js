// init-database.js - Command line database setup
const { pool, initializeDatabase } = require('./db');

async function setupDatabase() {
    console.log('🛠️ Setting up Christmas Puzzle Database...');
    
    try {
        // Test connection
        console.log('Testing MySQL connection...');
        const [rows] = await pool.execute('SELECT VERSION() as version');
        console.log(`✅ Connected to MySQL ${rows[0].version}`);
        
        // Initialize database
        console.log('Creating tables and adding users...');
        const success = await initializeDatabase();
        
        if (success) {
            console.log('\n🎉 Database setup completed successfully!');
            console.log('\n📋 Database Information:');
            console.log('   Database: christmas_grad_db');
            console.log('   User: root (no password)');
            console.log('   Host: localhost:3306');
            console.log('\n👤 Created Users:');
            console.log('   - Rajeev (password: rajeev123)');
            console.log('   - Santa_Claus');
            console.log('   - Elf_Master');
            console.log('   - Rudolph');
            console.log('\n🚀 To start server: npm start');
        } else {
            console.log('❌ Database setup failed');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure WAMP MySQL is running');
        console.log('2. Check if MySQL service is started');
        console.log('3. Verify MySQL credentials in db.js');
        process.exit(1);
    }
}

setupDatabase();