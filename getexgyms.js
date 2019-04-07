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
function pogotoolstomymaps() {

    gyms_data = JSON.parse(csvJSON(data_global_gyms));

    var level = 20;

    for (var i = 0; i < gyms_data.length; i++) {

        var gym_cellcenter = S2.keyToLatLng( S2.S2Cell.latLngToKey(gyms_data[i].lat, gyms_data[i].lng, level) );
        for (var j = 0; j < data_global_exareas['features'].length; j++) {
            
            if ( (data_global_exareas['features'][j]['geometry']['coordinates'][0].length >= 4) && (data_global_exareas['features'][j]['geometry']['type'] == "Polygon") && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon(data_global_exareas['features'][j]['geometry']['coordinates'])) == true) ) {
                gyms_data[i]['inEXarea'] = true;
            }
            else if ( data_global_exareas['features'][j]['geometry']['type'] == "LineString" ) {
                var temp_data = [];
                temp_data = data_global_exareas['features'][j]['geometry']['coordinates'];
                temp_data.push(data_global_exareas['features'][j]['geometry']['coordinates'][0]);

                if ( temp_data.length >= 4 && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon([temp_data])) == true) ) {
                    gyms_data[i]['inEXarea'] = true;
                }
            }

            if (gyms_data[i]['inEXarea'] == true) {
                break;
            }
        }

        for (var k = 0; k < data_global_exclusionareas['features'].length; k++) {
            
            if ( (data_global_exclusionareas['features'][k]['geometry']['coordinates'][0].length >= 4) && (data_global_exclusionareas['features'][k]['geometry']['type'] == "Polygon") && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon(data_global_exclusionareas['features'][k]['geometry']['coordinates'])) == true) ) {
                gyms_data[i]['inexclusionarea'] = true;
            }
            else if ( data_global_exclusionareas['features'][k]['geometry']['type'] == "LineString"){
                var temp_data = [];
                temp_data = data_global_exclusionareas['features'][k]['geometry']['coordinates'];
                temp_data.push(data_global_exclusionareas['features'][k]['geometry']['coordinates'][0]);

                if ( temp_data.length >= 4 && (turf.booleanPointInPolygon(turf.point([gym_cellcenter.lng,gym_cellcenter.lat]), turf.polygon([temp_data])) == true) ) {
                    gyms_data[i]['inexclusionarea'] = true;
                }
            }

            if (gyms_data[i]['inexclusionarea'] == true) {
                break;
            }
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

