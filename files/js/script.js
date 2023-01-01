console.log("connected");

// ----- PWA -----
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}
// -----    -----

var JSONdataEasy;
var JSONdataHard;
var numberOfEasyLevels;
var numberOfHardLevels;
var completedLevels = [];

// Zatial tunak citame ten JSON
fetch('./files/data/easy.json')
.then(response => {
    return response.json();
}).then(data => {
    JSONdataEasy = data;
    numberOfEasyLevels = data.length;
}).catch(err => {
    console.log("JSON error " + err);
});

fetch('./files/data/hard.json')
.then(response => {
    return response.json();
}).then(data => {
    JSONdataHard = data;
    numberOfHardLevels = data.length;
}).catch(err => {
    console.log("JSON error " + err);
});

const mainMenu = document.getElementById('main-menu');
const gameBoard = document.getElementById('game-board');
const easyButton = document.getElementById('easy');
const hardButton = document.getElementById('hard');
const quitButton = document.getElementById('quit');
const mineCoubter = document.getElementById('mine-counter');
const statusImg = document.getElementById('status');
var difficulty = 'easy';
var gameOver = false;
var currentLevel = 0;
var minesLeft = 0;

function mainGameLoop() {
    gameOver = false;
    showGameBoard();
    generateBoard();
    getMineCount();
    updateMineCounter();
    updateStatusImg();
}

function handleGameOver(){
    gameOver = true;
    updateStatusImg();
}


function updateStatusImg() {
    if(!gameOver)
        statusImg.src = "files/art/Smile.png";
    else
        statusImg.src = "files/art/Sad.png";
}

function getMineCount() {
    minesLeft = difficulty === "easy" ? JSONdataEasy[currentLevel].bombCoords.length : JSONdataHard[currentLevel].bombCoords.length;
}

function updateMineCounter() {    
    mineCoubter.innerHTML = `Mines left: ${minesLeft}`;
}

function generateBoard() {
    let numberOfSquares = difficulty === 'easy' ? 6 : 12;

    gameBoard.style.gridTemplateColumns = `repeat(${numberOfSquares}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${numberOfSquares}, 1fr)`;

    generateTiles(numberOfSquares);
    calculateBombsAround(numberOfSquares);
}

function generateTiles(numberOfSquares) {
    let n = 0;
    for (let x = 0; x < numberOfSquares; x++) {
        for (let y = 0; y < numberOfSquares; y++) {
            const tile = new Tile(x, y);
            determineTileType(tile, x, y);
            tile.setAttribute("x", y);
            tile.setAttribute("y", x);
            tile.setAttribute("ondrop", "drop(event)");
            tile.id = n;
            addTileEventListener(tile, numberOfSquares);
            gameBoard.appendChild(tile);
            n++;
        }
    }
}

class Tile {
    constructor() {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.style.width = `95%`;
        tile.style.height = `95%`;
        return tile;
    }
}

function determineTileType(tile, x, y) {
    const tileCoords = [x, y];
    const bombCoords = difficulty === 'easy' ? JSONdataEasy[currentLevel].bombCoords : JSONdataHard[currentLevel].bombCoords;
    const containsCoords = bombCoords.some(coord => coord[0] === tileCoords[0] && coord[1] === tileCoords[1]);

    if (containsCoords) {
        tile.setAttribute("bomb", 1);
    } else {
        tile.setAttribute("bomb", 0);
    }

    tile.style.backgroundImage = "url(files/art/Full.png)";
    tile.style.backgroundSize = 'cover';
}

function addTileEventListener(tile, numberOfSquares) {
    tile.addEventListener("click", function () {
        if(!gameOver)
            revealTile(tile, numberOfSquares);
    });
    tile.addEventListener('dragover', function(event) {
        event.preventDefault(); // Allow an object to be dropped on the tile
    });
}

function revealTile(tile, numberOfSquares) {
    if (tile.getAttribute("bomb") == 1 && tile.getAttribute("show") != 1) {
        tile.style.backgroundImage = "url(files/art/MineEx.png)";
        tile.style.backgroundSize = 'cover';
        tile.setAttribute("show", 1);
        handleGameOver();
    } else if (tile.getAttribute("bomb") != 1 && tile.getAttribute("show") != 1) {
        tile.style.backgroundImage = "url(files/art/Empty.png)";
        tile.style.backgroundSize = 'cover';
        tile.setAttribute("show", 1);
        if (tile.getAttribute("numberOfNeighboringMines") != 0) {
            const newContent = document.createTextNode(tile.getAttribute("numberOfNeighboringMines"));
            tile.appendChild(newContent);
        }
        findEmpty(tile, numberOfSquares);
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

easyButton.addEventListener('click', function () {
    difficulty = 'easy';
    // document.getElementById("main-menu").style.display = "none";
    // document.getElementById("easy-menu").style.display = "flex";
    mainGameLoop();
});

hardButton.addEventListener('click', function () {
    difficulty = 'hard';
    // document.getElementById("main-menu").style.display = "none";
    // document.getElementById("hard-menu").style.display = "flex";
    mainGameLoop();
});

quitButton.addEventListener('click', function () {
    gameBoard.innerHTML = '';
    // document.getElementById("easy-menu").style.display = "none";
    // document.getElementById("hard-menu").style.display = "none";
    currentLevel = 0;
    completedLevels = [];
    showMainMenu();
    statusImg.src = "files/art/Smile.png";
});

function calculateBombsAround(numberOfSquares) {
    for (let i = 0; i < numberOfSquares * numberOfSquares; i++) {
        var tile = document.getElementById(i);
        if (tile.getAttribute("bomb") == 0) {
            tile.setAttribute("numberOfNeighboringMines", checkDirections(tile, numberOfSquares));
        }
    }
}

function findEmpty(tile, numberOfSquares) {
    const checked = [];
    const notChecked = [];
    notChecked.push(tile);
    while (notChecked.length != 0) {
        if (notChecked[0].getAttribute("x") != 0) {
            if (document.getElementById(Number(notChecked[0].id) - 1).getAttribute("show") != 1 && document.getElementById(Number(notChecked[0].id) - 1).getAttribute("numberOfNeighboringMines") == 0) {
                if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) - 1)) && !checked.includes(document.getElementById(Number(notChecked[0].id) - 1))) {
                    notChecked.push(document.getElementById(Number(notChecked[0].id) - 1));
                }
            }
        }
        if (notChecked[0].getAttribute("x") != (numberOfSquares - 1)) {
            if (document.getElementById(Number(notChecked[0].id) + 1).getAttribute("show") != 1 && document.getElementById(Number(notChecked[0].id) + 1).getAttribute("numberOfNeighboringMines") == 0) {
                if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) + 1)) && !checked.includes(document.getElementById(Number(notChecked[0].id) + 1))) {
                    notChecked.push(document.getElementById(Number(notChecked[0].id) + 1));
                }
            }
        }
        if (notChecked[0].getAttribute("y") != 0) {
            if (document.getElementById(Number(notChecked[0].id) - numberOfSquares).getAttribute("show") != 1 && document.getElementById(Number(notChecked[0].id) - numberOfSquares).getAttribute("numberOfNeighboringMines") == 0) {
                if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) - numberOfSquares)) && !checked.includes(document.getElementById(Number(notChecked[0].id) - numberOfSquares))) {
                    notChecked.push(document.getElementById(Number(notChecked[0].id) - numberOfSquares));
                }
            }
        }
        if (notChecked[0].getAttribute("y") != (numberOfSquares - 1)) {
            if (document.getElementById(Number(notChecked[0].id) + numberOfSquares).getAttribute("show") != 1 && document.getElementById(Number(notChecked[0].id) + numberOfSquares).getAttribute("numberOfNeighboringMines") == 0) {
                if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) + numberOfSquares)) && !checked.includes(document.getElementById(Number(notChecked[0].id) + numberOfSquares))) {
                    notChecked.push(document.getElementById(Number(notChecked[0].id) + numberOfSquares));
                }
            }
        }
        checked.push(notChecked[0]);
        notChecked.shift();
    }
    for (i in checked) {
        revealEmpty(checked[i]);
    }
}

function revealEmpty(tile) {
    tile.style.backgroundImage = "url(files/art/Empty.png)";
    tile.style.backgroundSize = 'cover';
    tile.setAttribute("show", 1);
}

function checkDirections(tile, numberOfSquares) {
    var mines = 0;
    if (tile.getAttribute("x") != 0) {
        if (document.getElementById(Number(tile.id) - 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("x") != (numberOfSquares - 1)) {
        if (document.getElementById(Number(tile.id) + 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("x") != 0 && tile.getAttribute("y") != 0) {
        if (document.getElementById(Number(tile.id) - numberOfSquares - 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("y") != 0) {
        if (document.getElementById(Number(tile.id) - numberOfSquares).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("x") != (numberOfSquares - 1) && tile.getAttribute("y") != 0) {
        if (document.getElementById(Number(tile.id) - numberOfSquares + 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("x") != 0 && tile.getAttribute("y") != (numberOfSquares - 1)) {
        if (document.getElementById(Number(tile.id) + numberOfSquares - 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("y") != (numberOfSquares - 1)) {
        if (document.getElementById(Number(tile.id) + numberOfSquares).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    if (tile.getAttribute("x") != (numberOfSquares - 1) && tile.getAttribute("y") != (numberOfSquares - 1)) {
        if (document.getElementById(Number(tile.id) + numberOfSquares + 1).getAttribute("bomb") == 1) {
            mines++;
        }
    }
    return mines;
}

function resetLevel(){
    if(statusImg.src.substring(statusImg.src.length - 7) == "Sad.png"){
        gameBoard.innerHTML = "";
        mainGameLoop();
        console.log("Resetting Level");
    } else {
        console.log("Cannot reset level, game is not over");
    }
}

// Drag and drop 
const bombDefuser = document.getElementById('defuser');

bombDefuser.addEventListener('dragstart', function(event) {
    console.log('Defuser drag start');
});

bombDefuser.addEventListener('drag', function(event) {
  console.log("Defuser being dragged");
});

bombDefuser.addEventListener('dragend', function(event) {
  console.log("Defuser drag end");
});

function drop(event) {
    console.log("Defuse Attempt");
    const isBomb = event.target.getAttribute("bomb");
    const isRevealed = event.target.getAttribute("show");

    if(isBomb == 1 && isRevealed != 1){
        // defuse bomb and decease bomb count, if bomb count is 0, win
        defuseBomb(event.target);
        console.log("Bomb defused");
        checkForWin();
    } else if(isBomb == 0 && isRevealed != 1){
        // Lose defuser and end game
        console.log("Bomb not defused");
    }
}

function defuseBomb(tile){
    tile.style.backgroundImage = "url(files/art/Flag.png)";
    tile.style.backgroundSize = 'cover';
    tile.setAttribute("show", 1);

    minesLeft--;
    updateMineCounter();
}

function checkForWin(){
    if(minesLeft == 0){
        console.log("Level won!");
        nextLevel();
    }
}

function nextLevel(){
    completedLevels.push(currentLevel);
    currentLevel = difficulty === "easy" ? getNewLevel(numberOfEasyLevels) : getNewLevel(numberOfHardLevels);
    gameBoard.innerHTML = "";
    console.log("Completed levels: " + completedLevels);
    console.log("Current level: " + currentLevel);
    mainGameLoop();
}

function getNewLevel(numberOfLevels){
    if (completedLevels.length === numberOfLevels) {
        // Reset the array of completed levels if all levels have been completed
        completedLevels = [];
      }

    while (true) {
        const level = Math.floor(Math.random() * numberOfLevels);
        if (!completedLevels.includes(level)) {
          return level;
        }
      }    
}



// Nieco taketo na daylight sensor, might not work, uvidime
// // Check if the Sensor API is supported
// if ('AmbientLightSensor' in window) {
//     // Create a new instance of the AmbientLightSensor
//     const sensor = new AmbientLightSensor();
    
//     // Set up an event listener to detect changes in the ambient light level
//     sensor.onreading = () => {
//       // Check the light level
//       if (sensor.illuminance < 50) {
//         // Set the background color to black if the light level is low
//         document.body.style.backgroundColor = 'black';
//       } else {
//         // Set the background color to white if the light level is high
//         document.body.style.backgroundColor = 'white';
//       }
//     }
    
//     // Start the sensor
//     sensor.start();
//   }