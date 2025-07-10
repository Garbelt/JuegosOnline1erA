// Función para mostrar el submenú correspondiente al tema seleccionado
function showSubMenu(theme) {
    const subMenuPages = {
        'caracteristicasdelsonido': '../Juegos/caracteristicasdelsonido/catalogo.html',
        'laorquestasinfonica': '../Juegos/laorquestasinfonica/catalogo.html',


    };

    if (subMenuPages.hasOwnProperty(theme)) {
        window.location.href = subMenuPages[theme];
    } else {
        console.error('No hay submenú definido para el tema seleccionado.');
    }
}

