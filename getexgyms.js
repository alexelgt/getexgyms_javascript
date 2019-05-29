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

/*=== Strings ===*/
var csv_string;

/*==== States ====*/
var problem_detected = false;
var problems_with_gyms = false;

var anyValidGym;
var EXAreasReady;
var ExclusionAreasReady;

var AutomaticModeAreasLoaded = false;

var current_mode = "Manual";
/*== States ==*/

/*==== Other ====*/
var level = 20;
const min_vertices = 4;
/*== States ==*/
/*== Set global variables ==*/

/*==== Set data from input files ====*/

/*==== Gyms ====*/
function handleFilegyms (evt) {
    const fr_gyms = new FileReader();
    fr_gyms.readAsText(evt.target.files[0]);

    output_filename = evt.target.files[0].name.replace('.csv', '').replace('.txt', '');

    fr_gyms.onload = e => {
        data_global_gyms = (e.target.result);
        gyms_data = JSON.parse(csvJSON(data_global_gyms));

        /*==== Check if any of the rows contains valid data ====*/
        problems_with_gyms = false;
        anyValidGym = removeProblematicGymRows(); // this function returns the number of valid gyms

        if (!anyValidGym) {
            readyToGetEXAndBlocked();
            isThereAnyError();
            $("#Output_error_gyms").html("• None of the gyms are valid. Please select a valid file.<br>");
            $("#Output_error_orange").html("");
            document.getElementById("btngetexareas").disabled = true;
            throw new Error("None of the gyms are valid. Please select a valid file");
        }
        else {
            $("#Output_error_gyms").html("");
            if ( current_mode != "Automatic" ) {
                readyToGetEXAndBlocked();
                isThereAnyError();
            }
            document.getElementById("btngetexareas").disabled = false;
        }
        /*== Check if any of the rows contains valid data ==*/
        
    };
};
/*== Gyms ==*/

/*==== EX areas ====*/
function handleFileEXareas (evt) {
    const fr_exareas = new FileReader();
    fr_exareas.readAsText(evt.target.files[0]);

    fr_exareas.onload = e => {
        try {
            data_global_exareas = JSON.parse(e.target.result);
            EXAreasReady = true;
            readyToGetEXAndBlocked();
            $("#Output_error_EXAreas").html("");
        } catch(e) {
            EXAreasReady = false;
            readyToGetEXAndBlocked();
            isThereAnyError();
            $("#Output_error_EXAreas").html($('#Output_error_EXAreas').html() + "• File with EX areas not correct.<br>");
            throw new Error("File with EX areas not correct");
        }

        try {
            data_global_exareas['features'].length;
        } catch(e) {
            EXAreasReady = false;
            readyToGetEXAndBlocked();
            isThereAnyError();
            $("#Output_error_EXAreas").html($('#Output_error_EXAreas').html() + "• File with EX areas not correct.<br>");
            throw new Error("File with EX areas not correct");
        }
        isThereAnyError();
    };
};
/*== EX areas ==*/

/*==== Exclusion areas ====*/
function handleFileexclusionareas (evt) {
    const fr_exclusionareas = new FileReader();
    fr_exclusionareas.readAsText(evt.target.files[0]);

    fr_exclusionareas.onload = e => {
        try {
            data_global_exclusionareas = JSON.parse(e.target.result);
            ExclusionAreasReady = true;
            readyToGetEXAndBlocked();
            $("#Output_error_exclusionAreas").html("");
        } catch(e) {
            ExclusionAreasReady = false;
            readyToGetEXAndBlocked();
            isThereAnyError();
            $("#Output_error_exclusionAreas").html($('#Output_error_exclusionAreas').html() + "• File with exclusion areas not correct.<br>");
            throw new Error("File with exclusion areas not correct");
        }

        try {
            data_global_exclusionareas['features'].length;
        } catch(e) {
            ExclusionAreasReady = false;
            readyToGetEXAndBlocked();
            isThereAnyError();
            $("#Output_error_exclusionAreas").html($('#Output_error_exclusionAreas').html() + "• File with exclusion areas not correct.<br>");
            throw new Error("File with exclusion areas not correct");
        }
        isThereAnyError();
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
        document.getElementById("File_section_EX").style.display = 'none';
        document.getElementById("File_section_exclusion").style.display = 'none';
        
    }
    else{
        document.getElementById("EXareasfile").disabled = false;
        document.getElementById("exclusionareasfile").disabled = false;
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

document.getElementById('button_structure').addEventListener('click', handleSelectedmode, false);
/*== Deal with page style if select_mode is changed ==*/

/*==== Function called when the button "Get EX and blocked gyms" is pressed ====*/
function getexgyms() {

    /*==== Clear the output ====*/
    $("#Output_error_red").html("");
    $("#Output_results").html("");
    $(".Output_buttons").html("");
    $(".Output_text_info").html("");
    $("#Output_table_data").html("");


    document.getElementsByClassName("results_block")[0].style.display = 'none';
    /*== Clear the output ==*/

    /*=== If a pre-selected area is selected change EX an exclusion areas ===*/
    setModeVariables(current_mode);

    /*==== Check if the file with EX areas data has been selected ====*/
    if (data_global_exareas === undefined) {
        document.getElementsByClassName("error_block")[0].style.display = 'block';
        $("#Output_error_red").html($('#Output_error_red').html() + "• File with EX areas not correct.");
        throw new Error("File with EX areas not correct");
    }
    /*== Check if the file with EX areas data has been selected ==*/
    /*==== If so create a multipolygon with all EX areas ====*/
    else {
        var data_global_exareas_multipolygon;
        [anyEXArea, data_global_exareas_multipolygon] = createMultiPolygon(data_global_exareas);
    }
    /*== If so create a multipolygon with all EX areas===*/

    /*==== Check if the file with Exclusion areas data has been selected ====*/
    if (data_global_exclusionareas === undefined) {
        document.getElementsByClassName("error_block")[0].style.display = 'block';
        $("#Output_error_red").html($('#Output_error_red').html() + "• File with exclusion areas not correct.");
        throw new Error("File with exclusion areas not correct");
    }
    /*== Check if the file with Exclusion areas data has been selected ==*/
    /*==== If so create a multipolygon with all exclusion areas ====*/
    else {
        var data_global_exclusionareas_multipolygon;
        [anyExclusionArea, data_global_exclusionareas_multipolygon] = createMultiPolygon(data_global_exclusionareas);
    }
    /*== If so create a multipolygon with all exclusion areas ==*/

    /*=== Check all gyms ===*/
    var ex_gyms, blocked_gyms, gyms_table_data;
    [ex_gyms, blocked_gyms, csv_string, gyms_table_data] = checkIfGymsAreEXorBlocked(data_global_exareas_multipolygon, data_global_exclusionareas_multipolygon);

    /*==== Deal with the output text and buttons displayed ====*/
    document.getElementsByClassName("results_block")[0].style.display = 'block';
    $("#Output_results").html($('#Output_results').html() + "• Gyms analyzed: " + gyms_data.length + "<br>");
    $("#Output_results").html($('#Output_results').html() + "• EX gyms: " + ex_gyms + "<br>");
    $("#Output_results").html($('#Output_results').html() + "• Blocked gyms: " + blocked_gyms);

    if (ex_gyms || blocked_gyms) { // If there is any EX or blocked gym show a button to download a csv with the data
        $(".Output_buttons").html($('.Output_buttons').html() + "<button id='btnLoad' onclick='downloadOutputFile(csv_string," + '"csv"' + ", output_filename + " + '"_ex_and_blocked"' + ");'>Download csv file with table data</button>");

        $("#Output_table_data").html($('#Output_table_data').html() + gyms_table_data);

        if (blocked_gyms) { // If there is at least 1 blocked gym show a button to download a kml file which can be imported to Google My Maps to see what blocks these gyms
            $(".Output_buttons").html($('.Output_buttons').html() + "<button id='btnLoad' onclick='Get_exclusionareas();'>Download kml file with blocked gyms</button>");
            
            $(".Output_text_info").html($('.Output_text_info').html() + "(The kml file can be imported to Google My Maps to see what blocks these gyms)");
        }
        $(".Output_buttons").html($('.Output_buttons').html() + "<br>");
    }
    /*== Deal with the output text and buttons displayed ==*/

}
/*== Function called when the button "Get EX and blocked gyms" is pressed ==*/

function checkIfGymsAreEXorBlocked(data_global_exareas_multipolygon, data_global_exclusionareas_multipolygon) {
    /*==== Set variables ====*/
    var ex_gyms = 0;
    var blocked_gyms = 0;

    var csv_header = "Name,Latitude,Longitude,Type\n";
    var csv_string_ex = "";
    var csv_string_blocked = "";

    var gyms_table_data_header = "<tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Type</th></tr>";
    var gyms_table_data_ex = "";
    var gyms_table_data_blocked = "";
    /*== Set variables ==*/

    for (const gym of gyms_data) {
        /*=== Get cell center of the S2 cell that contains the gym  ===*/
        var gym_cellcenter = S2.keyToLatLng(S2.S2Cell.latLngToKey(gym.lat, gym.lng, level));

        /*==== Check if cell center is inside any of the EX areas ====*/
        isGymInEXArea = anyEXArea ? turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng, gym_cellcenter.lat]), data_global_exareas_multipolygon) : false; // if anyEXArea is false and turf.booleanPointInPolygon is evaluated it'll give an error
        gym['inEXarea'] = isGymInEXArea;
        /*== Check if cell center is inside any of the EX areas ==*/

        /*==== Check if cell center is inside any of the exclusion areas ====*/
        isGymInExclusionArea = anyExclusionArea ? turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng, gym_cellcenter.lat]), data_global_exclusionareas_multipolygon) : false; // if anyExclusionArea is false and turf.booleanPointInPolygon is evaluated it'll give an error
        gym['inexclusionarea'] = isGymInExclusionArea;
        /*== Check if cell center is inside any of the exclusion areas ==*/

        /*==== Check if the gym is EX or blocked and if so update output csv file data ====*/
        if (gym['inEXarea'] && !gym['inexclusionarea']) {
            ex_gyms++;
            csv_string_ex += gym.Name + "," + gym.lat + "," + gym.lng + ",EX\n";
            gyms_table_data_ex += "<tr class='ex'><td>" + gym.Name + "</td><td>" + gym.lat + "</td><td>" + gym.lng + "</td><td>EX</td></tr>";
        }
        if (gym['inEXarea'] && gym['inexclusionarea']) {
            blocked_gyms++;
            csv_string_blocked += gym.Name + "," + gym.lat + "," + gym.lng + ",Blocked\n";
            gyms_table_data_blocked += "<tr class='blocked'><td>" + gym.Name + "</td><td>" + gym.lat + "</td><td>" + gym.lng + "</td><td>Blocked</td></tr>";
        }
        /*== Check if the gym is EX or blocked and if so update output csv file data ==*/
    }
    return [ex_gyms, blocked_gyms, csv_header + csv_string_ex + csv_string_blocked, gyms_table_data_header + gyms_table_data_ex + gyms_table_data_blocked]
}

function createMultiPolygon(data_areas) {
    var anyArea = data_areas['features'].length;

    if ( anyArea ) {
        var data_areas_polygon = [];
        var number_valid_areas = 0;

        for (const data_areas_element of data_areas['features']) {
            if ( (data_areas_element['geometry']['coordinates'][0].length >= min_vertices) && (data_areas_element['geometry']['type'] == "Polygon") ) {
                data_areas_polygon[number_valid_areas] = data_areas_element['geometry']['coordinates'];
                number_valid_areas++;
            }
            else if ( data_areas_element['geometry']['type'] == "LineString" ) {
                var temp_data = [];
                temp_data = data_areas_element['geometry']['coordinates'];
                temp_data.push(data_areas_element['geometry']['coordinates'][0]);

                if ( temp_data.length >= min_vertices ) {
                    data_areas_polygon[number_valid_areas] = [temp_data];
                    number_valid_areas++;
                }
            }
        }
        return [anyArea, turf.multiPolygon(data_areas_polygon)]
    }
    else {
        return [anyArea, undefined]
    }
}

function setModeVariables(mode) {
    if (mode === "URL") {
        var EXAreasURL = document.getElementById("EXAreasurl").value;
        var ExclusionAreasURL = document.getElementById("ExclusionAreasurl").value;

        data_global_exareas = setDataFromURL(EXAreasURL,"EX");
        data_global_exclusionareas = setDataFromURL(ExclusionAreasURL,"exclusion");
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

            /*=== Check EX areas where the cell center is inside ===*/
            kml_string_exareas_folder = checkAreasWhereCenterInside(gym_cellcenter, data_global_exareas, kml_string_exareas_folder, "589d0f");

            /*=== Check exclusion areas where the cell center is inside ===*/
            kml_string_exclusionareas_folder = checkAreasWhereCenterInside(gym_cellcenter, data_global_exclusionareas, kml_string_exclusionareas_folder, "b0279c");
        }
        /*== Only take into account EX gyms in an exclusion area ==*/
    }
    /*== Check all gyms ==*/

    kml_string_gyms_folder += '\n    </Folder>';
    kml_string_exclusionareas_folder += '\n    </Folder>';
    kml_string_exareas_folder += '\n    </Folder>';

    /*=== Get output kml file ===*/
    downloadOutputFile(kml_string1 + kml_string_gyms_folder + kml_string_exareas_folder + kml_string_exclusionareas_folder + kml_string2, "kml", output_filename + "_blocked_and_exclusionareas");
}

function checkAreasWhereCenterInside(gym_cellcenter, data_areas, kml_string_areas_folder, color) {
    var anyArea = data_areas['features'].length
    if (anyArea) {
        for (const data_areas_element of data_areas['features']) {
            if ((data_areas_element['geometry']['coordinates'][0].length >= min_vertices) && (data_areas_element['geometry']['type'] == "Polygon") && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng, gym_cellcenter.lat]), turf.polygon(data_areas_element['geometry']['coordinates'])) == true)) {
                if (data_areas_element['properties']['name'] != undefined) {
                    kml_string_areas_folder += '\n      <Placemark>\n        <name>' + data_areas_element['properties']['name'] + '</name>';
                }
                else {
                    kml_string_areas_folder += '\n      <Placemark>\n        <name></name>';
                }
                kml_string_areas_folder += '\n        <Polygon>\n          <outerBoundaryIs>\n            <LinearRing>\n              <coordinates>';
                for (const data_areas_element_coordinates of data_areas_element['geometry']['coordinates'][0]) {
                    kml_string_areas_folder += '\n                ' + data_areas_element_coordinates[0] + ',' + data_areas_element_coordinates[1];
                }
                kml_string_areas_folder += '\n              </coordinates>\n            </LinearRing>\n          </outerBoundaryIs>\n        </Polygon>';
                kml_string_areas_folder += '\n        <Style>\n          <PolyStyle>\n            <color>#4c' + color + '</color>\n          </PolyStyle>\n        </Style>\n      </Placemark>';
            }
            else if (data_areas_element['geometry']['type'] == "LineString") {
                var temp_data = [];
                temp_data = data_areas_element['geometry']['coordinates'];
                temp_data.push(data_areas_element['geometry']['coordinates'][0]);
                if (temp_data.length >= min_vertices && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng, gym_cellcenter.lat]), turf.polygon([temp_data])) == true)) {
                    if (data_areas_element['properties']['name'] != undefined) {
                        kml_string_areas_folder += '\n      <Placemark>\n        <name>' + data_areas_element['properties']['name'] + '</name>';
                    }
                    else {
                        kml_string_areas_folder += '\n      <Placemark>\n        <name></name>';
                    }
                    kml_string_areas_folder += '\n        <LineString>\n          <coordinates>';
                    for (const data_areas_element_coordinates of data_areas_element['geometry']['coordinates']) {
                        kml_string_areas_folder += '\n            ' + data_areas_element_coordinates[0] + ',' + data_areas_element_coordinates[1];
                    }
                    kml_string_areas_folder += '\n          </coordinates>\n        </LineString>';
                    kml_string_areas_folder += '\n        <Style>\n          <LineStyle>\n            <color>#ff' + color + '</color>\n          </LineStyle>\n        </Style>\n      </Placemark>';
                }
            }
        }
    }
    return kml_string_areas_folder
}

function getareas(query_url) {
    var query_common = 'https://overpass-api.de/api/interpreter?data=%5Bdate%3A%222016-07-16T00%3A00%3A00Z%22%5D%0A%5Btimeout%3A620%5D%0A%5Bbbox%3A';
    var query_ex = '%5D%3B%0A%28%0A%20%20%20%20way%5Bleisure%3Dpark%5D%3B%0A%20%20%20%20way%5Blanduse%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Dpitch%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgarden%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgolf_course%5D%3B%0A%20%20%20%20way%5Bleisure%3Dplayground%5D%3B%0A%20%20%20%20way%5Blanduse%3Dmeadow%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgrass%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgreenfield%5D%3B%0A%20%20%20%20way%5Bnatural%3Dscrub%5D%3B%0A%20%20%20%20way%5Bnatural%3Dheath%5D%3B%0A%20%20%20%20way%5Bnatural%3Dgrassland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dvineyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dorchard%5D%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';
    var query_exclusion = '%5D%3B%0A%28%0A%20%20%20%20way%5Bamenity%3Dschool%5D%3B%0A%20%20%20%20way%5Bhighway%5D%5Barea%3Dyes%5D%3B%0A%09way%5Bnatural%3Dwater%5D%3B%0A%09way%5Blanduse%3Dconstruction%5D%3B%0A%09way%5Bnatural%3Dwetland%5D%3B%0A%09way%5Baeroway%3Drunway%5D%3B%0A%20%20%09way%5Baeroway%3Dtaxiway%5D%3B%0A%20%20%09way%5Blanduse%3Dmilitary%5D%3B%0A%09way%5Blanduse%3Dquarry%5D%3B%0A%20%20%09way%5Bwater%3Dmarsh%5D%3B%0A%20%20%09way%5Blanduse%3Drailway%5D%3B%0A%20%20%09way%5Blanduse%3Dlandfill%5D%3B%0A%09%2F%2Fway%5B%22junction%22%3D%22roundabout%22%5D%2840.54512538387331%2C-3.6385291814804077%2C40.54668050872829%2C-3.6364075541496277%29%3B%0A%20%20%09way%5Bhighway%5D%28if%3Ais_closed%28%29%29%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';

    var wait_time = 50000.0;
    var [min_lat, min_lng, max_lat, max_lng] = getMaxMinLatLng();

    if (query_url == "EX") {
        $("#EX_areas_status").html("");
        $("#EX_areas_status").html($('#EX_areas_status').html() + "• Loading EX areas (wait until this text changes).");
        document.getElementById("btngetexareas").disabled = true;
        document.getElementById("gymsfile").disabled = true;
    }
    else if (query_url == "exclusion") {
        $("#Exclusion_areas_status").html("");
        $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "• Loading exclusion areas (wait until this text changes).");
        document.getElementById("btngetexclusionareas").disabled = true;
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

    if (data.readyState === 4) {
        if (data.statusText == "OK") {
            if (query_url == "EX") {
                if (data.responseText.includes("runtime error") == true) {
                    document.getElementById("btngetexareas").disabled = false;
                    document.getElementById("gymsfile").disabled = false;
                    $("#EX_areas_status").html("");
                    $("#EX_areas_status").html($('#EX_areas_status').html() + "• WARNING! An error ocurred while getting the EX areas. If this message keeps appearing avoid gyms too far away.");
                    throw new Error("Query is too big for the overpass API. Maybe gyms too far away");
                }
                else {
                    data_global_exareas_from_osm = data;

                    document.getElementById("btngetexareas").disabled = true;
                    $("#EX_areas_status").html("");
                    $("#EX_areas_status").html($('#EX_areas_status').html() + "• EX areas loaded correctly.");

                    $("#Exclusion_areas_status").html("");
                    $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "• Wait 50 seconds to load exclusion areas (more time migth be needed).");
                    setTimeout(function(){
                        document.getElementById("btngetexclusionareas").disabled = false;
                        $("#Exclusion_areas_status").html("");
                    },wait_time);
                }

            }
            else if (query_url == "exclusion") {

                if (data.responseText.includes("runtime error") == true) {
                    document.getElementById("btngetexareas").disabled = false;
                    document.getElementById("gymsfile").disabled = false;
                    $("#Exclusion_areas_status").html("");
                    $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "• WARNING! An error ocurred while getting the exclusion areas. If this message keeps appearing avoid gyms too far away.");
                    throw new Error("Query is too big for the overpass API. Maybe gyms too far away");
                }
                else {
                    data_global_exclusionareas_from_osm = data;

                    document.getElementById("btngetexclusionareas").disabled = true;
                    $("#Exclusion_areas_status").html("");
                    $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "• Exclusion areas loaded correctly.");

                    AutomaticModeAreasLoaded = true;
                    readyToGetEXAndBlocked();

                    setTimeout(function(){
                        document.getElementById("btnresetareas").disabled = false;
                    },wait_time);
                }
            }

        }
        else if (data.statusText == "Too Many Requests") {

            if (query_url == "EX") {
                $("#EX_areas_status").html("");
                $("#EX_areas_status").html($('#EX_areas_status').html() + "• EX areas not loaded. Too many requests to the overpass API.");
                document.getElementById("btngetexareas").disabled = false;
                throw new Error("EX areas not loaded. Too many requests to the overpass API");
            }
            else if (query_url == "exclusion") {
                $("#Exclusion_areas_status").html("");
                $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "• Exclusion areas not loaded. Too many requests to the overpass API.");
                document.getElementById("btngetexclusionareas").disabled = false;
                throw new Error("Exclusion areas not loaded. Too many requests to the overpass API");
            }
        }
        }
    }

    data.send(null);
}

function resetareas() {
    $("#EX_areas_status").html("• Upload the file with gyms data and tap the first button.");
    $("#Exclusion_areas_status").html("");
    document.getElementById("btngetexareas").disabled = false;
    document.getElementById("btnresetareas").disabled = true;
    document.getElementById("btngetexandblockedgyms").disabled = true;
    document.getElementById("gymsfile").disabled = false;

    AutomaticModeAreasLoaded = false;
}

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
}

function setDataFromURL(URL,datatype) {
    var data;
    try {
        data = JSON.parse(getJSON(URL));
      }
    catch(e) {
        document.getElementsByClassName("error_block")[0].style.display = 'block';
        $("#Output_error_red").html($('#Output_error_red').html() + "• Url with " + datatype + " areas not correct. " + e.name);
        throw new Error("Error while getting data from URL");
      }
    return data
}

function readyToGetEXAndBlocked() {
    var ManualModeReady = current_mode == "Manual" && anyValidGym && EXAreasReady && ExclusionAreasReady;
    var URLModeReady = current_mode == "URL" && anyValidGym;
    var AutomaticModeReady = current_mode == "Automatic" && AutomaticModeAreasLoaded;

    if (current_mode == "Manual") {
        if (ManualModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = false;
        }
        else if (!ManualModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = true;
        }
    }

    if (current_mode == "URL") {
        if (URLModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = false;
        }
        else if (!URLModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = true;
        }
    }

    if (current_mode == "Automatic") {
        if (AutomaticModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = false;
        }
        else if (!AutomaticModeReady) {
            document.getElementById("btngetexandblockedgyms").disabled = true;
        }
    }
}

function isThereAnyError() {

    if (problems_with_gyms || anyValidGym == false || EXAreasReady == false || ExclusionAreasReady == false) {
        document.getElementsByClassName("error_block")[0].style.display = 'block';
    }
    else if ( (anyValidGym == true || anyValidGym == undefined) && (EXAreasReady == true || EXAreasReady == undefined) && (ExclusionAreasReady == true || ExclusionAreasReady == undefined)) {
        document.getElementsByClassName("error_block")[0].style.display = 'none';
    } 
}