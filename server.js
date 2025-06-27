require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3545;

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Book API routes
app.use('/api/books', bookRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the Book Management API!');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app; 