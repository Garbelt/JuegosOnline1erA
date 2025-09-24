// Función para mostrar el submenú correspondiente al tema seleccionado
function showSubMenu(theme) {
    // Definir los enlaces a las páginas de los submenús
    var subMenuPages = {
        'canciones': 'sub_menu_canciones.html',
        'instrumentos': 'sub_menu_instrumentos.html',
        'caracteristicas': 'sub_menu_caracteristicas.html',
        'folclore': 'sub_menu_folclore.html'
    };

    // Verificar si el tema tiene un submenú asociado
    if (subMenuPages.hasOwnProperty(theme)) {
        // Redirigir a la página del submenú correspondiente
        window.location.href = subMenuPages[theme];
    } else {
        console.error('No hay submenú definido para el tema seleccionado.');
    }
}

// Función para redirigir al menú principal
function goToMainMenu() {
    // Redirigir al usuario de vuelta al menú principal (menu.html)
    window.location.href = 'menu.html';
}

// Función para cerrar la ventana del navegador
function exit() {
    // Cerrar la ventana del navegador
    window.close();
}

// Función para redirigir a registro
function goToRegistration() {
    // Redirigir al usuario al archivo index.html en la carpeta anterior
    window.location.href = '../index.html';
}
