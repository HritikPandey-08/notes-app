const pgp = require('pg-promise')();
const connectionString = 'postgres://postgres:1234@localhost:5432/notes';
const db = pgp(connectionString);

module.exports = db;

// Function to connect to PostgreSQL
const connectToPostgres = async () => {
    try {
      // Use a simple query to check the connection
      await db.any('SELECT 1');
      console.log('Connected to PostgreSQL');
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
    }
  };
  
  // Export the connectToPostgres function
  module.exports.connectToPostgres = connectToPostgres; // Exporting as a property of the module.exports object

