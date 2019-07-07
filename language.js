/*========================================================
 * function that sets the strings for different languages
 *========================================================*/
function language(){

    if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
        document.getElementsByClassName("STRING_MODE")[0].innerText = "Modo"

        document.getElementsByClassName("STRING_FILES")[0].innerText = "Archivos"
        document.getElementsByClassName("STRING_AUTOMATIC")[0].innerHTML = "Automático"

        document.getElementsByClassName("STRING_GYMS_FILE")[0].innerHTML = 'Gimnasios: <span class="inputfile">seleccionar archivo</span>'
        document.getElementsByClassName("STRING_EX_FILE")[0].innerHTML = 'Zonas EX: <span class="inputfile">seleccionar archivo</span>'
        document.getElementsByClassName("STRING_EXCLUSION_FILE")[0].innerHTML = 'Zonas excluyentes: <span class="inputfile">seleccionar archivo</span>'

        document.getElementsByClassName("STRING_URL_EX")[0].innerHTML = "URL zonas EX"
        document.getElementsByClassName("STRING_URL_EXCLUSION")[0].innerHTML = "URL zonas excluyentes"

        document.getElementsByClassName("STRING_GET_AREAS")[0].innerHTML = "Obtener zonas"
        document.getElementsByClassName("STRING_GET_EX_AREAS")[0].innerHTML = "Zonas EX"
        document.getElementsByClassName("STRING_GET_EXCLUSION_AREAS")[0].innerHTML = "Zonas excluyentes"
        document.getElementsByClassName("STRING_GET_RESET_AREAS")[0].innerHTML = "Resetear zonas"

        document.getElementsByClassName("STRING_STATUS_AUTOMATIC_MODE")[0].innerHTML = "Estado de modo automático"
        document.getElementsByClassName("STRING_PROBLEMS_DETECTED")[0].innerHTML = "Errores detectados"

        document.getElementById("EX_areas_status").innerHTML = "• Sube el archivos con los datos de los gimnasios y pulsa en el primer botón."

        document.getElementsByClassName("STRING_GET_GYMS")[0].innerHTML = "Obtener gimnasios EX y bloqueados"

        document.getElementsByClassName("STRING_DOWNLOADS")[0].innerHTML = "Descargas"
    }
}

function language_sidebar(){
    if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
        document.getElementsByClassName("STRING_MENU")[0].innerHTML = "Menú"
        document.getElementsByClassName("STRING_TOOL")[0].innerHTML = "Herramienta"
        document.getElementsByClassName("STRING_REFERENCES")[0].innerHTML = "Referencias"
        document.getElementsByClassName("STRING_CREDITS")[0].innerHTML = "Créditos"
    }
}

function language_credits(){
    if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
        document.getElementsByClassName("STRING_CREDITS_TITLE")[0].innerHTML = "Créditos"
        document.getElementsByClassName("STRING_MORE_INFO")[0].innerHTML = "Más información"
        document.getElementsByClassName("STRING_MORE_INFO")[1].innerHTML = "Más información"
        document.getElementsByClassName("STRING_MORE_INFO")[2].innerHTML = "Más información"
        document.getElementsByClassName("STRING_MORE_INFO")[3].innerHTML = "Más información"

        document.getElementsByClassName("STRING_TURF")[0].innerHTML = "Esta librería es usada para determinar si un punto está dentro de un polígono lo cual hace posible comprobar si un gimnasio está dentro de una zona EX o excluyente."
        document.getElementsByClassName("STRING_S2GEOMETRY")[0].innerHTML = "Esta librería es usada para obtener el centro de las celdas S2 de nivel 20 que contienen el gimnasio."
        document.getElementsByClassName("STRING_OSMTOGEOJSON")[0].innerHTML = "Esta librería es usada para convertir los datos de la API de overpass a GeoJSON."
        document.getElementsByClassName("STRING_CUSTOM_FILE_INPUT")[0].innerHTML = "Este código es usado en los bloques de entrada de ficheros."
  }
}

function language_references(){
    if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
        document.getElementsByClassName("STRING_REFERENCES_TITLE")[0].innerHTML = "Referencias"

        document.getElementsByClassName("STRING_REFERENCES_INFO")[0].innerHTML = "Desde la salida the las raids EX se ha hecho muchísima investigación. Los posts más importantes sobre raids EX son los siguientes:"
    }
}

function language_info(){
    if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
        document.getElementsByClassName("STRING_IMPORTANT_TEXT")[0].innerHTML = "IMPORTANTE: este script puede tardar un poco en ejecutarse."
    }
}