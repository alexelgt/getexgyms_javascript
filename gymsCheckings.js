function gymStatus(gym) {
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

function removeProblematicGymRows() {
    problem_detected = false;
    document.getElementsByClassName("error_block")[0].style.display = 'none';
    $("#Output_error_gyms").html("");

    var valid_gyms = 0;
    var new_gyms_data = [];
    for (const [i, gym] of gyms_data.entries()) {
        if (gymStatus(gym) == "no_problem") {
            valid_gyms += 1;
            new_gyms_data.push(gym);
        }
        else {
            problems_with_gyms = true;
            document.getElementsByClassName("error_block")[0].style.display = 'block';
            if (gymStatus(gym) == "empty_row") {
                $("#Output_error_gyms").html($('#Output_error_gyms').html() + "• Row number " + i + " skipped (empty row?).<br>");
            }
            else if (gymStatus(gym) == "header_row") {
                $("#Output_error_gyms").html($('#Output_error_gyms').html() + "• Row number " + i + " skipped (header row?).<br>");
            }
            else if (gymStatus(gym) == "name_with_comma") {
                $("#Output_error_gyms").html($('#Output_error_gyms').html() + "• Row number " + i + " skipped (name with comma?).<br>");
            }
        }
    }
    gyms_data = new_gyms_data;

    return valid_gyms
}

function getMaxMinLatLng() {
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

    return [min_lat, min_lng, max_lat, max_lng]
}