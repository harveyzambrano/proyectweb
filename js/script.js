// =============================================
// VARIABLES GLOBALES - MODIFICADAS
// =============================================
let secretNumber = Math.floor(Math.random() * 1001); // 0-10000
let attempts = 0;
let playerName = "";
let currentPlayer = "";
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
const MAX_NUMBER = 1000; // ← NUEVA VARIABLE PARA EL RANGO

// =============================================
// FUNCIÓN: INICIAR JUEGO - MODIFICADA
// =============================================
function startGame() {
    const nameInput = document.getElementById('playerName').value.trim();
    
    if (!nameInput) {
        alert("¡Ingresa tu nombre para comenzar! 🎩");
        return;
    }
    
    playerName = nameInput;
    currentPlayer = playerName;
    document.getElementById('currentPlayer').textContent = currentPlayer;
    document.getElementById('gameContent').style.display = 'block';
    
    // 🎯 ACTUALIZAR MENSAJE CON NUEVO RANGO
    document.getElementById('rangeInfo').textContent = 
        `Estoy pensando en un número entre <span class="highlight">0</span> y <span class="highlight">${MAX_NUMBER}</span>`;
    
    document.getElementById('playerName').disabled = true;
    document.querySelector('.btn-start').disabled = true;
    document.querySelector('.btn-start').style.opacity = '0.6';
    document.querySelector('.btn-start').style.cursor = 'not-allowed';
    
    loadLeaderboard();
    updateTemperature(10000); // ← ACTUALIZAR TEMPERATURA PARA RANGO MAYOR
}

// =============================================
// FUNCIÓN: NUEVO JUGADOR - MODIFICADA
// =============================================
function newPlayer() {
    secretNumber = Math.floor(Math.random() * (MAX_NUMBER + 1)); // 0-10000
    attempts = 0;
    
    document.getElementById('guessInput').value = '';
    document.getElementById('result').textContent = '¡Empieza a adivinar!';
    document.getElementById('attempts').textContent = 'Intentos: 0';
    document.getElementById('socialShare').style.display = 'none';
    document.getElementById('newPlayerBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('gameContent').style.display = 'none';
    
    document.getElementById('playerName').disabled = false;
    document.querySelector('.btn-start').disabled = false;
    document.querySelector('.btn-start').style.opacity = '1';
    document.querySelector('.btn-start').style.cursor = 'pointer';
    
    document.getElementById('guessInput').disabled = false;
    document.querySelector('.btn-guess').disabled = false;
    document.querySelector('.btn-guess').style.opacity = '1';
    document.querySelector('.btn-guess').style.cursor = 'pointer';
    
    document.getElementById('playerName').value = '';
    document.getElementById('playerName').focus();
    
    updateTemperature(1000);
    playerName = "";
    currentPlayer = "";
}

// =============================================
// FUNCIÓN: REINICIAR JUEGO - MODIFICADA
// =============================================
function resetGame() {
    secretNumber = Math.floor(Math.random() * (MAX_NUMBER + 1)); // 0-10000
    attempts = 0;
    
    document.getElementById('guessInput').value = '';
    document.getElementById('result').textContent = '¡Empieza a adivinar!';
    document.getElementById('attempts').textContent = 'Intentos: 0';
    document.getElementById('socialShare').style.display = 'none';
    document.getElementById('newPlayerBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    
    document.getElementById('guessInput').disabled = false;
    document.querySelector('.btn-guess').disabled = false;
    document.querySelector('.btn-guess').style.opacity = '1';
    document.querySelector('.btn-guess').style.cursor = 'pointer';
    
    updateTemperature(10000);
    document.getElementById('tempText').textContent = '¡La aventura comienza!';
}

// =============================================
// FUNCIÓN PRINCIPAL: VERIFICAR guess - MODIFICADA
// =============================================
function checkGuess() {
    const userGuess = parseInt(document.getElementById('guessInput').value);
    const resultElement = document.getElementById('result');
    const attemptsElement = document.getElementById('attempts');

    // 🎯 ACTUALIZAR VALIDACIÓN PARA 0-10000
    if (isNaN(userGuess) || userGuess < 0 || userGuess > MAX_NUMBER) {
        resultElement.textContent = `¡Por favor, ingresa un número válido entre 0 y ${MAX_NUMBER}!`;
        resultElement.style.color = "#ffeb3b";
        return;
    }

    attempts++;
    attemptsElement.textContent = `Intentos: ${attempts}`;

    if (userGuess === secretNumber) {
        resultElement.textContent = `¡Felicidades ${currentPlayer}! 🎉 Adivinaste en ${attempts} intentos.`;
        resultElement.style.color = "#4caf50";
        
        saveScore();
        document.getElementById('socialShare').style.display = 'block';
        disableInput();
        document.getElementById('resetBtn').style.display = 'inline-block';
        document.getElementById('newPlayerBtn').style.display = 'inline-block';
        updateTemperature(0);
        
    } else {
        const difference = Math.abs(userGuess - secretNumber);
        updateTemperature(difference);
        
        if (userGuess < secretNumber) {
            resultElement.textContent = "Más alto... ⬆️";
            resultElement.style.color = "#ff9800";
        } else {
            resultElement.textContent = "Más bajo... ⬇️";
            resultElement.style.color = "#ff9800";
        }
    }
}

// =============================================
// FUNCIÓN: ACTUALIZAR TEMPERATURA - MODIFICADA
// =============================================
function updateTemperature(difference) {
    const tempText = document.getElementById('tempText');
    const tempBar = document.getElementById('tempBar');
    
    let temperature, width, color;
    
    // 🎯 ACTUALIZAR RANGOS PARA 0-10000
    if (difference === 0) {
        temperature = "¡HIRVIENDO! 🔥";
        width = 100;
        color = "#ff0000";
    } else if (difference <= 50) {        // Muy caliente
        temperature = "Muy caliente 🌡️";
        width = 80;
        color = "#ff5252";
    } else if (difference <= 150) {       // Caliente
        temperature = "Caliente ☀️";
        width = 60;
        color = "#ff9800";
    } else if (difference <= 300) {       // Tibio
        temperature = "Tibio 💨";
        width = 40;
        color = "#ffeb3b";
    } else if (difference <= 600) {       // Frío
        temperature = "Frío ❄️";
        width = 20;
        color = "#2196f3";
    } else {                               // Muy frío
        temperature = "¡CONGELADO! 🧊";
        width = 10;
        color = "#003366";
    }
    
    tempText.textContent = temperature;
    tempBar.style.width = width + '%';
    tempBar.style.background = color;
}