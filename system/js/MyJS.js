//*****************************************************************************************************************************************
// Global Variable
//*****************************************************************************************************************************************
var VisSelected = [];
var QueryId = -1;
var ComplexQueryList = [];
var edit = 0;
var editQId = -1;
var ActiveQID = -1;
var TempQO = -1;
var polylines = -1;
var Start_Points = -1;
var End_Points = -1;
var heatLayer = -1;
var AvtiveVis = -1;
var Street_Layer = -1;
var Region_Layer = -1;
var Poly_Layer = -1;
var QcoorLat;
var QcoorLng;
var MyDB;
var MyTB;
var points = {};
var mytitle = "";
var STC;
var ActiveTab = "#3b";
var SMM;
//*****************************************************************************************************************************************
// Initialize Map, , set the view to a given place and zoom + Buttons 
//*****************************************************************************************************************************************
$('#span1').hide();
$('#span2').hide();
$('#span3').hide();
DrawChart1();
MyDB = localStorage.getItem("MyDB");
MyTB = localStorage.getItem("MyTB");
lat = localStorage.getItem("lat");
lng = localStorage.getItem("lng");

//******************************************************************************************************************************************
if (MyTB != "td") {
    $.ajaxSetup({
        async: false
    });
    $.post("/TrajVis/system/Qquery2.php", {
        SelDB: MyDB,
        SelTB: MyTB
    }, function(results) {
        // the output of the response is now handled via a variable call 'results'
        if (results) {
            var obj = [];
            obj = JSON.parse(results);
            //console.log(obj);
            RID = obj.RID;
        } else {
            console.log("No Results");
        }
    });
}
//******************************************************************************************************************************************

var zoom = 14;

var regns = new L.FeatureGroup();
var Pickregns = new L.FeatureGroup();

if (MyTB === "tds") {
    mytitle = "Street ID";
    var select1 = document.getElementById('QueryMode');
    var opt = document.createElement('option');
    opt.value = "Within";
    opt.innerHTML = "Within";
    select1.appendChild(opt);
} else if (MyTB === "tdr") {
    mytitle = "Region ID";
} else if (MyTB === "td") {
    mytitle = "ID";
    var select1 = document.getElementById('QueryMode');
    var opt = document.createElement('option');
    opt.value = "Within";
    opt.innerHTML = "Within";
    select1.appendChild(opt);
}

var RoadTypeLayer = [];
for (var k = 0; k < 11; k++) {
    RoadTypeLayer[k] = new L.FeatureGroup();
}

// add an OpenStreetMap tile layer
var mbAttr = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';


var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


var map = L.map('map', {
    center: [lat, lng], // City Center
    zoom: zoom,
    layers: [streets, RoadTypeLayer[2], RoadTypeLayer[5]],
    zoomControl: false,
    preferCanvas: true,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode",
        position: 'topright'
    }
});

//map.getPane('tilePane').style.opacity = 0.1;

var baseLayers = {
    "Grayscale": grayscale, // Grayscale tile layer
    "Streets": streets, // Streets tile layer
};

var overlayMaps = {

    "Motorway": RoadTypeLayer[1],
    "Primary": RoadTypeLayer[2],
    "Secondary": RoadTypeLayer[5],
    "Residential": RoadTypeLayer[3],
    "Road": RoadTypeLayer[4],
    "Living_Street": RoadTypeLayer[0],
    "Service": RoadTypeLayer[6],
    "Tertiary": RoadTypeLayer[7],
    "Trunk": RoadTypeLayer[8],
    "Cycleway": RoadTypeLayer[9],
    "Unclassified": RoadTypeLayer[10]
};

layerControl = L.control.layers(baseLayers, overlayMaps, {
    position: 'bottomright'
}).addTo(map);

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var featureGroup = L.featureGroup();

var drawControl = new L.Control.Draw({
    position: 'topright',
    collapsed: false,
    draw: {
        // Available Shapes in Draw box. To disable anyone of them just convert true to false
        polyline: false,
        polygon: true,
        circle: true,
        rectangle: true,
        marker: false,
    },
    edit: {
        featureGroup: drawnItems,
        remove: false,
        edit: false
    }

});

//To add anything to map, add it to "drawControl"
map.addControl(drawControl);

//Street View-Trajectory View-Clear View Control
if (MyTB != "td") {
    //RID = JSON.parse(localStorage.RID || "{}");
    //RID = JSON.parse(RID1 || "{}");
    STC = [
        L.easyButton({
            states: [{
                icon: 'fa-tachometer fa-lg',
                title: 'Traj Speed',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 1;
                        if (MyTB === "tds") {
                            DrawStreet(ActiveQID.road_Array);
                        } else if (MyTB === "tdr") {
                            RDrawStreet(ActiveQID.road_Array);
                        }
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-exchange fa-lg',
                title: 'Traj Flow',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 2;
                        if (MyTB === "tds") {
                            DrawStreet1(ActiveQID.road_Array, ActiveQID.color);
                        } else if (MyTB === "tdr") {
                            RDrawStreet1(ActiveQID.road_Array, ActiveQID.color);
                        }
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-sign-in fa-lg',
                title: 'Pick-UP Distribution',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 3;
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-sign-out fa-lg',
                title: 'Drop-Off Distribution',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 4;
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-taxi fa-lg',
                title: 'Trajectory View',
                onClick: function() {
                    clearMap();
                    AvtiveVis = 5;
                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-eraser fa-lg',
                title: 'Clear Map',
                onClick: function() {
                    location.reload();
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa fa-file-image-o fa-lg',
                title: 'Save Map',
                onClick: function() {
                    html2canvas(document.getElementById('map'), {
                        useCORS: true,
                        onrendered: function(canvas) {
                            var dataUrl = canvas.toDataURL("image/png");
                            var link = document.createElement("a");
                            link.download = 'Map';
                            link.href = dataUrl;
                            link.click();
                            // DO SOMETHING WITH THE DATAURL
                            // Eg. write it to the page
                            //document.write('<img src="' + dataUrl + '"/>');
                            //Canvas2Image.saveAsPNG(canvas); 
                        }
                    });
                }
            }]
        })

    ];
} else {
    STC = [
        L.easyButton({
            states: [{
                icon: 'fa-sign-in fa-lg',
                title: 'Pick-UP Distribution',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 3;
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-sign-out fa-lg',
                title: 'Drop-Off Distribution',
                onClick: function() {
                    if (ActiveQID != -1) {
                        //console.log(vis.QueryManager.GetQueryByQueryId(ActiveQID));
                        clearMap();
                        AvtiveVis = 4;
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    }
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-taxi fa-lg',
                title: 'Trajectory View',
                onClick: function() {
                    clearMap();
                    AvtiveVis = 5;
                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa-eraser fa-lg',
                title: 'Clear Map',
                onClick: function() {
                    location.reload();
                }
            }]
        }),
        L.easyButton({
            states: [{
                icon: 'fa fa-file-image-o fa-lg',
                title: 'Save Map',
                onClick: function() {
                    html2canvas(document.getElementById('map'), {
                        useCORS: true,
                        onrendered: function(canvas) {
                            var dataUrl = canvas.toDataURL("image/png");
                            var link = document.createElement("a");
                            link.download = 'Map';
                            link.href = dataUrl;
                            link.click();
                            // DO SOMETHING WITH THE DATAURL
                            // Eg. write it to the page
                            //document.write('<img src="' + dataUrl + '"/>');
                            //Canvas2Image.saveAsPNG(canvas); 
                        }
                    });
                }
            }]
        })

    ];
}
L.easyBar(STC).addTo(map);

//Save-Load GeoJson file Control
var SLG = [
    L.easyButton({
        states: [{
            icon: 'fa-floppy-o fa-lg',
            title: 'Save Region(s) (.GeoJson)',
            href: "#",
            onClick: function() {
                var featureGroup1 = L.featureGroup();
                // Extract GeoJson from featureGroup
                for (var i = 0; i < ActiveQID.LayerGroups.length; i++) {
                    featureGroup1.addLayer(ActiveQID.LayerGroups[i]);
                }
                //console.log(featureGroup1);
                var ftr = 0;
                var data = featureGroup1.toGeoJSON();
                featureGroup1.eachLayer(function(layer123) {
                    data.features[ftr].geometry.type = layer123.type;
                    data.features[ftr].properties.TQ = layer123.TQ;
                    data.features[ftr].properties.T1 = layer123.T1;
                    data.features[ftr].properties.T2 = layer123.T2;
                    ftr = ftr + 1;
                });
                // Stringify the GeoJson
                var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

                // Create export
                var a = document.createElement('a');
                a.setAttribute('href', 'data:' + convertedData);
                a.setAttribute('download', 'data.geojson');
                a.click();
            }
        }]
    }),
    L.easyButton({
        states: [{
            icon: 'fa-folder-open fa-lg',
            title: 'Load Region(s) (.GeoJson)',
            onClick: function() {
                document.getElementById('upload-file').click();
            }
        }]
    })
];

L.easyBar(SLG).addTo(map);

//To add speed legend to the map
var legend = L.control({
    position: 'topleft'
});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [2, 7, 17, 28],
        lbl = ["<= 05Km/h", "<= 15Km/h", "<= 25Km/h", "> 25Km/h"],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from) + '"></i> ' + lbl[i]);
        //from + (to ? '–' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
};

if (MyTB === "tdr") {
    if (RID.features[0].geometry.coordinates[0][0][0][0]) {
        for (var i = 0; i < RID.features.length; i++) {
            //console.log(RID.features[i].properties.id);
            //console.log(RID.features[i].geometry.coordinates[0][0].length);
            points[RID.features[i].properties.id] = [];
            for (var j = 0; j < RID.features[i].geometry.coordinates[0][0].length; j++) {
                var lt = RID.features[i].geometry.coordinates[0][0][j][1];
                var lg = RID.features[i].geometry.coordinates[0][0][j][0];
                points[RID.features[i].properties.id].push(L.latLng(lt, lg));
            }
            //console.log(points);
            //var polygon = L.polygon([points],{color:"Red", opacity:0.9, weight: 2}).addTo(map);
        }
    } else {
        for (var i = 0; i < RID.features.length; i++) {
            //console.log(RID.features[i].properties.id);
            //console.log(RID.features[i].geometry.coordinates[0].length);
            points[RID.features[i].properties.id] = [];
            for (var j = 0; j < RID.features[i].geometry.coordinates[0].length; j++) {
                var lt = RID.features[i].geometry.coordinates[0][j][1];
                var lg = RID.features[i].geometry.coordinates[0][j][0];
                points[RID.features[i].properties.id].push(L.latLng(lt, lg));
            }
            //console.log(points);
            //var polygon = L.polygon([points],{color:"Red", opacity:0.9, weight: 2}).addTo(map);
        }
    }
}
//console.log(points);


//*****************************************************************************************************************************************
// custom zoom bar control that includes a Zoom Home function.
//*****************************************************************************************************************************************
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topright',
        zoomInText: '<i class="fa fa-plus fa-lg" style="line-height:1.65;"></i>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<i class="fa fa-minus fa-lg" style="line-height:1.65;"></i>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home fa-lg" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function(map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
            controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function(map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function(e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function(e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function(html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function() {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});

// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

//*****************************************************************************************************************************************
// Side Bar
//*****************************************************************************************************************************************
$('#toolbar .MV').on('click', function() {
    $(this).parent().toggleClass('open');
});
//*****************************************************************************************************************************************
// Clear the map
//*****************************************************************************************************************************************
function clearMap() {
    for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            } catch (e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }

    map.removeControl(legend);
    regns.clearLayers();
    Pickregns.clearLayers();

    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }

    if (polylines != -1) {
        polylines.clearLayers();
        Start_Points.clearLayers();
        End_Points.clearLayers();
    }

    if (heatLayer != -1) {
        map.removeLayer(heatLayer);
    }
    clearLassoSelectedClickLayel();
    clearLassoSelectedStreeLayel();
}
//*****************************************************************************************************************************************
// Drawing Shapes (polyline, polygon, circle, rectangle, marker) Event: Select from draw box and start drawing on map.
//*****************************************************************************************************************************************
var stcor = "";
var type = "";
var color = "";
map.on('draw:created', function(e) {

    //var T1 = kendo.toString($("#datetimepicker1").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');
    //var T2 = kendo.toString($("#datetimepicker2").data("kendoDateTimePicker").value(), "yyyy/MM/dd HH:mm:ss").replace(/\//g, '-');

    var SM = document.getElementById("QueryMode").value;
    var RS = "Single";

    if (SM == "Intersect") {
        SMM = "1";
    } else if (SM == "Pick-UP") {
        SMM = "2";
    } else if (SM == "Drop-Off") {
        SMM = "3";
    } else {
        SMM = "4";
    }

    var T1 = document.getElementById("search-from-date").value + ":00";
    var T2 = document.getElementById("search-to-date").value + ":00";

    type = e.layerType;
    var layer = e.layer;
    layer.type = type;
    layer.TQ = SMM;
    layer.T1 = T1;
    layer.T2 = T2;

    /*
	var layer = event.layer,
        feature = layer.feature = layer.feature || {}; // Initialize feature

    feature.type = feature.type || "Feature"; // Initialize feature.type
    var props = feature.properties = feature.properties || {}; // Initialize feature.properties
    props.myId = 'This is myId';
	*/


    if (edit == 0) {
        if (RS == "Single") {
            clearMap();
            featureGroup.clearLayers();
            drawnItems.clearLayers();
        }
        color = vis.QueryManager.nextQueryColor;
        newQuery = vis.QueryManager.CreateQuery(layer, color);
        //layer.bindPopup('Query ' + newQuery.QueryId);
        //If your selection is a circle
        if (type === 'circle') {
            //Prepare circle border for query
            var r = new L.LayerGroup();
            var desyCircle = LGeo.circle([layer.getLatLng().lat, layer.getLatLng().lng], layer.getRadius(), {
                parts: 144
            }).addTo(r);
            var f = r.getLayers()
            var p = f[0].toGeoJSON()
            featureGroup.addLayer(f[0]);
            // points of the border
            stcor = p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            for (var k = 1; k < p.geometry.coordinates[0].length; k++) {
                stcor = stcor + "," + p.geometry.coordinates[0][k][0].toString() + " " + p.geometry.coordinates[0][k][1].toString();
            }
            stcor = stcor + "," + p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
            //Send circle border to the server for query
            if (MyTB === "tds") {
                AvtiveVis = 2;
                $.post("/TrajVis/system/query.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                    } else {
                        console.log("No Results");
                    }
                });
            } else if (MyTB === "tdr") {
                AvtiveVis = 2;
                $.post("/TrajVis/system/Rquery.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        //console.log(obj);
                        StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                    } else {
                        console.log("No Results");
                    }
                });
            } else if (MyTB === "td") {
                AvtiveVis = 5;
                $.post("/TrajVis/system/Nquery.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        //console.log(obj);
                        StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"],obj["Months"], obj["Years"], obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                    } else {
                        console.log("No Results");
                    }
                });
            }
        } else
            //If your selection is a rectangle
            if (type === 'rectangle') {
                //Prepare rectangle border for query
                featureGroup.addLayer(layer);
                var coor = [];
                coor = layer.getLatLngs();
                QcoorLat = coor[0][0].lat;
                QcoorLng = coor[0][0].lng;
                stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;

                //Send rectangle border to the server for query
                if (MyTB === "tds") {
                    AvtiveVis = 2;
                    $.post("/TrajVis/system/query.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            console.log(obj);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "tdr") {
                    AvtiveVis = 2;
                    $.post("/TrajVis/system/Rquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            //console.log(obj);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "td") {
                    AvtiveVis = 5;
                    $.post("/TrajVis/system/Nquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            //console.log(obj);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                }
            }
        else
            //If your selection is a polygon
            if (type === 'polygon') {
                //Prepare polygon border for query
                featureGroup.addLayer(layer);
                var coor = [];
                coor = layer.getLatLngs();
                stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send polygon border to the server for query
                if (MyTB === "tds") {
                    AvtiveVis = 2;
                    $.post("/TrajVis/system/query.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "tdr") {
                    AvtiveVis = 2;
                    $.post("/TrajVis/system/Rquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            //console.log(obj);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"],obj["Months"], obj["Years"], obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "td") {
                    AvtiveVis = 5;
                    $.post("/TrajVis/system/Nquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            //console.log(obj);
                            StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"], obj["Months"], obj["Years"],obj["region_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                        } else {
                            console.log("No Results");
                        }
                    });
                }
            }
    } else
    if (edit == 1) {
        var Qu = vis.QueryManager.GetQueryByQueryId(editQId);
        Qu.LayerGroups.push(layer);
        color = Qu.Color;
        //If your selection is a circle
        if (type === 'circle') {
            //Prepare circle border for query
            var r = new L.LayerGroup();
            var desyCircle = LGeo.circle([layer.getLatLng().lat, layer.getLatLng().lng], layer.getRadius(), {
                parts: 144
            }).addTo(r);
            var f = r.getLayers()
            var p = f[0].toGeoJSON()

            // points of the border
            stcor = p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            for (var k = 1; k < p.geometry.coordinates[0].length; k++) {
                stcor = stcor + "," + p.geometry.coordinates[0][k][0].toString() + " " + p.geometry.coordinates[0][k][1].toString();
            }
            stcor = stcor + "," + p.geometry.coordinates[0][0][0].toString() + " " + p.geometry.coordinates[0][0][1].toString();
            stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
            //Send circle border to the server for query
            if (MyTB === "tds") {
                $.post("/TrajVis/system/query.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        ComplexQueryInfo(obj["Draw"], stcor);
                        $("#finish_editing").hide();
                        FinalResults = FilterComplexQuery();
                        tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                        $.post("/TrajVis/system/query_edit.php", {
                            trips: tripIDs,
                            DB: MyDB
                        }, function(results) {
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                //console.log(obj1)
                                //console.log(FinalResults)
                                StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                ComplexQueryList = []
                                edit = 0;
                                var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                Qu.Complex = 1
                                changeselectioncolor(vis.QueryManager.nextQueryColor);
                                editQId = -1
                                Qu.DOMLink['Edit'].removeClass("iconActive");
                                //DrawChart()
                            }

                        });

                    } else {
                        console.log("No Results");
                    }
                });
            } else if (MyTB === "tdr") {
                $.post("/TrajVis/system/Rquery.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        ComplexQueryInfo(obj["Draw"], stcor);
                        $("#finish_editing").hide();
                        FinalResults = FilterComplexQuery();
                        tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                        $.post("/TrajVis/system/Rquery_edit.php", {
                            trips: tripIDs,
                            DB: MyDB
                        }, function(results) {
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                //console.log(obj1)
                                //console.log(FinalResults)
                                StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"], obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                ComplexQueryList = []
                                edit = 0;
                                var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                Qu.Complex = 1
                                changeselectioncolor(vis.QueryManager.nextQueryColor);
                                editQId = -1
                                Qu.DOMLink['Edit'].removeClass("iconActive");
                                //DrawChart()
                            }

                        });

                    } else {
                        console.log("No Results");
                    }
                });
            } else if (MyTB === "td") {
                $.post("/TrajVis/system/Nquery.php", {
                    cor: stcor,
                    DB: MyDB
                }, function(results) {
                    // the output of the response is now handled via a variable call 'results'
                    if (results) {
                        var obj = [];
                        obj = JSON.parse(results);
                        ComplexQueryInfo(obj["Draw"], stcor);
                        $("#finish_editing").hide();
                        FinalResults = FilterComplexQuery();
                        tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                        $.post("/TrajVis/system/Nquery_edit.php", {
                            trips: tripIDs,
                            DB: MyDB
                        }, function(results) {
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                //console.log(obj1)
                                //console.log(FinalResults)
                                StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                ComplexQueryList = []
                                edit = 0;
                                var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                Qu.Complex = 1
                                changeselectioncolor(vis.QueryManager.nextQueryColor);
                                editQId = -1
                                Qu.DOMLink['Edit'].removeClass("iconActive");
                                //DrawChart()
                            }

                        });

                    } else {
                        console.log("No Results");
                    }
                });
            }

        } else
            //If your selection is a rectangle
            if (type === 'rectangle') {
                //Prepare rectangle border for query
                var coor = [];
                coor = layer.getLatLngs();
                stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send rectangle border to the server for query
                if (MyTB === "tds") {
                    $.post("/TrajVis/system/query.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/query_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color, obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "tdr") {
                    $.post("/TrajVis/system/Rquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/Rquery_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    //console.log(obj1);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"],obj["Months"], obj["Years"], obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });
                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "td") {
                    $.post("/TrajVis/system/Nquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/Nquery_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    //console.log(obj1);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color, obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });
                        } else {
                            console.log("No Results");
                        }
                    });
                }
            }
        else
            //If your selection is a polygon
            if (type === 'polygon') {
                //Prepare polygon border for query
                var coor = [];
                coor = layer.getLatLngs();
                stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                for (var k = 1; k < coor[0].length; k++) {
                    stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                }
                stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                //Send polygon border to the server for query
                if (MyTB === "tds") {
                    $.post("/TrajVis/system/query.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/query_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color, obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });

                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "tdr") {
                    $.post("/TrajVis/system/Rquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/Rquery_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });

                        } else {
                            console.log("No Results");
                        }
                    });
                } else if (MyTB === "td") {
                    $.post("/TrajVis/system/Nquery.php", {
                        cor: stcor,
                        DB: MyDB
                    }, function(results) {
                        // the output of the response is now handled via a variable call 'results'
                        if (results) {
                            var obj = [];
                            obj = JSON.parse(results);
                            ComplexQueryInfo(obj["Draw"], stcor);
                            $("#finish_editing").hide();
                            FinalResults = FilterComplexQuery();
                            tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                            $.post("/TrajVis/system/Nquery_edit.php", {
                                trips: tripIDs,
                                DB: MyDB
                            }, function(results) {
                                if (results) {
                                    var obj1 = [];
                                    obj1 = JSON.parse(results);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color, obj1["Data_For_SCP"]);
                                    ComplexQueryList = []
                                    edit = 0;
                                    var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                    Qu.Complex = 1
                                    changeselectioncolor(vis.QueryManager.nextQueryColor);
                                    editQId = -1
                                    Qu.DOMLink['Edit'].removeClass("iconActive");
                                }

                            });

                        } else {
                            console.log("No Results");
                        }
                    });
                }
            }
    }
    drawnItems.addLayer(layer); //Add your Selection to Map
    //Reset_Select()
});
//*****************************************************************************************************************************************
// Load .GeoJSON.
//*****************************************************************************************************************************************
$('input[type=file]').change(function(e) {
    var T1;
    var T2;
    var temp_color;
    var temp_id = -1;
    Complex = 0;
    clearMap();
    featureGroup.clearLayers();
    drawnItems.clearLayers();
    AvtiveVis = 2;

    var input = document.getElementById("upload-file");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function(event) {
        var geojsonLayer1 = L.geoJson.ajax(event.target.result, {
            middleware: function(data) {
                (data.features).forEach(async function(item, j) {
                    var poly = [];
                    for (var i = 0; i < item.geometry.coordinates[0].length; i++) {
                        var point = new L.LatLng(item.geometry.coordinates[0][i][1], item.geometry.coordinates[0][i][0]);
                        poly.push(point);
                    }

                    if (j == 0) {
                        color = vis.QueryManager.nextQueryColor;
                        var polygon = L.polygon([poly], {
                            color: color,
                            fillColor: color,
                        });
                        featureGroup.addLayer(polygon);
                        var type = 'polygon';
                        layer = polygon;
                        layer.type = type;
                        layer.TQ = item.properties.TQ;
                        layer.T1 = item.properties.T1;
                        layer.T2 = item.properties.T2;
                        SMM = layer.TQ;
                        T1 = layer.T1;
                        T2 = layer.T2;

                        if (SMM == "1") {
                            document.getElementById("QueryMode").value = "Intersect";
                        } else if (SMM == "2") {
                            document.getElementById("QueryMode").value = "Pick-UP";
                        } else if (SMM == "3") {
                            document.getElementById("QueryMode").value = "Drop-Off";
                        } else if (SMM == "4") {
                            document.getElementById("QueryMode").value = "Within";
                        }

                        jQuery('#search-from-date').datetimepicker({
                            value: T1,
                            mask: true,
                        });
                        jQuery('#search-to-date').datetimepicker({
                            value: T2,
                            mask: true,
                        });
                        newQuery = vis.QueryManager.CreateQuery(layer, color)
                        var coor = [];
                        coor = layer.getLatLngs();
                        stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                        for (var k = 1; k < coor[0].length; k++) {
                            stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                        }
                        stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                        stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                        //Send polygon border to the server for query 
                        if (MyTB === "tds") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/query.php", {
                                cor: stcor,
                                DB: MyDB,
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    StoreInfo(stcor, obj["Draw"], obj["WeekDays"], obj["DayHours"],obj["Months"], obj["Years"], obj["road_Array"], obj["Trip_Rank"], obj["St_Rank_count"], obj["St_Rank_speed"], type, edit, newQuery.QueryId, color, obj["Data_For_SCP"]);
                                } else {
                                    console.log("No Results");
                                }
                            });
                        } else if (MyTB === "tdr") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/Rquery.php", {
                                cor: stcor,
                                DB: MyDB
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    //console.log(obj);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                } else {
                                    console.log("No Results");
                                }
                            });
                        } else if (MyTB === "td") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/Nquery.php", {
                                cor: stcor,
                                DB: MyDB
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    //console.log(obj);
                                    StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj["Months"], obj["Years"],obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color,obj1["Data_For_SCP"]);
                                } else {
                                    console.log("No Results");
                                }
                            });
                        }
                        drawnItems.addLayer(polygon);
                        temp_id = newQuery.QueryId;
                        temp_color = color;
                    }
                    if (j != 0) {
                        var polygon = L.polygon([poly], {
                            color: color,
                            fillColor: color,
                        });
                        featureGroup.addLayer(polygon);
                        var type = 'polygon';
                        layer = polygon;
                        layer.type = type;
                        layer.TQ = item.properties.TQ;
                        layer.T1 = item.properties.T1;
                        layer.T2 = item.properties.T2;
                        SMM = layer.TQ;
                        T1 = layer.T1;
                        T2 = layer.T2;

                        if (SMM == "1") {
                            document.getElementById("QueryMode").value = "Intersect";
                        } else if (SMM == "2") {
                            document.getElementById("QueryMode").value = "Pick-UP";
                        } else if (SMM == "3") {
                            document.getElementById("QueryMode").value = "Drop-Off";
                        } else if (SMM == "4") {
                            document.getElementById("QueryMode").value = "Within";
                        }

                        jQuery('#search-from-date').datetimepicker({
                            value: T1,
                            mask: true,
                        });
                        jQuery('#search-to-date').datetimepicker({
                            value: T2,
                            mask: true,
                        });
                        ComplexQueryList = []
                        edit = 1;
                        editQId = temp_id;
                        var Qu = vis.QueryManager.GetQueryByQueryId(editQId);

                        if (Qu.Complex == 0)
                            ComplexQueryInfo(Qu.Results, Qu.parameters);
                        else
                            ComplexQueryList = Qu.parameters;
                        Qu.LayerGroups.push(layer);
                        color = Qu.Color;
                        var coor = [];
                        coor = layer.getLatLngs();
                        stcor = coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                        for (var k = 1; k < coor[0].length; k++) {
                            stcor = stcor + "," + coor[0][k].lng.toString() + " " + coor[0][k].lat.toString();
                        }
                        stcor = stcor + "," + coor[0][0].lng.toString() + " " + coor[0][0].lat.toString();
                        stcor = stcor + "!" + T1 + "!" + T2 + "!" + SMM;
                        //Send polygon border to the server for query
                        if (MyTB === "tds") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/query.php", {
                                cor: stcor,
                                DB: MyDB
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    ComplexQueryInfo(obj["Draw"], stcor);
                                    FinalResults = FilterComplexQuery();
                                    tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("/TrajVis/system/query_edit.php", {
                                        trips: tripIDs,
                                        DB: MyDB
                                    }, function(results) {
                                        if (results) {
                                            var obj1 = [];
                                            obj1 = JSON.parse(results);
                                            StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["Months"], obj1["Years"], obj1["road_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color);
                                            ComplexQueryList = []
                                            edit = 0;
                                            var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                            Qu.Complex = 1
                                            changeselectioncolor(vis.QueryManager.nextQueryColor);
                                            editQId = -1
                                        }

                                    });

                                } else {
                                    console.log("No Results");
                                }
                            });
                        } else if (MyTB === "tdr") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/Rquery.php", {
                                cor: stcor,
                                DB: MyDB
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    ComplexQueryInfo(obj["Draw"], stcor);
                                    FinalResults = FilterComplexQuery();
                                    tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("/TrajVis/system/Rquery_edit.php", {
                                        trips: tripIDs,
                                        DB: MyDB
                                    }, function(results) {
                                        if (results) {
                                            var obj1 = [];
                                            obj1 = JSON.parse(results);
                                            StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["Months"], obj1["Years"], obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color);
                                            ComplexQueryList = []
                                            edit = 0;
                                            var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                            Qu.Complex = 1
                                            changeselectioncolor(vis.QueryManager.nextQueryColor);
                                            editQId = -1
                                        }

                                    });

                                } else {
                                    console.log("No Results");
                                }
                            });
                        } else if (MyTB === "td") {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("/TrajVis/system/Nquery.php", {
                                cor: stcor,
                                DB: MyDB
                            }, function(results) {
                                // the output of the response is now handled via a variable call 'results'
                                if (results) {
                                    var obj = [];
                                    obj = JSON.parse(results);
                                    ComplexQueryInfo(obj["Draw"], stcor);
                                    FinalResults = FilterComplexQuery();
                                    tripIDs = "( " + Object.keys(FinalResults).toString() + " )"
                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("/TrajVis/system/Nquery_edit.php", {
                                        trips: tripIDs,
                                        DB: MyDB
                                    }, function(results) {
                                        if (results) {
                                            var obj1 = [];
                                            obj1 = JSON.parse(results);
                                            StoreInfo(ComplexQueryList, FinalResults, obj1["WeekDays"], obj1["DayHours"], obj1["Months"], obj1["Years"], obj1["region_Array"], obj1["Trip_Rank"], obj1["St_Rank_count"], obj1["St_Rank_speed"], "C", edit, editQId, color, obj["Data_For_SCP"]);
                                            ComplexQueryList = []
                                            edit = 0;
                                            var Qu = vis.QueryManager.GetQueryByQueryId(editQId)
                                            Qu.Complex = 1
                                            changeselectioncolor(vis.QueryManager.nextQueryColor);
                                            editQId = -1
                                        }

                                    });

                                } else {
                                    console.log("No Results");
                                }
                            });
                        }
                        drawnItems.addLayer(polygon);
                    }

                });
            }
        });
    }

});
//*****************************************************************************************************************************************
// Edit Query
//*****************************************************************************************************************************************
function intersection(a, b) {
    var c = {}
    for (var key in a)
        if (key in b)
            c[key] = a[key];
    return c;
}
//*****************************************************************************************************************************************
function ComplexQueryInfo(results, Parameters) {
    var obj0 = new Object();
    obj0['QueryPara'] = Parameters;
    obj0['QueryResults'] = results;
    ComplexQueryList.push(obj0);
    //console.log(Parameters)
}
//*****************************************************************************************************************************************
function FilterComplexQuery() {
    var StartR = {}
    var IntersectR = {}
    var EndR = {}
    for (var i = 0; i < ComplexQueryList.length; i++) {
        var TempQuery = ComplexQueryList[i]
        var Para = TempQuery["QueryPara"].split("!")
        if (Para[3] == "1") {
            if (Object.keys(IntersectR).length != 0) {
                /*IntersectR = collectionIntersection(IntersectR, TempQuery["QueryResults"],
                    function(item) {
                        return item.tripid;
                    });*/
                IntersectR = intersection(IntersectR, TempQuery["QueryResults"])
            } else
                IntersectR = TempQuery["QueryResults"]

        }
        if (Para[3] == "2") {
            /*StartR = collectionUnion(StartR, TempQuery["QueryResults"],
                function(item) {
                    return item.tripid;
                });*/
            StartR = $.extend({}, StartR, TempQuery["QueryResults"]);
        }
        if (Para[3] == "3") {
            /*EndR = collectionUnion(EndR, TempQuery["QueryResults"],
                function(item) {
                    return item.tripid;
                });*/
            EndR = $.extend({}, EndR, TempQuery["QueryResults"]);
        }
    }
    var ILen = Object.keys(IntersectR).length
    var SLen = Object.keys(StartR).length
    var ELen = Object.keys(EndR).length
    var FinalResults = []
    if ((ILen == 0) && (SLen == 0) && (ELen >= 1)) {
        FinalResults = EndR;
    }
    if ((ILen == 0) && (SLen >= 1) && (ELen == 0)) {
        FinalResults = StartR;
    }
    if ((ILen == 0) && (SLen >= 1) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(StartR, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(StartR, EndR)
    }
    if ((ILen >= 1) && (SLen == 0) && (ELen == 0)) {
        FinalResults = IntersectR;
    }
    if ((ILen >= 1) && (SLen == 0) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(IntersectR, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(IntersectR, EndR)
    }
    if ((ILen >= 1) && (SLen >= 1) && (ELen == 0)) {
        /*FinalResults = collectionIntersection(StartR, IntersectR, function(item) {
            return item.tripid
        });*/

        FinalResults = intersection(StartR, IntersectR)
    }
    if ((ILen >= 1) && (SLen >= 1) && (ELen >= 1)) {
        /*FinalResults = collectionIntersection(StartR, IntersectR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(StartR, IntersectR)
        /*FinalResults = collectionIntersection(FinalResults, EndR, function(item) {
            return item.tripid
        });*/
        FinalResults = intersection(FinalResults, EndR)
    }


    return FinalResults;
}
//*****************************************************************************************************************************************
// Date/Time Selector
//*****************************************************************************************************************************************
jQuery(document).ready(function() {
    'use strict';
    //jQuery('#filter-date, #search-from-date, #search-to-date').datetimepicker();
    jQuery('#search-from-date').datetimepicker({
        value: localStorage.getItem("ST"),
        mask: true,
    });
    jQuery('#search-to-date').datetimepicker({
        value: localStorage.getItem("ET"),
        mask: true,
    });
});
//*****************************************************************************************************************************************
// Function to store Query Info
//*****************************************************************************************************************************************
function StoreInfo(parameters, results, WeekDays, DayHours, Months,Years,road_Array, Trip_Rank, St_Rank_count, St_Rank_speed, type, Complex, Id, Qcolor, data_For_SCP) {
    var Qu = vis.QueryManager.GetQueryByQueryId(Id);
    if (Qu != null) {
        Qu.parameters = parameters;
        Qu.Results = results;
        Qu.WeekDays = WeekDays;
        Qu.DayHours = DayHours;
        Qu.Months = Months;
        Qu.Years = Years;
        Qu.road_Array = road_Array;
        Qu.Trip_Rank = Trip_Rank;
        Qu.St_Rank_count = St_Rank_count;
        Qu.St_Rank_speed = St_Rank_speed;
        Qu.Qtype = type;
        Qu.Complex = Complex;
        Qu.color = Qcolor;
        Qu.data_For_SCP = data_For_SCP;
    }
    ActiveQID = Object.create(Qu);
    TempQO = Object.create(Qu);
    VisSelected = [];
    VisSelected.push(Id)

    clearMap();
    $('#span1').show();
    $('#span2').show();
    $('#span3').show();
    if (MyTB === "tds") {
        if (AvtiveVis == 1) {
            DrawStreet(ActiveQID.road_Array);
        } else if (AvtiveVis == 2) {
            DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
        } else if (AvtiveVis == 3) {
            DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 4) {
            DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 5) {
            DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
        }
        tabledata(Qu.St_Rank_count, Qu.St_Rank_speed, Qu.Trip_Rank);
        DrawChart();
        getDataForSCP(Qu.data_For_SCP);
        drawSCP();
    } else if (MyTB === "tdr") {
        if (AvtiveVis == 1) {
            RDrawStreet(ActiveQID.road_Array);
        } else if (AvtiveVis == 2) {
            RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
        } else if (AvtiveVis == 3) {
            DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 4) {
            DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 5) {
            DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
        }
        tabledata(Qu.St_Rank_count, Qu.St_Rank_speed, Qu.Trip_Rank);
        DrawChart();
        getDataForSCP(Qu.data_For_SCP);
        drawSCP();
    } else if (MyTB === "td") {

        if (AvtiveVis == 3) {
            DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 4) {
            DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
        } else if (AvtiveVis == 5) {
            DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
        }
        tabledata(Qu.St_Rank_count, Qu.St_Rank_speed, Qu.Trip_Rank);
        DrawChart();
        getDataForSCP(Qu.data_For_SCP);
        drawSCP();
    }

}
//*****************************************************************************************************************************************
// Query Color
//*****************************************************************************************************************************************
function changeselectioncolor(cl) {
    drawControl.setDrawingOptions({
        rectangle: {
            shapeOptions: {
                color: cl
            }
        },
        circle: {
            shapeOptions: {
                color: cl
            }
        },
        polygon: {
            shapeOptions: {
                color: cl
            }
        }
    });
}
//*****************************************************************************************************************************************
// Street Color
//*****************************************************************************************************************************************
function getColor(d) {
    return d <= 05 ? '#8B0000' : //Dark Red
        d <= 15 ? '#FF0000' : //Red
        d <= 25 ? '#FF8C00' : //Orange
        '#228B22'; //Green
}
//*****************************************************************************************************************************************
//// Draw Region / Speed
//*****************************************************************************************************************************************
function RDrawStreet(objtraj) {
    legend.addTo(map);
    //console.log(Math.min(objtraj.total_AVSpeed));
    //console.log(objtraj);
    for (j in objtraj) {
        var polygon = new L.polygon([points[j]], {
            fillColor: getColor(parseFloat(objtraj[j].total_AVSpeed)),
            color: getColor(parseFloat(objtraj[j].total_AVSpeed)),
            fillOpacity: 0.2,
            opacity: 0.9,
            weight: 3
        }).bindPopup("Region Average Speed: " + Math.round(objtraj[j].total_AVSpeed) + " km/h");
        regns.addLayer(polygon);
    }
    regns.addTo(map);
}
//*****************************************************************************************************************************************
//// Draw Region / Flow
//*****************************************************************************************************************************************
function RDrawStreet1(objtraj, color) {
    var maxflow = -1;
    var minflow = 100;
    for (j in objtraj) {
        if (parseInt(objtraj[j].total_Count) > maxflow) {
            maxflow = parseInt(objtraj[j].total_Count);
        }
        if (parseInt(objtraj[j].total_Count) < minflow) {
            minflow = parseInt(objtraj[j].total_Count);
        }
    }

    for (j in objtraj) {
        var polygon = new L.polygon([points[j]], {
            fillColor: color,
            color: color,
            fillOpacity: ((parseInt(objtraj[j].total_Count) - minflow) / (maxflow - minflow)),
            opacity: 0.9,
            weight: 3
        }).bindPopup("Region Flow: " + parseInt(objtraj[j].total_Count));
        regns.addLayer(polygon);
    }
    regns.addTo(map);
    //fillColor
    //scaledValue = (rawValue - min) / (max - min);
}
//*****************************************************************************************************************************************
//// Draw Street Categories / Speed
//*****************************************************************************************************************************************
function DrawStreet(objtraj) {
    legend.addTo(map);
    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }
    //primary
    for (j in objtraj.primary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.primary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //primary_link
    for (j in objtraj.primary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.primary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //secondary
    for (j in objtraj.secondary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.secondary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //secondary_link
    for (j in objtraj.secondary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.secondary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //motorway
    for (j in objtraj.motorway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.motorway[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //motorway_link
    for (j in objtraj.motorway_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.motorway_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //residential
    for (j in objtraj.residential) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.residential[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[3].addLayer(polyline); // Add to map
    }

    //road
    for (j in objtraj.road) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.road[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[4].addLayer(polyline); // Add to map
    }

    //service
    for (j in objtraj.service) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.service[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[6].addLayer(polyline); // Add to map
    }

    //unclassified
    for (j in objtraj.unclassified) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.unclassified[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[10].addLayer(polyline); // Add to map
    }

    //cycleway
    for (j in objtraj.cycleway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.cycleway[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[9].addLayer(polyline); // Add to map
    }

    //Living_Street
    for (j in objtraj.living_street) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.living_street[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[0].addLayer(polyline); // Add to map
    }

    //tertiary
    for (j in objtraj.tertiary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.tertiary[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //tertiary_link
    for (j in objtraj.tertiary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.tertiary_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //trunk
    for (j in objtraj.trunk) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.trunk[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

    //trunk_link
    for (j in objtraj.trunk_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: getColor(parseInt(objtraj.trunk_link[j].total_AVSpeed)), // polyline color
            weight: 5, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

}
//*****************************************************************************************************************************************
// Draw Trajectories
//*****************************************************************************************************************************************
function DrawTraj1(objtraj, ID, color1) {
    var q = vis.QueryManager.GetQueryByQueryId(ID)
    if (edit == 1) {

        for (var i = 0; i < q.extraLayers.length; i++) {
            try {
                if (q.extraLayers[i] != null)
                    map.removeLayer(q.extraLayers[i]);
            } catch (e) {}
        }
        q.extraLayers = []
    }
    var Trajectories = []
    var SPoints = []
    var EPoints = []
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[0], T[1]]);
        }
        var TempT = {
            "type": "LineString",
            "properties": {
                "id": j
            },
            "coordinates": polylinePoints
        }
        Trajectories.push(TempT);
        var circle1 = {
            "type": "Point",
            "coordinates": polylinePoints[0]
        }
        var circle2 = {
            "type": "Point",
            "coordinates": polylinePoints[Traj.length - 1]
        }
        SPoints.push(circle1)
        EPoints.push(circle2)
    }
    polylines = L.geoJson(Trajectories, {
        style: {
            color: color1,
            weight: 4,
            opacity: 0.5
        }
    }).addTo(map);

    Start_Points = L.geoJSON(SPoints, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 4,
                color: 'DarkGreen',
                fillColor: 'green',
                fillOpacity: 0.5,
                weight: 1,
                opacity: 1,
            })
        }
    }).addTo(map);
    End_Points = L.geoJson(EPoints, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 4,
                color: 'Maroon',
                fillColor: 'red',
                fillOpacity: 0.5,
                weight: 1,
                opacity: 1,
            })
        }
    }).addTo(map);
    //Farah For Delete
    //q.extraLayers.push(polylines);
    //q.extraLayers.push(Start_Points);
    //q.extraLayers.push(End_Points);
}
//*****************************************************************************************************************************************
// Draw Pick-UP
//*****************************************************************************************************************************************
function DrawPick(objtraj, ID, color1, Robj) {
    if (MyTB === "tdr") {
        for (j in Robj) {
            var polygon = L.polygon([points[j]], {
                color: "#808080",
                opacity: 0.9,
                weight: 3
            });
            Pickregns.addLayer(polygon);
        }
        Pickregns.addTo(map);
    }
    var heatMap = [];
    var calculated_heatmap_max = 1;
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        T = Traj[0].split(' ');
        heatMap.push([T[1], T[0], 10]);
    }
    calculated_heatmap_max = heatMap.length/5000
    heatLayer = L.heatLayer(heatMap, {
        radius: 10,
        blur: 15,
        max: calculated_heatmap_max,
    });
    heatLayer.addTo(map);
}
//*****************************************************************************************************************************************
// Draw Drop-Off
//*****************************************************************************************************************************************
function DrawDrop(objtraj, ID, color1, Robj) {
    if (MyTB === "tdr") {
        for (j in Robj) {
            var polygon = L.polygon([points[j]], {
                color: "#808080",
                opacity: 0.9,
                weight: 3
            });
            Pickregns.addLayer(polygon);
        }
        Pickregns.addTo(map);
    }
    var heatMap = [];
    var calculated_heatmap_max = 1;
    for (var j in objtraj) {
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace("LINESTRING(", "")
        objtraj[j]["trajectorypoints"] = objtraj[j]["trajectorypoints"].replace(")", "")
        var Traj = objtraj[j]["trajectorypoints"].split(',');
        T = Traj[Traj.length - 1].split(' ');
        heatMap.push([T[1], T[0], 10]);
    }
    calculated_heatmap_max = heatMap.length/5000
    heatLayer = L.heatLayer(heatMap, {
        radius: 10,
        blur: 15,
        max: calculated_heatmap_max,
    });
    heatLayer.addTo(map);
}
//*****************************************************************************************************************************************
// Street Weight
//*****************************************************************************************************************************************
function getWeight(d) {
    return d <= 10 ? 1 :
        d <= 20 ? 2 :
        d <= 30 ? 3 :
        d <= 40 ? 4 :
        d <= 50 ? 5 :
        d <= 60 ? 6 :
        d <= 70 ? 7 :
        d <= 80 ? 8 :
        d <= 90 ? 9 :
        d <= 100 ? 10 :
        d <= 110 ? 11 :
        d <= 120 ? 12 :
        d <= 130 ? 13 :
        d <= 140 ? 14 :
        15;
}
//*****************************************************************************************************************************************
//// Draw Street Categories / Count
//*****************************************************************************************************************************************
function DrawStreet1(objtraj, color) {

    for (var k = 0; k < 11; k++) {
        RoadTypeLayer[k].clearLayers();
    }
    //primary
    for (j in objtraj.primary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.primary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //primary_link
    for (j in objtraj.primary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.primary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[2].addLayer(polyline); // Add to map
    }

    //secondary
    for (j in objtraj.secondary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.secondary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //secondary_link
    for (j in objtraj.secondary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.secondary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[5].addLayer(polyline); // Add to map
    }

    //motorway
    for (j in objtraj.motorway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.motorway[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //motorway_link
    for (j in objtraj.motorway_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.motorway_link[j].total_Count)), // polyline weight, // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[1].addLayer(polyline); // Add to map
    }

    //residential
    for (j in objtraj.residential) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.residential[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[3].addLayer(polyline); // Add to map
    }

    //road
    for (j in objtraj.road) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.road[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[4].addLayer(polyline); // Add to map
    }

    //service
    for (j in objtraj.service) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.service[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[6].addLayer(polyline); // Add to map
    }

    //unclassified
    for (j in objtraj.unclassified) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.unclassified[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[10].addLayer(polyline); // Add to map
    }

    //cycleway
    for (j in objtraj.cycleway) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.cycleway[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[9].addLayer(polyline); // Add to map
    }

    //Living_Street
    for (j in objtraj.living_street) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.living_street[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[0].addLayer(polyline); // Add to map
    }

    //tertiary
    for (j in objtraj.tertiary) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.tertiary[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //tertiary_link
    for (j in objtraj.tertiary_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.tertiary_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[7].addLayer(polyline); // Add to map
    }

    //trunk
    for (j in objtraj.trunk) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.trunk[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }

    //trunk_link
    for (j in objtraj.trunk_link) {
        //console.log();
        var polylinePoints = [];
        var Traj = RID[j].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var polyline = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: color, // polyline color
            weight: getWeight(parseInt(objtraj.trunk_link[j].total_Count)), // polyline weight
            opacity: 0.7, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });
        RoadTypeLayer[8].addLayer(polyline); // Add to map
    }
}

//*****************************************************************************************************************************************
//// Draw Grouped BarChart
//*****************************************************************************************************************************************
function DrawGroupedBarChart(xtitle, Ytitle, ChDataB, svg3) {
    nv.addGraph(function() {
        var chart = nv.models.multiBarChart().stacked(false).margin({
                left: 70
            })
            .rotateLabels(0) //Angle to rotate x-axis labels.
            .showControls(false) //Allow user to switch between 'Grouped' and 'Stacked' mode.
            .groupSpacing(0.3) //Distance between each group of bars.
            .reduceXTicks(false);
        chart.xAxis.axisLabel(xtitle);
        chart.yAxis.axisLabel(Ytitle).tickFormat(d3.format(',.0f'));
        d3.select(svg3).datum(ChDataB).call(chart);
        nv.utils.windowResize(chart.update);
        chart.legend.dispatch.on('legendClick', function(d, i) {
            if (d.values.length == 7) {
                DrawChart();
                ActiveQID = Object.create(TempQO);
                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                getDataForSCP(ActiveQID.data_For_SCP);
                drawSCP();
                clearMap();
                if (MyTB === "tds") {
                    if (AvtiveVis == 1) {
                        DrawStreet(ActiveQID.road_Array);
                    } else if (AvtiveVis == 2) {
                        DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                    } else if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }
                } else if (MyTB === "tdr") {
                    if (AvtiveVis == 1) {
                        RDrawStreet(ActiveQID.road_Array);
                    } else if (AvtiveVis == 2) {
                        RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                    } else if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }
                } else if (MyTB === "td") {
                    if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }
                }

            }
        });
        return chart;
    }, function() {


        d3.selectAll(".nv-bar").on('click',
            function(e) {

                var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                var Timelabels2 = {
                    "Sun": 0,
                    "Mon": 1,
                    "Tue": 2,
                    "Wed": 3,
                    "Thu": 4,
                    "Fri": 5,
                    "Sat": 6
                }
                //get bar number of the click event   
                //console.log(e)
                time = e.x;
                idx = e.series;


                if (Timelabels1.indexOf(time) == -1) {
                    d3.select("#bottom1 svg").selectAll('rect').style('opacity', .2);
                    d3.select(this).style('opacity', 1);
                }
                if (Timelabels1.indexOf(time) != -1) {
                    d3.select("#top1 svg").selectAll('rect').style('opacity', .2);
                    d3.select(this).style('opacity', 1);
                }

                var temp;
                if (Timelabels1.indexOf(time) > -1)
                    temp = ChDataB[idx]["key"].split(":")
                else
                    temp = ChDataB_Main[idx]["key"].split(":")
                //get id of the query of the click event

                //console.log(temp) 
                if (temp.length <= 2) {
                    qid = temp[1]
                    //get the query parameters by qid
                    var Qu = vis.QueryManager.GetQueryByQueryId(qid);

                    //var para = Qu.parameters
                    var para = "( " + Object.keys(Qu.Results).toString() + " )" //Farah2
                    if (Timelabels1.indexOf(time) > -1)
                        para += "!H!" + time
                    else
                        para += "!D!" + Timelabels2[time]
                    //para += "!" + SMM;
                    if (Qu.Complex != 1)
                        para += "!" + Qu.parameters;
                    else
                        para += "!" + Qu.parameters[0].QueryPara;
                    //post query to get the interaction results
                    if (MyTB === "tds") {
                        console.log(para);
                        $.post("/TrajVis/system/query_filter.php", {
                            para: para,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                // obj1 is the result of the interaction query that you will use to modify your visualization
                                //Qu.extra_query.push(obj1)
                                //console.log(obj1);
                                if (Timelabels1.indexOf(time) <= -1)

                                    DrawHourChart(obj1["DayHours"], qid, Qu.Color, time);

                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.DayHours = obj1["DayHours"];
                                ActiveQID.road_Array = obj1["road_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 1) {
                                    DrawStreet(ActiveQID.road_Array);
                                } else if (AvtiveVis == 2) {
                                    DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                                } else if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }


                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    } else if (MyTB === "tdr") {
                        $.post("/TrajVis/system/Rquery_filter.php", {
                            para: para,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                // obj1 is the result of the interaction query that you will use to modify your visualization
                                //Qu.extra_query.push(obj1)
                                //console.log(obj1);
                                if (Timelabels1.indexOf(time) <= -1)
                                    DrawHourChart(obj1["DayHours"], qid, Qu.Color, time);

                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.DayHours = obj1["DayHours"];
                                ActiveQID.road_Array = obj1["region_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 1) {
                                    RDrawStreet(ActiveQID.road_Array);
                                } else if (AvtiveVis == 2) {
                                    RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                                } else if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }
                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    } else if (MyTB === "td") {
                        console.log("inside");
                        console.log(para);
                        $.post("/TrajVis/system/Nquery_filter.php", {
                            para: para,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                // obj1 is the result of the interaction query that you will use to modify your visualization
                                //Qu.extra_query.push(obj1)
                                //console.log(obj1);
                                if (Timelabels1.indexOf(time) <= -1)
                                    DrawHourChart(obj1["DayHours"], qid, Qu.Color, time);

                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.DayHours = obj1["DayHours"];
                                ActiveQID.road_Array = obj1["region_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }
                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    }

                } else if (temp.length > 2) {
                    //get id of the query of the click event
                    qid = temp[1]
                    day = temp[2]
                    //get the query parameters by qid


                    var Qu = vis.QueryManager.GetQueryByQueryId(qid);

                    //var para1 = Qu.parameters + "!" + time + "!" + Timelabels2[day]
                    var para1 = "( " + Object.keys(Qu.Results).toString() + " )" + "!" + time + "!" + Timelabels2[day]; //Farah2

                    //para1 += "!" + Qu.parameters;
                    if (Qu.Complex != 1)
                        para1 += "!" + Qu.parameters;
                    else
                        para1 += "!" + Qu.parameters[0].QueryPara;
                    //console.log(para1)
                    //post query to get the interaction results
                    if (MyTB === "tds") {
                        console.log(para);
                        $.post("/TrajVis/system/query_filter2.php", {
                            para1: para1,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.road_Array = obj1["road_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 1) {
                                    DrawStreet(ActiveQID.road_Array);
                                } else if (AvtiveVis == 2) {
                                    DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                                } else if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }
                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    } else if (MyTB === "tdr") {
                        $.post("/TrajVis/system/Rquery_filter2.php", {
                            para1: para1,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.road_Array = obj1["region_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 1) {
                                    RDrawStreet(ActiveQID.road_Array);
                                } else if (AvtiveVis == 2) {
                                    RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                                } else if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }
                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    } else if (MyTB === "td") {
                        console.log("oytside");
                        console.log(para1);
                        $.post("/TrajVis/system/Nquery_filter2.php", {
                            para1: para1,
                            DB: MyDB
                        }, function(results) {
                            // the output of the response is now handled via a variable call 'results'
                            if (results) {
                                console.log(results);
                                var obj1 = [];
                                obj1 = JSON.parse(results);
                                ActiveQID.Results = obj1["Draw"];
                                ActiveQID.road_Array = obj1["region_Array"];
                                ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                                ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                                ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                                ActiveQID.data_For_SCP = obj1["Data_For_SCP"];

                                tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                                getDataForSCP(ActiveQID.data_For_SCP);
                                drawSCP();
                                clearMap();
                                if (AvtiveVis == 3) {
                                    DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 4) {
                                    DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                                } else if (AvtiveVis == 5) {
                                    DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                                }
                                //console.log(obj1)
                            } else {
                                console.log("No Results");
                            }
                        });
                    }

                }
            });
    });
}

//*****************************************************************************************************************************************
//// Draw Chart
//// edited by DJX, add Month and Year Chart
//*****************************************************************************************************************************************
function DrawChart() {
    $("#bottom1 svg").empty();
    $("#top1 svg").empty();
    $("#Months_reportView svg").empty();
    $("#Years_reportView svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var xtitle2 = "WeekDays"
    var xtitle3 = "Months"
    var xtitle4 = "Years"
    var svg1 = '#top1 svg'
    var svg2 = '#bottom1 svg'
    var svg3 = '#Months_reportView svg'
    var svg4 = '#Years_reportView svg'
    var BarChartData1 = []
    var BarChartData2 = []
    var BarChartData3 = []
    var BarChartData4 = []

    for (var j0 = 0; j0 < VisSelected.length; j0++) {
        j = VisSelected[j0]
        var qu = vis.QueryManager.GetQueryByQueryId(j);
        var temp1 = qu.DayHours
        var temp2 = qu.WeekDays
        var temp3 = qu.Months
        var temp4 = qu.Years
        //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
        var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
        var Timelabels2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        var Timelabels3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var Timelabels4 = [];
        for(k in temp4){
            Timelabels4.push(k)
        }

        var DdataB1 = []
        var DdataB2 = []
        var DdataB3 = []
        var DdataB4 = []

        for (var i = 0; i < 24; i++) {
            if (i in temp1) {
                DdataB1.push({
                    x: Timelabels1[i],
                    y: parseInt(temp1[i]['total']),

                });
            } else {
                DdataB1.push({
                    x: Timelabels1[i],
                    y: 0,

                });
            }
        }
        for (var i = 0; i < 7; i++) {
            if (i in temp2) {
                DdataB2.push({
                    x: Timelabels2[i],
                    y: parseInt(temp2[i]['total']),

                });
            } else {
                DdataB2.push({
                    x: Timelabels2[i],
                    y: 0,

                });
            }
        }
        for (var i = 1; i < 13; i++) {
            if (i in temp3) {
                DdataB3.push({
                    x: Timelabels3[i-1],
                    y: parseInt(temp3[i]['total']),
                });
            } else {
                DdataB3.push({
                    x: Timelabels3[i-1],
                    y: 0,
                });
            }
        }
        for(k in temp4){
            DdataB4.push({
                x: k,
                y: parseInt(temp4[k]['total']),
            });
        }


        var FDataB1 = {
            values: DdataB1,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }
        BarChartData1.push(FDataB1)
        var FDataB2 = {
            values: DdataB2,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }
        BarChartData2.push(FDataB2)

        var FDataB3 = {
            values: DdataB3,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }
        BarChartData3.push(FDataB3)
        var FDataB4 = {
            values: DdataB4,
            key: "Query:" + qu.QueryId,
            color: qu.Color
        }
        BarChartData4.push(FDataB4)

        ChDataB_Main = BarChartData2
        DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1);
        DrawGroupedBarChart(xtitle2, Ytitle, BarChartData2, svg2);
        DrawGroupedBarChart(xtitle3, Ytitle, BarChartData3, svg3);
        DrawGroupedBarChart(xtitle4, Ytitle, BarChartData4, svg4);
    }}

function DrawChart1() {
    $("#top1 svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var svg1 = '#top1 svg'
    var BarChartData1 = []
    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
}
//*****************************************************************************************************************************************
//// Draw Hour Chart
//*****************************************************************************************************************************************
function DrawHourChart(temp1, qid, Color, time) {

    $("#top1 svg").empty();
    var Ytitle = "Count"
    var xtitle1 = "DayHours"
    var svg1 = '#top1 svg'
    var BarChartData1 = []

    //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
    var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
    var DdataB1 = []
    for (var i = 0; i < 24; i++) {
        if (i in temp1) {
            DdataB1.push({
                x: Timelabels1[i],
                y: parseInt(temp1[i]['total']),

            });
        } else {
            DdataB1.push({
                x: Timelabels1[i],
                y: 0,

            });
        }
    }

    var FDataB1 = {
        values: DdataB1,
        key: "Query:" + qid + ":" + time,
        color: Color
    }
    BarChartData1.push(FDataB1)
    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
}
//*****************************************************************************************************************************************
//// Add Data List View
//*****************************************************************************************************************************************
function tabledata(objrank, objrank1, objrank2) {

    $("#singleSort").data('kendoGrid').dataSource.data([]);
    if (objrank != null) {
        var Data = objrank.split(',');
        var grid = $("#singleSort").data("kendoGrid");
        var datasource = grid.dataSource;
        for (var i = 0; i < Data.length; i++) {
            var Data1 = Data[i].split(':');
            datasource.insert({
                Street: Data1[0],
                Flow: parseInt(Data1[1]),
                Speed: parseInt(Data1[2]),
            });
        }
    }
    $("#singleSort1").data('kendoGrid').dataSource.data([]);
    var Data1 = objrank1.split(',');
    var grid1 = $("#singleSort1").data("kendoGrid");
    var datasource1 = grid1.dataSource;
    for (var i = 0; i < Data1.length; i++) {
        var Data11 = Data1[i].split(':');
        datasource1.insert({
            Street: Data11[0],
            Speed: parseInt(Data11[1]),
            Flow: parseInt(Data11[2]),

        });
    }

    $("#singleSort2").data('kendoGrid').dataSource.data([]);
    var Data2 = objrank2.split(',');
    var grid2 = $("#singleSort2").data("kendoGrid");
    var datasource2 = grid2.dataSource;
    for (var i = 0; i < Data2.length; i++) {
        var Data12 = Data2[i].split(':');
        if ((parseFloat(Data12[1] / 1000).toFixed(4)) > 0.0020) {
            datasource2.insert({
                TripID: Data12[0],
                TripLength: parseFloat(Data12[1] / 1000).toFixed(4),
            });
        }
    }
    //grid2.dataSource.sort({field: "TripLength", dir: "desc"});
}
//*****************************************************************************************************************************************
//// List View3 (Top Streets/Regions based on Flow)
//*****************************************************************************************************************************************
function grid_change() {

}
/*
function HighlightStreet(ST_Name) {
    var polylinePoints = [];
    for (j = 0; j < P_ST[ST_Name].length; j++) {
        if (RID[P_ST[ST_Name][j]]) {
            var Traj = RID[P_ST[ST_Name][j]].split(',');
            var polylinePoints = [];
            for (var i = 0; i < Traj.length; i++) {
                T = Traj[i].split(' ');
                polylinePoints.push([T[1], T[0]]);
            }
        }
    }

    Street_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
        color: "#00FF00", // polyline color
        weight: 20, // polyline weight
        opacity: 0.5, // polyline opacity
        smoothFactor: 1.0 // polyline smoothFactor
    }).bindPopup('<strong>' + ST_Name + '</strong>');
    if (Street_Layer != -1) {
        map.removeLayer(Street_Layer);
    }
    map.setView(polylinePoints[0], 15, {
        animation: true
    });
    map.addLayer(Street_Layer); // Add to map
    Street_Layer.openPopup();
}
*/
function HighlightStreet(ST_Name) {
    if (MyTB === "tds") {
        var polylinePoints = [];
        if (RID[ST_Name]) {
            var Traj = RID[ST_Name].split(',');
            var polylinePoints = [];
            for (var i = 0; i < Traj.length; i++) {
                T = Traj[i].split(' ');
                polylinePoints.push([T[1], T[0]]);
            }
        }
        Street_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: "#00FF00", // polyline color
            weight: 20, // polyline weight
            opacity: 0.5, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        }).bindPopup('<strong>Street ID: ' + ST_Name + '</strong>');
        if (Street_Layer != -1) {
            map.removeLayer(Street_Layer);
        }
        var ZOM = map.getZoom();
        map.setView(polylinePoints[0], zoom, {
            animation: true
        });
        map.addLayer(Street_Layer); // Add to map
        Street_Layer.openPopup();
    } else if (MyTB === "tdr") {
        if (Region_Layer != -1) {
            map.removeLayer(Region_Layer);
        }

        Region_Layer = new L.polygon([points[ST_Name]], {
            color: "#00FF00",
            opacity: 0.9,
            weight: 3
        }).bindPopup('<strong>Region ID: ' + ST_Name + '</strong>');

        var ZOM = map.getZoom();
        map.setView(points[ST_Name][0], zoom, {
            animation: true
        });
        map.addLayer(Region_Layer); // Add to map
        Region_Layer.openPopup();
    }
}

function HoverOnGrid() {
    $("tr", "#singleSort").on("mouseover", function(ev) {
        var grid = $("#singleSort").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowData && rowIdx != -1) {
            HighlightStreet(rowData.Street);
        }
    });
    $("tr", "#singleSort").on("mouseout", function(ev) {
        var grid = $("#singleSort").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowData && rowIdx != -1) {
            var ZOM = map.getZoom();
            map.removeLayer(Street_Layer);
            map.removeLayer(Region_Layer);
            map.setView([QcoorLat, QcoorLng], zoom, {
                animation: true
            });
        }
    });
}

$("#singleSort").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change,
    dataBound: HoverOnGrid,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "Street",
            title: mytitle,
            width: 300
        },
        {
            field: "Flow",
            title: "Flow",
            sortable: {
                initialDirection: "desc"
            },
            width: 75
        },
        {
            field: "Speed",
            title: "Speed (Km/h)",
            width: 75
        },
    ]
});
//*****************************************************************************************************************************************
//// List View2 (Top Streets/Regions based on Speed)
//*****************************************************************************************************************************************
function grid_change1(arg) {}

function HoverOnGrid1() {
    $("tr", "#singleSort1").on("mouseover", function(ev) {
        var grid = $("#singleSort1").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowData && rowIdx != -1) {
            HighlightStreet(rowData.Street);
        }
    });
    $("tr", "#singleSort1").on("mouseout", function(ev) {
        var grid = $("#singleSort1").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowIdx != -1) {
            map.removeLayer(Street_Layer);
            map.removeLayer(Region_Layer);
            map.setView([QcoorLat, QcoorLng], zoom, {
                animation: true
            });
        }
    });
}

$("#singleSort1").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change1,
    dataBound: HoverOnGrid1,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "Street",
            title: mytitle,
            width: 300
        },
        {
            field: "Speed",
            title: "Speed (Km/h)",
            sortable: {
                initialDirection: "desc"
            },
            width: 75
        },
        {
            field: "Flow",
            title: "Flow",
            width: 75
        },
    ]
});
//*****************************************************************************************************************************************
//// Highlight Hovered Trajectory
//*****************************************************************************************************************************************
function HighlightTraj(j) {
    ActiveQID.Results[j]["trajectorypoints"] = ActiveQID.Results[j]["trajectorypoints"].replace("LINESTRING(", "")
    ActiveQID.Results[j]["trajectorypoints"] = ActiveQID.Results[j]["trajectorypoints"].replace(")", "")
    var Traj = ActiveQID.Results[j]["trajectorypoints"].split(',');
    var polylinePoints = [];
    for (var i = 0; i < Traj.length; i++) {
        T = Traj[i].split(' ');
        polylinePoints.push([T[1], T[0]]);
    }
    Poly_Layer = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
        color: "#00FF00", // polyline color
        weight: 20, // polyline weight
        opacity: 0.5, // polyline opacity
        smoothFactor: 1.0 // polyline smoothFactor
    }).bindPopup('<strong>Trip: ' + j + '</strong>');
    if (Poly_Layer != -1) {
        map.removeLayer(Poly_Layer);
    }
    map.setView(polylinePoints[0], zoom, {
        animation: true
    });
    map.addLayer(Poly_Layer); // Add to map
    Poly_Layer.openPopup();
}
//*****************************************************************************************************************************************
//// List View1 (Ranked Trajectories Based on Length)
//*****************************************************************************************************************************************
function grid_change2(arg) {}

function HoverOnGrid2() {
    $("tr", "#singleSort2").on("mouseover", function(ev) {
        var grid = $("#singleSort2").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowData && rowIdx != -1) {
            HighlightTraj((rowData.TripID).toString());
        }
    });
    $("tr", "#singleSort2").on("mouseout", function(ev) {
        var grid = $("#singleSort2").data("kendoGrid");
        var rowData = grid.dataItem(this);
        var row = $(this).closest("tr");
        var rowIdx = $("tr", grid.tbody).index(row);
        if (rowIdx != -1) {
            map.removeLayer(Poly_Layer);
            map.setView([QcoorLat, QcoorLng], zoom, {
                animation: true
            });
        }
    });
}

$("#singleSort2").kendoGrid({
    dataSource: {
        data: [],
        pageSize: 5
    },
    selectable: true,
    change: grid_change2,
    dataBound: HoverOnGrid2,
    sortable: {
        mode: "single",
        allowUnsort: false
    },
    pageable: {
        buttonCount: 2
    },
    scrollable: false,
    columns: [{
            field: "TripID",
            title: "Trajectory ID",
            width: 200
        },
        {
            field: "TripLength",
            title: "Trajectory Length (Km)",
            sortable: {
                initialDirection: "desc"
            },
            width: 175
        },
    ]
});
//*****************************************************************************************************************************************
//// Save Charts As .png Image
//*****************************************************************************************************************************************
////DayHours Chart
$('#span1').click(function() {

    var svg = document.querySelector("#top1 svg");
    var svgData = new XMLSerializer().serializeToString(svg);

    var canvas = document.createElement("canvas");
    var bbox = svg.getBBox();
    canvas.width = bbox.width + 15;
    canvas.height = bbox.height + 15;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, bbox.width, bbox.height);

    var dataUri = '';
    try {
        dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (ex) {

        // For browsers that don't have a btoa() method, send the text off to a webservice for encoding
    }

    var img = document.createElement("img");

    img.onload = function() {
        ctx.drawImage(img, 0, 0);

        try {

            // Try to initiate a download of the image
            var a = document.createElement("a");
            a.download = "DayHours.png";
            a.href = canvas.toDataURL("image/png");
            document.querySelector("body").appendChild(a);
            a.click();
            document.querySelector("body").removeChild(a);

        } catch (ex) {

            // If downloading not possible (as in IE due to canvas.toDataURL() security issue) 
            // then display image for saving via right-click
        }
    };
    //console.log(dataUri);
    img.src = dataUri;
});
////WeekDays Chart
$('#span2').click(function() {
    var svg = document.querySelector("#bottom1 svg");
    var svgData = new XMLSerializer().serializeToString(svg);

    var canvas = document.createElement("canvas");
    var bbox = svg.getBBox();
    canvas.width = bbox.width + 15;
    canvas.height = bbox.height + 15;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, bbox.width, bbox.height);

    var dataUri = '';
    try {
        dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (ex) {

        // For browsers that don't have a btoa() method, send the text off to a webservice for encoding
    }

    var img = document.createElement("img");

    img.onload = function() {
        ctx.drawImage(img, 0, 0);

        try {

            // Try to initiate a download of the image
            var a = document.createElement("a");
            a.download = "WeekDays.png";
            a.href = canvas.toDataURL("image/png");
            document.querySelector("body").appendChild(a);
            a.click();
            document.querySelector("body").removeChild(a);

        } catch (ex) {

            // If downloading not possible (as in IE due to canvas.toDataURL() security issue) 
            // then display image for saving via right-click
        }
    };
    //console.log(dataUri);
    img.src = dataUri;
    //saveSvgAsPng(document.getElementById("v2"), "Chart2.png");
});
//*****************************************************************************************************************************************
//// Active Tab in List View
//*****************************************************************************************************************************************
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    var target = $(e.target).attr("href")
    ActiveTab = target;
});
//*****************************************************************************************************************************************
//// Save List View as .csv File
//*****************************************************************************************************************************************
$('#span3').click(function() {
    if (ActiveTab == "#3b") { //Ranked Trajectories by Length
        var dataSource = $("#singleSort2").data("kendoGrid").dataSource;
        var filteredDataSource = new kendo.data.DataSource({
            data: dataSource.data(),
            filter: dataSource.filter()
        });

        filteredDataSource.read();
        var data = filteredDataSource.view();

        //start with the desired column headers here
        var result = "Trajectory ID, Trajectory Length (Km)";

        //each column will need to be called using the field name in the data source
        for (var i = 0; i < data.length; i++) {
            result += "\n";

            result += data[i].TripID + ",";

            result += data[i].TripLength;
        }

        if (window.navigator.msSaveBlob) {
            //Internet Explorer
            window.navigator.msSaveBlob(new Blob([result]), 'Trajectories.csv');
        } else if (window.webkitURL != null) {
            //Google Chrome and Mozilla Firefox
            var a = document.createElement('a');
            result = encodeURIComponent(result);
            a.href = 'data:application/csv;charset=UTF-8,' + result;
            a.download = 'Trajectories.csv';
            a.click();
        } else {
            //Everything Else
            window.open(result);
        }
    } else if (ActiveTab == "#2b") { //Top Streets/Regions Based On Speed
        var dataSource = $("#singleSort1").data("kendoGrid").dataSource;
        var filteredDataSource = new kendo.data.DataSource({
            data: dataSource.data(),
            filter: dataSource.filter()
        });

        filteredDataSource.read();
        var data = filteredDataSource.view();

        //start with the desired column headers here
        var result = "ID, Speed (Km/h), Flow";

        //each column will need to be called using the field name in the data source
        for (var i = 0; i < data.length; i++) {
            result += "\n";

            result += data[i].Street + ",";

            result += data[i].Speed + ",";

            result += data[i].Flow;
        }

        if (window.navigator.msSaveBlob) {
            //Internet Explorer
            window.navigator.msSaveBlob(new Blob([result]), 'Speed.csv');
        } else if (window.webkitURL != null) {
            //Google Chrome and Mozilla Firefox
            var a = document.createElement('a');
            result = encodeURIComponent(result);
            a.href = 'data:application/csv;charset=UTF-8,' + result;
            a.download = 'Speed.csv';
            a.click();
        } else {
            //Everything Else
            window.open(result);
        }
    } else if (ActiveTab == "#1b") { //Top Streets/Regions Based On Flow
        var dataSource = $("#singleSort").data("kendoGrid").dataSource;
        var filteredDataSource = new kendo.data.DataSource({
            data: dataSource.data(),
            filter: dataSource.filter()
        });

        filteredDataSource.read();
        var data = filteredDataSource.view();

        //start with the desired column headers here
        var result = "ID, Flow, Speed (Km/h)";

        //each column will need to be called using the field name in the data source
        for (var i = 0; i < data.length; i++) {
            result += "\n";

            result += data[i].Street + ",";

            result += data[i].Flow + ",";

            result += data[i].Speed;
        }

        if (window.navigator.msSaveBlob) {
            //Internet Explorer
            window.navigator.msSaveBlob(new Blob([result]), 'Flow.csv');
        } else if (window.webkitURL != null) {
            //Google Chrome and Mozilla Firefox
            var a = document.createElement('a');
            result = encodeURIComponent(result);
            a.href = 'data:application/csv;charset=UTF-8,' + result;
            a.download = 'Flow.csv';
            a.click();
        } else {
            //Everything Else
            window.open(result);
        }
    }
});

//////////
var colorBy;
var dataForSCP = []
var colorForSCP;
////prepare data for scatter plot

function getDataForSCP(tripdata) {
    if (tripdata != null) {
        var Data = tripdata.split(',');
        dataForSCP = [];
        if (MyTB == "td") {
            document.getElementById("h2dataInnfo").innerHTML = "Trip Atribute";
            document.getElementById("h2dataInnfo").style.marginLeft = (window.innerWidth / 7);
            for (var i = 0; i < Data.length; i++) {
                var Data1 = Data[i].split(':');
                //  if(parseInt(Data1[1]) >0 && parseInt(Data1[2])>0 &&  parseInt(Data1[3]) >0 && parseInt(Data1[4]))
                //{
                var newLine = {};
                newLine["Id"] = Data1[0];
                newLine["StartHour"] = parseInt(Data1[1]);
                newLine["StartDay"] = parseInt(Data1[2]);
                newLine["AvgSpeed"] = parseInt(Data1[3]);
                newLine["MinSpeed"] = parseInt(Data1[4]);
                newLine["MaxSpeed"] = parseInt(Data1[5]);
                newLine["EndHour"] = parseInt(Data1[6]);
                newLine["Length_km"] = parseInt(parseInt(Data1[7]) / 1000);
                dataForSCP.push(newLine);
                //}
            }
        } else {
            document.getElementById("h2dataInnfo").innerHTML = "Street Atribute";
            for (var i = 0; i < Data.length; i++) {
                var Data1 = Data[i].split(':');
                if (parseInt(Data1[1]) > 0 && parseInt(Data1[2]) > 0 && parseInt(Data1[3]) > 0 && parseInt(Data1[4])) {
                    var newLine = {};
                    newLine["Id"] = Data1[0];
                    newLine["Flow"] = parseInt(Data1[1]);
                    newLine["AvgSpeed"] = parseInt(Data1[2]);
                    newLine["MaxSpeed"] = parseInt(Data1[3]);
                    newLine["MinSpeed"] = parseInt(Data1[4]);
                    dataForSCP.push(newLine);
                }
            }
        }
    }
}
var lassoselectedList = "";

/// draw scatter plot

function drawSCP() {
    d3.select("#scatter").select("svg").remove();
	clearLassoSelectedStreeLayel();
	clearLassoSelectedClickLayel();
	resetallverialFor3d();
    var margin = {
            top: 5,
            right: 50,
            bottom: 60,
            left: 50
        },
        outerWidth = (window.innerWidth / 3.5);
    outerHeight = (window.innerHeight / 2.5) - 100;
    width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;
    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    var XLine = document.getElementById('XLine').value
    var YLine = document.getElementById('YLine').value
    colorBy = document.getElementById('colorid').value

    var xmax = d3.max(dataForSCP, function(d) {
        return d[XLine];
    });
    var xmin = d3.min(dataForSCP, function(d) {
        return d[XLine];
    });

    var ymax = d3.max(dataForSCP, function(d) {
        return d[YLine];
    });
    var ymin = d3.min(dataForSCP, function(d) {
        return d[YLine];
    });
    x.domain([xmin - 10, xmax + 10]).nice();
    y.domain([ymin - 10, ymax + 10]).nice();


    var xAxis = d3.svg.axis()
        .scale(x).tickFormat(function(d) {
            if ((d / 1000) >= 1) {
                d = d / 1000 + "K";
            }
            return d;
        })
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(y).tickFormat(function(d) {
            if ((d / 1000) >= 1) {
                d = d / 1000 + "K";
            }
            return d;
        })
        .orient("left");

    d3.select("#scatter").select("svg").remove();

    var svg = d3.select("#scatter").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("class", "g_main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Lasso functions to execute while lassoing
    var lasso_start = function() {
        lasso.items()
            .attr("r", 6).style('stroke-width', 1); // reset size
        clearLassoSelectedStreeLayel();
    };

    var lasso_end = function() {

        var selecteddata = lasso.items().filter(function(d) {
                return d.selected === true
            })
            .style('stroke-width', 4);

        var selectedSCPData = selecteddata[0].map(a => {
            return JSON.parse(a.attributes[0].nodeValue)
        });
        if (selectedSCPData.length > 0) {

            HighlightStreetForLassoSelect(selectedSCPData);
        }
    };

    // Create the area where the lasso event can be triggered
    var lasso_area = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0);

    // Define the lasso
    var lasso = d3.lasso()
        .closePathDistance(75) // max distance for the lasso loop to be closed
        .closePathSelect(true) // can items be selected by closing the path?
        .hoverSelect(true) // can items by selected by hovering over them?
        .area(lasso_area) // area where the lasso can be started
        .on("start", lasso_start) // lasso start function
        .on("end", lasso_end); // lasso end function


    // Init the lasso on the svg:g that contains the dots
    svg.call(lasso);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip tooltipstyle")
        .style("opacity", 0.0);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width + 2)
        .attr("y", 30)
        .style("text-anchor", "end")
        .style("font-Weight", "bold")
        .style("font-size", 12)
        .text(XLine);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-Weight", "bold")
        .style("font-size", 12)
        .text(YLine);


    svg.selectAll(".dot")
        .data(dataForSCP)
        .enter().append("circle")
        .attr("id", function(d) {
            return +d.Id
        })
        .attr("class", "dot").style("cursor", "pointer")
        .attr("r", 6)
        .attr("cx", function(d) {
            return x(d[XLine]);
        })
        .attr("cy", function(d) {
            return y(d[YLine]);
        })
        .style("fill", function(d) {
            return getColorSCP(d[colorBy]);
        })
        .on("mouseover", function(d, i) {
            d3.select(this)
                .attr("r", 9);
            if (MyTB === "td") {
                HighlightTraj(d.Id)
            } else {
                HighlightStreet(d.Id);
            }
            var str = "";
            str += "<div><b>ID: " + d.Id + "</b></div>";
            str += "<div>" + XLine + ": " + d[XLine] + "</div>";
            str += "<div>" + YLine + ": " + d[YLine] + "</div>";
            tooltip.html(str)
                .style("width", 100 + "px")
                .style("height", "auto")
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 65) + "px")
                .style("opacity", 1.0)
                .style("background", "white");
        })
        .on("mouseout", function(d) {

            if (!isdblclick) {
                d3.select(this)
                    .attr("r", 6);
			}
                var ZOM = map.getZoom();
                if (Street_Layer != -1) {
                    map.removeLayer(Street_Layer);
                }
                if (Region_Layer != -1) {
                    map.removeLayer(Region_Layer);
                }
                if (Poly_Layer != -1) {
                    map.removeLayer(Poly_Layer);
                }
                map.setView([QcoorLat, QcoorLng], zoom, {
                    animation: true
                });
                tooltip.style("width", 0)
                    .style("height", 0)
                    .style("opacity", 0.0);
            
        }).on("click", function(d) {

            if (clickStreetList.indexOf(d.Id) == -1) {
                d3.select(this).style('fill', "#F0FC4C");
                HighlightStreetForSCPClick(d.Id);
            } else {
                d3.select(this).style("fill", function(d) {
                    return getColorSCP(d[colorBy]);
                });
                var streetIndex = clickStreetList.indexOf(d.Id);
                map.removeLayer(clickStreetLayar[streetIndex]);
                clickStreetList.splice(streetIndex, 1);
                clickStreetLayar.splice(streetIndex, 1);
            }


        }).on("dblclick", function(d) {
            if (MyTB == "td") {
                draw3dmap(d.Id, this);
                if (Street_Layer != -1) {
                    map.removeLayer(Street_Layer);
                }
                if (Region_Layer != -1) {
                    map.removeLayer(Region_Layer);
                }
                if (Poly_Layer != -1) {
                    map.removeLayer(Poly_Layer);
                }
                tooltip.style("width", 0)
                    .style("height", 0)
                    .style("opacity", 0.0);
            }
        })

    lasso.items(d3.selectAll(".dot"));
    var legenddata = getlegenddata();
  
    var z = d3.scale.ordinal().range(["red", "green", "blue"]);
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 15)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(legenddata.slice())
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + i * 150 + "," + 0 + ")";
        })

    legend.append("rect")
        .attr("x", 45)
        .attr("y", height + 30)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 40)
        .attr("y", height + 35)
        .style("font-size", "smaller")
        .attr("dy", "0.32em").text(function(d) {
            return d;
        }).style("cursor", "default");

    var legend2data = ["clear"]
    var legend2 = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 15)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(legend2data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend2.append("rect")
        .attr("x", width - 90)
        .attr("y", -10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

    legend2.append("text")
        .attr("id", "cleartext")
        .attr("x", width - 50)
        .attr("y", -5)
        .style("font-size", "smaller")
        .attr("dy", "0.32em").text(function(d) {
            return d;
        }).style("cursor", "pointer").on("click", function() {
            clearscp();
        });


}

function getlegenddata()
{
	if (colorBy === "MinSpeed" || colorBy === "AvgSpeed" || colorBy === "MaxSpeed") {
       return [colorBy + " < " + 30, 30 + " <= " + colorBy + " < " + 60, colorBy + " >= " + 60];
    } else if (colorBy === "Flow") {
        return [colorBy + " < " + 50, 50 + " <= " + colorBy + " < " + 100, colorBy + " >= " + 100];
    }
	else if (colorBy === "StartHour" || colorBy === "EndHour") {
        return [colorBy + " < " + 8, 8 + " <= " + colorBy + " < " + 16, colorBy + " >= " + 16];
    }
	else if (colorBy === "StartDay") {
        return [colorBy + " < " + 3, 3 + " <= " + colorBy + " < " + 5, colorBy + " >= " + 5];
    }
	else if (colorBy === "Length_km") {
        return [colorBy + " < " + 5, 5 + " <= " + colorBy + " < " + 10, colorBy + " >= " + 10];
    }
}
function tabSCPChanged(value) {
    if (value.id === "tableView") {
        document.getElementById("exTab3").style.display = "block";
        document.getElementById("scatterdiv").style.display = "none";
    } else {
        document.getElementById("exTab3").style.display = "none";
        document.getElementById("scatterdiv").style.display = "block";
    }

}

function getColorSCP(streetdata) {
    if (colorBy === "MinSpeed" || colorBy === "AvgSpeed" || colorBy === "MaxSpeed") {
        if (streetdata < 30)
            return "red";
        else if (streetdata < 60)
            return "green";
        else
            return "blue";
    } else if (colorBy === "Flow") {
        if (streetdata < 50)
            return "red";
        else if (streetdata < 100)
            return "green";
        else
            return "blue";
    } else if (colorBy === "StartHour") {
        if (streetdata < 8)
            return "red";
        else if (streetdata < 16)
            return "green";
        else
            return "blue";
    } else if (colorBy === "StartDay") {
        if (streetdata < 3)
            return "red";
        else if (streetdata < 5)
            return "green";
        else
            return "blue";
    } else if (colorBy === "EndHour") {
        if (streetdata < 8)
            return "red";
        else if (streetdata < 16)
            return "green";
        else
            return "blue";
    } else if (colorBy === "Length_km") {
        if (streetdata < 5)
            return "red";
        else if (streetdata < 10)
            return "green";
        else
            return "blue";
    }


}
var lassoSelectedStreeLayer = [];

///draw all trip of lasso selection

function HighlightStreetForLassoSelect(ST_Names) {
    lassoSelectedStreeLayer = [];
    lassoselectedList = "( ";
    if (MyTB === "tds") {
        ST_Names.forEach(function(id) {
            lassoselectedList = lassoselectedList + id + ",";
            var polylinePoints = [];
            if (RID[id]) {
                var Traj = RID[id].split(',');
                var polylinePoints = [];
                for (var i = 0; i < Traj.length; i++) {
                    T = Traj[i].split(' ');
                    polylinePoints.push([T[1], T[0]]);
                }
            }
            Street_LayerForLasso = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
                color: "#00CC00", // polyline color
                weight: 10, // polyline weight
                opacity: 0.6, // polyline opacity
                smoothFactor: 1.0 // polyline smoothFactor
            });


            map.addLayer(Street_LayerForLasso); // Add to map

            lassoSelectedStreeLayer.push(Street_LayerForLasso);
        });
    } else if (MyTB === "tdr") {
        ST_Names.forEach(function(id) {
            lassoselectedList = lassoselectedList + id + ",";
           var Region_LayerForLasso = new L.polygon([points[id]], {
                color: "#00CC00",
                opacity: 0.6,
                weight: 3
            });

            map.addLayer(Region_LayerForLasso); // Add to map

            lassoSelectedStreeLayer.push(Region_LayerForLasso);
        })
    } else if (MyTB == "td") {
        ST_Names.forEach(function(id) {
            lassoselectedList = lassoselectedList + id + ",";
            ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace("LINESTRING(", "")
            ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace(")", "")
            var Traj = ActiveQID.Results[id]["trajectorypoints"].split(',');
            var polylinePoints = [];
            for (var i = 0; i < Traj.length; i++) {
                T = Traj[i].split(' ');
                polylinePoints.push([T[1], T[0]]);
            }
            var Poly_Layer2 = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
                color: "#00CC00", // polyline color
                weight: 10, // polyline weight
                opacity: 0.6, // polyline opacity
                smoothFactor: 1.0 // polyline smoothFactor
            })

            map.addLayer(Poly_Layer2); // Add to map
            lassoSelectedStreeLayer.push(Poly_Layer2);
        })
    }
}

var clickStreetList = [];
var clickStreetLayar = [];

/// draw trip for lasso cilck 

function HighlightStreetForSCPClick(id) {

    if (MyTB === "tds") {
        var polylinePoints = [];
        if (RID[id]) {
            var Traj = RID[id].split(',');
            var polylinePoints = [];
            for (var i = 0; i < Traj.length; i++) {
                T = Traj[i].split(' ');
                polylinePoints.push([T[1], T[0]]);
            }
        }
        Street_LayerForLasso = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: "#F0FC4C", // polyline color
            weight: 10, // polyline weight
            opacity: 0.8, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        });


        map.addLayer(Street_LayerForLasso); // Add to map
        clickStreetList.push(id);
        clickStreetLayar.push(Street_LayerForLasso);
    } else if (MyTB === "tdr") {

       var Region_LayerForLasso = new L.polygon([points[id]], {
            color: "#F0FC4C",
            opacity: 0.8,
            weight: 3
        });

        map.addLayer(Region_LayerForLasso); // Add to map
        clickStreetList.push(id);
        clickStreetLayar.push(Street_LayerForLasso);
    } else if (MyTB === "td") {
        ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace("LINESTRING(", "")
        ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace(")", "")
        var Traj = ActiveQID.Results[id]["trajectorypoints"].split(',');
        var polylinePoints = [];
        for (var i = 0; i < Traj.length; i++) {
            T = Traj[i].split(' ');
            polylinePoints.push([T[1], T[0]]);
        }
        var Poly_Layer2 = new L.polyline(polylinePoints, { // polyline options (Play with it as you like)
            color: "#F0FC4C", // polyline color
            weight: 10, // polyline weight
            opacity: 0.8, // polyline opacity
            smoothFactor: 1.0 // polyline smoothFactor
        })

        map.addLayer(Poly_Layer2); // Add to map
        clickStreetList.push(id);
        clickStreetLayar.push(Poly_Layer2);

    }
}


function clearLassoSelectedStreeLayel() {
    if (lassoSelectedStreeLayer.length != 0) {
        lassoSelectedStreeLayer.forEach(function(selectedLayer) {
            map.removeLayer(selectedLayer);
        });

    }
}

function clearLassoSelectedClickLayel() {
    if (clickStreetLayar.length != 0) {
        clickStreetLayar.forEach(function(selectedLayer) {
            map.removeLayer(selectedLayer);
        });

    }
}

hideoptionForSCP();
//// give right option to right time 

function hideoptionForSCP() {
    if (MyTB == "td") {
        d3.selectAll(".optionForSCPTDS").style("display", "none");
        d3.selectAll(".optionForSCPTD").style("display", "block");
    } else {
        d3.selectAll(".optionForSCPTDS").style("display", "block");
        d3.selectAll(".optionForSCPTD").style("display", "none");
    }

}

/// get trip data of lasso selected trip

function DrawTripFormLassoselected() {
    if (lassoselectedList != "null" && lassoselectedList != "") {
        isLAssoselectedzoom = true;
        var paraForSCP = stcor;
        lassoselectedList = lassoselectedList.slice(0, -1);
        lassoselectedList = lassoselectedList + " )";
        paraForSCP = paraForSCP + "!" + lassoselectedList + "!" + "1";
        if (MyTB == "td") {
            //AvtiveVis = 5;
            $.post("/TrajVis/system/Nquery.php", {
                cor: paraForSCP,
                DB: MyDB
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {
                    var obj1 = [];
                    obj1 = JSON.parse(results);
                    lassoselectedList = "";

                    ActiveQID.Results = obj1["Draw"];
                    ActiveQID.DayHours = obj1["DayHours"];
                    ActiveQID.road_Array = obj1["region_Array"];
                    ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                    ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                    ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                    ActiveQID.data_For_SCP = obj1["Data_For_SCP"];
                    ActiveQID.WeekDays = obj1["WeekDays"];
                    $("#bottom1 svg").empty();
                    $("#top1 svg").empty();
                    var Ytitle = "Count"
                    var xtitle1 = "DayHours"
                    var xtitle2 = "WeekDays"
                    var svg1 = '#top1 svg'
                    var svg2 = '#bottom1 svg'
                    var BarChartData1 = []
                    var BarChartData2 = []


                    var temp1 = ActiveQID.DayHours
                    var temp2 = ActiveQID.WeekDays

                    //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
                    var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                    var Timelabels2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                    var DdataB1 = []
                    var DdataB2 = []

                    for (var i = 0; i < 24; i++) {
                        if (i in temp1) {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: parseInt(temp1[i]['total']),

                            });
                        } else {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: 0,

                            });
                        }
                    }
                    for (var i = 0; i < 7; i++) {
                        if (i in temp2) {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: parseInt(temp2[i]['total']),

                            });
                        } else {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: 0,

                            });
                        }
                    }
                    var FDataB1 = {
                        values: DdataB1,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }
                    BarChartData1.push(FDataB1)
                    var FDataB2 = {
                        values: DdataB2,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }

                    BarChartData2.push(FDataB2)

                    ChDataB_Main = BarChartData2
                    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
                    DrawGroupedBarChart(xtitle2, Ytitle, BarChartData2, svg2)
                    tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                    getDataForSCP(ActiveQID.data_For_SCP);
                    drawSCP();
                    clearMap();
                    if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }
                } else {
                    console.log("No Results");
                }
            });
        } else if (MyTB == "tds") {
            //AvtiveVis = 2;
            $.post("/TrajVis/system/query.php", {
                cor: paraForSCP,
                DB: MyDB
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {

                    var obj1 = [];
                    obj1 = JSON.parse(results);
                    lassoselectedList = "";
                    ActiveQID.Results = obj1["Draw"];
                    ActiveQID.DayHours = obj1["DayHours"];
                    ActiveQID.road_Array = obj1["road_Array"];
                    ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                    ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                    ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                    ActiveQID.data_For_SCP = obj1["Data_For_SCP"];
                    ActiveQID.WeekDays = obj1["WeekDays"];
                    $("#bottom1 svg").empty();
                    $("#top1 svg").empty();
                    var Ytitle = "Count"
                    var xtitle1 = "DayHours"
                    var xtitle2 = "WeekDays"
                    var svg1 = '#top1 svg'
                    var svg2 = '#bottom1 svg'
                    var BarChartData1 = []
                    var BarChartData2 = []


                    var temp1 = ActiveQID.DayHours
                    var temp2 = ActiveQID.WeekDays

                    //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
                    var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                    var Timelabels2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                    var DdataB1 = []
                    var DdataB2 = []

                    for (var i = 0; i < 24; i++) {
                        if (i in temp1) {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: parseInt(temp1[i]['total']),

                            });
                        } else {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: 0,

                            });
                        }
                    }
                    for (var i = 0; i < 7; i++) {
                        if (i in temp2) {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: parseInt(temp2[i]['total']),

                            });
                        } else {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: 0,

                            });
                        }
                    }
                    var FDataB1 = {
                        values: DdataB1,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }
                    BarChartData1.push(FDataB1)
                    var FDataB2 = {
                        values: DdataB2,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }

                    BarChartData2.push(FDataB2)

                    ChDataB_Main = BarChartData2
                    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
                    DrawGroupedBarChart(xtitle2, Ytitle, BarChartData2, svg2)
                    tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                    getDataForSCP(ActiveQID.data_For_SCP);
                    drawSCP();
                    clearMap();
                    if (AvtiveVis == 1) {
                        DrawStreet(ActiveQID.road_Array);
                    } else if (AvtiveVis == 2) {
                        DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                    } else if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }

                } else {
                    console.log("No Results");
                }
            });

        } else if (MyTB == "tdr") {

            $.post("/TrajVis/system/Rquery.php", {
                cor: paraForSCP,
                DB: MyDB
            }, function(results) {
                // the output of the response is now handled via a variable call 'results'
                if (results) {

                    var obj1 = [];
                    obj1 = JSON.parse(results);
                    lassoselectedList = "";
                    ActiveQID.Results = obj1["Draw"];
                    ActiveQID.DayHours = obj1["DayHours"];
                    ActiveQID.road_Array = obj1["region_Array"];
                    ActiveQID.Trip_Rank = obj1["Trip_Rank"];
                    ActiveQID.St_Rank_count = obj1["St_Rank_count"];
                    ActiveQID.St_Rank_speed = obj1["St_Rank_speed"];
                    ActiveQID.data_For_SCP = obj1["Data_For_SCP"];
                    ActiveQID.WeekDays = obj1["WeekDays"];
                    $("#bottom1 svg").empty();
                    $("#top1 svg").empty();
                    var Ytitle = "Count"
                    var xtitle1 = "DayHours"
                    var xtitle2 = "WeekDays"
                    var svg1 = '#top1 svg'
                    var svg2 = '#bottom1 svg'
                    var BarChartData1 = []
                    var BarChartData2 = []


                    var temp1 = ActiveQID.DayHours
                    var temp2 = ActiveQID.WeekDays

                    //var Timelabels = ["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"]
                    var Timelabels1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                    var Timelabels2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                    var DdataB1 = []
                    var DdataB2 = []

                    for (var i = 0; i < 24; i++) {
                        if (i in temp1) {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: parseInt(temp1[i]['total']),

                            });
                        } else {
                            DdataB1.push({
                                x: Timelabels1[i],
                                y: 0,

                            });
                        }
                    }
                    for (var i = 0; i < 7; i++) {
                        if (i in temp2) {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: parseInt(temp2[i]['total']),

                            });
                        } else {
                            DdataB2.push({
                                x: Timelabels2[i],
                                y: 0,

                            });
                        }
                    }
                    var FDataB1 = {
                        values: DdataB1,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }
                    BarChartData1.push(FDataB1)
                    var FDataB2 = {
                        values: DdataB2,
                        key: "Query:" + newQuery.QueryId,
                        color: color
                    }

                    BarChartData2.push(FDataB2)

                    ChDataB_Main = BarChartData2
                    DrawGroupedBarChart(xtitle1, Ytitle, BarChartData1, svg1)
                    DrawGroupedBarChart(xtitle2, Ytitle, BarChartData2, svg2)
                    tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
                    getDataForSCP(ActiveQID.data_For_SCP);
                    drawSCP();
                    clearMap();
                    if (AvtiveVis == 1) {
                        RDrawStreet(ActiveQID.road_Array);
                    } else if (AvtiveVis == 2) {
                        RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
                    } else if (AvtiveVis == 3) {
                        DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 4) {
                        DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
                    } else if (AvtiveVis == 5) {
                        DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
                    }

                } else {
                    console.log("No Results");
                }
            });

        }
    }
}
var isLAssoselectedzoom = false;

function clearscp() {
    clearLassoSelectedStreeLayel();
    clearLassoSelectedClickLayel();
    if (isLAssoselectedzoom) {
        isLAssoselectedzoom = false;
        DrawChart();
        ActiveQID = Object.create(TempQO);
        tabledata(ActiveQID.St_Rank_count, ActiveQID.St_Rank_speed, ActiveQID.Trip_Rank);
        getDataForSCP(ActiveQID.data_For_SCP);
        drawSCP();
        clearMap();
        if (MyTB === "tds") {
            if (AvtiveVis == 1) {
                DrawStreet(ActiveQID.road_Array);
            } else if (AvtiveVis == 2) {
                DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
            } else if (AvtiveVis == 3) {
                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 4) {
                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 5) {
                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            }
        } else if (MyTB === "tdr") {
            if (AvtiveVis == 1) {
                RDrawStreet(ActiveQID.road_Array);
            } else if (AvtiveVis == 2) {
                RDrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
            } else if (AvtiveVis == 3) {
                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 4) {
                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 5) {
                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            }
        } else if (MyTB === "td") {
            if (AvtiveVis == 3) {
                DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 4) {
                DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color, ActiveQID.road_Array);
            } else if (AvtiveVis == 5) {
                DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
            }
        }

    }
}


// global veriable for 3d map view //
var isdblclick;
var latmin = 90,
    latmax = -90,
    longmin = 180,
    longmax = -180;
var tripList3d = [];
var difference = 0;
var color3d = [];
var click3dLayar = [];

function draw3dmap(id, circleelement) {
    isdblclick = true;
    var polylinePoints = [];
    $.post("/TrajVis/system/3Dquery.php", {
        cor: id,
        DB: MyDB
    }, function(results) {
        // the output of the response is now handled via a variable call 'results'
        if (results) {
            var obj1 = [];
            obj1 = JSON.parse(results);
            var data = obj1["pointlist"].split(',')
            var starttime = new Date(data[1]);
            var endtime = new Date(data[data.length - 1]);
            if (((endtime - starttime) / 1000) > difference) {
                difference = (endtime - starttime) / 1000;
            }
            for (var i = 0; i < data.length; i = i + 2) {


                var point = data[i];
                point = point.replace("POINT(", "");
                point = point.replace(")", "");
                var latlong = point.split(" ");

                polylinePoints.push([latlong[0], latlong[1], (new Date(data[i + 1]) - starttime) / 1000]);
                if (latlong[0] < longmin) {
                    longmin = latlong[0];
                }
                if (latlong[0] > longmax) {
                    longmax = latlong[0]
                }
                if (latlong[1] < latmin) {
                    latmin = latlong[1];
                }
                if (latlong[1] > latmax) {
                    latmax = latlong[1]
                }

            }

        }

        $("#myModal").modal();
        $("#myModal").show();
        tripList3d.push(polylinePoints);
        var bbox = [longmin, latmin, longmax, latmax]
        var bboxPolygon = turf.bboxPolygon(bbox);

        var centroid = turf.center(bboxPolygon);

        var p0 = turf.point([bbox[0], bbox[1]]);
        var p1 = turf.point([bbox[0], bbox[3]]);
        var p2 = turf.point([bbox[2], bbox[1]]);


        var width = turf.distance(p0, p2, {
            units: 'miles'
        }) * 985;
        var length = turf.distance(p0, p1, {
            units: 'miles'
        }) * 985;


        mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaGFsMTIxMnYiLCJhIjoiY2p4dzEzZTMzMGFyYzNjbnRoNTlqZ3ZjaSJ9.pX6AUOuYQjhgQB2V0k6ZFw';
        var map2 = new mapboxgl.Map({
            container: 'map2',
            style: 'mapbox://styles/mapbox/light-v9',
            zoom: 10,
            center: centroid.geometry.coordinates,
            pitch: 60
        });


        // parameters to ensure the model is georeferenced correctly on the map
        var modelOrigin = centroid.geometry.coordinates;
        var modelAltitude = 0;
        var modelRotate = [Math.PI / 2, 0, 0];
        var modelScale = 5.41843220338983e-8;

        // transformation parameters to position, rotate and scale the 3D model onto the map
        var modelTransform = {
            translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
            translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
            translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: modelScale
        };

        var THREE = window.THREE;

        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        var customLayer = {
            id: '3dcube',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map2, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();



                var myScalex = d3.scale.linear()
                    .domain([longmin, longmax])
                    .range([width / 2, -width / 2]);

                var myScalez = d3.scale.linear()
                    .domain([latmin, latmax])
                    .range([length / 2, -length / 2]);

                var myScaley = d3.scale.linear()
                    .domain([0, difference])
                    .range([0, 750]);

                this.renderer = new THREE.WebGLRenderer({
                    canvas: map2.getCanvas(),
                    context: gl
                });

                color3d.push(getRandomColor());

                ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace("LINESTRING(", "")
                ActiveQID.Results[id]["trajectorypoints"] = ActiveQID.Results[id]["trajectorypoints"].replace(")", "")
                var Traj = ActiveQID.Results[id]["trajectorypoints"].split(',');
                var polylinePoints2 = [];
                for (var i = 0; i < Traj.length; i++) {
                    T = Traj[i].split(' ');
                    polylinePoints2.push([T[1], T[0]]);
                }
                var Poly_Layer2 = new L.polyline(polylinePoints2, { // polyline options (Play with it as you like)
                    color: color3d[color3d.length - 1], // polyline color
                    weight: 10, // polyline weight
                    opacity: 0.8, // polyline opacity
                    smoothFactor: 1.0 // polyline smoothFactor
                })

                map.addLayer(Poly_Layer2); // Add to map
                click3dLayar.push(Poly_Layer2);
                //d3.select("#scatter").selectAll("svg").select(".g-main").select("#"+id).attr("r", "100").style("stroke-width","3").style("stroke","#979A9A");
                d3.select(circleelement).attr("r", 10).style("stroke-width", "6").style("stroke", color3d[color3d.length - 1]);
var geometry1 = new THREE.BoxGeometry(width,750,length);
var material1 = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true, linewidth: 5});
var cube1 = new THREE.Mesh(geometry1, material1);
cube1.position.set(0,750/2,0);
//var worldAxis = new THREE.AxesHelper(750);
//worldAxis.position.set(-width/2,-750/2,-length/2)
  //cube1.add(worldAxis);
this.scene.add(cube1); 

            
			   for (k = 0; k < tripList3d.length; k++) {

                    var material = new THREE.LineBasicMaterial({
                        linewidth: 100,
                        color: color3d[k]
                    });
                    var geometry = new THREE.Geometry();

                    tripList3d[k].forEach(function(points) {

                        geometry.vertices.push(new THREE.Vector3(myScalex(points[0]), myScaley(points[2]), myScalez(points[1])));
                    });

                    var line = new THREE.Line(geometry, material);
                    this.scene.add(line);


                }

                // use the Mapbox GL JS map canvas for three.js


                this.renderer.autoClear = false;
            },
            render: function(gl, matrix) {
                var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
                var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
                var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

                var m = new THREE.Matrix4().fromArray(matrix);
                var l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                    .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix.elements = matrix;
                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.state.reset();
                this.renderer.render(this.scene, this.camera);
                map2.triggerRepaint();
            }

        }

        map2.on("style.load", function() {
            map2.addLayer(customLayer);

            var bounds = polylinePoints.reduce(function(bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(polylinePoints[0], polylinePoints[0]));

            map2.fitBounds(bounds, {
                padding: 50
            });

        });

    });
};

$('#myModal').on('hidden.bs.modal', function() {
    //d3.select("#myModal").remove();
	//map2.removeLayer('3dcube');
    //map2.remove();
    map2 = null;
    isdblclick = false;
    resetallverialFor3d();
})

function resetallverialFor3d()
{
	
    latmin = 90;
    latmax = -90;
    longmin = 180;
    longmax = -180;
    tripList3d = [];
    difference = 0;
    d3.select("#scatter").selectAll(".dot").attr("r", 6).style("stroke-width", 1).style("stroke", "black")
  if (click3dLayar.length != 0) {
        click3dLayar.forEach(function(selectedLayer) {
            map.removeLayer(selectedLayer);
        });

    }
    color3d = [];
	
}

function addAnotherTrip() {
    $("#myModal").hide();
    $('.modal-backdrop').remove();

    isdblclick = false;

}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;

}

//*****************************************************************************************************************************************
//// change report view
//*****************************************************************************************************************************************
$('#DayHours_btn').click(function() {
    $("#bottom1").hide();
    $("#Years_reportView").hide();
    $("#Months_reportView").hide();
    $("#top1").show();
    window.dispatchEvent(new Event('resize'));
});
$('#WeekDays_btn').click(function() {
    $("#Years_reportView").hide();
    $("#Months_reportView").hide();
    $("#top1").hide();
    $("#bottom1").show();
    window.dispatchEvent(new Event('resize'));
});
$('#Months_btn').click(function() {
    $("#Years_reportView").hide();
    $("#top1").hide();
    $("#bottom1").hide();
    $("#Months_reportView").show();
    window.dispatchEvent(new Event('resize'));
});
$('#Years_btn').click(function() {
    $("#top1").hide();
    $("#bottom1").hide();
    $("#Months_reportView").hide();
    $("#Years_reportView").show();
    window.dispatchEvent(new Event('resize'));
});