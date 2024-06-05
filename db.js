const { Pool } = require('pg');

// Set up your database connection details
const pool = new Pool({
  user: 'aaronweiss',
  host: 'localhost',
  database: 'ecommerce',
  password: 'password',
  port: 5432
});

// Export the pool to be reused elsewhere in the project
module.exports = {
  pool
};