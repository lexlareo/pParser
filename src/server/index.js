const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 35729;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
