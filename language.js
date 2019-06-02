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

    document.getElementsByClassName("STRING_GET_EX_AREAS")[0].innerHTML = "Obtener zonas EX"
    document.getElementsByClassName("STRING_GET_EXCLUSION_AREAS")[0].innerHTML = "Obtener zonas excluyentes"
    document.getElementsByClassName("STRING_GET_RESET_AREAS")[0].innerHTML = "Resetear zonas"

    document.getElementsByClassName("STRING_STATUS_AUTOMATIC_MODE")[0].innerHTML = "Estado de modo automático"
    document.getElementsByClassName("STRING_PROBLEMS_DETECTED")[0].innerHTML = "Errores detectados"

    document.getElementsByClassName("STRING_GET_GYMS")[0].innerHTML = "Obtener gimnasios EX y bloqueados"

    document.getElementsByClassName("STRING_MENU")[0].innerHTML = "Menú (test)"
  }
}