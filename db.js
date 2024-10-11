const { Pool } = require('pg'); // Import the Pool from pg

const pool = new Pool({
    host: 'dpg-cs4c2n5svqrc73892j00-a.oregon-postgres.render.com', // Use the external database URL
    user: 'wellplate_user',
    password: 'kTiVfaGwEffR2s56k7O2GUHnC1WpsxC1', 
    database: 'wellplate',
    port: 5432, 
    ssl: {
        rejectUnauthorized: false // Set this to false if you're connecting to a hosted service that requires SSL
    }
});

// Connect to the PostgreSQL database
pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the PostgreSQL database.');
});

// Export the pool for use in other modules
module.exports = pool;
