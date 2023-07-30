const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const { mkdirpSync } = require('mkdirp')
const ba64 = require('ba64')
const port = 3000;
const { getGame } = require('./game-manager.cjs')
const fs = require('fs')

app.use(cors())

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/exquisite-corpse', (req, res) => {
  // Handle the uploaded file
  res.sendFile(__dirname + '/dist/index.html')
});

app.get('/exquisite-corpse/api/all', (req, res) => {
  const file = fs.readFileSync('games.json')
    const games = JSON.parse(file)
  res.json(games)
})

app.get('/exquisite-corpse/api/:id', (req, res) => {
  // Handle the uploaded file
  const game = getGame(req.params.id)
  res.json(game)
});

// Set up a route for file uploads
app.post('/exquisite-corpse/upload', (req, res) => {
  // Handle the uploaded file
  mkdirpSync('uploads')
  ba64.writeImageSync('uploads/' + Date.now(), req.body.base64image)
  res.json({ message: 'File uploaded successfully!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
