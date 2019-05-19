/*==== Set global variables ====*/
/*==== Data ====*/
var data_global_gyms;
var data_global_exareas;
var data_global_exclusionareas;
var output_filename;
var gyms_data;

var data_global_exareas_from_osm = new XMLHttpRequest();
var data_global_exclusionareas_from_osm = new XMLHttpRequest();
/*== Data ==*/

/*==== Strings ====*/
var csv_string_ex = "";
var csv_string_blocked = "";
var gyms_table_data_header = "<tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Type</th></tr>";
var gyms_table_data_ex = "";
var gyms_table_data_blocked = "";

var query_common = 'https://overpass-api.de/api/interpreter?data=%5Bdate%3A%222016-07-16T00%3A00%3A00Z%22%5D%0A%5Btimeout%3A620%5D%0A%5Bbbox%3A';
var query_ex = '%5D%3B%0A%28%0A%20%20%20%20way%5Bleisure%3Dpark%5D%3B%0A%20%20%20%20way%5Blanduse%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Dpitch%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgarden%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgolf_course%5D%3B%0A%20%20%20%20way%5Bleisure%3Dplayground%5D%3B%0A%20%20%20%20way%5Blanduse%3Dmeadow%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgrass%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgreenfield%5D%3B%0A%20%20%20%20way%5Bnatural%3Dscrub%5D%3B%0A%20%20%20%20way%5Bnatural%3Dheath%5D%3B%0A%20%20%20%20way%5Bnatural%3Dgrassland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dvineyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dorchard%5D%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';
var query_exclusion = '%5D%3B%0A%28%0A%20%20%20%20way%5Bamenity%3Dschool%5D%3B%0A%20%20%20%20way%5Bhighway%5D%5Barea%3Dyes%5D%3B%0A%09way%5Bnatural%3Dwater%5D%3B%0A%09way%5Blanduse%3Dconstruction%5D%3B%0A%09way%5Bnatural%3Dwetland%5D%3B%0A%09way%5Baeroway%3Drunway%5D%3B%0A%20%20%09way%5Baeroway%3Dtaxiway%5D%3B%0A%20%20%09way%5Blanduse%3Dmilitary%5D%3B%0A%09way%5Blanduse%3Dquarry%5D%3B%0A%20%20%09way%5Bwater%3Dmarsh%5D%3B%0A%20%20%09way%5Blanduse%3Drailway%5D%3B%0A%20%20%09way%5Blanduse%3Dlandfill%5D%3B%0A%09%2F%2Fway%5B%22junction%22%3D%22roundabout%22%5D%2840.54512538387331%2C-3.6385291814804077%2C40.54668050872829%2C-3.6364075541496277%29%3B%0A%20%20%09way%5Bhighway%5D%28if%3Ais_closed%28%29%29%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';
/*== Strings ==*/

/*==== States ====*/
var problem_detected = false;
var problems_with_gyms = false;


var clear_output_error_text = false;
var getmaxandminvalues_done = false;
var ready_to_run = false;
var anyValidGym = false;

var current_mode = "Manual";
/*== States ==*/

/*==== Other ====*/
var level = 20;
var min_lat, min_lng, max_lat, max_lng;
/*== States ==*/
/*== Set global variables ==*/

/*==== Set data from input files ====*/
//creates a new file reader object
const fr_exareas = new FileReader();
const fr_exclusionareas = new FileReader();
const fr_gyms = new FileReader();

/*==== Gyms ====*/
function handleFilegyms (evt) {
    fr_gyms.readAsText(evt.target.files[0]);

    output_filename = evt.target.files[0].name.replace('.csv', '').replace('.txt', '');

    fr_gyms.onload = e => {
        data_global_gyms = (e.target.result);
        gyms_data = JSON.parse(csvJSON(data_global_gyms));

        /*==== Check if any of the rows contains valid data ====*/
        problems_with_gyms = false;
        anyValidGym = remove_problematic_gym_rows(); // this function returns the number of valid gyms

        if (!anyValidGym) {
            $("#Output_error_2").html("• None of the gyms are valid. Please select a valid file.");
            if ( current_mode != "Automatic" ) {
                document.getElementById("btngetexandblockedgyms").disabled = true;
            }
            document.getElementById("btngetexareas").disabled = true;
        }
        else {
            $("#Output_error_2").html("");
            if ( current_mode != "Automatic" ) {
                document.getElementById("btngetexandblockedgyms").disabled = false;
            }
            document.getElementById("btngetexareas").disabled = false;
        }
        /*== Check if any of the rows contains valid data ==*/
    };
};
/*== Gyms ==*/

/*==== EX areas ====*/
function handleFileEXareas (evt) {
    fr_exareas.readAsText(evt.target.files[0]);

    fr_exareas.onload = e => {
        data_global_exareas = JSON.parse(e.target.result);
    };
};
/*== EX areas ==*/

/*==== Exclusion areas ====*/
function handleFileexclusionareas (evt) {
    fr_exclusionareas.readAsText(evt.target.files[0]);

    fr_exclusionareas.onload = e => {
        data_global_exclusionareas = JSON.parse(e.target.result);
    };
};
/*== Exclusion areas ==*/

//event listener for file input
document.getElementById('gymsfile').addEventListener('change', handleFilegyms, false);
document.getElementById('EXareasfile').addEventListener('change', handleFileEXareas, false);
document.getElementById('exclusionareasfile').addEventListener('change', handleFileexclusionareas, false);
/*== Set data from input files ==*/

/*==== Deal with page style if select_mode is changed ====*/
function handleSelectedmode() {
    if ( current_mode != "Manual" ) {
        document.getElementById("EXareasfile").disabled = true;
        document.getElementById("exclusionareasfile").disabled = true;
        document.getElementById("File_section").style.display = 'none';
    }
    else{
        document.getElementById("EXareasfile").disabled = false;
        document.getElementById("exclusionareasfile").disabled = false;
        document.getElementById("File_section").style.display = 'block';
    }

    if ( current_mode == "Automatic" ) {
        document.getElementById("Automatic_section").style.display = 'block';
        document.getElementById("Automatic_warning").style.display = 'block';
        if ( ready_to_run == false ) {
            document.getElementById("btngetexandblockedgyms").disabled = true;
        }

    }
    else{
        document.getElementById("Automatic_section").style.display = 'none';
        document.getElementById("Automatic_warning").style.display = 'none';
        if (anyValidGym) {
            document.getElementById("btngetexandblockedgyms").disabled = false;
        }
    }
}

document.getElementById('button_structure').addEventListener('click', handleSelectedmode, false);
/*== Deal with page style if select_mode is changed ==*/

/*==== Function called when the button "Get EX and blocked gyms" is pressed ====*/
function getexgyms() {

    /*==== Clear the output ====*/
    if (clear_output_error_text == true) {
        $("#Output_info").html("");   
    }
    else {
        clear_output_error_text = true;
    }
    $("#Output_results").html("");
    $("#Get_exclusionareas").html("");

    $("#Output_table_data").html("");

    $("#Output_error_3").html("");

    if (problems_with_gyms == false) {
        document.getElementsByClassName("error_block")[0].style.display = 'none';
    }
    /*== Clear the output ==*/

    /*==== Check if the file with gyms data has been selected ====*/
    // with the new checks done, this part is redundant
    if ( data_global_gyms == undefined ) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with gyms not correct.");
        return;
    }
    /*== Check if the file with gyms data has been selected ==*/

    /*=== If a pre-selected area is selected change EX an exclusion areas ===*/
    set_mode(current_mode);

    /*==== Create a multipolygon with all EX areas ====*/
    /*==== Check if the file with EX areas data has been selected ====*/
    if (data_global_exareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_error_3").html($('#Output_error_3').html() + "• File with EX areas not correct.");
        return;
    }
    /*== Check if the file with EX areas data has been selected ==*/

    anyEXArea = data_global_exareas['features'].length

    if ( anyEXArea ) {
        var data_global_exareas_polygon = [];
        var number_valid_exareas = 0;
        for (let i = 0; i < data_global_exareas['features'].length; i++) {
    
            if ( (data_global_exareas['features'][i]['geometry']['coordinates'][0].length >= 4) && (data_global_exareas['features'][i]['geometry']['type'] == "Polygon") ) {
                data_global_exareas_polygon[number_valid_exareas] = data_global_exareas['features'][i]['geometry']['coordinates'];
                number_valid_exareas++;
            }
            else if ( data_global_exareas['features'][i]['geometry']['type'] == "LineString" ) {
    
                var temp_data = [];
                temp_data = data_global_exareas['features'][i]['geometry']['coordinates'];
                temp_data.push(data_global_exareas['features'][i]['geometry']['coordinates'][0]);
    
                if ( temp_data.length >= 4 ) {
                    data_global_exareas_polygon[number_valid_exareas] = temp_data;
                    number_valid_exareas++;
                }
            }
        }
        var data_global_exareas_multipolygon = turf.multiPolygon(data_global_exareas_polygon);
    }
    /*== Create a multipolygon with all EX areas ==*/
    
    /*==== Create a multipolygon with all exclusion areas ====*/
    /*==== Check if the file with Exclusion areas data has been selected ====*/
    if (data_global_exclusionareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_error_3").html($('#Output_error_3').html() + "• File with exclusion areas not correct.");
        return;
    }
    /*== Check if the file with Exclusion areas data has been selected ==*/

    anyExclusionArea = data_global_exclusionareas['features'].length

    if ( anyExclusionArea ) {
        var data_global_exclusionareas_polygon = [];
        var number_valid_exclusionareas = 0;
        for (let i = 0; i < data_global_exclusionareas['features'].length; i++) {
    
            if ( (data_global_exclusionareas['features'][i]['geometry']['coordinates'][0].length >= 4) && (data_global_exclusionareas['features'][i]['geometry']['type'] == "Polygon") ) {
                data_global_exclusionareas_polygon[number_valid_exclusionareas] = data_global_exclusionareas['features'][i]['geometry']['coordinates'];
                number_valid_exclusionareas++;
            }
            else if ( data_global_exclusionareas['features'][i]['geometry']['type'] == "LineString" ) {
                var temp_data = [];
                temp_data = data_global_exclusionareas['features'][i]['geometry']['coordinates'];
                temp_data.push(data_global_exclusionareas['features'][i]['geometry']['coordinates'][0]);
    
                if ( temp_data.length >= 4 ) {
                    data_global_exclusionareas_polygon[number_valid_exclusionareas] = [temp_data];
                    number_valid_exclusionareas++;
                }
            }
        }
        var data_global_exclusionareas_multipolygon = turf.multiPolygon(data_global_exclusionareas_polygon);
    }
    /*== Create a multipolygon with all exclusion areas ==*/

    /*==== Check all gyms ====*/
    var ex_gyms = 0;
    var blocked_gyms = 0;
    for (const [i, gym] of gyms_data.entries()) {

        /*=== Get cell center of the S2 cell that contains the gym  ===*/
        var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gym.lat, gym.lng, level) );
    
        /*==== Check if cell center is inside any of the EX areas ====*/
        isGymInEXArea = anyEXArea ? turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exareas_multipolygon) : false // if anyEXArea is false and turf.booleanPointInPolygon is evaluated it'll give an error
        
        gym['inEXarea'] = isGymInEXArea
        /*== Check if cell center is inside any of the EX areas ==*/

        /*==== Check if cell center is inside any of the exclusion areas ====*/
        isGymInExclusionArea = anyExclusionArea ? turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exclusionareas_multipolygon) : false // if anyExclusionArea is false and turf.booleanPointInPolygon is evaluated it'll give an error

        gym['inexclusionarea'] = isGymInExclusionArea
        /*== Check if cell center is inside any of the exclusion areas ==*/

        /*==== Check if the gym is EX or blocked and if so update output csv file data ====*/
        if (gym['inEXarea'] && !gym['inexclusionarea']) {
            ex_gyms++;
            csv_string_ex += gym.Name + "," + gym.lat + "," + gym.lng + ",EX\n";
            gyms_table_data_ex += "<tr class='ex'><td>" + gym.Name + "</td><td>" + gym.lat + "</td><td>" + gym.lng + "</td><td>EX</td></tr>"
        }
        if (gym['inEXarea'] && gym['inexclusionarea']) {
            blocked_gyms++;
            csv_string_blocked += gym.Name + "," + gym.lat + "," + gym.lng + ",Blocked\n";
            gyms_table_data_blocked += "<tr class='blocked'><td>" + gym.Name + "</td><td>" + gym.lat + "</td><td>" + gym.lng + "</td><td>Blocked</td></tr>"
        }
        /*== Check if the gym is EX or blocked and if so update output csv file data ==*/
    }
    /*== Check all gyms ==*/

    /*==== Deal with the output text and buttons displayed ====*/
    //$("#Output_results").html($('#Output_results').html() + "<b>Results</b><br>");
    document.getElementsByClassName("results_block")[0].style.display = 'block';
    $("#Output_results").html($('#Output_results').html() + "• Gyms analyzed: " + gyms_data.length + "<br>");
    $("#Output_results").html($('#Output_results').html() + "• EX gyms: " + ex_gyms + "<br>");
    $("#Output_results").html($('#Output_results').html() + "• Blocked gyms: " + blocked_gyms);

    if (ex_gyms || blocked_gyms) { // If there is any EX or blocked gym show a button to download a csv with the data
        $("#Get_exclusionareas").html($('#Get_exclusionareas').html() + "<button id='btnLoad' value='Get csv file with EX and blocked gyms' onclick='writeCSV(csv_string_ex + csv_string_blocked);'>Get csv file with EX and blocked gyms</button>");

        $("#Output_table_data").html($('#Output_table_data').html() + gyms_table_data_header + gyms_table_data_ex + gyms_table_data_blocked);

        if (blocked_gyms) { // If there is at least 1 blocked gym show a button to download a kml file which can be imported to Google My Maps to see what blocks these gyms
            $("#Get_exclusionareas").html($('#Get_exclusionareas').html() + "<button id='btnLoad' value='Get kml file with blocked gyms' onclick='Get_exclusionareas();'>Get kml file with blocked gyms</button><span class='info'>(The kml file can be imported to Google My Maps to see what blocks these gyms)</span><br>");
        }
        $("#Get_exclusionareas").html($('#Get_exclusionareas').html() + "<br>");
    }
    /*== Deal with the output text and buttons displayed ==*/

}
/*== Function called when the button "Get EX and blocked gyms" is pressed ==*/

function gym_status(gym) {
    if (gym.Name == "") {
        return "empty_row"
    }
    else if (isNaN(gym.lat) == true) {
        if (gym.Name == "Name" || gym.Name == "name") {
            return "header_row"
        }
        else{
            return "name_with_comma"
        }
    }
    else {
        return "no_problem"
    }
}

function remove_problematic_gym_rows() {
    problem_detected = false;
    clear_output_error_text = false;
    document.getElementsByClassName("error_block")[0].style.display = 'none';
    $("#Output_error").html("");

    var valid_gyms = 0;
    var new_gyms_data = [];
    for (const [i, gym] of gyms_data.entries()) {
        if (gym_status(gym) == "no_problem") {
            valid_gyms += 1;
            new_gyms_data.push(gym);
        }
        else {
            problems_with_gyms = true;
            problem_detected = first_time_problem_detected(problem_detected);
            if (gym_status(gym) == "empty_row") {
                $("#Output_error").html($('#Output_error').html() + "• Row number " + i + " skipped (empty row?)<br>");
            }
            else if (gym_status(gym) == "header_row") {
                $("#Output_error").html($('#Output_error').html() + "• Row number " + i + " skipped (header row?)<br>");
            }
            else if (gym_status(gym) == "name_with_comma") {
                $("#Output_error").html($('#Output_error').html() + "• Row number " + i + " skipped (name with comma?)<br>");
            }
        }
    }
    gyms_data = new_gyms_data;

    return valid_gyms
}

function writeCSV(string) {
    let file_data = "data:text/csv;charset=utf-8,";
    file_data += "Name,Latitude,Longitude,Type\n" + string;
    file_data = file_data.replace(/[\r]+/g, '').trim();
    var encodedUri = encodeURI(file_data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", output_filename + "_ex_and_blocked.csv");
    document.body.appendChild(link);
    link.click();
}

function first_time_problem_detected(problem_detected) {
    document.getElementsByClassName("error_block")[0].style.display = 'block';
    
    if (problem_detected == false) {
        problem_detected = true;
        //$("#Output_info").html($('#Output_info').html() + "<b>Problems detected</b><br>");
    }
    return problem_detected;
}

function csvJSON(csv){

    csv = "Name,lat,lng\n" + csv;
    var lines=csv.split("\n");

    var result = [];

    var headers=lines[0].split(",");

    for(let i = 1; i < lines.length; i++){

        var obj = {};
        var currentline=lines[i].split(",");
  
        for(let j = 0; j < headers.length; j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }

    return JSON.stringify(result);
}

function getJSON(url) {
    var resp ;
    var xmlHttp ;

    resp  = '' ;
    xmlHttp = new XMLHttpRequest();

    if(xmlHttp != null)
    {
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
    }

    return resp ;
}

function set_mode(mode) {
    if (mode === "Madrid") {
        data_global_exareas = JSON.parse(getJSON('example_data/madrid_exareas.geojson'));
        data_global_exclusionareas = JSON.parse(getJSON('example_data/madrid_exclusionareas.geojson'));
    }

    if ( mode === "Automatic" ) {

        /*==== Converts EX areas data to a typical GeoJSON file ====*/
        var osm_data_ex = data_global_exareas_from_osm.responseText;

        try {
            osm_data_ex = $.parseXML(osm_data_ex);
        } catch(e) {
            osm_data_ex = JSON.parse(osm_data_ex);
        }
        data_global_exareas = osmtogeojson(osm_data_ex);
        /*== Converts EX areas data to a typical GeoJSON file ==*/

        /*==== Converts exclusion areas data to a typical GeoJSON file ====*/
        var osm_data_exclusion = data_global_exclusionareas_from_osm.responseText;

        try {
            osm_data_exclusion = $.parseXML(osm_data_exclusion);
        } catch(e) {
            osm_data_exclusion = JSON.parse(osm_data_exclusion);
        }
        data_global_exclusionareas = osmtogeojson(osm_data_exclusion);
        /*== Converts exclusion areas data to a typical GeoJSON file ==*/
    }
}

function Get_exclusionareas() {

    /*==== Set some strings for the kml file ====*/
    var kml_string1 = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>Blocked gyms</name>';
    var kml_string2 = '\n  </Document>\n</kml>';
    
    var kml_string_gyms_folder = '\n    <Folder>\n      <name>Blocked gyms</name>';
    var kml_string_exclusionareas_folder = '\n    <Folder>\n      <name>Exclusion areas</name>';
    var kml_string_exareas_folder = '\n    <Folder>\n      <name>EX areas</name>';
    /*== Set some strings for the kml file ==*/

    /*==== Check all gyms ====*/
    for (const gym of gyms_data) {

        /*==== Only take into account EX gyms in an exclusion area ====*/
        if (gym['inEXarea'] && gym['inexclusionarea']) {

            kml_string_gyms_folder += '\n      <Placemark>\n        <name>' + gym.Name + '</name>';
            kml_string_gyms_folder += '\n        <Point>\n          <coordinates>\n            ' + gym.lng + ',' + gym.lat + '\n          </coordinates>\n        </Point>\n      </Placemark>';

            /*=== Get cell center of the S2 cell that contains the gym  ===*/
            var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gym.lat, gym.lng, level) );

            /*==== Check EX areas where the cell center is inside ====*/
            if ( anyEXArea ) {
                for (let k = 0; k < data_global_exareas['features'].length; k++) {

                    if ( (data_global_exareas['features'][k]['geometry']['coordinates'][0].length >= 4) && (data_global_exareas['features'][k]['geometry']['type'] == "Polygon") && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon(data_global_exareas['features'][k]['geometry']['coordinates'])) == true) ) {
    
                        if ( data_global_exareas['features'][k]['properties']['name'] != undefined ) {
                            kml_string_exareas_folder += '\n      <Placemark>\n        <name>' + data_global_exareas['features'][k]['properties']['name'] + '</name>';
                        }
                        else{
                            kml_string_exareas_folder += '\n      <Placemark>\n        <name></name>';
                        }
    
                        kml_string_exareas_folder += '\n        <Polygon>\n          <outerBoundaryIs>\n            <LinearRing>\n              <coordinates>';
    
                        for (let j = 0; j < data_global_exareas['features'][k]['geometry']['coordinates'][0].length; j++) {
                            kml_string_exareas_folder += '\n                ' + data_global_exareas['features'][k]['geometry']['coordinates'][0][j][0] + ',' + data_global_exareas['features'][k]['geometry']['coordinates'][0][j][1];
                        }
                        kml_string_exareas_folder += '\n              </coordinates>\n            </LinearRing>\n          </outerBoundaryIs>\n        </Polygon>';
    
                        kml_string_exareas_folder += '\n        <Style>\n          <PolyStyle>\n            <color>#4c589d0f</color>\n          </PolyStyle>\n        </Style>\n      </Placemark>';
                    }
                    else if ( data_global_exareas['features'][k]['geometry']['type'] == "LineString"){
                        var temp_data = [];
                        temp_data = data_global_exareas['features'][k]['geometry']['coordinates'];
                        temp_data.push(data_global_exareas['features'][k]['geometry']['coordinates'][0]);
    
                        if ( temp_data.length >= 4 && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon([temp_data])) == true) ) {
    
                            if ( data_global_exareas['features'][k]['properties']['name'] != undefined ) {
                                kml_string_exareas_folder += '\n      <Placemark>\n        <name>' + data_global_exareas['features'][k]['properties']['name'] + '</name>';
                            }
                            else{
                                kml_string_exareas_folder += '\n      <Placemark>\n        <name></name>';
                            }
    
                            kml_string_exareas_folder += '\n        <LineString>\n          <coordinates>';
        
                            for (let j = 0; j < data_global_exareas['features'][k]['geometry']['coordinates'].length; j++) {
                                kml_string_exareas_folder += '\n            ' + data_global_exareas['features'][k]['geometry']['coordinates'][j][0] + ',' + data_global_exareas['features'][k]['geometry']['coordinates'][j][1];
                            }
                            kml_string_exareas_folder += '\n          </coordinates>\n        </LineString>';
    
                            kml_string_exareas_folder += '\n        <Style>\n          <LineStyle>\n            <color>#ff589d0f</color>\n          </LineStyle>\n        </Style>\n      </Placemark>';
                        }
                    }
    
                }
            }
            /*== Check EX areas where the cell center is inside ==*/

            /*==== Check exclusion areas where the cell center is inside ====*/
            if ( anyExclusionArea ) {
                for (let k = 0; k < data_global_exclusionareas['features'].length; k++) {
    
                    if ( (data_global_exclusionareas['features'][k]['geometry']['coordinates'][0].length >= 4) && (data_global_exclusionareas['features'][k]['geometry']['type'] == "Polygon") && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon(data_global_exclusionareas['features'][k]['geometry']['coordinates'])) == true) ) {
                        
                        if ( data_global_exclusionareas['features'][k]['properties']['name'] != undefined ) {
                            kml_string_exclusionareas_folder += '\n      <Placemark>\n        <name>' + data_global_exclusionareas['features'][k]['properties']['name'] + '</name>';
                        }
                        else{
                            kml_string_exclusionareas_folder += '\n      <Placemark>\n        <name></name>';
                        }
                        
                        kml_string_exclusionareas_folder += '\n        <Polygon>\n          <outerBoundaryIs>\n            <LinearRing>\n              <coordinates>';
    
                        for (let j = 0; j < data_global_exclusionareas['features'][k]['geometry']['coordinates'][0].length; j++) {
                            kml_string_exclusionareas_folder += '\n                ' + data_global_exclusionareas['features'][k]['geometry']['coordinates'][0][j][0] + ',' + data_global_exclusionareas['features'][k]['geometry']['coordinates'][0][j][1];
                        }
                        kml_string_exclusionareas_folder += '\n              </coordinates>\n            </LinearRing>\n          </outerBoundaryIs>\n        </Polygon>';
    
                        kml_string_exclusionareas_folder += '\n        <Style>\n          <PolyStyle>\n            <color>#4cb0279c</color>\n          </PolyStyle>\n        </Style>\n      </Placemark>';
                    }
                    else if ( data_global_exclusionareas['features'][k]['geometry']['type'] == "LineString"){
                        var temp_data = [];
                        temp_data = data_global_exclusionareas['features'][k]['geometry']['coordinates'];
                        temp_data.push(data_global_exclusionareas['features'][k]['geometry']['coordinates'][0]);
    
                        if ( temp_data.length >= 4 && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon([temp_data])) == true) ) {
                            
    
                            if ( data_global_exclusionareas['features'][k]['properties']['name'] != undefined ) {
                                kml_string_exclusionareas_folder += '\n      <Placemark>\n        <name>' + data_global_exclusionareas['features'][k]['properties']['name'] + '</name>';
                            }
                            else{
                                kml_string_exclusionareas_folder += '\n      <Placemark>\n        <name></name>';
                            }
    
                            kml_string_exclusionareas_folder += '\n        <LineString>\n          <coordinates>';
    
                            for (let j = 0; j < data_global_exclusionareas['features'][k]['geometry']['coordinates'].length; j++) {
                                kml_string_exclusionareas_folder += '\n            ' + data_global_exclusionareas['features'][k]['geometry']['coordinates'][j][0] + ',' + data_global_exclusionareas['features'][k]['geometry']['coordinates'][j][1];
                            }
                            kml_string_exclusionareas_folder += '\n          </coordinates>\n        </LineString>';
    
                            kml_string_exclusionareas_folder += '\n        <Style>\n          <LineStyle>\n            <color>#ffb0279c</color>\n          </LineStyle>\n        </Style>\n      </Placemark>';
                        }
                    }
    
                }
            }
            /*== Check exclusion areas where the cell center is inside ==*/
        }
        /*== Only take into account EX gyms in an exclusion area ==*/
    }
    /*== Check all gyms ==*/

    kml_string_gyms_folder += '\n    </Folder>';
    kml_string_exclusionareas_folder += '\n    </Folder>';
    kml_string_exareas_folder += '\n    </Folder>';

    /*==== Get output csv file ====*/
    let file_data = "data:text/csv;charset=utf-8,";
    file_data += kml_string1 + kml_string_gyms_folder + kml_string_exareas_folder + kml_string_exclusionareas_folder + kml_string2;
    file_data = file_data.replace(/[\r]+/g, '').trim();
    var encodedUri = encodeURI(file_data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", output_filename + "_blocked_and_exclusionareas.kml");
    document.body.appendChild(link);
    link.click();
    /*== Get output csv file ==*/
}

function getareas(query_url) {

    if (query_url == "EX") {
        $("#EX_areas_status").html("");
        $("#EX_areas_status").html($('#EX_areas_status').html() + "Loading EX areas (wait until this text changes).");
        document.getElementById("btngetexareas").disabled = true;
        document.getElementById("gymsfile").disabled = true;
    }
    else if (query_url == "exclusion") {
        $("#Exclusion_areas_status").html("");
        $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "Loading exclusion areas (wait until this text changes).");
        document.getElementById("btngetexclusionareas").disabled = true;
        document.getElementById("gymsfile").disabled = false;
    }

    var wait_time = 50000.0;

    if ( getmaxandminvalues_done == false ) {
        getmaxandminvalues();
    }

    if (query_url == "EX") {
        var query = query_common + min_lat + "%2C" + min_lng + "%2C" + max_lat + "%2C" + max_lng + query_ex;
    }
    else if (query_url == "exclusion") {
        var query = query_common + min_lat + "%2C" + min_lng + "%2C" + max_lat + "%2C" + max_lng + query_exclusion;
    }
    
    var data = new XMLHttpRequest();
    data.open("GET", query, true);
    data.onreadystatechange = function() {
        // Check states 4 = Ready to parse, 200 = found file
        if(data.readyState === 4 && data.status === 200) {
            if (query_url == "EX") {
                document.getElementById("btngetexareas").disabled = true;
                $("#EX_areas_status").html("");
                $("#EX_areas_status").html($('#EX_areas_status').html() + "EX areas loaded correctly.");
                if (data_global_exareas_from_osm.responseText.includes("runtime error") == true) {
                    $("#EX_areas_status").html("");
                    $("#EX_areas_status").html($('#EX_areas_status').html() + "WARNING! An error ocurred while getting the EX areas. Reload the website and try again. If this message keeps appearing avoid gyms too far away.");
                }
                $("#Exclusion_areas_status").html("");
                $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "Wait 50 seconds to load exclusion areas (more time migth be needed).");
                setTimeout(function(){
                    document.getElementById("btngetexclusionareas").disabled = false;
                    $("#Exclusion_areas_status").html("");
                },wait_time);
            }
            else if (query_url == "exclusion") {
                document.getElementById("btngetexclusionareas").disabled = true;
                ready_to_run = true;
                $("#Exclusion_areas_status").html("");
                $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "Exclusion areas loaded correctly.");
                if (data_global_exclusionareas_from_osm.responseText.includes("runtime error") == true) {
                    ready_to_run = false;
                    $("#Exclusion_areas_status").html("");
                    $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "WARNING! An error ocurred while getting the exclusion areas. Reload the website and try again. If this message keeps appearing avoid gyms too far away.");
                }
                if ( ready_to_run == true ) {
                    document.getElementById("btngetexandblockedgyms").disabled = false;
                }
                setTimeout(function(){
                    document.getElementById("btnresetareas").disabled = false;
                },wait_time);
            }
        }
        else{
            if (query_url == "EX") {
                $("#EX_areas_status").html("");
                $("#EX_areas_status").html($('#EX_areas_status').html() + "EX areas not loaded. Maybe to many requests to the overpass API.");
                document.getElementById("btngetexareas").disabled = false;
            }
            else if (query_url == "exclusion") {
                $("#Exclusion_areas_status").html("");
                $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "Exclusion areas not loaded. Maybe to many requests to the overpass API.");
                document.getElementById("btngetexclusionareas").disabled = false;
            }
        }
    }
    data.send(null);

    if (query_url == "EX") {
        data_global_exareas_from_osm = data;
    }
    else if (query_url == "exclusion") {
        data_global_exclusionareas_from_osm = data;
    }
}

function testexareas() {
    console.log(data_global_exareas_from_osm.responseText);
}

function testexclusionareas() {
    console.log(data_global_exclusionareas_from_osm.responseText);
}

function getmaxandminvalues() {
    const offset = 0.001;
    min_possible_lat = -90.0;
    min_possible_lng = -180.0;

    max_lat = Math.max(...gyms_data.map((x) => x.lat));
    min_lat = Math.min(...gyms_data.map((x) => x.lat));

    max_lng = Math.max(...gyms_data.map((x) => x.lng));
    min_lng = Math.min(...gyms_data.map((x) => x.lng));

    if ( min_lat == max_lat ) {
        if (max_lat - offset < min_possible_lat) {
            max_lat = min_lat + offset;
        }
        else {
            min_lat = max_lat - offset;
        }
    }
    else if ( min_lng == max_lng ) {
        if (max_lng - offset < min_possible_lng) {
            max_lng = min_lng + offset;
        }
        else {
            min_lng = max_lng - offset;
        }
    }

    getmaxandminvalues_done = true;
}

function resetareas() {
    getmaxandminvalues_done = false;

    $("#EX_areas_status").html("");
    $("#Exclusion_areas_status").html("");
    document.getElementById("btngetexareas").disabled = false;
    document.getElementById("btnresetareas").disabled = true;
}

function somefuncion(mode,pressed_div) {

    /*==== Remove class selected from all elements ====*/
    var elems = document.querySelectorAll("#button_structure #element");

    [].forEach.call(elems, function(el) {
        el.classList.remove("selected");
    });
    /*== Remove class selected from all elements ==*/

    /*=== Add class selected to element how triggered the function ===*/
    $(pressed_div).addClass("selected");

    current_mode = mode;
}