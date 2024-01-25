const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, "../client")));

// Route for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/* 
const fs = require('fs');

const filePath = '/Users/alexlareomerino/Documents/iVn_projects/pParser/src/client/snapshots/snapshot.json';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log(jsonData);
} catch (err) {
    console.error('Error:', err);
}

 */
