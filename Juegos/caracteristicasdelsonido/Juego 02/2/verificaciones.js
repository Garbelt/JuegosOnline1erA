window.addEventListener("load", async () => {
    const correo = localStorage.getItem('correo');
    const password = localStorage.getItem('password');

    if (!correo || !password) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "../../../../index.html";
        return;
    }

    // Escuchar el estado de autenticación
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("Usuario autenticado:", user.email);
            // Aquí se puede inicializar el juego o habilitar botones
        } else {
            // Si no hay usuario logueado, intentar login con credenciales
            firebase.auth().signInWithEmailAndPassword(correo, password)
                .then(() => {
                    console.log("Login válido con credenciales");
                })
                .catch(err => {
                    console.error(err);
                    alert("Sesión inválida o expirada. Vuelve a iniciar sesión.");
                    window.location.href = "../../../../index.html";
                });
        }
    });
});
