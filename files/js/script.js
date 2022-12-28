console.log("connected");

// ----- PWA -----
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
        .register("files/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
// -----    -----

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
            determineTileType(tile, x, y);
            const tileCounter = addTileCounter(tile);
            addTileEventListener(tile, tileCounter);
            gameBoard.appendChild(tile);
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
    const containsCoords = bombCoords.some(coord => coord[0] === tileCoords[0] && coord[1] === tileCoords[1]);

    if (containsCoords) {
        tile.id = "Bomb"
    } else {
        tile.id = "Empty";
    }

    tile.style.backgroundImage = "url(files/art/Full.png)";
    tile.style.backgroundSize = 'cover';
}

function addTileEventListener(tile, tileCounter){
    tile.addEventListener("click", function(){
        revealTile(tile, tileCounter);
    });
}

function revealTile(tile, tileCounter){
    // TODO ak dragneme na tile odhalovac bomb, tak bombu zneskodnime
    // TODO ak dragneme odhalovac empty tilov na bombu tak bomba jebne a prehrali sme

    if(tile.id === "Bomb"){
        tile.style.backgroundImage = "url(files/art/MineEx.png)";
        tile.style.backgroundSize = 'cover';
    }else if(tile.id === "Empty"){
        tile.style.backgroundImage = "url(files/art/Empty.png)";
        tile.style.backgroundSize = 'cover';
        // TODO reveal all empty tiles within area
        // TODO calculate number of mines within 1 tile
            // TODO set tileCounter.innerHTML = "numberOfNeighboringMnes";
        
    }
}

function addTileCounter(tile) {
    const tileCounter = document.createElement("div");
    tileCounter.classList.add("tileCounter");
    tileCounter.innerHTML = "";
    tile.appendChild(tileCounter);
    return tileCounter;
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

// TODO calculate the number of bombs around each tile
    // change innerHTML to this number
 


