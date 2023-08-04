const fs = require('fs')
const { mkdirpSync } = require('mkdirp')
const { rimrafSync } = require('rimraf')


function resetGames() {
    rimrafSync('corpses')
    fs.writeFileSync('games.json', '[]', { encoding: 'utf8', })
}

function createGame() {
  const file = fs.readFileSync('games.json')
  const games = JSON.parse(file)
  const now = Date.now()
  mkdirpSync(`corpses/${now}`)
  const game = {
    id: now,
    gameState: 0
  }
  games.push(game)
  fs.writeFileSync('games.json', JSON.stringify(games, null, ' '), { encoding: 'utf8', })
  return game
}

function getGame(id) {
  const file = fs.readFileSync('games.json')
  const games = JSON.parse(file)
  const game = games.find(g => g.id == id)
  return game
}

function getNextStateFromState(state) {
  return state + 1
}

function gameNextState(id) {
  const file = fs.readFileSync('games.json')
  const games = JSON.parse(file)
  const game = games.find(g => g.id == id)
  if (game.gameState < 3) {
    game.gameState = getNextStateFromState(game.gameState)
    fs.writeFileSync('games.json', JSON.stringify(games, null, ' '), { encoding: 'utf8', })
  }
  return game
}

module.exports = {
  createGame,
  resetGames,
  getGame,
  gameNextState,
}
