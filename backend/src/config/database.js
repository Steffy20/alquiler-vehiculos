const { Pool } = require("pg");


const connection = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };

const pool = new Pool({
    ...connection,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});


module.exports = pool;
