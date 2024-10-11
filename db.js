const { Pool } = require('pg');

// Create a new pool instance for connecting to PostgreSQL
const pool = new Pool({
    host: 'dpg-cs4cr0dsvqrc7389ggl0-a.oregon-postgres.render.com', // Use the external database URL
    user: 'wellplate_qmul_user',
    password: 'W2vTSfNah1ubU4EmusYu8xy0VO5fPjrv', 
    database: 'wellplate_qmul',
    port: 5432, 
    ssl: {
        rejectUnauthorized: false // Set this to false for hosted databases that use self-signed SSL certificates
    }
});

// Test the connection to the database
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Successfully connected to the PostgreSQL database:', res.rows);
    }
});

// Export the pool for use in other modules
module.exports = pool;
