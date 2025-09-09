const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend communication

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
   
  })
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Bootcamp Registration API is running...');
});

app.use('/api/register', registrationRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});