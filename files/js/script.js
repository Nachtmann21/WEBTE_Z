console.log("connected")

const mainMenu = document.getElementById('main-menu');
const gameBoard = document.getElementById('game-board');
const easyButton = document.getElementById('easy');
const hardButton = document.getElementById('hard');
const quitButton = document.getElementById('quit');
var difficulty = 'easy';

// Show the main menu and hide the game board
function showMainMenu() {
  mainMenu.style.display = 'flex';
  gameBoard.style.display = 'none';
}

// Show the game board and hide the main menu
function showGameBoard() {
  mainMenu.style.display = 'none';
  gameBoard.style.display = 'grid';
  generateGameBoard();
}

function generateGameBoard() {

    let numberOfSquares = difficulty === 'easy' ? 6 : 30;

    gameBoard.style.gridTemplateColumns = `repeat(${numberOfSquares}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${numberOfSquares}, 1fr)`;
    
    // Generate the squares
    for (let i = 0; i < numberOfSquares*numberOfSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        // change square with to be 100/numberOfSquares
        square.style.width = `95%`;
        square.style.height = `95%`;
        gameBoard.appendChild(square);
    }
}

easyButton.addEventListener('click', function() {
    difficulty = 'easy';
    showGameBoard();
});

// Handle a click on the hard button
hardButton.addEventListener('click', function() {
    difficulty = 'hard';
    showGameBoard();
});

quitButton.addEventListener('click', function() {
    gameBoard.innerHTML = '';
    showMainMenu();
});