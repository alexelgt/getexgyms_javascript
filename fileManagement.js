function downloadOutputFile(string, format, output_filename) {
    let file_data = "data:text/"+ format + ";charset=utf-8," + string;
    file_data = file_data.replace(/[\r]+/g, '').trim();
    var encodedUri = encodeURI(file_data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", output_filename + "." + format);
    document.body.appendChild(link);
    link.click();
}

function csvJSON(csv){
    problem_detected = null

    csv = "Name,lat,lng\n" + csv;
    var lines=csv.split("\n");

    var result = [];

    var headers=lines[0].split(",");

    for(let i = 1; i < lines.length; i++){

        var obj = {};
        var currentline=lines[i].split(",");
        if (currentline.length > 3) {
            problem_detected = "row_with_extra_elements"
        }
        else {
            for(let j = 0; j < headers.length; j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
  
    }

    return [JSON.parse(JSON.stringify(result)), problem_detected];
}

function getJSON(url) {
    var xmlHttp;

    xmlHttp = new XMLHttpRequest();

    if(xmlHttp != null)
    {
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
    }

    return xmlHttp.responseText;
}