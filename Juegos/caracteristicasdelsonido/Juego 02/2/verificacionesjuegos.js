let mensajePendiente = null; 
let mensajeSecundario = null;
let audioPrimero = null;
let audioSegundo = null;

window.addEventListener("load", async () => {
    const startButton = document.getElementById("start-button");
    startButton.classList.add("disable-clicks");
    const juegoCode = "TM_rcnc";

    const correoLS = localStorage.getItem('correo');
    const passwordLS = localStorage.getItem('password');
    const uidLS = localStorage.getItem('uid');

    // 1️⃣ Esperamos a que Firebase indique si hay usuario logueado
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            // No hay sesión activa → DEBES INICIAR SESIÓN
            console.log("🚨 Paso 1: DEBES INICIAR SESIÓN");
            setMensajesPendientes(
                "DEBES INICIAR SESIÓN.",
                "SE TE REDIRIGIRÁ AL INICIO.",
                "sound/fx/iniciarsesion.mp3",
                "sound/fx/redireccionando.mp3"
            );
            return;
        }

        // Usuario activo en Firebase
        const uid = user.uid;
        const correo = user.email;

        // Verificamos que los datos de localStorage coincidan
        if (correo !== correoLS || uid !== uidLS || !passwordLS) {
            // Datos guardados inválidos → ACCESO DENEGADO
            console.log("🚨 Paso 2: ACCESO DENEGADO (datos no coinciden)");
            setMensajesPendientes(
                "ACCESO DENEGADO.",
                "SE TE REDIRIGIRÁ AL INICIO.",
                "sound/fx/denegado.mp3",
                "sound/fx/redireccionando.mp3"
            );
            // Cerramos sesión para limpiar cualquier estado
            await firebase.auth().signOut();
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

        // 4️⃣ Verificación de paso
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

        // ✅ Todo OK
        startButton.classList.remove("disable-clicks");
    });
});

// Funciones existentes (sin cambios)
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

function setMensajesPendientes(msg1, msg2, aud1, aud2) {
    mensajePendiente = msg1;
    mensajeSecundario = msg2;
    audioPrimero = aud1;
    audioSegundo = aud2;
}

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

function verificarPaso() {
    let pass = parseInt(localStorage.getItem("pass")) || 0;
    pass += 1;
    localStorage.setItem("pass", pass);
    const archivo = window.location.pathname.split("/").pop();
    const nombre = archivo.split(".")[0];
    return nombre === pass.toString();
}

function mostrarMensajesSecuenciales(msg1, msg2, audio1, audio2) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = msg1;
    messageEl.className = "message inhabilitado";
    messageEl.style.display = "block";
    new Audio(audio1).play();
    setTimeout(() => {
        messageEl.textContent = msg2;
        new Audio(audio2).play();
        setTimeout(() => {
            window.location.href = "../../../../index.html";
        }, 3000);
    }, 3000);
}
