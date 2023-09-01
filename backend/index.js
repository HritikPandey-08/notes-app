const express = require('express');
const app = express();
const cors = require('cors');
const port = 5000;

const { connectToPostgres } = require('./db'); // Import the connectToPostgres function

connectToPostgres(); // Connect to PostgreSQL
app.use(express.json());
// Enable CORS for all routes
app.use(cors());
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth',authRoutes)
app.use('/api/notes',notesRoutes)


app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
  });
