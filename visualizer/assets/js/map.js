var rootEndpoint = "https://corona-stats.online/?format=json";
var map;

$( document ).ready(function() {  
    initMap();
});

function initMap() {
    map = L.map('stations', {scrollWheelZoom:true}).setView([29.53523, 24.60938], 2);

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
        'OSM_Black' : openStreetMapBlackAndWhite
    }
    baseLayers.OSM_Black.addTo(map);    
    
    $.ajax({
            type: 'GET',
            url: rootEndpoint,
            dataType: 'json',
            async: false,
            success: function(data) {
                elements = data.data
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
                            "<div class=\"table-responsive\">" + 
                                "<table class=\"table table-striped table-sm\">" +
                                    "<thead>" +
                                        "<tr>" +                                   
                                            "<th>Country</th>" + 
                                            "<th>Cases</th>" + 
                                            "<th>Cases Today</th>" + 
                                            "<th>Deaths</th>" + 
                                            "<th>Deaths Today</th>" + 
                                            "<th>Recovered</th>" + 
                                            "<th>Active</th>" + 
                                            "<th>Confirmed</th>" + 
                                        "</tr>" + 
                                    "</thead>" + 
                                    "<tbody>" + 
                                        "<tr>" + 
                                            "<td>" + marker.country + "</td>" + 
                                            "<td>" + marker.cases + "</td>" + 
                                            "<td>" + marker.todayCases + "</td>" + 
                                            "<td>" + marker.deaths + "</td>" + 
                                            "<td>" + marker.todayDeaths + "</td>" + 
                                            "<td>" + marker.recovered + "</td>" + 
                                            "<td>" + marker.active + "</td>" + 
                                            "<td>" + marker.confirmed + "</td>" + 
                                        "</tr>" + 
                                    "</tbody>" + 
                                "</table>" + 
                            "</div>"

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
                          .addTo(map)
                          .on('click', function () {
                                this.setLabelNoHide(noHide);
                                noHide = !noHide;
                           });
                });    
            }
    });

    L.control.layers(baseLayers, null).addTo(map);

    L.control.scale().addTo(map);

    L.control.mousePosition().addTo(map);
}