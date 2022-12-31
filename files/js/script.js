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
const mineCoubter = document.getElementById('mine-counter');
var difficulty = 'easy';
var gameOver = false;
var currentLevel = 1;
var minesLeft = 0;

function mainGameLoop() {
    showGameBoard();
    generateBoard();
    getMineCount();
    updateMineCounter();
}

function getMineCount() {
    minesLeft = JSONdata[currentLevel].bombCoords.length;
}

function updateMineCounter() {    
    mineCoubter.innerHTML = `Mines left: ${minesLeft}`;
}

function generateBoard() {
    let numberOfSquares = difficulty === 'easy' ? 6 : 12;

    gameBoard.style.gridTemplateColumns = `repeat(${numberOfSquares}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${numberOfSquares}, 1fr)`;

    // Fetch data(mine positions) from JSON
    // Generate the squares according to JSON rules
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
    const bombCoords = JSONdata[currentLevel].bombCoords;
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
        revealTile(tile, numberOfSquares);
    });
    tile.addEventListener('dragover', function(event) {
        // Allow an object to be dropped on the tile
        event.preventDefault();
    });
}

function revealTile(tile, numberOfSquares) {
    // TODO ak dragneme na tile odhalovac bomb, tak bombu zneskodnime
    // TODO ak dragneme odhalovac empty tilov na bombu tak bomba jebne a prehrali sme
    if (tile.getAttribute("bomb") == 1) {
        tile.style.backgroundImage = "url(files/art/MineEx.png)";
        tile.style.backgroundSize = 'cover';
    } else if (tile.getAttribute("bomb") == 0 && tile.getAttribute("show") != 1) {
        tile.style.backgroundImage = "url(files/art/Empty.png)";
        tile.style.backgroundSize = 'cover';
        tile.setAttribute("show", 1);
        // TODO reveal all empty tiles within area
        // TODO calculate number of mines within 1 tile
        // TODO set tileCounter.innerHTML = "numberOfNeighboringMnes";
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
    showMainMenu();
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

function log(){
    console.log("log");
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
    console.log("Dropped");
    // This function will be called when the draggable object is dropped on the tile.
    // You can use this function to get the data that was transferred when the object was dropped.
    const data = event.dataTransfer.getData('text/plain');
  
    // You can also use this function to specify custom behavior when the object is dropped on the tile.
    // event.target.revealTile();
}


