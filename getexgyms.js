/*==== Set data_global_exareas from input file ====*/
var data_global_gyms;
var data_global_exareas;
var data_global_exclusionareas;
var output_filename;

//creates a new file reader object
const fr_exareas = new FileReader();
const fr_exclusionareas = new FileReader();
const fr_gyms = new FileReader();

function handleFilegyms (evt) {
    //function is called when input file is Selected
    //calls FileReader object with file
    fr_gyms.readAsText(evt.target.files[0]);

    output_filename = evt.target.files[0].name.replace('.csv', '');

    fr_gyms.onload = e => {
        //fuction runs when file is fully loaded.
        data_global_gyms = (e.target.result);
        
    };
};

function handleFileEXareas (evt) {
    //function is called when input file is Selected
    //calls FileReader object with file
    fr_exareas.readAsText(evt.target.files[0]);

    fr_exareas.onload = e => {
        //fuction runs when file is fully loaded.
        data_global_exareas = JSON.parse(e.target.result);
        
    };
};

function handleFileexclusionareas (evt) {
    //function is called when input file is Selected
    //calls FileReader object with file
    fr_exclusionareas.readAsText(evt.target.files[0]);

    fr_exclusionareas.onload = e => {
        //fuction runs when file is fully loaded.
        data_global_exclusionareas = JSON.parse(e.target.result);
    };
};

//event listener for file input
document.getElementById('gymsfile').addEventListener('change', handleFilegyms, false);
document.getElementById('EXareasfile').addEventListener('change', handleFileEXareas, false);
document.getElementById('exclusionareasfile').addEventListener('change', handleFileexclusionareas, false);
/*== Set data_global_exareas from input file ==*/

/*==== Function called when the button is pressed ====*/
function getexgyms() {

    gyms_data = JSON.parse(csvJSON(data_global_gyms));

    var level = 20;


    var data_global_exareas_polygon = [];
    var number_valid_exareas = 0;
    for (var i = 0; i < data_global_exareas['features'].length; i++) {

        if ( (data_global_exareas['features'][i]['geometry']['coordinates'][0].length >= 4) && (data_global_exareas['features'][i]['geometry']['type'] == "Polygon") ) {
            data_global_exareas_polygon[number_valid_exareas] = data_global_exareas['features'][i]['geometry']['coordinates'];
            number_valid_exareas++;
        }
        else if ( data_global_exareas['features'][i]['geometry']['type'] == "LineString" ) {

            var temp_data = [];
            temp_data = data_global_exareas['features'][i]['geometry']['coordinates'];
            temp_data.push(data_global_exareas['features'][i]['geometry']['coordinates'][0]);

            if ( temp_data.length >= 4  ) {
                data_global_exareas_polygon[number_valid_exareas] = temp_data;
                number_valid_exareas++;
            }
        }
    }
    var data_global_exareas_multipolygon = turf.multiPolygon(data_global_exareas_polygon);
    
    var data_global_exclusionareas_polygon = [];
    var number_valid_exclusionareas = 0;
    for (var i = 0; i < data_global_exclusionareas['features'].length; i++) {

        if ( (data_global_exclusionareas['features'][i]['geometry']['coordinates'][0].length >= 4) && (data_global_exclusionareas['features'][i]['geometry']['type'] == "Polygon") ) {
            data_global_exclusionareas_polygon[number_valid_exclusionareas] = data_global_exclusionareas['features'][i]['geometry']['coordinates'];
            number_valid_exclusionareas++;
        }
        else if ( data_global_exclusionareas['features'][i]['geometry']['type'] == "LineString" ) {
            var temp_data = [];
            temp_data = data_global_exclusionareas['features'][i]['geometry']['coordinates'];
            temp_data.push(data_global_exclusionareas['features'][i]['geometry']['coordinates'][0]);

            if ( temp_data.length >= 4  ) {
                data_global_exclusionareas_polygon[number_valid_exclusionareas] = [temp_data];
                number_valid_exclusionareas++;
            }
        }
    }
    var data_global_exclusionareas_multipolygon = turf.multiPolygon(data_global_exclusionareas_polygon);


    for (var i = 0; i < gyms_data.length; i++) {

        if ((i/100.0 - Math.floor(i/100.0)) == 0.0 ) {
            console.log(i);
        }
        
        var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gyms_data[i].lat, gyms_data[i].lng, level) );

        if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exareas_multipolygon) == true) ) {
            gyms_data[i]['inEXarea'] = true;
        }

        if ( (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), data_global_exclusionareas_multipolygon) == true) ) {
            gyms_data[i]['inexclusionarea'] = true;
        }

    }

    var csv_string_ex = "";
    var csv_string_blocked = "";

    for (var i = 0; i < gyms_data.length; i++) {
        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] != true) {
            csv_string_ex += gyms_data[i].Name + "," + gyms_data[i].lat + "," + gyms_data[i].lng + ",EX\n";
        }
        if (gyms_data[i]['inEXarea'] == true && gyms_data[i]['inexclusionarea'] == true) {
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

}
/*== Function called when the button is pressed ==*/

//var csv is the CSV file with headers
function csvJSON(csv){

    csv = "Name,lat,lng\n" + csv;
    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }

    return JSON.stringify(result);
  }

