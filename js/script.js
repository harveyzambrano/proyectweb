// =============================================
// VARIABLES GLOBALES
// =============================================
let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let playerName = "";
let currentPlayer = "";
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// =============================================
// CONFIGURACIÓN FIREBASE - VERSIÓN COMPATIBLE
// =============================================
const firebaseConfig = {
    apiKey: "AIzaSyDm-x1f77qTdVvuIzO8cgE9DReQY2BSqoo",
    authDomain: "proyectweb-34f87.firebaseapp.com",
    projectId: "proyectweb-34f87",
    storageBucket: "proyectweb-34f87.firebasestorage.app",
    messagingSenderId: "613530880201",
    appId: "1:613530880201:web:398aaa454aafb430302518",
    measurementId: "G-8B32GK0JTM"
};

// Inicializar Firebase (VERSIÓN COMPATIBLE)
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase conectado correctamente");
    } else {
        console.log("ℹ️  Firebase no cargó, usando localStorage");
    }
} catch (error) {
    console.log("⚠️  Error con Firebase, usando localStorage:", error);
}

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
// FUNCIÓN: INICIAR JUEGO
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
    
    document.getElementById('playerName').disabled = true;
    document.querySelector('.btn-start').disabled = true;
    document.querySelector('.btn-start').style.opacity = '0.6';
    document.querySelector('.btn-start').style.cursor = 'not-allowed';
    
    loadLeaderboard();
    updateTemperature(100);
}

// =============================================
// FUNCIÓN: NUEVO JUGADOR
// =============================================
function newPlayer() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
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
    
    updateTemperature(100);
    playerName = "";
    currentPlayer = "";
}

// =============================================
// FUNCIÓN: REINICIAR JUEGO
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
    
    document.getElementById('guessInput').disabled = false;
    document.querySelector('.btn-guess').disabled = false;
    document.querySelector('.btn-guess').style.opacity = '1';
    document.querySelector('.btn-guess').style.cursor = 'pointer';
    
    updateTemperature(100);
    document.getElementById('tempText').textContent = '¡La aventura comienza!';
}

// =============================================
// FUNCIÓN PRINCIPAL: VERIFICAR guess
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
// FUNCIÓN: DESHABILITAR INPUT
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
// FUNCIÓN: CARGAR LEADERBOARD (FIREBASE + LOCAL) - CORREGIDA
// =============================================
async function loadLeaderboard() {
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            const db = firebase.firestore();
            const snapshot = await db.collection('leaderboard')
                .orderBy('attempts')  // Ordenar por intentos (menos es mejor)
                .limit(50)  // ← AQUÍ DEBE DECIR 50
                .get();
                
            const tbody = document.getElementById('leaderboardBody');
            tbody.innerHTML = '';
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5">¡Sé el primero en jugar! 🏆</td></tr>';
                return;
            }
            
            // 🎯 CONVERTIR A ARRAY Y ORDENAR
            const players = [];
            snapshot.forEach(doc => {
                const player = doc.data();
                players.push({
                    id: doc.id,
                    name: player.name,
                    attempts: player.attempts,
                    dateTime: player.dateTime
                });
            });
            
            // 🎯 ORDENAR POR INTENTOS (por si Firebase no lo hizo)
            players.sort((a, b) => a.attempts - b.attempts);
            
            // 🎯 LIMITAR A 10 Y MOSTRAR
            const topPlayers = players.slice(0, 10);
            
            topPlayers.forEach((player, index) => {
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
            return;
        }
    } catch (error) {
        console.log("⚠️  Error con Firebase:", error);
        loadLocalLeaderboard();  // Fallback a localStorage
    }
    
    loadLocalLeaderboard();
}

// =============================================
// FUNCIÓN: GUARDAR SCORE (FIREBASE + LOCAL)
// =============================================
async function saveScore() {
    const currentDateTime = getCurrentDateTime();
    
    // Intentar guardar en Firebase primero
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            const db = firebase.firestore();
            
            // Buscar si el jugador ya existe
            const playerQuery = await db.collection('leaderboard')
                .where('name', '==', currentPlayer)
                .get();
                
            if (!playerQuery.empty) {
                // Jugador existe, actualizar si tiene mejor score
                const playerDoc = playerQuery.docs[0];
                const playerData = playerDoc.data();
                
                if (attempts < playerData.attempts) {
                    await playerDoc.ref.update({
                        attempts: attempts,
                        dateTime: currentDateTime,
                        lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log("✅ Record actualizado en Firebase");
                }
            } else {
                // Nuevo jugador
                await db.collection('leaderboard').add({
                    name: currentPlayer,
                    attempts: attempts,
                    dateTime: currentDateTime,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("✅ Nuevo record guardado en Firebase");
            }
            
            loadLeaderboard();
            return;
        }
    } catch (error) {
        console.log("⚠️  Error con Firebase, guardando en localStorage:", error);
    }
    
    // Fallback a localStorage
    saveLocalScore(currentDateTime);
}

// =============================================
// FUNCIONES DE RESPALDO (LOCALSTORAGE)
// =============================================
function saveLocalScore(currentDateTime) {
    const existingIndex = leaderboard.findIndex(p => p.name.toLowerCase() === currentPlayer.toLowerCase());
    
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
    loadLocalLeaderboard();
}
// =============================================
// FUNCIÓN:  LOCAL LEADERBOARD
// =============================================
function loadLocalLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    const sortedLeaderboard = [...leaderboard].sort((a, b) => a.attempts - b.attempts).slice(0, 10);
    
    if (sortedLeaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">¡Sé el primero en jugar! 🏆</td></tr>';
        return;
    }
    
    // 🎯 Asegúrate de que esta parte tenga las medallas:
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
// EVENT LISTENERS
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

// =============================================
// FUNCIONES DE COMPARTIR (OPCIONAL)
// =============================================
function shareOnFacebook() {
    const url = encodeURIComponent('https://harveyzambrano.github.io/proyectweb/');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const text = encodeURIComponent(`¡Adiviné el número en ${attempts} intentos! 🎯`);
    const url = encodeURIComponent('https://harveyzambrano.github.io/proyectweb/');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareOnWhatsApp() {
    const text = encodeURIComponent(`¡Adiviné el número en ${attempts} intentos! 🎯 Juega aquí: https://harveyzambrano.github.io/proyectweb/`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}