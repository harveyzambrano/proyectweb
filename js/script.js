 // =============================================
// VARIABLES GLOBALES
// =============================================
let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let playerName = "";
let currentPlayer = "";
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// =============================================
// FUNCIÓN: OBTENER FECHA Y HORA ACTUAL
// =============================================
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('es-ES');
    const time = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    return `${date} ${time}`;
}

// =============================================
// FUNCIÓN: INICIAR JUEGO (CORREGIDA)
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
    
    // DESACTIVAR campo de nombre y botón de comenzar
    document.getElementById('playerName').disabled = true;
    document.querySelector('.btn-start').disabled = true;
    document.querySelector('.btn-start').style.opacity = '0.6';
    document.querySelector('.btn-start').style.cursor = 'not-allowed';
    
    loadLeaderboard();
    updateTemperature(100);
}

// =============================================
// FUNCIÓN: NUEVO JUGADOR (MEJORADA)
// =============================================
function newPlayer() {
    // Reiniciar variables
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    
    // Limpiar interfaz
    document.getElementById('guessInput').value = '';
    document.getElementById('result').textContent = '¡Empieza a adivinar!';
    document.getElementById('attempts').textContent = 'Intentos: 0';
    document.getElementById('socialShare').style.display = 'none';
    document.getElementById('newPlayerBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('gameContent').style.display = 'none';
    
    // REACTIVAR TODOS los controles
    document.getElementById('playerName').disabled = false;
    document.querySelector('.btn-start').disabled = false;
    document.querySelector('.btn-start').style.opacity = '1';
    document.querySelector('.btn-start').style.cursor = 'pointer';
    
    document.getElementById('guessInput').disabled = false;
    document.querySelector('.btn-guess').disabled = false;
    document.querySelector('.btn-guess').style.opacity = '1';
    document.querySelector('.btn-guess').style.cursor = 'pointer';
    
    // Preparar para nuevo jugador
    document.getElementById('playerName').value = '';
    document.getElementById('playerName').focus();
    
    updateTemperature(100);
    
    playerName = "";
    currentPlayer = "";
}

// =============================================
// FUNCIÓN: REINICIAR JUEGO (MEJORADA)
// =============================================
function resetGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    
    document.getElementById('guessInput').value = '';
    document.getElementById('result').textContent = '¡Empieza a adivinar!';
    document.getElementById('attempts').textContent = 'Intentos: 0';
    document.getElementById('socialShare').style.display = 'none';
    document.getElementById('newPlayerBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'none';
    
    // REACTIVAR controles de juego
    document.getElementById('guessInput').disabled = false;
    document.querySelector('.btn-guess').disabled = false;
    document.querySelector('.btn-guess').style.opacity = '1';
    document.querySelector('.btn-guess').style.cursor = 'pointer';
    
    updateTemperature(100);
    document.getElementById('tempText').textContent = '¡La aventura comienza!';
}

// =============================================
// FUNCIÓN PRINCIPAL: VERIFICAR guess (CORREGIDA)
// =============================================
function checkGuess() {
    const userGuess = parseInt(document.getElementById('guessInput').value);
    const resultElement = document.getElementById('result');
    const attemptsElement = document.getElementById('attempts');

    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        resultElement.textContent = "¡Por favor, ingresa un número válido entre 1 y 100!";
        resultElement.style.color = "#ffeb3b";
        return;
    }

    attempts++;
    attemptsElement.textContent = `Intentos: ${attempts}`;

    if (userGuess === secretNumber) {
        resultElement.textContent = `¡Felicidades ${currentPlayer}! 🎉 Adivinaste en ${attempts} intentos.`;
        resultElement.style.color = "#4caf50";
        
        // Guardar score y mostrar botones
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
// FUNCIÓN: DESHABILITAR INPUT (SOLO AL GANAR)
// =============================================
function disableInput() {
    document.getElementById('guessInput').disabled = true;
    document.querySelector('.btn-guess').disabled = true;
    document.querySelector('.btn-guess').style.opacity = '0.6';
    document.querySelector('.btn-guess').style.cursor = 'not-allowed';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('newPlayerBtn').style.display = 'inline-block';
}

// =============================================
// FUNCIÓN: CARGAR LEADERBOARD (ACTUALIZADA)
// =============================================
function loadLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    const sortedLeaderboard = [...leaderboard].sort((a, b) => a.attempts - b.attempts).slice(0, 10);
    
    if (sortedLeaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">¡Sé el primero en jugar! 🏆</td></tr>';
        return;
    }
    
    sortedLeaderboard.forEach((player, index) => {
        const row = document.createElement('tr');
        
        let positionEmoji = '';
        if (index === 0) positionEmoji = '🥇';
        else if (index === 1) positionEmoji = '🥈';
        else if (index === 2) positionEmoji = '🥉';
        
        row.innerHTML = `
            <td>${positionEmoji} ${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.attempts}</td>
            <td>${1000 - (player.attempts * 10)}</td>
            <td>${player.dateTime || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// =============================================
// FUNCIÓN: GUARDAR SCORE (ACTUALIZADA)
// =============================================
function saveScore() {
    const existingIndex = leaderboard.findIndex(p => p.name.toLowerCase() === currentPlayer.toLowerCase());
    const currentDateTime = getCurrentDateTime();
    
    if (existingIndex !== -1) {
        if (attempts < leaderboard[existingIndex].attempts) {
            leaderboard[existingIndex].attempts = attempts;
            leaderboard[existingIndex].dateTime = currentDateTime;
        }
    } else {
        leaderboard.push({ 
            name: currentPlayer, 
            attempts: attempts, 
            dateTime: currentDateTime 
        });
    }
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

// =============================================
// FUNCIÓN: ACTUALIZAR TEMPERATURA
// =============================================
function updateTemperature(difference) {
    const tempText = document.getElementById('tempText');
    const tempBar = document.getElementById('tempBar');
    
    let temperature, width, color;
    
    if (difference === 0) {
        temperature = "¡HIRVIENDO! 🔥";
        width = 100;
        color = "#ff0000";
    } else if (difference <= 5) {
        temperature = "Muy caliente 🌡️";
        width = 80;
        color = "#ff5252";
    } else if (difference <= 15) {
        temperature = "Caliente ☀️";
        width = 60;
        color = "#ff9800";
    } else if (difference <= 30) {
        temperature = "Tibio 💨";
        width = 40;
        color = "#ffeb3b";
    } else {
        temperature = "Frío ❄️";
        width = 20;
        color = "#2196f3";
    }
    
    tempText.textContent = temperature;
    tempBar.style.width = width + '%';
    tempBar.style.background = color;
}

// =============================================
// EVENT LISTENERS E INICIALIZACIÓN
// =============================================
document.getElementById('playerName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        startGame();
    }
});

document.getElementById('guessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard();
    updateTemperature(100);
});