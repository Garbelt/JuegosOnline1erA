const words = ["LOCRO", "EMPANADAS", "ASADO", "GUITARRA", "BOMBO", "PONCHO", "ALPARGATAS", "ZAMBA", "CHACARERA", "CHAMAMÉ", "CUECA", "CARNAVALITO", "TRUCO", "ACORDEÓN"];
let totalWords = words.length;
let usedWords = [];
const gridSize = 12;
let grid = [];
let correctCells = [];
let selectedCells = [];
const DIREC = [];
const CORSEL = [];
const INCORSEL = [];
let timerInterval;
let totalTimeInSeconds = 150;
let score = 0;
let messageShown = false; // Para evitar repetir el mensaje final
let gameSaved = false;    // Para controlar que se guarde el juego solo una vez


// Función para generar letra aleatoria
function getRandomLetterExcluding(excludedLetter) {
    let newLetter;
    do {
        newLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } while (newLetter === excludedLetter);
    return newLetter;
}

// Crear la sopa de letras
function createPuzzle() {
    grid = [];
    correctCells = [];
    selectedCells = [];
    DIREC.length = 0;
    CORSEL.length = 0;
    INCORSEL.length = 0;

    const puzzleElement = document.getElementById("puzzle");
    puzzleElement.innerHTML = "";

    let wordFound;
    do {
        wordFound = chooseNewWord();
    } while (usedWords.includes(wordFound));

    usedWords.push(wordFound);

    for (let i = 0; i < gridSize; i++) {
        const row = [];
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");

        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${i}/${j}`;
            row.push(cell);
            rowElement.appendChild(cell);
        }

        grid.push(row);
        puzzleElement.appendChild(rowElement);
    }

    insertWordInGrid(wordFound);
    fillEmptyCells();

    document.getElementById("palabras").textContent = `${wordFound}`;

    if (!timerInterval) startTimer();
}

// Elegir palabra no usada
function chooseNewWord() {
    const unusedWords = words.filter(word => !usedWords.includes(word));
    return unusedWords[Math.floor(Math.random() * unusedWords.length)];
}

// Insertar palabra en la cuadrícula
function insertWordInGrid(word) {
    const wordLength = word.length;
    const { position, direction } = getRandomPositionAndDirection(wordLength);
    const { row, col } = position;

    if (direction === "horizontal") {
        for (let i = 0; i < wordLength; i++) {
            grid[row][col + i].textContent = word[i];
            correctCells.push({ row, col: col + i });
            DIREC.push(`${row}/${col + i}`);
        }
    } else {
        for (let i = 0; i < wordLength; i++) {
            grid[row + i][col].textContent = word[i];
            correctCells.push({ row: row + i, col });
            DIREC.push(`${row + i}/${col}`);
        }
    }
}

// Posición y dirección aleatoria
function getRandomPositionAndDirection(wordLength) {
    const remainingSpace = gridSize - wordLength;
    let direction, startRow, startCol;

    if (Math.random() < 0.5) {
        direction = "horizontal";
        startRow = Math.floor(Math.random() * gridSize);
        startCol = Math.floor(Math.random() * (remainingSpace + 1));
    } else {
        direction = "vertical";
        startRow = Math.floor(Math.random() * (remainingSpace + 1));
        startCol = Math.floor(Math.random() * gridSize);
    }

    return { position: { row: startRow, col: startCol }, direction };
}

// Llenar espacios vacíos
function fillEmptyCells() {
    grid.forEach(row => row.forEach(cell => {
        if (cell.textContent === "") cell.textContent = getRandomLetterExcluding("");
    }));
}

// Temporizador
function startTimer() {
    updateTimerDisplay(totalTimeInSeconds);
    timerInterval = setInterval(() => {
        totalTimeInSeconds--;
        updateTimerDisplay(totalTimeInSeconds);

        if (totalTimeInSeconds <= 0) {
            clearInterval(timerInterval);
            setTimeout(checkCorrectCellsSelected, 0);
        }
    }, 1000);
}

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    document.getElementById("reloj").textContent = `Tiempo: ${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
}

// Mensajes y puntaje
function disableClicks() { document.body.classList.add("disable-clicks"); }
function enableClicks() { document.body.classList.remove("disable-clicks"); }


// Función genérica para mostrar mensajes del juego
function showGameMessage(text, duration = 3000, audioSrc = null, callback = null, extraClass = "") {
    disableClicks();
    const messageElement = document.createElement("div");
    messageElement.innerHTML = text; // admite HTML
    messageElement.classList.add("found-message");
    if (extraClass) messageElement.classList.add(extraClass);

    // 🔹 CAMBIO AQUÍ:
    const container = document.querySelector(".container") || document.body;
    container.appendChild(messageElement);

    if (audioSrc) {
        const audio = new Audio(audioSrc);
        audio.play();
    }

    setTimeout(() => {
        messageElement.remove();
        enableClicks();
        if (callback) callback();
    }, duration);
}



// Mostrar "PALABRA ENCONTRADA"
function showFoundMessage() {
    showGameMessage("PALABRA ENCONTRADA", 3000, "sound/PalabraEncontrada.mp3", () => {
        score += 30;
        document.getElementById("puntaje").textContent = `Puntaje: ${score}`;
        checkForBonus();
        createPuzzle();
    }, "correct");
}

// Comprobar selección correcta
function checkCorrectCellsSelected() {
    if (gameSaved) return; // 🔹 Evita duplicados

    const allCorrectSelected = correctCells.every(c => CORSEL.includes(`${c.row}/${c.col}`));
    const anyIncorrectSelected = INCORSEL.length > 0;

    if (allCorrectSelected && !anyIncorrectSelected) {
        showFoundMessage();
        return;
    }

    if (totalTimeInSeconds <= 0) {
        updateAcumulado(score);
        showEndGameMessage();
        clearInterval(timerInterval);
    }
}

// Mensajes finales controlados por gameSaved
function showEndGameMessage() {
    if (messageShown) return; // solo controla el mensaje
    messageShown = true;

    showGameMessage("FIN DE ESTE JUEGO", 7000, "sound/findejuego.mp3", () => {
        const backgroundAudio = document.getElementById('background-music');
        fadeOutAudio(backgroundAudio, 5000);

        setTimeout(() => {
            saveGameScore(); // ahora sí se ejecuta aunque messageShown = true
            window.location.href = "out.html";
        }, 6000);
    }, "correct");
}


// Mostrar mensaje de bonus
function showBonusMessage(bonus) {
    if (messageShown) return;
    messageShown = true;

    showGameMessage(`¡DESCUBRISTE TODAS LAS PALABRAS!<br>GANASTE UN BONUS DE ${bonus} PUNTOS.`, 6000, null, () => {
        const backgroundAudio = document.getElementById('background-music');
        fadeOutAudio(backgroundAudio, 5000);

        setTimeout(() => {
            saveGameScore();
            window.location.href = "out.html";
        }, 6000);
    }, "correct");
}


// Guardar puntaje completo
function saveGameScore() {
    if (gameSaved) return; // control independiente del mensaje
    gameSaved = true;

    const usuario = localStorage.getItem("ActualUs") || "desconocido";
    const currentDate = new Date().toLocaleDateString();
    const gameData = {
        fecha: currentDate,
        usuario: usuario,
        puntaje: score,
        juegonumero: incrementGameNumber(),
        game: "FOLK_sdl",
        acumulado: parseInt(localStorage.getItem("acumulado")) || 0,
        rutina: localStorage.getItem("rutina")
    };

    const gamesHistory = JSON.parse(localStorage.getItem("gamesHistory")) || [];
    gamesHistory.push(gameData);
    localStorage.setItem("gamesHistory", JSON.stringify(gamesHistory));

    saveGameResultToFirebase(score, "FOLK_sdl", "Sopa de Letras", usuario);
}


function incrementGameNumber() {
    let gameNumber = parseInt(localStorage.getItem("juegonumero")) || 0;
    gameNumber++;
    localStorage.setItem("juegonumero", gameNumber);
    return gameNumber;
}

// Bonus
function checkForBonus() {
    if (gameSaved) return; // 🔹 Evita duplicados

    if (usedWords.length === totalWords) {
        clearInterval(timerInterval); // 🔹 Detener el temporizador
        const bonus = totalTimeInSeconds + (totalWords * 5);
        score += bonus;
        updateAcumulado(score);
        document.getElementById("puntaje").textContent = `Puntaje: ${score}`;
        showBonusMessage(bonus);
    }
}

function fadeOutAudio(audio, duration) {
    let volume = audio.volume;
    const step = volume / (duration / 100);
    const fadeAudio = setInterval(() => {
        if (volume > 0) {
            volume -= step;
            if (volume < 0) volume = 0;
            audio.volume = volume;
        } else clearInterval(fadeAudio);
    }, 100);
}

// Guardar en Firebase
function saveGameResultToFirebase(puntaje, gameCode, gameTitle, usuario) {
    const fecha = new Date().toLocaleDateString("es-ES");
    const newGameRef = firebase.database().ref("games").push();
    newGameRef.set({
        fecha: fecha,
        game: gameCode,
        puntaje: puntaje,
        title: gameTitle,
        usuario: usuario
    })
    .then(() => console.log("✅ Resultado completo guardado en Firebase"))
    .catch(error => console.error("❌ Error al guardar:", error));
}

function updateAcumulado(scoreToAdd) {
    let acumulado = parseInt(localStorage.getItem("acumulado")) || 0;
    acumulado += scoreToAdd;
    localStorage.setItem("acumulado", acumulado);
}

// Manejo de clicks en celdas
document.addEventListener("click", function(event) {
    const cell = event.target;
    if (cell.classList.contains("cell")) {
        const cellName = cell.id;

        if (DIREC.includes(cellName)) {
            if (CORSEL.includes(cellName)) {
                CORSEL.splice(CORSEL.indexOf(cellName), 1);
                cell.classList.remove("found");
            } else {
                CORSEL.push(cellName);
                cell.classList.add("found");
            }
        } else {
            if (INCORSEL.includes(cellName)) {
                INCORSEL.splice(INCORSEL.indexOf(cellName), 1);
                cell.classList.remove("found");
            } else {
                INCORSEL.push(cellName);
                cell.classList.add("found");
            }
        }

        setTimeout(checkCorrectCellsSelected, 0);
    }
});

fillEmptyCells();

