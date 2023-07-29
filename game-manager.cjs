const fs = require('fs')
const { mkdirpSync } = require('mkdirp')

function resetGames() {
    fs.writeFileSync('games.json', '{}', { encoding: 'utf8', })
}

function createGame() {
  fs.readFile('games.json', (err, file) => {
    if (err) throw(err)
    const games = JSON.parse(file)
    const now = Date.now()
    mkdirpSync(`corpses/${now}`)
    games[now] = 'PleaseDrawHead'
    fs.writeFileSync('games.json', JSON.stringify(games, null, ' '), { encoding: 'utf8', })
  })
}

function getGame(id) {
  const file = fs.readFileSync('games.json')
  const games = JSON.parse(file)
  return games[id]
}

function editGame(id) {
}

module.exports = {
  createGame,
  editGame,
  resetGames,
  getGame,
}
