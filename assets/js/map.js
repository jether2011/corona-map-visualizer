var rootEndpoint = "https://corona-stats.online/?format=json";
var map;

$( document ).ready(function() {  
    loadEntireMap();
});

function loadEntireMap() {
    map = L.map('covid19-coverage', { scrollWheelZoom:true }).setView([29.53523, 24.60938], 3);

    var openstreetmap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
        maxZoom: 18
    });
    var openStreetMapBlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    });

    var empty = L.tileLayer('');    

    var baseLayers = {
        'Blank': empty,
        'OSM' : openstreetmap,
        'OSM Black' : openStreetMapBlackAndWhite
    }
    baseLayers['OSM Black'].addTo(map);    
    
    var overLayers = {};

    $.ajax({
        type: 'GET',
        url: rootEndpoint,
        dataType: 'json',
        async: false,
        success: function(data) {
            /**
             * maps and layers 
             */
            let countries = new L.LayerGroup();
            let heatRootPoints = new Array();
            let elements = data.data
            elements.forEach(element => {
                let marker = {
                        country: element.country,
                        countryInfo: {
                            lat: element.countryInfo.lat,
                            long: element.countryInfo.long,
                            flag: element.countryInfo.flag,
                            iso3: element.countryInfo.iso3
                        },
                        cases: element.cases,
                        todayCases: element.todayCases,
                        deaths: element.deaths,
                        todayDeaths: element.todayDeaths,
                        recovered: element.recovered,
                        active: element.active,
                        critical: element.critical,
                        casesPerOneMillion: element.casesPerOneMillion,
                        deathsPerOneMillion: element.deathsPerOneMillion,
                        countryCode: element.countryCode,
                        confirmed: element.confirmed
                    }
                    
                var popupContent = 
                    "<div class=\"table-responsive\"><table class=\"table table-striped table-sm\">" +
                            "<thead><tr><th>Country</th><th>Cases</th><th>Cases Today</th><th>Deaths</th><th>Deaths Today</th><th>Recovered</th><th>Active</th><th>Confirmed</th></tr></thead>" + 
                            "<tbody><tr>" + 
                                    "<td>" + marker.country + "</td>" + 
                                    "<td>" + marker.cases + "</td>" + 
                                    "<td>" + marker.todayCases + "</td>" + 
                                    "<td>" + marker.deaths + "</td>" + 
                                    "<td>" + marker.todayDeaths + "</td>" + 
                                    "<td>" + marker.recovered + "</td>" + 
                                    "<td>" + marker.active + "</td>" + 
                                    "<td>" + marker.confirmed + "</td>" + 
                            "</tr></tbody></table></div>"

                let flagIcon = L.icon({
                    iconUrl: marker.countryInfo.flag,
                    iconSize: [25, 15]
                });

                var noHide = false;
                L.marker([marker.countryInfo.lat, marker.countryInfo.long], {
                    icon: flagIcon
                }).bindPopup(popupContent)
                    .bindTooltip(marker.countryInfo.iso3, {
                        direction: 'auto'
                    })
                    .openPopup()
                    .addTo(countries)
                    .on('click', function () {
                        this.setLabelNoHide(noHide);
                        noHide = !noHide;
                    });
                
                let heatPoints = [marker.countryInfo.lat, marker.countryInfo.long, marker.cases];
                heatRootPoints.push(heatPoints);
            });

            let heats = L.heatLayer(heatRootPoints, {radius: 35, blur: 35}).addTo(map);                
            countries.addTo(map);            
            overLayers['Heatmap Cases'] = heats;
            overLayers['Countries Coverage'] = countries;

            /**
             * world summary
             */
            let worldSummary = data.worldStats;
            var worldSummaryTable = 
                "<table class=\"table table-striped\"><tbody>" + 
                    "<tr><th>World Cases</th><td>" + worldSummary.cases + "</td></tr>" +
                    "<tr><th>World Cases Today</th><td>" + worldSummary.todayCases + "</td></tr>" +
                    "<tr><th>World Deaths</th><td>" + worldSummary.deaths + "</td></tr>" +
                    "<tr><th>World Deaths Today</th><td>" + worldSummary.todayDeaths + "</td></tr>" +
                    "<tr><th>World Recovered Cases</th><td>" + worldSummary.recovered + "</td></tr>" +
                    "<tr><th>World Active Cases</th><td>" + worldSummary.active + "</td></tr>" +
                    "<tr><th>World Critical Cases</th><td>" + worldSummary.critical + "</td></tr>" +
                    "<tr><th>World Confirmed Cases</th><td>" + worldSummary.confirmed + "</td></tr>" +
                    "<tr><th>Current Date</th><td>" + moment().format('MMMM Do YYYY, h:mm:ss a') + "</td></tr>" +
                "</tbody></table>"
            $('#world-summary-content').html(worldSummaryTable);
        }
    });

    L.control.layers(baseLayers, overLayers, { collapsed: false }).addTo(map);

    L.control.scale().addTo(map);

    L.control.mousePosition().addTo(map);

    // https://github.com/noerw/leaflet-sidebar-v2
    L.control.sidebar({
        autopan: false,   
        closeButton: true,
        container: 'sidebar',
        position: 'left',
    }).addTo(map);
}