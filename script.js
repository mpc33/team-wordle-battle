class WordleBattle {
    constructor() {
        this.WORD_LENGTH = 5;
        this.ATTEMPTS = 6;
        this.gameActive = false;
        this.activeTeam = null;
        this.WINNING_SCORE = 3;
        this.scores = {
            a: 0,
            b: 0
        };
        this.teams = {
            a: { 
                name: '', 
                word: '', 
                currentAttempt: 0, 
                currentGuess: '', 
                board: [],
                keyboardState: {} // Add this to track keyboard colors
            },
            b: { 
                name: '', 
                word: '', 
                currentAttempt: 0, 
                currentGuess: '', 
                board: [],
                keyboardState: {} // Add this to track keyboard colors
            }
        };
        
        this.initializeGame();
    }

    initializeGame() {
        // Create boards
        this.createBoard('team-a');
        this.createBoard('team-b');
        
        // Create keyboards
        this.createKeyboard('keyboard-a', 'a');
        this.createKeyboard('keyboard-b', 'b');
        
        // Add event listeners
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Add team activation buttons listeners
        document.querySelectorAll('.activate-team').forEach(button => {
            button.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                this.activateTeam(team);
            });
        });
    }

    activateTeam(team) {
        if (!this.gameActive) return;

        // Deactivate all teams first
        document.querySelectorAll('.keyboard').forEach(kb => kb.classList.remove('active'));
        document.querySelectorAll('.activate-team').forEach(btn => btn.classList.remove('active'));

        // Activate selected team
        document.getElementById(`keyboard-${team}`).classList.add('active');
        document.querySelector(`[data-team="${team}"]`).classList.add('active');
        
        this.activeTeam = team;
    }

    handleKeyPress(e) {
        if (!this.gameActive || !this.activeTeam) return;

        if (e.key === 'Backspace') {
            this.deleteLetter(this.activeTeam);
        } else if (e.key === 'Enter') {
            this.submitGuess(this.activeTeam);
        } else if (/^[A-Za-z]$/.test(e.key)) {
            this.addLetter(e.key.toUpperCase(), this.activeTeam);
        }
    }

    handleKeyClick(key, team) {
        if (!this.gameActive || team !== this.activeTeam) return;

        if (key === '⌫') {
            this.deleteLetter(team);
        } else if (key === 'Enter') {
            this.submitGuess(team);
        } else {
            this.addLetter(key, team);
        }
    }

    startGame() {
        // Get team names and words
        const teamAName = document.getElementById('team-a-name').value.trim() || 'Team 1';
        const teamBName = document.getElementById('team-b-name').value.trim() || 'Team 2';
        const teamAWord = document.getElementById('team-a-word').value.toUpperCase();
        const teamBWord = document.getElementById('team-b-word').value.toUpperCase();

        if (teamAWord.length !== 5 || teamBWord.length !== 5) {
            alert('Both words must be exactly 5 letters long!');
            return;
        }

        // Set team names and words
        this.teams.a.name = teamAName;
        this.teams.b.name = teamBName;
        this.teams.a.word = teamAWord;
        this.teams.b.word = teamBWord;

        // Update team titles
        document.getElementById('team-a-title').textContent = teamAName;
        document.getElementById('team-b-title').textContent = teamBName;

        // Update score labels with team names
        document.getElementById('team-a-score-label').textContent = teamAName;
        document.getElementById('team-b-score-label').textContent = teamBName;

        // Reset scores for new game
        this.scores = { a: 0, b: 0 };
        this.updateScoreDisplay();

        // Hide setup screen and show game screen
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        this.gameActive = true;
    }

    createBoard(teamId) {
        const board = document.querySelector(`#${teamId} .wordle-board`);
        for (let i = 0; i < this.ATTEMPTS; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            
            for (let j = 0; j < this.WORD_LENGTH; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
            }
            
            board.appendChild(row);
        }
    }

    createKeyboard(keyboardId, team) {
        const keyboard = document.getElementById(keyboardId);
        const layout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        layout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const button = document.createElement('button');
                button.className = 'key';
                button.textContent = key;
                // Add data attribute for letter keys
                if (key.length === 1) {
                    button.dataset.key = key;
                }
                button.addEventListener('click', () => this.handleKeyClick(key, team));
                keyboardRow.appendChild(button);
            });
            
            keyboard.appendChild(keyboardRow);
        });
    }

    addLetter(letter, team) {
        if (this.teams[team].currentGuess.length < this.WORD_LENGTH) {
            this.teams[team].currentGuess += letter;
            this.updateDisplay(team);
        }
    }

    deleteLetter(team) {
        if (this.teams[team].currentGuess.length > 0) {
            this.teams[team].currentGuess = this.teams[team].currentGuess.slice(0, -1);
            this.updateDisplay(team);
        }
    }

    submitGuess(team) {
        if (this.teams[team].currentGuess.length !== this.WORD_LENGTH) return;

        const guess = this.teams[team].currentGuess;
        const word = this.teams[team].word;
        
        // Check guess and update colors
        const result = this.checkGuess(guess, word);
        this.updateColors(team, result);
        
        // Update keyboard colors
        this.updateKeyboardColors(team, guess, result);

        // Check for win
        if (guess === word) {
            this.handleWin(team);
        }

        // Move to next attempt
        this.teams[team].currentAttempt++;
        this.teams[team].currentGuess = '';

        // Check for game over
        if (this.teams[team].currentAttempt >= this.ATTEMPTS) {
            this.handleLoss(team);
        }
    }

    checkGuess(guess, word) {
        const result = Array(this.WORD_LENGTH).fill('absent');
        const wordArray = word.split('');
        const guessArray = guess.split('');

        // Check for correct letters
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (guessArray[i] === wordArray[i]) {
                result[i] = 'correct';
                wordArray[i] = null;
            }
        }

        // Check for present letters
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (result[i] === 'absent' && wordArray.includes(guessArray[i])) {
                result[i] = 'present';
                wordArray[wordArray.indexOf(guessArray[i])] = null;
            }
        }

        return result;
    }

    updateDisplay(team) {
        const row = document.querySelector(`#team-${team} .wordle-board`).children[this.teams[team].currentAttempt];
        const tiles = row.children;
        const guess = this.teams[team].currentGuess.padEnd(this.WORD_LENGTH);

        for (let i = 0; i < this.WORD_LENGTH; i++) {
            tiles[i].textContent = guess[i];
        }
    }

    updateColors(team, result) {
        const row = document.querySelector(`#team-${team} .wordle-board`).children[this.teams[team].currentAttempt];
        const tiles = row.children;

        for (let i = 0; i < this.WORD_LENGTH; i++) {
            tiles[i].classList.add(result[i]);
        }
    }

    updateKeyboardColors(team, guess, result) {
        const keyboard = document.getElementById(`keyboard-${team}`);
        const guessArray = guess.split('');

        guessArray.forEach((letter, index) => {
            const key = keyboard.querySelector(`button[data-key="${letter}"]`);
            if (!key) return;

            const currentState = result[index];
            const currentClass = this.teams[team].keyboardState[letter];

            // Remove existing color classes
            key.classList.remove('correct', 'present', 'absent');

            // Determine the best state for the key
            let newState = currentState;
            if (currentClass === 'correct' || (currentClass === 'present' && currentState === 'absent')) {
                newState = currentClass;
            }

            // Update the key's state
            key.classList.add(newState);
            this.teams[team].keyboardState[letter] = newState;
        });
    }

    updateScoreDisplay() {
        const teamAScore = document.getElementById('team-a-score');
        const teamBScore = document.getElementById('team-b-score');
        
        teamAScore.textContent = this.scores.a;
        teamBScore.textContent = this.scores.b;
    }

    animateScore(team) {
        const scoreElement = document.getElementById(`team-${team}-score`);
        scoreElement.classList.remove('score-update');
        // Trigger reflow
        void scoreElement.offsetWidth;
        scoreElement.classList.add('score-update');
    }

    handleWin(team) {
        this.gameActive = false;
        this.scores[team]++;
        this.updateScoreDisplay();
        this.animateScore(team);

        if (this.scores[team] >= this.WINNING_SCORE) {
            // Game Over - Team wins the match
            setTimeout(() => {
                this.handleMatchWin(team);
            }, 1000);
        } else {
            // Continue to next round
            setTimeout(() => {
                this.resetBoards();
                this.gameActive = true;
            }, 2000);
        }
    }

    handleMatchWin(team) {
        const winner = this.teams[team].name;
        const modal = document.createElement('div');
        modal.className = 'win-modal';
        modal.innerHTML = `
            <div class="win-modal-content">
                <h2>${winner} Wins!</h2>
                <button id="new-match">New Match</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('new-match').addEventListener('click', () => {
            this.resetMatch();
            modal.remove();
        });
    }

    resetMatch() {
        // Reset scores
        this.scores = { a: 0, b: 0 };
        this.updateScoreDisplay();

        // Reset boards and show setup screen
        this.resetBoards();
    }

    handleLoss(team) {
        // Give point to the other team
        const otherTeam = team === 'a' ? 'b' : 'a';
        this.scores[otherTeam]++;
        this.updateScoreDisplay();
        this.animateScore(otherTeam);

        // Reset for next round
        setTimeout(() => {
            this.resetBoards();
            this.gameActive = true;
        }, 2000);
    }

    resetBoards() {
        ['a', 'b'].forEach(team => {
            // Clear the board
            const board = document.querySelector(`#team-${team} .wordle-board`);
            board.innerHTML = '';
            this.createBoard(`team-${team}`);

            // Reset keyboard
            const keyboard = document.getElementById(`keyboard-${team}`);
            keyboard.innerHTML = '';
            this.createKeyboard(`keyboard-${team}`, team);

            // Reset team state
            this.teams[team].currentAttempt = 0;
            this.teams[team].currentGuess = '';
            this.teams[team].keyboardState = {};

            // Reset keyboard visual state
            document.getElementById(`keyboard-${team}`).classList.remove('active');
            document.querySelector(`[data-team="${team}"]`).classList.remove('active');
        });

        // Reset active team
        this.activeTeam = null;

        // Show word input modal for next round
        this.showWordInputModal();
    }

    showWordInputModal() {
        const modal = document.createElement('div');
        modal.className = 'win-modal';
        modal.innerHTML = `
            <div class="win-modal-content">
                <h2>Next Round</h2>
                <div class="word-inputs">
                    <div class="team-word-input">
                        <label>${this.teams.a.name}'s Word:</label>
                        <input type="password" id="next-word-a" maxlength="5" placeholder="Enter 5-letter word">
                    </div>
                    <div class="team-word-input">
                        <label>${this.teams.b.name}'s Word:</label>
                        <input type="password" id="next-word-b" maxlength="5" placeholder="Enter 5-letter word">
                    </div>
                </div>
                <button id="start-next-round">Start Round</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('start-next-round').addEventListener('click', () => {
            const wordA = document.getElementById('next-word-a').value.toUpperCase();
            const wordB = document.getElementById('next-word-b').value.toUpperCase();

            if (wordA.length !== 5 || wordB.length !== 5) {
                alert('Both words must be exactly 5 letters long!');
                return;
            }

            this.teams.a.word = wordA;
            this.teams.b.word = wordB;
            this.gameActive = true;
            modal.remove();
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordleBattle();
}); 