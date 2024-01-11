var jsonData = [];
var minYear, maxYear;
var currentYear;
var timeLapseTimer;

google.charts.load('current', {
    'packages':['geochart'],
});
google.charts.setOnLoadCallback(loadData);

function loadData() {
    $.getJSON("filtered_tobacco_global_food.json", function(data) {
        jsonData = data;
        minYear = Math.min.apply(Math, jsonData.map(function(o) { return o.Year; }));
        maxYear = Math.max.apply(Math, jsonData.map(function(o) { return o.Year; }));
        drawRegionsMap(maxYear);
    });
}

function drawRegionsMap(year) {
    updateHeader(year);
    var filteredData = jsonData.filter(function(d) {
    return d.Year == year;
    });

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Country');
    data.addColumn('number', 'Production (t)');
    data.addColumn({type: 'string', role: 'tooltip', p: {html: true}});

    filteredData.forEach(function(d) {
    var tooltipContent = '<div style="padding:1px 1px 1px 1px;">' +
                        + year + '<br>' +
                        'Population: ' + d.Population.toLocaleString() + '<br><hr>' +
                        'Production (t) <strong>: ' + d["Production (t)"].toLocaleString() + '</strong></div>';
    data.addRow([d.Country, d["Production (t)"], tooltipContent]);
    });

    var options = {
        colorAxis: {
            colors: ['#EDF8FB', '#B2E2E1', '#66C2A4', '#2BA25E', '#016C2C'],
            values: [0, 24329, 75679, 155000, 298645]
        },
        tooltip: {isHtml: true},
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);
}

function updateHeader(year) {
    $('#header').text('Tobacco Production, ' + year);
}

function playTimeLapse() {
    if (typeof currentYear === 'undefined' || currentYear > maxYear) {
        currentYear = minYear; // Initialize or reset currentYear
    }
    function iterateYears() {
        if (currentYear > maxYear) {
            clearTimeout(timeLapseTimer);
            return;
        }
        drawRegionsMap(currentYear);
        currentYear++;
        timeLapseTimer = setTimeout(iterateYears, 200);
    }
    iterateYears();
}

function stopTimeLapse() {
    clearTimeout(timeLapseTimer);
}

$(document).ready(function() {
    $('#yearInput').change(function() {
        var inputYear = $(this).val();

        // Check if inputYear is empty or NaN (Not a Number)
        if (inputYear === '' || isNaN(inputYear)) {
            inputYear = maxYear; // Default to maxYear if input is empty or invalid
        } else {
            inputYear = parseInt(inputYear); // Convert to an integer if it's a valid number
        }

        stopTimeLapse(); // Stop the time-lapse if the user selects a year or clears the input
        currentYear = inputYear; // Update currentYear
        drawRegionsMap(currentYear);
        updateHeader(currentYear);
    });

    // Fiunction for slider
    $('#yearSlider').on('input change', function() {
        var year = parseInt($(this).val(), 10);
        stopTimeLapse();
        drawRegionsMap(year);
        updateHeader(year);
    });
});
