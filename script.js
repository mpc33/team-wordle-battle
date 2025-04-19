// Game State
const gameState = {
    team1Name: '',
    team2Name: '',
    team1Word: '',
    team2Word: '',
    team1Guesses: 6,
    team2Guesses: 6,
    team1Grid: [],
    team2Grid: [],
    validWords: []
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    secretWords: document.getElementById('secret-words-screen'),
    game: document.getElementById('game-screen'),
    endGame: document.getElementById('end-game-screen')
};

const forms = {
    teamNames: document.getElementById('team-names-form'),
    secretWords: document.getElementById('secret-words-form')
};

const gameElements = {
    team1Title: document.getElementById('team1-title'),
    team2Title: document.getElementById('team2-title'),
    currentTurn: document.getElementById('current-turn'),
    team1Guesses: document.getElementById('team1-guesses'),
    team2Guesses: document.getElementById('team2-guesses'),
    team1Grid: document.getElementById('team1-grid'),
    team2Grid: document.getElementById('team2-grid'),
    team1Guess: document.getElementById('team1-guess'),
    team2Guess: document.getElementById('team2-guess'),
    team1Submit: document.getElementById('team1-submit'),
    team2Submit: document.getElementById('team2-submit'),
    endGameMessage: document.getElementById('end-game-message'),
    secretWordsReveal: document.getElementById('secret-words-reveal'),
    playAgain: document.getElementById('play-again')
};

// Load valid words
async function loadValidWords() {
    try {
        const response = await fetch('words.txt');
        const text = await response.text();
        gameState.validWords = text.split('\n').map(word => word.trim().toUpperCase());
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

// Initialize game
function initializeGame() {
    // Create empty grids
    createEmptyGrid(gameElements.team1Grid);
    createEmptyGrid(gameElements.team2Grid);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load valid words
    loadValidWords();
}

// Create empty grid
function createEmptyGrid(gridElement) {
    gridElement.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        gridElement.appendChild(row);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Team names form
    forms.teamNames.addEventListener('submit', (e) => {
        e.preventDefault();
        gameState.team1Name = document.getElementById('team1-name').value;
        gameState.team2Name = document.getElementById('team2-name').value;
        
        // Update all team name displays
        updateTeamNameDisplays();
        
        // Switch to secret words screen
        screens.welcome.classList.remove('active');
        screens.secretWords.classList.add('active');
    });

    // Secret words form
    forms.secretWords.addEventListener('submit', (e) => {
        e.preventDefault();
        gameState.team1Word = document.getElementById('team1-word').value.toUpperCase();
        gameState.team2Word = document.getElementById('team2-word').value.toUpperCase();
        
        // Validate words
        if (!isValidWord(gameState.team1Word) || !isValidWord(gameState.team2Word)) {
            alert('Please enter valid 5-letter words from the allowed word list!');
            return;
        }
        
        // Switch to game screen
        screens.secretWords.classList.remove('active');
        screens.game.classList.add('active');
        
        // Initialize game controls
        initializeGameControls();
    });

    // Setup guess submissions for both teams
    setupGuessHandling('team1');
    setupGuessHandling('team2');
    
    // Play again
    gameElements.playAgain.addEventListener('click', resetGame);
}

// Initialize game controls
function initializeGameControls() {
    // Enable both teams' inputs
    gameElements.team1Guess.disabled = false;
    gameElements.team2Guess.disabled = false;
    gameElements.team1Submit.disabled = false;
    gameElements.team2Submit.disabled = false;
    
    // Clear any previous input
    gameElements.team1Guess.value = '';
    gameElements.team2Guess.value = '';
}

// Setup guess handling for a team
function setupGuessHandling(team) {
    const guessInput = document.getElementById(`${team}-guess`);
    const submitButton = document.getElementById(`${team}-submit`);

    // Handle Enter key in input
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const remainingGuesses = team === 'team1' ? gameState.team1Guesses : gameState.team2Guesses;
            if (remainingGuesses > 0 && guessInput.value.length === 5) {
                handleGuess(team);
            }
        }
    });

    // Handle submit button click
    submitButton.addEventListener('click', () => {
        const remainingGuesses = team === 'team1' ? gameState.team1Guesses : gameState.team2Guesses;
        if (remainingGuesses > 0 && guessInput.value.length === 5) {
            handleGuess(team);
        }
    });

    // Convert input to uppercase as user types and enforce letter-only input
    guessInput.addEventListener('input', (e) => {
        // Remove any non-letter characters
        e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    });
}

// Update all team name displays
function updateTeamNameDisplays() {
    // Update secret words screen labels
    const team1Labels = document.querySelectorAll('#team1-name-label');
    const team2Labels = document.querySelectorAll('#team2-name-label');
    
    team1Labels.forEach(label => label.textContent = gameState.team1Name);
    team2Labels.forEach(label => label.textContent = gameState.team2Name);
    
    // Update game board titles with just team names
    gameElements.team1Title.textContent = `${gameState.team1Name}'s Puzzle`;
    gameElements.team2Title.textContent = `${gameState.team2Name}'s Puzzle`;
}

// Validate word
function isValidWord(word) {
    return word.length === 5 && 
           /^[A-Za-z]+$/.test(word) && 
           gameState.validWords.includes(word);
}

// Handle guess
function handleGuess(team) {
    const guessInput = document.getElementById(`${team}-guess`);
    const guess = guessInput.value.toUpperCase();
    
    // Validate guess length and content
    if (guess.length !== 5) {
        alert('Please enter a 5-letter word!');
        return;
    }
    
    // Validate guess is a valid word
    if (!isValidWord(guess)) {
        alert('Please enter a valid word from the allowed word list!');
        return;
    }
    
    // Process guess
    const secretWord = team === 'team1' ? gameState.team2Word : gameState.team1Word;
    const grid = gameElements[`${team}Grid`];
    const currentRow = 6 - (team === 'team1' ? gameState.team1Guesses : gameState.team2Guesses);
    
    // Update grid
    updateGridWithGuess(grid, currentRow, guess, secretWord);
    
    // Decrement guesses
    if (team === 'team1') {
        gameState.team1Guesses--;
        gameElements.team1Guesses.textContent = gameState.team1Guesses;
    } else {
        gameState.team2Guesses--;
        gameElements.team2Guesses.textContent = gameState.team2Guesses;
    }
    
    // Check game state
    if (guess === secretWord) {
        endGame(team);
    } else if (gameState.team1Guesses === 0 && gameState.team2Guesses === 0) {
        endGame('draw');
    }
    
    // Clear input and maintain focus
    guessInput.value = '';
    guessInput.focus();
}

// Update grid with guess
function updateGridWithGuess(grid, row, guess, secretWord) {
    const tiles = grid.children[row].children;
    const letterCounts = {};
    
    // Count letters in secret word
    for (let i = 0; i < secretWord.length; i++) {
        const letter = secretWord[i];
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    
    // First set the letters
    for (let i = 0; i < guess.length; i++) {
        const tile = tiles[i];
        tile.textContent = guess[i];
    }
    
    // Then animate and reveal colors with delay
    setTimeout(() => {
        // First pass: mark correct letters
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const tile = tiles[i];
            
            setTimeout(() => {
                tile.classList.add('flip');
                
                setTimeout(() => {
                    if (letter === secretWord[i]) {
                        tile.classList.add('correct');
                        letterCounts[letter]--;
                    }
                }, 250); // Half of flip animation duration
            }, i * 250); // Stagger the animations
        }
        
        // Second pass: mark present/absent letters
        setTimeout(() => {
            for (let i = 0; i < guess.length; i++) {
                const letter = guess[i];
                const tile = tiles[i];
                
                if (!tile.classList.contains('correct')) {
                    if (letterCounts[letter] > 0) {
                        tile.classList.add('present');
                        letterCounts[letter]--;
                    } else {
                        tile.classList.add('absent');
                    }
                }
            }
        }, guess.length * 250 + 250); // Wait for all flips to complete
    }, 100); // Small initial delay
}

// End game
function endGame(result) {
    screens.game.classList.remove('active');
    screens.endGame.classList.add('active');
    
    if (result === 'draw') {
        gameElements.endGameMessage.textContent = "It's a Draw!";
    } else {
        const winningTeam = result === 'team1' ? gameState.team1Name : gameState.team2Name;
        gameElements.endGameMessage.textContent = `${winningTeam} Wins!`;
    }
    
    // Reveal secret words with team names
    gameElements.secretWordsReveal.innerHTML = `
        <p>${gameState.team1Name}'s word: ${gameState.team1Word}</p>
        <p>${gameState.team2Name}'s word: ${gameState.team2Word}</p>
    `;
}

// Reset game
function resetGame() {
    // Reset game state
    gameState.team1Name = '';
    gameState.team2Name = '';
    gameState.team1Word = '';
    gameState.team2Word = '';
    gameState.team1Guesses = 6;
    gameState.team2Guesses = 6;
    
    // Reset forms
    forms.teamNames.reset();
    forms.secretWords.reset();
    
    // Reset game elements
    gameElements.team1Guesses.textContent = '6';
    gameElements.team2Guesses.textContent = '6';
    
    // Reset grids
    createEmptyGrid(gameElements.team1Grid);
    createEmptyGrid(gameElements.team2Grid);
    
    // Initialize controls
    initializeGameControls();
    
    // Switch to welcome screen
    screens.endGame.classList.remove('active');
    screens.welcome.classList.add('active');
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame); 