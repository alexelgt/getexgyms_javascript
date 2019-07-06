/*==== Deal with page style if select_mode is changed ====*/
function handleSelectedmode() {
    if ( current_mode != "Manual" ) {
        document.getElementById("File_section_EX").style.display = 'none';
        document.getElementById("File_section_exclusion").style.display = 'none';
        
    }
    else{
        document.getElementById("File_section_EX").style.display = 'block';
        document.getElementById("File_section_exclusion").style.display = 'block';
    }

    if ( current_mode == "URL" ) {
        document.getElementsByClassName("URL_area")[0].style.display = 'block';
    }
    else {
        document.getElementsByClassName("URL_area")[0].style.display = 'none';
    }

    if ( current_mode == "Automatic" ) {
        document.getElementById("Automatic_section").style.display = 'block';
        readyToGetEXAndBlocked();
    }
    else{
        document.getElementById("Automatic_section").style.display = 'none';
        readyToGetEXAndBlocked();
    }
}
/*== Deal with page style if select_mode is changed ==*/

function setMode(mode,pressed_div) {

    var parentClass = pressed_div.parentNode.className;

    if (parentClass != "") {
        parentClass = "." + parentClass.replace(/ /g, '.');
    }

    /*==== Remove class "selected" from all elements ====*/
    var elems = document.querySelectorAll("#button_structure" + parentClass + " > div");

    [].forEach.call(elems, function(el) {
        el.classList.remove("selected");
    });
    /*== Remove class "selected" from all elements ==*/

    /*=== Add class "selected" to element who triggered the function ===*/
    pressed_div.classList.add("selected");

    changeModeVar(mode);

    function changeModeVar(mode,parentClass) {
        current_mode = mode;
    }

    handleSelectedmode();
}