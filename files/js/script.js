console.log("connected");

var currentLevel = 0;
var JSONdata;

// Zatial tunak citame ten JSON
fetch('./files/data/easy.json')
    .then(response => {
    return response.json();
  }).then(data => {    
    JSONdata = data;
  }).catch(err => {
    console.log("JSON error " + err);
});

const mainMenu = document.getElementById('main-menu');
const gameBoard = document.getElementById('game-board');
const easyButton = document.getElementById('easy');
const hardButton = document.getElementById('hard');
const quitButton = document.getElementById('quit');
var difficulty = 'easy';
var gameOver = false;

function mainGameLoop(){
    showGameBoard();
    generateBoard();

}

function generateBoard() {
    let numberOfSquares = difficulty === 'easy' ? 6 : 12;

    gameBoard.style.gridTemplateColumns = `repeat(${numberOfSquares}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${numberOfSquares}, 1fr)`;
    
    // Fetch data(mine positions) from JSON
    // Generate the squares according to JSON rules
    generateTiles(numberOfSquares);
}

function generateTiles(numberOfSquares) {
    for(let x = 0; x < numberOfSquares; x++) {
        for(let y = 0; y < numberOfSquares; y++){
            const tile = new Tile(x, y);
            gameBoard.appendChild(tile);
            console.log(tile.id);
        }
    }
}

class Tile {
    constructor(x, y) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.style.width = `95%`;
        tile.style.height = `95%`;
        return tile;
    }
}

function determineTileType(tile, x, y) {
    const tileCoords = [x, y];
    const bombCoords = JSONdata[currentLevel].bombCoords;
    tile.innerHTML = "0";
    console.log("Json coords: " + bombCoords);
}

// Show the main menu and hide the game board
function showMainMenu() {
    mainMenu.style.display = 'flex';
    gameBoard.style.display = 'none';
  }
  
  // Show the game board and hide the main menu
  function showGameBoard() {
    mainMenu.style.display = 'none';
    gameBoard.style.display = 'grid';
  }

easyButton.addEventListener('click', function() {
    difficulty = 'easy';
    mainGameLoop();
});

hardButton.addEventListener('click', function() {
    difficulty = 'hard';
    mainGameLoop();
});

quitButton.addEventListener('click', function() {
    gameBoard.innerHTML = '';
    showMainMenu();
});

