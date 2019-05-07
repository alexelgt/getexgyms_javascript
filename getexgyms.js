/*==== Set global variables ====*/
var level = 20;
var data_global_gyms;
var data_global_exareas;
var data_global_exclusionareas;
var output_filename;
var gyms_data;

var problem_detected = false;

var data_global_exareas_from_osm = new XMLHttpRequest();
var data_global_exclusionareas_from_osm = new XMLHttpRequest();

var min_lat = 91.0;
var min_lng = 181.0;

var max_lat = -91.0;
var max_lng = -181.0;

var getmaxandminvalues_done = false;

var ready_to_run = false;

var query_common = 'https://overpass-api.de/api/interpreter?data=%5Bdate%3A%222016-07-16T00%3A00%3A00Z%22%5D%0A%5Btimeout%3A620%5D%0A%5Bbbox%3A';
var query_ex = '%5D%3B%0A%28%0A%20%20%20%20way%5Bleisure%3Dpark%5D%3B%0A%20%20%20%20way%5Blanduse%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Drecreation_ground%5D%3B%0A%20%20%20%20way%5Bleisure%3Dpitch%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgarden%5D%3B%0A%20%20%20%20way%5Bleisure%3Dgolf_course%5D%3B%0A%20%20%20%20way%5Bleisure%3Dplayground%5D%3B%0A%20%20%20%20way%5Blanduse%3Dmeadow%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgrass%5D%3B%0A%20%20%20%20way%5Blanduse%3Dgreenfield%5D%3B%0A%20%20%20%20way%5Bnatural%3Dscrub%5D%3B%0A%20%20%20%20way%5Bnatural%3Dheath%5D%3B%0A%20%20%20%20way%5Bnatural%3Dgrassland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dvineyard%5D%3B%0A%20%20%20%20way%5Blanduse%3Dfarmland%5D%3B%0A%20%20%20%20way%5Blanduse%3Dorchard%5D%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';
var query_exclusion = '%5D%3B%0A%28%0A%20%20%20%20way%5Bamenity%3Dschool%5D%3B%0A%20%20%20%20way%5Bhighway%5D%5Barea%3Dyes%5D%3B%0A%09way%5Bnatural%3Dwater%5D%3B%0A%09way%5Blanduse%3Dconstruction%5D%3B%0A%09way%5Bnatural%3Dwetland%5D%3B%0A%09way%5Baeroway%3Drunway%5D%3B%0A%20%20%09way%5Baeroway%3Dtaxiway%5D%3B%0A%20%20%09way%5Blanduse%3Dmilitary%5D%3B%0A%09way%5Blanduse%3Dquarry%5D%3B%0A%20%20%09way%5Bwater%3Dmarsh%5D%3B%0A%20%20%09way%5Blanduse%3Drailway%5D%3B%0A%20%20%09way%5Blanduse%3Dlandfill%5D%3B%0A%09%2F%2Fway%5B%22junction%22%3D%22roundabout%22%5D%2840.54512538387331%2C-3.6385291814804077%2C40.54668050872829%2C-3.6364075541496277%29%3B%0A%20%20%09way%5Bhighway%5D%28if%3Ais_closed%28%29%29%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B';
/*== Set global variables ==*/

/*==== Set data from input files ====*/
//creates a new file reader object
const fr_exareas = new FileReader();
const fr_exclusionareas = new FileReader();
const fr_gyms = new FileReader();

function handleFilegyms (evt) {
    fr_gyms.readAsText(evt.target.files[0]);

    output_filename = evt.target.files[0].name.replace('.csv', '');

    fr_gyms.onload = e => {
        data_global_gyms = (e.target.result);
        gyms_data = JSON.parse(csvJSON(data_global_gyms));
    };
};

function handleFileEXareas (evt) {
    fr_exareas.readAsText(evt.target.files[0]);

    fr_exareas.onload = e => {
        data_global_exareas = JSON.parse(e.target.result);
    };
};

function handleFileexclusionareas (evt) {
    fr_exclusionareas.readAsText(evt.target.files[0]);

    fr_exclusionareas.onload = e => {
        data_global_exclusionareas = JSON.parse(e.target.result);
    };
};

//event listener for file input
document.getElementById('gymsfile').addEventListener('change', handleFilegyms, false);
document.getElementById('EXareasfile').addEventListener('change', handleFileEXareas, false);
document.getElementById('exclusionareasfile').addEventListener('change', handleFileexclusionareas, false);
/*== Set data from input files ==*/

/*==== Deal with page style if select_area is changed ====*/
function handleSelectedarea() {
    if ( document.getElementById("select_area").value != "Manual" ) {
        document.getElementById("EXareasfile").disabled = true;
        document.getElementById("exclusionareasfile").disabled = true;
        document.getElementById("exgeojson_text").style.color = '#808080';
        document.getElementById("exclusiongeojson_text").style.color = '#808080';
        document.getElementById("File_section").style.display = 'none';
    }
    else{
        document.getElementById("EXareasfile").disabled = false;
        document.getElementById("exclusionareasfile").disabled = false;
        document.getElementById("exgeojson_text").style.color = '#000';
        document.getElementById("exclusiongeojson_text").style.color = '#000';
        document.getElementById("File_section").style.display = 'block';
    }

    if ( document.getElementById("select_area").value == "Automatic" ) {
        document.getElementById("Automatic_section").style.display = 'block';
        document.getElementById("Automatic_warning").style.display = 'block';
        if ( ready_to_run == false ) {
            document.getElementById("btngetexandblockedgyms").disabled = true;
        }

    }
    else{
        document.getElementById("Automatic_section").style.display = 'none';
        document.getElementById("Automatic_warning").style.display = 'none';
        document.getElementById("btngetexandblockedgyms").disabled = false;
    }
}

document.getElementById('select_area').addEventListener('change', handleSelectedarea, false);
/*== Deal with page style if select_area is changed ==*/

/*==== Function called when the button "Get EX and blocked gyms" is pressed ====*/
function getexgyms() {

    $("#Output_info").html("");
    $("#Output_results").html("");
    $("#Get_exclusionareas").html("");
    

    if ( data_global_gyms == undefined ) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with gyms not correct.");
        return;
    }

    /*=== If a pre-selected area is selected change EX an exclusion areas ===*/
    preselectedareas();

    /*==== Create a multipolygon with all EX areas ====*/
    if (data_global_exareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with EX areas not correct.");
        return;
    }

    if ( data_global_exareas['features'].length > 0 ) {
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
    if (data_global_exclusionareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with exclusion areas not correct.");
        return;
    }

    if ( data_global_exclusionareas['features'].length > 0 ) {
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
    var gyms_analyzed = 0;
    for (let i = 0; i < gyms_data.length; i++) {

        /*==== Deal with problematic rows ====*/
        if (gyms_data[i].Name == "") {
            problem_detected = first_time_problem_detected(problem_detected);
            $("#Output_info").html($('#Output_info').html() + "Row number " + i + " skipped (empty row?)<br>");
        }
        else if (isNaN(gyms_data[i].lat) == true) {
            problem_detected = first_time_problem_detected(problem_detected);
            if (gyms_data[i].Name == "Name" || gyms_data[i].Name == "name") {
                $("#Output_info").html($('#Output_info').html() + "Row number " + i + " skipped (header row?)<br>");
            }
            else{
                $("#Output_info").html($('#Output_info').html() + "Row number " + i + " skipped (name with comma?)<br>");
            }
        }
        /*== Deal with problematic rows ==*/
        else{
            gyms_analyzed++;
            /*=== Get cell center of the S2 cell that contains the gym  ===*/
            var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gyms_data[i].lat, gyms_data[i].lng, level) );
    
            /*==== Check if cell center is inside any of the EX areas ====*/
            if ( data_global_exareas['features'].length > 0 ) {
                if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exareas_multipolygon) == true) ) {
                    gyms_data[i]['inEXarea'] = true;
                }
            }
            /*== Check if cell center is inside any of the EX areas ==*/

            /*==== Check if cell center is inside any of the exclusion areas ====*/
            if ( data_global_exclusionareas['features'].length > 0 ) {
                if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exclusionareas_multipolygon) == true) ) {
                    gyms_data[i]['inexclusionarea'] = true;
                }
            }
            /*== Check if cell center is inside any of the exclusion areas ==*/
        }
    }
    /*== Check all gyms ==*/

    /*==== Get output csv file ====*/
    var csv_string_ex = "";
    var csv_string_blocked = "";

    var ex_gyms = 0;
    var blocked_gyms = 0;
    for (let i = 0; i < gyms_data.length; i++) {
        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] != true) {
            ex_gyms++;
            csv_string_ex += gyms_data[i].Name + "," + gyms_data[i].lat + "," + gyms_data[i].lng + ",EX\n";
        }
        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] == true) {
            blocked_gyms++;
            csv_string_blocked += gyms_data[i].Name + "," + gyms_data[i].lat + "," + gyms_data[i].lng + ",Blocked\n";
        }
    }

    let file_data = "data:text/csv;charset=utf-8,";
    file_data += "Name,Latitude,Longitude,Type\n" + csv_string_ex + csv_string_blocked;
    file_data = file_data.replace(/[\r]+/g, '').trim();
    var encodedUri = encodeURI(file_data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", output_filename + "_ex_and_blocked.csv");
    document.body.appendChild(link);
    link.click();
    /*== Get output csv file ==*/

    $("#Output_results").html($('#Output_results').html() + "<b>Results</b><br>");
    $("#Output_results").html($('#Output_results').html() + "Gyms analyzed: " + gyms_analyzed + "<br>");
    $("#Output_results").html($('#Output_results').html() + "EX gyms: " + ex_gyms + "<br>");
    $("#Output_results").html($('#Output_results').html() + "Blocked gyms: " + blocked_gyms);

    if (blocked_gyms > 0) {
        $("#Get_exclusionareas").html($('#Get_exclusionareas').html() + "<br><input type='button' id='btnLoad' value='Get kml file with blocked gyms' onclick='Get_exclusionareas();'><br><br>");
    }

}
/*== Function called when the button "Get EX and blocked gyms" is pressed ==*/

function first_time_problem_detected(problem_detected) {
    if (problem_detected == false) {
        problem_detected = true;
        $("#Output_info").html($('#Output_info').html() + "<b>Problems detected</b><br>");
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

function preselectedareas() {
    if (document.getElementById("select_area").value == "Madrid") {
        data_global_exareas = JSON.parse(getJSON('example_data/madrid_exareas.geojson'));
        data_global_exclusionareas = JSON.parse(getJSON('example_data/madrid_exclusionareas.geojson'));
    }

    if ( document.getElementById("select_area").value == "Automatic" ) {

        /*==== Convert EX areas data to a typical GeoJSON file ====*/
        var osm_data_ex = data_global_exareas_from_osm.responseText;

        try {
            osm_data_ex = $.parseXML(osm_data_ex);
        } catch(e) {
            osm_data_ex = JSON.parse(osm_data_ex);
        }
        data_global_exareas = osmtogeojson(osm_data_ex);
        /*== Convert EX areas data to a typical GeoJSON file ==*/

        /*==== Convert exclusion areas data to a typical GeoJSON file ====*/
        var osm_data_exclusion = data_global_exclusionareas_from_osm.responseText;

        try {
            osm_data_exclusion = $.parseXML(osm_data_exclusion);
        } catch(e) {
            osm_data_exclusion = JSON.parse(osm_data_exclusion);
        }
        data_global_exclusionareas = osmtogeojson(osm_data_exclusion);
        /*== Convert exclusion areas data to a typical GeoJSON file ==*/
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
    for (let i = 0; i < gyms_data.length; i++) {

        /*==== Only take into account EX gyms in an exclusion area ====*/
        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] == true) {

            kml_string_gyms_folder += '\n      <Placemark>\n        <name>' + gyms_data[i].Name + '</name>';
            kml_string_gyms_folder += '\n        <Point>\n          <coordinates>\n            ' + gyms_data[i].lng + ',' + gyms_data[i].lat + '\n          </coordinates>\n        </Point>\n      </Placemark>';

            /*=== Get cell center of the S2 cell that contains the gym  ===*/
            var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gyms_data[i].lat, gyms_data[i].lng, level) );

            /*==== Check EX areas where the cell center is inside ====*/
            if ( data_global_exareas['features'].length > 0 ) {
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
            if ( data_global_exclusionareas['features'].length > 0 ) {
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

    //document.getElementById("btnresetareas").disabled = false;

    

    if (query_url == "EX") {
        $("#EX_areas_status").html("");
        $("#EX_areas_status").html($('#EX_areas_status').html() + "Loading EX areas (wait until this text changes).");
        document.getElementById("btngetexareas").disabled = true;
    }
    else if (query_url == "exclusion") {
        $("#Exclusion_areas_status").html("");
        $("#Exclusion_areas_status").html($('#Exclusion_areas_status').html() + "Loading exclusion areas (wait until this text changes).");
        document.getElementById("btngetexclusionareas").disabled = true;
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
    for (let i = 0; i < gyms_data.length; i++) {
        if ( Number(gyms_data[i].lat) < min_lat ) {
            min_lat = gyms_data[i].lat;
        }

        if ( Number(gyms_data[i].lat) > max_lat ) {
            max_lat = gyms_data[i].lat;
        }

        if ( Number(gyms_data[i].lng) < min_lng ) {
            min_lng = gyms_data[i].lng;
        }

        if ( Number(gyms_data[i].lng) > max_lng ) {
            max_lng = gyms_data[i].lng;
        }
    }

    if ( min_lat == max_lat && min_lng == max_lng ) {
        min_lat = max_lat - 0.001;
        min_lng = max_lng - 0.001;
    }

    getmaxandminvalues_done = true;
}

function resetareas() {
    getmaxandminvalues_done = false;

    min_lat = 91.0;
    min_lng = 181.0;
    
    max_lat = -91.0;
    max_lng = -181.0;

    $("#EX_areas_status").html("");
    $("#Exclusion_areas_status").html("");
    document.getElementById("btngetexareas").disabled = false;
    document.getElementById("btnresetareas").disabled = true;
    //document.getElementById("btngetexclusionareas").disabled = false;
}