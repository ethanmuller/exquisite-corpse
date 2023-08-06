const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const { mkdirpSync } = require('mkdirp')
const ba64 = require('ba64')
const port = 3000;
const { getGame, gameNextState, createGame } = require('./game-manager.cjs')
const fs = require('fs')
const im = require('imagemagick')

app.use(cors())

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/exquisite-corpse/img', express.static('corpses'))

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
  const game = getGame(req.params.id)
  if (game) {
    res.json(game)
  } else {
    res.sendStatus(404)
  }
});

app.post('/exquisite-corpse/api/new', (req, res) => {
  const game = createGame()
  res.json(game)
});

app.post('/exquisite-corpse/api/:id', (req, res) => {
  const location = `corpses/${req.params.id}/`
  mkdirpSync(location)
  ba64.writeImageSync(`${location}/${req.body.part}`, req.body.base64image)
  const game = gameNextState(req.params.id)

  if (game.gameState >= 3) {
    console.log('game finished. generating full.png')
    im.convert([`${location}/head.png`, `${location}/body.png`, `${location}/feet.png`, '-append', `${location}/full.png`], (err, stdout) => {
      if (err) throw err;
    })
  }

  res.json(game)
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
