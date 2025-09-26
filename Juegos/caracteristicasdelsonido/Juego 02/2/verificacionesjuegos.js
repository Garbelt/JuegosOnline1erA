let mensajePendiente = null; // Primer mensaje a mostrar
let mensajeSecundario = null; // Segundo mensaje
let audioPrimero = null;
let audioSegundo = null;

window.addEventListener("load", async () => {
    const startButton = document.getElementById("start-button");
    startButton.classList.add("disable-clicks");

    const juegoCode = "TM_rcnc";

    // 1️⃣ Verificación de existencia de login en localStorage
    const correo = localStorage.getItem('correo');
    const password = localStorage.getItem('password');
    const uid = localStorage.getItem('uid');

    if (!correo || !password || !uid) {
        console.log("🚨 Paso 1: DEBES INICIAR SESIÓN");
        setMensajesPendientes(
            "DEBES INICIAR SESIÓN.",
            "SE TE REDIRIGIRÁ AL INICIO.",
            "sound/fx/iniciarsesion.mp3",
            "sound/fx/redireccionando.mp3"
        );
        return;
    }

    // 2️⃣ Autenticación real con Firebase
    try {
        // Forzar cierre de sesión previo para evitar interferencias de sesiones guardadas en Chrome
        await firebase.auth().signOut();
        await firebase.auth().signInWithEmailAndPassword(correo, password);
    } catch (err) {
        console.error("Login inválido:", err);
        setMensajesPendientes(
            "ACCESO DENEGADO.",
            "SE TE REDIRIGIRÁ AL INICIO.",
            "sound/fx/denegado.mp3",
            "sound/fx/redireccionando.mp3"
        );
        return;
    }

    // 3️⃣ Verificación de habilitación
    const habilitado = await verificarHabilitacion(uid, juegoCode);
    if (!habilitado) {
        setMensajesPendientes(
            "INHABILITADO PARA JUGAR ESTE JUEGO.",
            "SE TE REDIRIGIRÁ AL INICIO.",
            "sound/fx/inhabilitado.mp3",
            "sound/fx/redireccionando.mp3"
        );
        return;
    }

    // 4️⃣ Verificación de paso (orden de páginas)
    const pasoCorrecto = verificarPaso();
    if (!pasoCorrecto) {
        setMensajesPendientes(
            "ACCESO DENEGADO.",
            "SE TE REDIRIGIRÁ AL INICIO.",
            "sound/fx/denegado.mp3",
            "sound/fx/redireccionando.mp3"
        );
        return;
    }

    // ✅ Todo OK → habilitamos el botón de inicio
    startButton.classList.remove("disable-clicks");
});

//  Primer clic en cualquier parte para mostrar mensajes pendientes
window.addEventListener("click", () => {
    if (mensajePendiente && mensajeSecundario) {
        mostrarMensajesSecuenciales(
            mensajePendiente,
            mensajeSecundario,
            audioPrimero,
            audioSegundo
        );
        mensajePendiente = null;
        mensajeSecundario = null;
    }
});

// Función para asignar mensajes y audios pendientes
function setMensajesPendientes(msg1, msg2, aud1, aud2) {
    mensajePendiente = msg1;
    mensajeSecundario = msg2;
    audioPrimero = aud1;
    audioSegundo = aud2;
}

// Función de verificación de habilitación en Firebase
async function verificarHabilitacion(uid, juegoCode) {
    try {
        const snapshot = await firebase.database()
            .ref(`listadejuegos/${juegoCode}/alumnosHabilitados/${uid}`)
            .once("value");
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error("Error verificando habilitación:", error);
        return false;
    }
}

// Función de verificación de pasos
function verificarPaso() {
    let pass = parseInt(localStorage.getItem("pass")) || 0;
    pass += 1;
    localStorage.setItem("pass", pass);
    const archivo = window.location.pathname.split("/").pop();
    const nombre = archivo.split(".")[0];
    return nombre === pass.toString();
}

// Función para mostrar mensajes secuenciales con audio
function mostrarMensajesSecuenciales(msg1, msg2, audio1, audio2) {
    const messageEl = document.getElementById("message");

    // Primer mensaje
    messageEl.textContent = msg1;
    messageEl.className = "message inhabilitado";
    messageEl.style.display = "block";
    new Audio(audio1).play();

    setTimeout(() => {
        // Segundo mensaje
        messageEl.textContent = msg2;
        new Audio(audio2).play();

        setTimeout(() => {
            window.location.href = "../../../../index.html";
        }, 3000);
    }, 3000);
}
