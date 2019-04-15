/*==== Set global variables ====*/
var level = 20;
var data_global_gyms;
var data_global_exareas;
var data_global_exclusionareas;
var output_filename;
var gyms_data;
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
    }
    else{
        document.getElementById("EXareasfile").disabled = false;
        document.getElementById("exclusionareasfile").disabled = false;
        document.getElementById("exgeojson_text").style.color = '#000';
        document.getElementById("exclusiongeojson_text").style.color = '#000';
    }
}

document.getElementById('select_area').addEventListener('change', handleSelectedarea, false);
/*== Deal with page style if select_area is changed ==*/

/*==== Function called when the button is pressed ====*/
function getexgyms() {

    $("#Output_info").html("");
    $("#Output_results").html("");
    $("#Get_exclusionareas").html("");
    var problem_detected = false;

    /*=== Set csv data into a variable  ===*/
    gyms_data = JSON.parse(csvJSON(data_global_gyms));

    /*=== If a pre-selected area is selected change EX an exclusion areas ===*/
    preselectedareas();

    /*==== Create a multipolygon with all EX areas ====*/
    if (data_global_exareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with EX areas not correct.");
        return;
    }

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
    /*== Create a multipolygon with all EX areas ==*/
    
    /*==== Create a multipolygon with all exclusion areas ====*/
    if (data_global_exclusionareas == undefined) {
        problem_detected = first_time_problem_detected(problem_detected);
        $("#Output_info").html($('#Output_info').html() + "File with exclusion areas not correct.");
        return;
    }

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
            if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exareas_multipolygon) == true) ) {
                gyms_data[i]['inEXarea'] = true;
            }
            /*== Check if cell center is inside any of the EX areas ==*/
    
            /*==== Check if cell center is inside any of the exclusion areas ====*/
            if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exclusionareas_multipolygon) == true) ) {
                gyms_data[i]['inexclusionarea'] = true;
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
        $("#Get_exclusionareas").html($('#Get_exclusionareas').html() + "<br><input type='button' id='btnLoad' value='Get kml file with blocked gyms' onclick='Get_exclusionareas();'>");
    }

}
/*== Function called when the button is pressed ==*/

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
}

function Get_exclusionareas() {

    /*==== Set some strings for the kml file ====*/
    var kml_string1 = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>Blocked gyms</name>';
    var kml_string2 = '\n  </Document>\n</kml>';
    
    var kml_string_gyms_folder = '\n    <Folder>\n      <name>Blocked gyms</name>';
    var kml_string_exclusionareas_folder = '\n    <Folder>\n      <name>Exclusion areas</name>';
    var kml_string_exareas_folder = '\n    <Folder>\n      <name>EX areas</name>';
    /*== Set some strings for the kml file ==*/

    for (let i = 0; i < gyms_data.length; i++) {

        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] == true) {

            kml_string_gyms_folder += '\n      <Placemark>\n        <name>' + gyms_data[i].Name + '</name>';
            kml_string_gyms_folder += '\n        <Point>\n          <coordinates>\n            ' + gyms_data[i].lng + ',' + gyms_data[i].lat + '\n          </coordinates>\n        </Point>\n      </Placemark>';

            var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gyms_data[i].lat, gyms_data[i].lng, level) );

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
    }

    kml_string_gyms_folder += '\n    </Folder>';
    kml_string_exclusionareas_folder += '\n    </Folder>';
    kml_string_exareas_folder += '\n    </Folder>';

    /*==== Get output csv file ====*/
    let file_data = "data:text/csv;charset=utf-8,";
    file_data += kml_string1 + kml_string_gyms_folder + kml_string_exareas_folder + kml_string_exclusionareas_folder + kml_string2;
    var encodedUri = encodeURI(file_data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", output_filename + "_blocked_and_exclusionareas.kml");
    document.body.appendChild(link);
    link.click();
    /*== Get output csv file ==*/
}
