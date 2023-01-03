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
const guideButton = document.getElementById('guide');
const quitButton = document.getElementById('quit');
const mineCounter = document.getElementById('mine-counter');
const helpButton = document.getElementById("help");
const solutionButton = document.getElementById("solution");
const statusImg = document.getElementById('status');
var difficulty = 'easy';
var gameOver = false;
var currentLevel = 0;
var minesLeft = 0;
const numberColor = ["blue", "green", "red", "purple", "maroon", "turquoise", "black", "gray"];

function mainGameLoop() {
    gameOver = false;
    showGameBoard();
    generateBoard();
    getMineCount();
    updateMineCounter();
    updateStatusImg();
    console.log("Current level: " + currentLevel);
}

function handleGameOver() {
    gameOver = true;
    updateStatusImg();
}


function updateStatusImg() {
    if (!gameOver)
        statusImg.src = "files/art/Smile.png";
    else
        statusImg.src = "files/art/Sad.png";
}

function getMineCount() {
    minesLeft = difficulty === "easy" ? JSONdataEasy[currentLevel].bombCoords.length : JSONdataHard[currentLevel].bombCoords.length;
}

function updateMineCounter() {
    mineCounter.innerHTML = `Mines left: ${minesLeft}`;
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
    tile.style.backgroundSize = '100% 100%';
}

function addTileEventListener(tile, numberOfSquares) {
    tile.addEventListener("click", function () {
        if (!gameOver)
            revealTile(tile, numberOfSquares);
    });
    tile.addEventListener('dragover', function (event) {
        event.preventDefault(); // Allow an object to be dropped on the tile
    });
}

function revealTile(tile, numberOfSquares) {
    if (tile.getAttribute("bomb") == 1 && tile.getAttribute("show") != 1) {
        tile.style.backgroundImage = "url(files/art/MineEx.png)";
        tile.style.backgroundSize = '100% 100%';
        tile.setAttribute("show", 1);
        mineCounter.innerHTML = "Bomb exploded";
        handleGameOver();
    } else if (tile.getAttribute("bomb") != 1 && tile.getAttribute("show") != 1) {
        reveal(tile);
        if (tile.getAttribute("numberOfNeighboringMines") == 0) {
            findEmpty(tile, numberOfSquares);
        }
    }
}

function reveal(tile) {
    tile.style.backgroundImage = "url(files/art/Empty.png)";
    tile.style.backgroundSize = '100% 100%';
    tile.setAttribute("show", 1);
    if (tile.getAttribute("numberOfNeighboringMines") != 0) {
        const newContent = document.createTextNode(tile.getAttribute("numberOfNeighboringMines"));
        tile.appendChild(newContent);
        tile.style.color = numberColor[Number(tile.getAttribute("numberOfNeighboringMines")) - 1];
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
    document.getElementById("guide-menu").style.display = "none";
    document.getElementById("help").style.display = "block";
    document.getElementById("solution").style.display = "block";
    document.getElementById("buttons").style.visibility = "hidden";
}

// Show the game board and hide the main menu
function showGameBoard() {
    mainMenu.style.display = 'none';
    gameBoard.style.display = 'grid';
    document.getElementById("buttons").style.visibility = "visible";
}

easyButton.addEventListener('click', function () {
    difficulty = 'easy';
    // Load current level and completed levels from local storage
    loadFromStorage();
    mainGameLoop();
});

hardButton.addEventListener('click', function () {
    difficulty = 'hard';
    loadFromStorage();
    mainGameLoop();
});

quitButton.addEventListener('click', function () {
    gameBoard.innerHTML = '';
    currentLevel = 0;
    completedLevels = [];
    mineCounter.innerHTML = "";
    showMainMenu();
    statusImg.src = "files/art/Smile.png";
    // STORAGE CLEAR
    localStorage.clear();
});

//show guide menu
guideButton.addEventListener('click', function () {
    mainMenu.style.display = 'none';
    document.getElementById("guide-menu").style.display = "flex";
    document.getElementById("buttons").style.visibility = "visible";
    document.getElementById("help").style.display = "none";
    document.getElementById("solution").style.display = "none";
});

helpButton.addEventListener('click', function () {
    var mines = [];
    var tile = document.getElementById(0);
    var n = 0;
    while (tile) {
        if (tile.getAttribute("bomb") == 1 && tile.getAttribute("show") != 1) {
            mines.push(tile);
        }
        n++;
        tile = document.getElementById(n);
    }
    defuseBomb(mines[Math.floor(Math.random() * mines.length)]);
    if (mines.length == 1) {
        checkForWin();
        return;
    }
});

solutionButton.addEventListener('click', function () {
    var tile = document.getElementById(0);
    var n = 0;
    while (tile) {
        if (tile.getAttribute("bomb") == 1) {
            defuseBomb(tile);
        } else {
            reveal(tile);
        }
        n++;
        tile = document.getElementById(n);
    }
});


function loadFromStorage() {
    if (window.localStorage) {
        if (localStorage.getItem('currentLevelEasy') && difficulty == 'easy') {
            currentLevel = parseInt(localStorage.getItem('currentLevelEasy'));
            completedLevels = JSON.parse(localStorage.getItem('completedLevelsEasy'));
        } else if(localStorage.getItem('currentLevelHard') && difficulty == 'hard') {
            currentLevel = parseInt(localStorage.getItem('currentLevelHard'));
            completedLevels = JSON.parse(localStorage.getItem('completedLevelsHard'));
        }
    }
}

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
        if (document.getElementById(Number(notChecked[0].id)).getAttribute("numberOfNeighboringMines") == 0) {
            if (notChecked[0].getAttribute("x") != 0) {
                if (document.getElementById(Number(notChecked[0].id) - 1).getAttribute("show") != 1) {
                    if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) - 1)) && !checked.includes(document.getElementById(Number(notChecked[0].id) - 1))) {
                        notChecked.push(document.getElementById(Number(notChecked[0].id) - 1));
                    }
                }
            }
            if (notChecked[0].getAttribute("x") != (numberOfSquares - 1)) {
                if (document.getElementById(Number(notChecked[0].id) + 1).getAttribute("show") != 1) {
                    if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) + 1)) && !checked.includes(document.getElementById(Number(notChecked[0].id) + 1))) {
                        notChecked.push(document.getElementById(Number(notChecked[0].id) + 1));
                    }
                }
            }
            if (notChecked[0].getAttribute("y") != 0) {
                if (document.getElementById(Number(notChecked[0].id) - numberOfSquares).getAttribute("show") != 1) {
                    if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) - numberOfSquares)) && !checked.includes(document.getElementById(Number(notChecked[0].id) - numberOfSquares))) {
                        notChecked.push(document.getElementById(Number(notChecked[0].id) - numberOfSquares));
                    }
                }
            }
            if (notChecked[0].getAttribute("y") != (numberOfSquares - 1)) {
                if (document.getElementById(Number(notChecked[0].id) + numberOfSquares).getAttribute("show") != 1) {
                    if (!notChecked.includes(document.getElementById(Number(notChecked[0].id) + numberOfSquares)) && !checked.includes(document.getElementById(Number(notChecked[0].id) + numberOfSquares))) {
                        notChecked.push(document.getElementById(Number(notChecked[0].id) + numberOfSquares));
                    }
                }
            }
            checked.push(notChecked[0]);
            notChecked.shift();
        } else if (document.getElementById(Number(notChecked[0].id)).getAttribute("numberOfNeighboringMines") > 0) {
            checked.push(notChecked[0]);
            notChecked.shift();
        }
    }
    for (i in checked) {
        reveal(checked[i]);
    }
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

function resetLevel() {
    if (statusImg.src.substring(statusImg.src.length - 7) == "Sad.png") {
        gameBoard.innerHTML = "";
        mainGameLoop();
        console.log("Resetting Level");
    } else {
        console.log("Cannot reset level, game is not over");
    }
}

// Drag and drop 
const bombDefuser = document.getElementById('defuser');

bombDefuser.addEventListener('dragstart', function (event) {
    console.log('Defuser drag start');
});

bombDefuser.addEventListener('drag', function (event) {
    console.log("Defuser being dragged");
});

bombDefuser.addEventListener('dragend', function (event) {
    console.log("Defuser drag end");
});

function drop(event) {
    if (gameOver == false) {
        console.log("Defuse Attempt");
        const isBomb = event.target.getAttribute("bomb");
        const isRevealed = event.target.getAttribute("show");

        if (isBomb == 1 && isRevealed != 1) {
            // defuse bomb and decease bomb count, if bomb count is 0, win
            defuseBomb(event.target);
            console.log("Bomb defused");
            checkForWin();
        } else if (isBomb == 0 && isRevealed != 1) {
            // Lose defuser and end game
            console.log("Bomb not defused");
            event.target.style.backgroundImage = "url(files/art/Empty.png)";
            event.target.style.backgroundSize = '100% 100%';
            event.target.setAttribute("show", 1);
            if (event.target.getAttribute("numberOfNeighboringMines") != 0) {
                const newContent = document.createTextNode(event.target.getAttribute("numberOfNeighboringMines"));
                event.target.appendChild(newContent);
            }
            mineCounter.innerHTML = "Defused non-bomb tile";
            handleGameOver();
        }
    }
}

function defuseBomb(tile) {
    tile.style.backgroundImage = "url(files/art/Flag.png)";
    tile.style.backgroundSize = '100% 100%';
    tile.setAttribute("show", 1);

    minesLeft--;
    updateMineCounter();
}

function checkForWin() {
    if (minesLeft == 0) {
        console.log("Level won!");
        nextLevel();
    }
}

function nextLevel() {
    completedLevels.push(currentLevel);
    currentLevel = difficulty === "easy" ? getNewLevel(numberOfEasyLevels) : getNewLevel(numberOfHardLevels);
    gameBoard.innerHTML = "";
    console.log("Completed levels: " + completedLevels);
    console.log("Current level: " + currentLevel);

    // Save the completed levels and current level to local storage
    if(window.localStorage) {
        console.log("Saving to local storage");
        if(difficulty === "easy") {
            localStorage.setItem("completedLevelsEasy", JSON.stringify(completedLevels));
            localStorage.setItem("currentLevelEasy", currentLevel);
        } else if(difficulty === "hard") {
            localStorage.setItem("completedLevelsHard", JSON.stringify(completedLevels));
            localStorage.setItem("currentLevelHard", currentLevel);
        }        
    }

    mainGameLoop();
}

function getNewLevel(numberOfLevels) {
    if (completedLevels.length === numberOfLevels) {
        // Reset the array of completed levels if all levels have been completed
        completedLevels = [];
        localStorage.clear();
    }

    while (true) {
        const level = Math.floor(Math.random() * numberOfLevels);
        if (!completedLevels.includes(level)) {
            return level;
        }
    }
}

// Storage
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            (storage && storage.length !== 0);
    }
}

if (storageAvailable('localStorage')) {
    console.log("Storage available");
  }
  else {
    console.log("Storage not available");
  }