let mensajePendiente = null; // Primer mensaje a mostrar
let mensajeSecundario = null; // Segundo mensaje
let audioPrimero = null;
let audioSegundo = null;

window.addEventListener("load", async () => {
    const startButton = document.getElementById("start-button");
    startButton.classList.add("disable-clicks");

    const juegoCode = "IFOL_clsf";
    const rutinaCode = "FOLK_001";

    // Guardamos lo que había en localStorage
    const correoLS = localStorage.getItem('correo');
    const passwordLS = localStorage.getItem('password');
    const uidLS = localStorage.getItem('uid');

    // Bloquear acceso si no existen esrutina ni esjuego
    if (!localStorage.getItem("esrutina") && !localStorage.getItem("esjuego")) {
        resetearLlaves();
        setMensajesPendientes(
            "ACCESO DENEGADO.",
            "SE TE REDIRIGIRÁ AL INICIO.",
            "sound/fx/denegado.mp3",
            "sound/fx/redireccionando.mp3"
        );
        return;
    }

    // Esperamos a que Firebase indique estado de autenticación
    firebase.auth().onAuthStateChanged(async (user) => {
        await new Promise(r => setTimeout(r, 50));

        // 1️⃣ Verificación de login
        if (!user) {
            resetearLlaves();
            setMensajesPendientes(
                "DEBES INICIAR SESIÓN.",
                "SE TE REDIRIGIRÁ AL INICIO.",
                "sound/fx/iniciarsesion.mp3",
                "sound/fx/redireccionando.mp3"
            );
            return;
        }

        const uid = user.uid;
        const correo = user.email;

        // Verificamos que localStorage coincida
        if (!correoLS || !passwordLS || !uidLS || correoLS !== correo || uidLS !== uid) {
            resetearLlaves();
            setMensajesPendientes(
                "DEBES INICIAR SESIÓN.",
                "SE TE REDIRIGIRÁ AL INICIO.",
                "sound/fx/iniciarsesion.mp3",
                "sound/fx/redireccionando.mp3"
            );
            await firebase.auth().signOut();
            return;
        }

        // ===== Leer variables al momento de la verificación =====
        const esRutina = localStorage.getItem("esrutina") === "si";
        const esJuego = localStorage.getItem("esjuego") === "si";

        // 2️⃣ Verificación de habilitación según tipo
        let habilitado = false;

        if (esRutina && !esJuego) {
            habilitado = await verificarHabilitacionRutina(uid, rutinaCode);
            if (!habilitado) {
                resetearLlaves();
                setMensajesPendientes(
                    "INHABILITADO PARA ESTA RUTINA.",
                    "SE TE REDIRIGIRÁ AL INICIO.",
                    "sound/fx/inhabilitado.mp3",
                    "sound/fx/redireccionando.mp3"
                );
                return;
            } else {
                localStorage.setItem("rutinaCode", rutinaCode);
                localStorage.setItem("rutina", rutinaCode);
            }
        } else if (!esRutina && esJuego) {
            habilitado = await verificarHabilitacionJuego(uid, juegoCode);
            if (!habilitado) {
                resetearLlaves();
                setMensajesPendientes(
                    "INHABILITADO PARA JUGAR ESTE JUEGO.",
                    "SE TE REDIRIGIRÁ AL INICIO.",
                    "sound/fx/inhabilitado.mp3",
                    "sound/fx/redireccionando.mp3"
                );
                return;
            }
        } else {
            resetearLlaves();
            setMensajesPendientes(
                "ACCESO DENEGADO.",
                "SE TE REDIRIGIRÁ AL INICIO.",
                "sound/fx/denegado.mp3",
                "sound/fx/redireccionando.mp3"
            );
            return;
        }

        // 3️⃣ Verificación de paso
        const pasoCorrecto = verificarPaso();
        if (!pasoCorrecto) {
            resetearLlaves();
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
});

// ===== Función para resetear todas las llaves de acceso =====
function resetearLlaves() {
    localStorage.setItem("pass", "X");
    localStorage.setItem("rutina", "X");
    localStorage.setItem("rutinaCode", "X");
    localStorage.setItem("esrutina", "X");
    localStorage.setItem("esjuego", "X");
    localStorage.setItem("acumulado", "X");
}

// ===== Primer clic para mostrar mensajes pendientes =====
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

// ===== Asignar mensajes pendientes =====
function setMensajesPendientes(msg1, msg2, aud1, aud2) {
    mensajePendiente = msg1;
    mensajeSecundario = msg2;
    audioPrimero = aud1;
    audioSegundo = aud2;
}

// ===== Verificación habilitación rutina =====
async function verificarHabilitacionRutina(uid, rutinaCode) {
    try {
        const snapshot = await firebase.database()
            .ref(`rutinas/${rutinaCode}/alumnosHabilitados/${uid}`)
            .once("value");
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error("Error verificando habilitación rutina:", error);
        return false;
    }
}

// ===== Verificación habilitación juego =====
async function verificarHabilitacionJuego(uid, juegoCode) {
    try {
        const snapshot = await firebase.database()
            .ref(`listadejuegos/${juegoCode}/alumnosHabilitados/${uid}`)
            .once("value");
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error("Error verificando habilitación juego:", error);
        return false;
    }
}

// ===== Verificación de pasos =====
function verificarPaso() {
    let pass = localStorage.getItem("pass");
    if (!pass || pass === "X") pass = "X"; // nunca dejar 0
    pass = parseInt(pass) || 0;
    pass += 1;
    localStorage.setItem("pass", pass);
    const archivo = window.location.pathname.split("/").pop();
    const nombre = archivo.split(".")[0];
    return nombre === pass.toString();
}

// ===== Mostrar mensajes secuenciales con audio =====
function mostrarMensajesSecuenciales(msg1, msg2, audio1, audio2) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = msg1;
    messageEl.className = "message inhabilitado";
    messageEl.style.display = "block";

    const a1 = new Audio(audio1);
    a1.play().catch(e => console.warn("Error primer audio:", e));

    a1.onended = () => {
        messageEl.textContent = msg2;
        const a2 = new Audio(audio2);
        a2.play().catch(e => console.warn("Error segundo audio:", e));
        a2.onended = () => {
            window.location.href = "../../../../index.html";
        };
    };
}
