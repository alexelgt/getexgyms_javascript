/*==== Set data from input files ====*/

/*==== Gyms ====*/
function handleFilegyms (evt) {
    const fr_gyms = new FileReader();
    fr_gyms.readAsText(evt.target.files[0]);

    output_filename = evt.target.files[0].name.replace('.csv', '').replace('.txt', '');

    fr_gyms.onload = e => {
        data_global_gyms = (e.target.result);
        [gyms_data, problem_detected] = csvJSON(data_global_gyms);

        /*==== Check if any of the rows contains valid data ====*/
        problems_with_gyms = false;
        anyValidGym = removeProblematicGymRows(problem_detected); // this function returns the number of valid gyms

        if (!anyValidGym) {
            readyToGetEXAndBlocked();
            if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
                document.getElementById("Output_error_gyms").innerHTML = "• Ninguno de los gimnasios es válido . Por favor, seleccione un archivo válido.<br>";
            }
            else {
                document.getElementById("Output_error_gyms").innerHTML = "• None of the gyms are valid. Please, select a valid file.<br>";
            }
            document.getElementById("Output_error_orange").innerHTML = "";
            document.getElementById("btngetexareas").disabled = true;
            throw new Error("None of the gyms are valid");
        }
        else {
            document.getElementById("Output_error_gyms").innerHTML = "";
            if ( current_mode != "Automatic" ) {
                readyToGetEXAndBlocked();
                isThereAnyError();
            }
            if (!automaticModeNeedsReset) {
                document.getElementById("btngetexareas").disabled = false;
            }
        }
        /*== Check if any of the rows contains valid data ==*/
        
    };
};

document.getElementById('gymsfile').addEventListener('change', handleFilegyms, false);
/*== Gyms ==*/

/*==== EX areas ====*/
function handleFileEXareas (evt) {
    const fr_exareas = new FileReader();
    fr_exareas.readAsText(evt.target.files[0]);

    fr_exareas.onload = e => {
        try {
            data_global_exareas_manual = JSON.parse(e.target.result);
            EXAreasReady = true;
            readyToGetEXAndBlocked();
            document.getElementById("Output_error_EXAreas").innerHTML = "";
        } catch(e) {
            EXAreasReady = false;
            readyToGetEXAndBlocked();
            if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
                document.getElementById("Output_error_EXAreas").innerHTML = "• Archivo con las zonas EX no correcto.<br>";
            }
            else {
                document.getElementById("Output_error_EXAreas").innerHTML = "• File with EX areas not correct.<br>";
            }
            isThereAnyError();
            throw new Error("File with EX areas not correct");
        }

        try {
            data_global_exareas_manual['features'].length;
        } catch(e) {
            EXAreasReady = false;
            readyToGetEXAndBlocked();
            if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
                document.getElementById("Output_error_EXAreas").innerHTML = "• Archivo con las zonas EX no correcto.<br>";
            }
            else {
                document.getElementById("Output_error_EXAreas").innerHTML = "• File with EX areas not correct.<br>";
            }
            isThereAnyError();
            throw new Error("File with EX areas not correct");
        }
        isThereAnyError();
    };
};

document.getElementById('EXareasfile').addEventListener('change', handleFileEXareas, false);
/*== EX areas ==*/

/*==== Exclusion areas ====*/
function handleFileexclusionareas (evt) {
    const fr_exclusionareas = new FileReader();
    fr_exclusionareas.readAsText(evt.target.files[0]);

    fr_exclusionareas.onload = e => {
        try {
            data_global_exclusionareas_manual = JSON.parse(e.target.result);
            ExclusionAreasReady = true;
            readyToGetEXAndBlocked();
            document.getElementById("Output_error_exclusionAreas").innerHTML = "";
        } catch(e) {
            ExclusionAreasReady = false;
            readyToGetEXAndBlocked();
            if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
                document.getElementById("Output_error_EXAreas").innerHTML = "• Archivo con las zonas excluyentes no correcto.<br>";
            }
            else {
                document.getElementById("Output_error_EXAreas").innerHTML = "• File with exclusion areas not correct.<br>";
            }
            isThereAnyError();
            throw new Error("File with exclusion areas not correct");
        }

        try {
            data_global_exclusionareas_manual['features'].length;
        } catch(e) {
            ExclusionAreasReady = false;
            readyToGetEXAndBlocked();
            if (navigator.language == "es-es" || navigator.language == "es" || navigator.language == "es-ES") {
                document.getElementById("Output_error_EXAreas").innerHTML = "• Archivo con las zonas excluyentes no correcto.<br>";
            }
            else {
                document.getElementById("Output_error_EXAreas").innerHTML = "• File with exclusion areas not correct.<br>";
            }
            isThereAnyError();
            throw new Error("File with exclusion areas not correct");
        }
        isThereAnyError();
    };
};

document.getElementById('exclusionareasfile').addEventListener('change', handleFileexclusionareas, false);
/*== Exclusion areas ==*/

/*== Set data from input files ==*/