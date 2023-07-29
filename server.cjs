const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const ba64 = require('ba64')
const port = 3000;
const { getGame } = require('./game-manager.cjs')

app.use(cors())

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/exquisite-corpse', (req, res) => {
  // Handle the uploaded file
  res.sendFile(__dirname + '/dist/index.html')
});

app.get('/exquisite-corpse/:id', (req, res) => {
  // Handle the uploaded file
  const gameState = getGame(req.params.id)
  res.json({ gameState: gameState })
});

// Set up a route for file uploads
app.post('/exquisite-corpse/upload', (req, res) => {
  // Handle the uploaded file
  ba64.writeImageSync('uploads/' + Date.now(), req.body.base64image)
  res.json({ message: 'File uploaded successfully!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
