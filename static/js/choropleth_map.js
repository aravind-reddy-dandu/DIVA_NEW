// Themes begin
am4core.useTheme(am4themes_animated);
var wine_level_chart;
var chart;
var treechart;
var wine_level_max;
var wine_level_continent;
var wine_level_country;
var wine_level_price;
var wine_level_points;

var treemap_province;
var treemap_wines;
var treemap_price;
var treemap_points;
var treemap_country;

// Themes end
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateChartData2(Fdata) {

    let temp = 0;
    let random_value = 0;
    while (temp < 100) {
        random_value = getRandomInt(Fdata.length);
        temp = Fdata[random_value].value;
    }
    prepare_wineleveldata(Fdata[random_value].continent);
    prepare_treemap(Fdata[random_value].country);

    var northAmerica = 0;
    var southAmerica = 0;
    var africa = 0;
    var asia = 0;
    var europe = 0;
    var oceania = 0;

    var chartData2 = [];


    for (var i = 0; i < Fdata.length; i++) {
        chartData2.push({
            continent: Fdata[i].continent,
            id: Fdata[i].country_id,
            name: Fdata[i].country,
            value: Fdata[i].value,
            winery_cnt: Fdata[i].winery_cnt,
            avg_price: Fdata[i].avg_price,
            avg_points: Fdata[i].avg_points
        });
        if (isNaN(Fdata[i].value))
            Fdata[i].value = 0;
        if (Fdata[i].continent === "North America")
            northAmerica += Fdata[i].value;

        if (Fdata[i].continent == "South America")
            southAmerica += Fdata[i].value;

        if (Fdata[i].continent == "Africa")
            africa += Fdata[i].value;
        if (Fdata[i].continent == "Asia")
            asia += Fdata[i].value;
        if (Fdata[i].continent == "Europe")
            europe += Fdata[i].value;

        if (Fdata[i].continent == "Oceania") {
            oceania += Fdata[i].value;
            console.log(oceania);
        }
    }
    //console.log(chartData2[0].continent );

// Create map instance
    chart = am4core.create("chorplethdiv", am4maps.MapChart);

// Set projection
    chart.projection = new am4maps.projections.Mercator();

    var restoreContinents = function () {
        hideCountries();
        chart.goHome();
    };

// Zoom control
    chart.zoomControl = new am4maps.ZoomControl();

    var homeButton = new am4core.Button();
    homeButton.events.on("hit", restoreContinents);

    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);

// Shared
    var hoverColorHex = "#9a7bca";
    var hoverColor = am4core.color(hoverColorHex);
    var hideCountries = function () {
        countryTemplate.hide();
        labelContainer.hide();
    };

// Continents
    var continentsSeries = chart.series.push(new am4maps.MapPolygonSeries());
    continentsSeries.geodata = am4geodata_continentsLow;
    continentsSeries.useGeodata = true;
    continentsSeries.exclude = ["antarctica"];

    var continentTemplate = continentsSeries.mapPolygons.template;
    continentTemplate.tooltipText = "{name}: {value}";
    continentTemplate.properties.fillOpacity = 0.8; // Reduce conflict with back to continents map label
    continentTemplate.propertyFields.fill = "color";
    continentTemplate.nonScalingStroke = true;
    continentTemplate.events.on("hit", function (event) {
        if (!countriesSeries.visible) countriesSeries.visible = true;
        chart.zoomToMapObject(event.target);
        prepare_wineleveldata(event.target.dataItem.dataContext.name);
        countryTemplate.show();
        labelContainer.show();
    });

    var contintentHover = continentTemplate.states.create("hover");
    contintentHover.properties.fill = hoverColor;
    contintentHover.properties.stroke = hoverColor;

    continentsSeries.dataFields.zoomLevel = "zoomLevel";
    continentsSeries.dataFields.zoomGeoPoint = "zoomGeoPoint";

    continentsSeries.data = [{
        "id": "africa",
        "color": "#d9480f",
        "value": africa,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 8,
        //   "longitude": 34
        // }
    }, {
        "id": "asia",
        "color": "#6F257F",
        "value": asia,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 46,
        //   "longitude": 89
        // }
    }, {
        "id": "oceania",
        "color": "#af841f",
        "value": oceania,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 22,
        //   "longitude": 140
        // }
    }, {
        "id": "europe",
        "color": "#FFA500",
        "value": europe,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 53,
        //   "longitude": 9
        // }
    }, {
        "id": "northAmerica",
        "color": "#4CAF50",
        "value": northAmerica,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 54,
        //   "longitude": 105
        // }
    }, {
        "id": "southAmerica",
        "color": "#C6426E",
        "value": southAmerica,
        "zoomLevel": 2,
        // "zoomGeoPoint": {
        //   "latitude": 8,
        //   "longitude": 55
        // }
    }];


// Countries
    var countriesSeries = chart.series.push(new am4maps.MapPolygonSeries());
    var countries = countriesSeries.mapPolygons;
    countriesSeries.visible = false; // start off as hidden
    countriesSeries.exclude = ["AQ"];
    countriesSeries.geodata = am4geodata_worldLow;

// Add some data
    /*countriesSeries.data = [{
      "id": "US",
      "name": "United States",
      "value": 100
    }, {
      "id": "FR",
      "name": "France",
      "value": 50
    }];
    */
    countriesSeries.data = chartData2;

//countryTemplate.tooltipText = "{name}: {value}";

//console.log(am4geodata_worldLow);

    countriesSeries.useGeodata = true;
// Hide each country so we can fade them in
    countriesSeries.events.once("inited", function () {
        hideCountries();
    });

    var countryTemplate = countries.template;
    countryTemplate.applyOnClones = true;
    countryTemplate.fill = am4core.color("#a791b4");
    countryTemplate.fillOpacity = 0.3; // see continents underneath, however, country shapes are more detailed than continents.
    countryTemplate.strokeOpacity = 0.5;
    countryTemplate.nonScalingStroke = true;
    countryTemplate.tooltipText = "{name}: Wines: {value} \n Wineries: {winery_cnt} Average Price: {avg_price}" +
        "\n Average Points: {avg_points}";
    countryTemplate.events.on("hit", function (event) {
        chart.zoomToMapObject(event.target);
        prepare_treemap(event.target.dataItem.dataContext.name);
    });

// countryTemplate.tooltipText = "{name}: Wines: {value} \n Wineries: {winery_cnt}";

    var countryHover = countryTemplate.states.create("hover");
    countryHover.properties.fill = hoverColor;
    countryHover.properties.fillOpacity = 0.8; // Reduce conflict with back to continents map label
    countryHover.properties.stroke = hoverColor;
    countryHover.properties.strokeOpacity = 1;

    var labelContainer = chart.chartContainer.createChild(am4core.Container);
    labelContainer.hide();
    labelContainer.config = {
        cursorOverStyle: [
            {
                "property": "cursor",
                "value": "pointer"
            }
        ]
    };
    labelContainer.isMeasured = false;
    labelContainer.layout = "horizontal";
    labelContainer.verticalCenter = "bottom";
    labelContainer.contentValign = "middle";
    labelContainer.y = am4core.percent(100);
    labelContainer.dx = 10;
    labelContainer.dy = -25;
    labelContainer.background.fill = am4core.color("#fff");
    labelContainer.background.fillOpacity = 0; // Hack to ensure entire area of labelContainer, e.g. between icon path, is clickable
    labelContainer.setStateOnChildren = true;
    labelContainer.states.create("hover");
    labelContainer.events.on("hit", restoreContinents);

    var globeIcon = labelContainer.createChild(am4core.Sprite);
    globeIcon.valign = "bottom";
    globeIcon.verticalCenter = "bottom";
    globeIcon.width = 29;
    globeIcon.height = 29;
    globeIcon.marginRight = 7;
    globeIcon.path = "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM27.436,17.39c0.001,0.002,0.004,0.002,0.005,0.004c-0.022,0.187-0.054,0.37-0.085,0.554c-0.015-0.012-0.034-0.025-0.047-0.036c-0.103-0.09-0.254-0.128-0.318-0.115c-0.157,0.032,0.229,0.305,0.267,0.342c0.009,0.009,0.031,0.03,0.062,0.058c-1.029,5.312-5.709,9.338-11.319,9.338c-4.123,0-7.736-2.18-9.776-5.441c0.123-0.016,0.24-0.016,0.28-0.076c0.051-0.077,0.102-0.241,0.178-0.331c0.077-0.089,0.165-0.229,0.127-0.292c-0.039-0.064,0.101-0.344,0.088-0.419c-0.013-0.076-0.127-0.256,0.064-0.407s0.394-0.382,0.407-0.444c0.012-0.063,0.166-0.331,0.152-0.458c-0.012-0.127-0.152-0.28-0.24-0.318c-0.09-0.037-0.28-0.05-0.356-0.151c-0.077-0.103-0.292-0.203-0.368-0.178c-0.076,0.025-0.204,0.05-0.305-0.015c-0.102-0.062-0.267-0.139-0.33-0.189c-0.065-0.05-0.229-0.088-0.305-0.088c-0.077,0-0.065-0.052-0.178,0.101c-0.114,0.153,0,0.204-0.204,0.177c-0.204-0.023,0.025-0.036,0.141-0.189c0.113-0.152-0.013-0.242-0.141-0.203c-0.126,0.038-0.038,0.115-0.241,0.153c-0.203,0.036-0.203-0.09-0.076-0.115s0.355-0.139,0.355-0.19c0-0.051-0.025-0.191-0.127-0.191s-0.077-0.126-0.229-0.291c-0.092-0.101-0.196-0.164-0.299-0.204c-0.09-0.579-0.15-1.167-0.15-1.771c0-2.844,1.039-5.446,2.751-7.458c0.024-0.02,0.048-0.034,0.069-0.036c0.084-0.009,0.31-0.025,0.51-0.059c0.202-0.034,0.418-0.161,0.489-0.153c0.069,0.008,0.241,0.008,0.186-0.042C8.417,8.2,8.339,8.082,8.223,8.082S8.215,7.896,8.246,7.896c0.03,0,0.186,0.025,0.178,0.11C8.417,8.091,8.471,8.2,8.625,8.167c0.156-0.034,0.132-0.162,0.102-0.195C8.695,7.938,8.672,7.853,8.642,7.794c-0.031-0.06-0.023-0.136,0.14-0.153C8.944,7.625,9.168,7.708,9.16,7.573s0-0.28,0.046-0.356C9.253,7.142,9.354,7.09,9.299,7.065C9.246,7.04,9.176,7.099,9.121,6.972c-0.054-0.127,0.047-0.22,0.108-0.271c0.02-0.015,0.067-0.06,0.124-0.112C11.234,5.257,13.524,4.466,16,4.466c3.213,0,6.122,1.323,8.214,3.45c-0.008,0.022-0.01,0.052-0.031,0.056c-0.077,0.013-0.166,0.063-0.179-0.051c-0.013-0.114-0.013-0.331-0.102-0.203c-0.089,0.127-0.127,0.127-0.127,0.191c0,0.063,0.076,0.127,0.051,0.241C23.8,8.264,23.8,8.341,23.84,8.341c0.036,0,0.126-0.115,0.239-0.141c0.116-0.025,0.319-0.088,0.332,0.026c0.013,0.115,0.139,0.152,0.013,0.203c-0.128,0.051-0.267,0.026-0.293-0.051c-0.025-0.077-0.114-0.077-0.203-0.013c-0.088,0.063-0.279,0.292-0.279,0.292s-0.306,0.139-0.343,0.114c-0.04-0.025,0.101-0.165,0.203-0.228c0.102-0.064,0.178-0.204,0.14-0.242c-0.038-0.038-0.088-0.279-0.063-0.343c0.025-0.063,0.139-0.152,0.013-0.216c-0.127-0.063-0.217-0.14-0.318-0.178s-0.216,0.152-0.305,0.204c-0.089,0.051-0.076,0.114-0.191,0.127c-0.114,0.013-0.189,0.165,0,0.254c0.191,0.089,0.255,0.152,0.204,0.204c-0.051,0.051-0.267-0.025-0.267-0.025s-0.165-0.076-0.268-0.076c-0.101,0-0.229-0.063-0.33-0.076c-0.102-0.013-0.306-0.013-0.355,0.038c-0.051,0.051-0.179,0.203-0.28,0.152c-0.101-0.051-0.101-0.102-0.241-0.051c-0.14,0.051-0.279-0.038-0.355,0.038c-0.077,0.076-0.013,0.076-0.255,0c-0.241-0.076-0.189,0.051-0.419,0.089s-0.368-0.038-0.432,0.038c-0.064,0.077-0.153,0.217-0.19,0.127c-0.038-0.088,0.126-0.241,0.062-0.292c-0.062-0.051-0.33-0.025-0.367,0.013c-0.039,0.038-0.014,0.178,0.011,0.229c0.026,0.05,0.064,0.254-0.011,0.216c-0.077-0.038-0.064-0.166-0.141-0.152c-0.076,0.013-0.165,0.051-0.203,0.077c-0.038,0.025-0.191,0.025-0.229,0.076c-0.037,0.051,0.014,0.191-0.051,0.203c-0.063,0.013-0.114,0.064-0.254-0.025c-0.14-0.089-0.14-0.038-0.178-0.012c-0.038,0.025-0.216,0.127-0.229,0.012c-0.013-0.114,0.025-0.152-0.089-0.229c-0.115-0.076-0.026-0.076,0.127-0.025c0.152,0.05,0.343,0.075,0.622-0.013c0.28-0.089,0.395-0.127,0.28-0.178c-0.115-0.05-0.229-0.101-0.406-0.127c-0.179-0.025-0.42-0.025-0.7-0.127c-0.279-0.102-0.343-0.14-0.457-0.165c-0.115-0.026-0.813-0.14-1.132-0.089c-0.317,0.051-1.193,0.28-1.245,0.318s-0.128,0.19-0.292,0.318c-0.165,0.127-0.47,0.419-0.712,0.47c-0.241,0.051-0.521,0.254-0.521,0.305c0,0.051,0.101,0.242,0.076,0.28c-0.025,0.038,0.05,0.229,0.191,0.28c0.139,0.05,0.381,0.038,0.393-0.039c0.014-0.076,0.204-0.241,0.217-0.127c0.013,0.115,0.14,0.292,0.114,0.368c-0.025,0.077,0,0.153,0.09,0.14c0.088-0.012,0.559-0.114,0.559-0.114s0.153-0.064,0.127-0.166c-0.026-0.101,0.166-0.241,0.203-0.279c0.038-0.038,0.178-0.191,0.014-0.241c-0.167-0.051-0.293-0.064-0.115-0.216s0.292,0,0.521-0.229c0.229-0.229-0.051-0.292,0.191-0.305c0.241-0.013,0.496-0.025,0.444,0.051c-0.05,0.076-0.342,0.242-0.508,0.318c-0.166,0.077-0.14,0.216-0.076,0.292c0.063,0.076,0.09,0.254,0.204,0.229c0.113-0.025,0.254-0.114,0.38-0.101c0.128,0.012,0.383-0.013,0.42-0.013c0.039,0,0.216,0.178,0.114,0.203c-0.101,0.025-0.229,0.013-0.445,0.025c-0.215,0.013-0.456,0.013-0.456,0.051c0,0.039,0.292,0.127,0.19,0.191c-0.102,0.063-0.203-0.013-0.331-0.026c-0.127-0.012-0.203,0.166-0.241,0.267c-0.039,0.102,0.063,0.28-0.127,0.216c-0.191-0.063-0.331-0.063-0.381-0.038c-0.051,0.025-0.203,0.076-0.331,0.114c-0.126,0.038-0.076-0.063-0.242-0.063c-0.164,0-0.164,0-0.164,0l-0.103,0.013c0,0-0.101-0.063-0.114-0.165c-0.013-0.102,0.05-0.216-0.013-0.241c-0.064-0.026-0.292,0.012-0.33,0.088c-0.038,0.076-0.077,0.216-0.026,0.28c0.052,0.063,0.204,0.19,0.064,0.152c-0.14-0.038-0.317-0.051-0.419,0.026c-0.101,0.076-0.279,0.241-0.279,0.241s-0.318,0.025-0.318,0.102c0,0.077,0,0.178-0.114,0.191c-0.115,0.013-0.268,0.05-0.42,0.076c-0.153,0.025-0.139,0.088-0.317,0.102s-0.204,0.089-0.038,0.114c0.165,0.025,0.418,0.127,0.431,0.241c0.014,0.114-0.013,0.242-0.076,0.356c-0.043,0.079-0.305,0.026-0.458,0.026c-0.152,0-0.456-0.051-0.584,0c-0.127,0.051-0.102,0.305-0.064,0.419c0.039,0.114-0.012,0.178-0.063,0.216c-0.051,0.038-0.065,0.152,0,0.204c0.063,0.051,0.114,0.165,0.166,0.178c0.051,0.013,0.215-0.038,0.279,0.025c0.064,0.064,0.127,0.216,0.165,0.178c0.039-0.038,0.089-0.203,0.153-0.166c0.064,0.039,0.216-0.012,0.331-0.025s0.177-0.14,0.292-0.204c0.114-0.063,0.05-0.063,0.013-0.14c-0.038-0.076,0.114-0.165,0.204-0.254c0.088-0.089,0.253-0.013,0.292-0.115c0.038-0.102,0.051-0.279,0.151-0.267c0.103,0.013,0.243,0.076,0.331,0.076c0.089,0,0.279-0.14,0.332-0.165c0.05-0.025,0.241-0.013,0.267,0.102c0.025,0.114,0.241,0.254,0.292,0.279c0.051,0.025,0.381,0.127,0.433,0.165c0.05,0.038,0.126,0.153,0.152,0.254c0.025,0.102,0.114,0.102,0.128,0.013c0.012-0.089-0.065-0.254,0.025-0.242c0.088,0.013,0.191-0.026,0.191-0.026s-0.243-0.165-0.331-0.203c-0.088-0.038-0.255-0.114-0.331-0.241c-0.076-0.127-0.267-0.153-0.254-0.279c0.013-0.127,0.191-0.051,0.292,0.051c0.102,0.102,0.356,0.241,0.445,0.33c0.088,0.089,0.229,0.127,0.267,0.242c0.039,0.114,0.152,0.241,0.19,0.292c0.038,0.051,0.165,0.331,0.204,0.394c0.038,0.063,0.165-0.012,0.229-0.063c0.063-0.051,0.179-0.076,0.191-0.178c0.013-0.102-0.153-0.178-0.203-0.216c-0.051-0.038,0.127-0.076,0.191-0.127c0.063-0.05,0.177-0.14,0.228-0.063c0.051,0.077,0.026,0.381,0.051,0.432c0.025,0.051,0.279,0.127,0.331,0.191c0.05,0.063,0.267,0.089,0.304,0.051c0.039-0.038,0.242,0.026,0.294,0.038c0.049,0.013,0.202-0.025,0.304-0.05c0.103-0.025,0.204-0.102,0.191,0.063c-0.013,0.165-0.051,0.419-0.179,0.546c-0.127,0.127-0.076,0.191-0.202,0.191c-0.06,0-0.113,0-0.156,0.021c-0.041-0.065-0.098-0.117-0.175-0.097c-0.152,0.038-0.344,0.038-0.47,0.19c-0.128,0.153-0.178,0.165-0.204,0.114c-0.025-0.051,0.369-0.267,0.317-0.331c-0.05-0.063-0.355-0.038-0.521-0.038c-0.166,0-0.305-0.102-0.433-0.127c-0.126-0.025-0.292,0.127-0.418,0.254c-0.128,0.127-0.216,0.038-0.331,0.038c-0.115,0-0.331-0.165-0.331-0.165s-0.216-0.089-0.305-0.089c-0.088,0-0.267-0.165-0.318-0.165c-0.05,0-0.19-0.115-0.088-0.166c0.101-0.05,0.202,0.051,0.101-0.229c-0.101-0.279-0.33-0.216-0.419-0.178c-0.088,0.039-0.724,0.025-0.775,0.025c-0.051,0-0.419,0.127-0.533,0.178c-0.116,0.051-0.318,0.115-0.369,0.14c-0.051,0.025-0.318-0.051-0.433,0.013c-0.151,0.084-0.291,0.216-0.33,0.216c-0.038,0-0.153,0.089-0.229,0.28c-0.077,0.19,0.013,0.355-0.128,0.419c-0.139,0.063-0.394,0.204-0.495,0.305c-0.102,0.101-0.229,0.458-0.355,0.623c-0.127,0.165,0,0.317,0.025,0.419c0.025,0.101,0.114,0.292-0.025,0.471c-0.14,0.178-0.127,0.266-0.191,0.279c-0.063,0.013,0.063,0.063,0.088,0.19c0.025,0.128-0.114,0.255,0.128,0.369c0.241,0.113,0.355,0.217,0.418,0.367c0.064,0.153,0.382,0.407,0.382,0.407s0.229,0.205,0.344,0.293c0.114,0.089,0.152,0.038,0.177-0.05c0.025-0.09,0.178-0.104,0.355-0.104c0.178,0,0.305,0.04,0.483,0.014c0.178-0.025,0.356-0.141,0.42-0.166c0.063-0.025,0.279-0.164,0.443-0.063c0.166,0.103,0.141,0.241,0.23,0.332c0.088,0.088,0.24,0.037,0.355-0.051c0.114-0.09,0.064-0.052,0.203,0.025c0.14,0.075,0.204,0.151,0.077,0.267c-0.128,0.113-0.051,0.293-0.128,0.47c-0.076,0.178-0.063,0.203,0.077,0.278c0.14,0.076,0.394,0.548,0.47,0.638c0.077,0.088-0.025,0.342,0.064,0.495c0.089,0.151,0.178,0.254,0.077,0.331c-0.103,0.075-0.28,0.216-0.292,0.47s0.051,0.431,0.102,0.521s0.177,0.331,0.241,0.419c0.064,0.089,0.14,0.305,0.152,0.445c0.013,0.14-0.024,0.306,0.039,0.381c0.064,0.076,0.102,0.191,0.216,0.292c0.115,0.103,0.152,0.318,0.152,0.318s0.039,0.089,0.051,0.229c0.012,0.14,0.025,0.228,0.152,0.292c0.126,0.063,0.215,0.076,0.28,0.013c0.063-0.063,0.381-0.077,0.546-0.063c0.165,0.013,0.355-0.075,0.521-0.19s0.407-0.419,0.496-0.508c0.089-0.09,0.292-0.255,0.268-0.356c-0.025-0.101-0.077-0.203,0.024-0.254c0.102-0.052,0.344-0.152,0.356-0.229c0.013-0.077-0.09-0.395-0.115-0.457c-0.024-0.064,0.064-0.18,0.165-0.306c0.103-0.128,0.421-0.216,0.471-0.267c0.051-0.053,0.191-0.267,0.217-0.433c0.024-0.167-0.051-0.369,0-0.457c0.05-0.09,0.013-0.165-0.103-0.268c-0.114-0.102-0.089-0.407-0.127-0.457c-0.037-0.051-0.013-0.319,0.063-0.345c0.076-0.023,0.242-0.279,0.344-0.393c0.102-0.114,0.394-0.47,0.534-0.496c0.139-0.025,0.355-0.229,0.368-0.343c0.013-0.115,0.38-0.547,0.394-0.635c0.013-0.09,0.166-0.42,0.102-0.497c-0.062-0.076-0.559,0.115-0.622,0.141c-0.064,0.025-0.241,0.127-0.446,0.113c-0.202-0.013-0.114-0.177-0.127-0.254c-0.012-0.076-0.228-0.368-0.279-0.381c-0.051-0.012-0.203-0.166-0.267-0.317c-0.063-0.153-0.152-0.343-0.254-0.458c-0.102-0.114-0.165-0.38-0.268-0.559c-0.101-0.178-0.189-0.407-0.279-0.572c-0.021-0.041-0.045-0.079-0.067-0.117c0.118-0.029,0.289-0.082,0.31-0.009c0.024,0.088,0.165,0.279,0.19,0.419s0.165,0.089,0.178,0.216c0.014,0.128,0.14,0.433,0.19,0.47c0.052,0.038,0.28,0.242,0.318,0.318c0.038,0.076,0.089,0.178,0.127,0.369c0.038,0.19,0.076,0.444,0.179,0.482c0.102,0.038,0.444-0.064,0.508-0.102s0.482-0.242,0.635-0.255c0.153-0.012,0.179-0.115,0.368-0.152c0.191-0.038,0.331-0.177,0.458-0.28c0.127-0.101,0.28-0.355,0.33-0.444c0.052-0.088,0.179-0.152,0.115-0.253c-0.063-0.103-0.331-0.254-0.433-0.268c-0.102-0.012-0.089-0.178-0.152-0.178s-0.051,0.088-0.178,0.153c-0.127,0.063-0.255,0.19-0.344,0.165s0.026-0.089-0.113-0.203s-0.192-0.14-0.192-0.228c0-0.089-0.278-0.255-0.304-0.382c-0.026-0.127,0.19-0.305,0.254-0.19c0.063,0.114,0.115,0.292,0.279,0.368c0.165,0.076,0.318,0.204,0.395,0.229c0.076,0.025,0.267-0.14,0.33-0.114c0.063,0.024,0.191,0.253,0.306,0.292c0.113,0.038,0.495,0.051,0.559,0.051s0.33,0.013,0.381-0.063c0.051-0.076,0.089-0.076,0.153-0.076c0.062,0,0.177,0.229,0.267,0.254c0.089,0.025,0.254,0.013,0.241,0.179c-0.012,0.164,0.076,0.305,0.165,0.317c0.09,0.012,0.293-0.191,0.293-0.191s0,0.318-0.012,0.433c-0.014,0.113,0.139,0.534,0.139,0.534s0.19,0.393,0.241,0.482s0.267,0.355,0.267,0.47c0,0.115,0.025,0.293,0.103,0.293c0.076,0,0.152-0.203,0.24-0.331c0.091-0.126,0.116-0.305,0.153-0.432c0.038-0.127,0.038-0.356,0.038-0.444c0-0.09,0.075-0.166,0.255-0.242c0.178-0.076,0.304-0.292,0.456-0.407c0.153-0.115,0.141-0.305,0.446-0.305c0.305,0,0.278,0,0.355-0.077c0.076-0.076,0.151-0.127,0.19,0.013c0.038,0.14,0.254,0.343,0.292,0.394c0.038,0.052,0.114,0.191,0.103,0.344c-0.013,0.152,0.012,0.33,0.075,0.33s0.191-0.216,0.191-0.216s0.279-0.189,0.267,0.013c-0.014,0.203,0.025,0.419,0.025,0.545c0,0.053,0.042,0.135,0.088,0.21c-0.005,0.059-0.004,0.119-0.009,0.178C27.388,17.153,27.387,17.327,27.436,17.39zM20.382,12.064c0.076,0.05,0.102,0.127,0.152,0.203c0.052,0.076,0.14,0.05,0.203,0.114c0.063,0.064-0.178,0.14-0.075,0.216c0.101,0.077,0.151,0.381,0.165,0.458c0.013,0.076-0.279,0.114-0.369,0.102c-0.089-0.013-0.354-0.102-0.445-0.127c-0.089-0.026-0.139-0.343-0.025-0.331c0.116,0.013,0.141-0.025,0.267-0.139c0.128-0.115-0.189-0.166-0.278-0.191c-0.089-0.025-0.268-0.305-0.331-0.394c-0.062-0.089-0.014-0.228,0.141-0.331c0.076-0.051,0.279,0.063,0.381,0c0.101-0.063,0.203-0.14,0.241-0.165c0.039-0.025,0.293,0.038,0.33,0.114c0.039,0.076,0.191,0.191,0.141,0.229c-0.052,0.038-0.281,0.076-0.356,0c-0.075-0.077-0.255,0.012-0.268,0.152C20.242,12.115,20.307,12.013,20.382,12.064zM16.875,12.28c-0.077-0.025,0.025-0.178,0.102-0.229c0.075-0.051,0.164-0.178,0.241-0.305c0.076-0.127,0.178-0.14,0.241-0.127c0.063,0.013,0.203,0.241,0.241,0.318c0.038,0.076,0.165-0.026,0.217-0.051c0.05-0.025,0.127-0.102,0.14-0.165s0.127-0.102,0.254-0.102s0.013,0.102-0.076,0.127c-0.09,0.025-0.038,0.077,0.113,0.127c0.153,0.051,0.293,0.191,0.459,0.279c0.165,0.089,0.19,0.267,0.088,0.292c-0.101,0.025-0.406,0.051-0.521,0.038c-0.114-0.013-0.254-0.127-0.419-0.153c-0.165-0.025-0.369-0.013-0.433,0.077s-0.292,0.05-0.395,0.05c-0.102,0-0.228,0.127-0.253,0.077C16.875,12.534,16.951,12.306,16.875,12.28zM17.307,9.458c0.063-0.178,0.419,0.038,0.355,0.127C17.599,9.675,17.264,9.579,17.307,9.458zM17.802,18.584c0.063,0.102-0.14,0.431-0.254,0.407c-0.113-0.027-0.076-0.318-0.038-0.382C17.548,18.545,17.769,18.529,17.802,18.584zM13.189,12.674c0.025-0.051-0.039-0.153-0.127-0.013C13.032,12.71,13.164,12.725,13.189,12.674zM20.813,8.035c0.141,0.076,0.339,0.107,0.433,0.013c0.076-0.076,0.013-0.204-0.05-0.216c-0.064-0.013-0.104-0.115,0.062-0.203c0.165-0.089,0.343-0.204,0.534-0.229c0.19-0.025,0.622-0.038,0.774,0c0.152,0.039,0.382-0.166,0.445-0.254s-0.203-0.152-0.279-0.051c-0.077,0.102-0.444,0.076-0.521,0.051c-0.076-0.025-0.686,0.102-0.812,0.102c-0.128,0-0.179,0.152-0.356,0.229c-0.179,0.076-0.42,0.191-0.509,0.229c-0.088,0.038-0.177,0.19-0.101,0.216C20.509,7.947,20.674,7.959,20.813,8.035zM14.142,12.674c0.064-0.089-0.051-0.217-0.114-0.217c-0.12,0-0.178,0.191-0.103,0.254C14.002,12.776,14.078,12.763,14.142,12.674zM14.714,13.017c0.064,0.025,0.114,0.102,0.165,0.114c0.052,0.013,0.217,0,0.167-0.127s-0.167-0.127-0.204-0.127c-0.038,0-0.203-0.038-0.267,0C14.528,12.905,14.65,12.992,14.714,13.017zM11.308,10.958c0.101,0.013,0.217-0.063,0.305-0.101c0.088-0.038,0.216-0.114,0.216-0.229c0-0.114-0.025-0.216-0.077-0.267c-0.051-0.051-0.14-0.064-0.216-0.051c-0.115,0.02-0.127,0.14-0.203,0.14c-0.076,0-0.165,0.025-0.14,0.114s0.077,0.152,0,0.19C11.117,10.793,11.205,10.946,11.308,10.958zM11.931,10.412c0.127,0.051,0.394,0.102,0.292,0.153c-0.102,0.051-0.28,0.19-0.305,0.267s0.216,0.153,0.216,0.153s-0.077,0.089-0.013,0.114c0.063,0.025,0.102-0.089,0.203-0.089c0.101,0,0.304,0.063,0.406,0.063c0.103,0,0.267-0.14,0.254-0.229c-0.013-0.089-0.14-0.229-0.254-0.28c-0.113-0.051-0.241-0.28-0.317-0.331c-0.076-0.051,0.076-0.178-0.013-0.267c-0.09-0.089-0.153-0.076-0.255-0.14c-0.102-0.063-0.191,0.013-0.254,0.089c-0.063,0.076-0.14-0.013-0.217,0.012c-0.102,0.035-0.063,0.166-0.012,0.229C11.714,10.221,11.804,10.361,11.931,10.412zM24.729,17.198c-0.083,0.037-0.153,0.47,0,0.521c0.152,0.052,0.241-0.202,0.191-0.267C24.868,17.39,24.843,17.147,24.729,17.198zM20.114,20.464c-0.159-0.045-0.177,0.166-0.304,0.306c-0.128,0.141-0.267,0.254-0.317,0.241c-0.052-0.013-0.331,0.089-0.242,0.279c0.089,0.191,0.076,0.382-0.013,0.472c-0.089,0.088,0.076,0.342,0.052,0.482c-0.026,0.139,0.037,0.229,0.215,0.229s0.242-0.064,0.318-0.229c0.076-0.166,0.088-0.331,0.164-0.47c0.077-0.141,0.141-0.434,0.179-0.51c0.038-0.075,0.114-0.316,0.102-0.457C20.254,20.669,20.204,20.489,20.114,20.464zM10.391,8.802c-0.069-0.06-0.229-0.102-0.306-0.11c-0.076-0.008-0.152,0.06-0.321,0.06c-0.168,0-0.279,0.067-0.347,0C9.349,8.684,9.068,8.65,9.042,8.692C9.008,8.749,8.941,8.751,9.008,8.87c0.069,0.118,0.12,0.186,0.179,0.178s0.262-0.017,0.288,0.051C9.5,9.167,9.569,9.226,9.712,9.184c0.145-0.042,0.263-0.068,0.296-0.119c0.033-0.051,0.263-0.059,0.263-0.059S10.458,8.861,10.391,8.802z";

    var globeHover = globeIcon.states.create("hover");
    globeHover.properties.fill = hoverColor;

    var label = labelContainer.createChild(am4core.Label);
    label.valign = "bottom";
    label.verticalCenter = "bottom";
    label.dy = -5;
    label.text = "Back to continents map";
    label.states.create("hover").properties.fill = hoverColor;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.filePrefix = "Sommelier_Map";


    return chartData2;
}

fetch('http://127.0.0.1:5000/continent_data')
    .then(res => res.json())
    .then((out) => {
        generateChartData2(out);

    })

function generatewineleveldata(data, continent) {

    wine_level_chart = am4core.create("bardiv", am4charts.XYChart3D);

    var div = document.getElementById('treemapheader');

    if (data.length == 0) {
        div.style.height = '50px';
        div.textContent = continent.charAt(0).toUpperCase() + continent.substring(1).toLowerCase() + " has no wine-level distribution";

    } else {
        div.style.height = '50px';
        div.textContent = continent + " - Wine-level";

    }

    wine_level_chart.data = data;


    var level_array = [];
    var country_array = [];
    var price_array = [];
    var points_array = [];
    for (var i = 0; i < data.length; i++) {
        level_array[i] = data[i].Wine_Level;
        country_array[i] = data[i].Country;
        price_array[i] = data[i].Price;
        points_array[i] = data[i].Points;
    }

    wine_level_max = Math.max(...level_array);
    let k = level_array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    wine_level_continent = continent;
    wine_level_country = country_array[k];
    wine_level_points = points_array[k];
    wine_level_price = price_array[k];


    var categoryAxis = wine_level_chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "Country_Code";
    categoryAxis.renderer.minGridDistance = 5;
    categoryAxis.renderer.inside = true;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.baseGrid.disabled = true;
    categoryAxis.renderer.labels.template.dy = 20;

    var valueAxis = wine_level_chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.baseGrid.disabled = true;
    valueAxis.renderer.labels.template.disabled = false;
    valueAxis.renderer.minWidth = 0;
    valueAxis.renderer.minGridDistance = 20;

    var series = wine_level_chart.series.push(new am4charts.ConeSeries());
    series.dataFields.categoryX = "Country_Code";
    series.dataFields.valueY = "Wine_Level";
    series.columns.template.tooltipText = "Country : {Country} \n Points:{Points} \n Price:{Price} \n Wine Level:{Wine_Level}";
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 1;
    let labelTemplate = categoryAxis.renderer.labels.template;
    if (continent != 'Europe') {
        labelTemplate.rotation = -90;
        labelTemplate.horizontalCenter = "left";
        labelTemplate.verticalCenter = "middle";
        labelTemplate.dy = 10; // moves it a bit down;
        // labelTemplate.fontsize= 10;
        labelTemplate.tooltipText = "Country : {Country} \n Points:{Points} \n Price:{Price} \n Wine Level:{Wine_Level}";
        labelTemplate.inside = false; // this is done to avoid settings which are not suitable when label is rotated
    } else {
        labelTemplate.disabled = true;
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{Country_Code}";
        valueLabel.label.fontSize = 10;
        valueLabel.rotation = -45;
        valueLabel.label.truncate = false;
        valueLabel.label.hideOversized = false;
        valueLabel.label.horizontalCenter = "left";
        valueLabel.tooltipText = "Country : {Country} \n Points:{Points} \n Price:{Price} \n Wine Level:{Wine_Level}";
    }
// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
        return wine_level_chart.colors.getIndex(target.dataItem.index);
    });

    series.columns.template.adapter.add("stroke", function (stroke, target) {
        return wine_level_chart.colors.getIndex(target.dataItem.index);
    });
    wine_level_chart.exporting.menu = new am4core.ExportMenu();
    wine_level_chart.exporting.filePrefix = "Sommelier_data";
    wine_level_chart.exporting.timeoutDelay = 5000;
    wine_level_chart.exporting.extraSprites.push({
        "marginTop": 200,
        "position": "bottom",
        "sprite": chart
    });

    wine_level_chart.exporting.adapter.add("pdfmakeDocument", function (pdf, target) {

        pdf.doc.content.unshift({
            text: "Wine level, World map and Province distributions",
            margin: [0, 30],
            style: {
                fontSize: 20,
                bold: true,
            }
        });

        // Add logo
        pdf.doc.content.unshift({
            image: "data:image/png;base64,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", // actual content removed
            fit: [119, 54]
        });

        pdf.doc.content.push({
            text: "Some Facts about the charts: ",
            margin: [0, 10],
            style: 'subheader'
        });

        pdf.doc.content.push({
            text: "Selected continent is " + continent + ".Country with highest wine level(points/price) of " + wine_level_max + " is "
                + wine_level_country + ". This country has average points of " + wine_level_points +
                ". Average price of wine in " + wine_level_country + " is " + wine_level_price,
            margin: [0, 10],
            style: {
                fontSize: 12
            }
        });

        pdf.doc.content.push({
            text: "Selected country is " + treemap_country + ".Province in this country producing most number of wines is "
                + treemap_province + ". With total " + treemap_wines + " number of wines, this province has average points of " + treemap_points +
                ". Average price of wine in " + treemap_province + " is " + treemap_price,
            margin: [0, 10],
            style: {
                fontSize: 12
            }
        });

        return pdf;
    });
}

function prepare_wineleveldata(continent) {

    fetch('http://127.0.0.1:5000/winelevel_data?continent=' + continent)
        .then(res => res.json())
        .then((out) => {
            generatewineleveldata(out, continent);
        })
}

function generateProvinceChartData2(data, country) {

    var wines_array = [];
    var province_array = [];
    var price_array = [];
    var points_array = [];
    for (var i = 0; i < data.length; i++) {
        wines_array[i] = data[i].value;
        province_array[i] = data[i].children[0].name;
        price_array[i] = data[i].avg_price;
        points_array[i] = data[i].avg_points;
    }

    treemap_wines = Math.max(...wines_array);
    let k = wines_array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    treemap_province = province_array[k];
    treemap_points = points_array[k];
    treemap_price = price_array[k];
    treemap_country = country;

// create chart
    treechart = am4core.create("chartdiv", am4charts.TreeMap);

    var div = document.getElementById('cardheader');

    var label = treechart.chartContainer.createChild(am4core.Label);
//label.isMeasured = false; //uncomment to make the label not adjust the rest of the chart elements to accommodate its placement

    if (data.length == 0) {
        div.style.height = '50px';
        div.textContent = country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " has no province distribution";

    } else {
        div.style.height = '50px';
        div.textContent = country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " distribution across provinces";

    }
    treechart.data = data;

    // chart.colors.step = 2;

// define data fields
    treechart.dataFields.value = "value";
    treechart.dataFields.name = "name";
    treechart.dataFields.children = "children";
    treechart.dataFields.color = "color";

    treechart.zoomable = true;

// level 0 series template
    var level0SeriesTemplate = treechart.seriesTemplates.create("0");
    var level0ColumnTemplate = level0SeriesTemplate.columns.template;

    level0ColumnTemplate.column.cornerRadius(10, 10, 10, 10);
    level0ColumnTemplate.fillOpacity = 0;
    level0ColumnTemplate.strokeWidth = 4;
    level0ColumnTemplate.strokeOpacity = 0;

// level 1 series template
    var level1SeriesTemplate = treechart.seriesTemplates.create("1");
    var level1ColumnTemplate = level1SeriesTemplate.columns.template;

    level1SeriesTemplate.tooltip.animationDuration = 0;
    level1SeriesTemplate.strokeOpacity = 1;
    level1ColumnTemplate.tooltipText = "{name}- Wines:{value} Average price: {avg_price}\n Average Points: {avg_points}";

    level1ColumnTemplate.column.cornerRadius(10, 10, 10, 10)
    level1ColumnTemplate.fillOpacity = 1;
    level1ColumnTemplate.strokeWidth = 4;
    level1ColumnTemplate.stroke = am4core.color("#ffffff");


    var bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
    bullet1.locationY = 0.5;
    bullet1.locationX = 0.5;
    bullet1.label.text = "{name}";
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.tooltipText = "{name}- Wines:{value} Average price: {avg_price}\n Average Points: {avg_points}";
    treechart.exporting.menu = new am4core.ExportMenu();
    treechart.exporting.filePrefix = "Sommelier_TreeChart";
    treechart.maxLevels = 2;
    // drilldowntreemap('');
}

function processData(data) {
    var treeData = [];

    var smallBrands = {name: "Other", children: []};

    for (var province in data) {
        var provinceData = {
            name: province,
            children: [],
            p_wine_cnt: data[province].p_wine_cnt,
            count: data[province].p_wine_cnt,
            avg_points: data[province].p_avg_points,
            avg_price: data[province].p_avg_price
        }
        var brandTotal = 0;
        // for (var model in data[province]) {
        brandTotal += data[province].p_wine_cnt;
        // }

        for (var wine in data[province].wines) {
            provinceData.children.push({
                name: data[province].wines[wine].variety,
                count: data[province].wines[wine].wine_cnt,
                max_wine_level: data[province].wines[wine].max_wine_level,
                v_avg_points: data[province].wines[wine].v_avg_points,
                v_avg_price: data[province].wines[wine].v_avg_price,
                v_best_wine: data[province].wines[wine].v_best_wine
            });
        }

        // add to small brands if total number less than
        if (brandTotal > 20) {
            treeData.push(provinceData);
        } else {
            smallBrands.children.push(provinceData)
        }

    }
    if (smallBrands.children.length !== 0) {
        treeData.push(smallBrands);
    }
    return treeData;
}

function drilldowntreemap(data, country) {
    am4core.ready(function () {

// Themes begin
        am4core.useTheme(am4themes_animated);
// Themes end


        // create chart
        treechart = am4core.create("drilldowntree", am4charts.TreeMap);
        treechart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        // only one level visible initially
        treechart.maxLevels = 1;
        // define data fields
        treechart.dataFields.value = "count";
        treechart.dataFields.name = "name";
        treechart.dataFields.children = "children";
        // chart.homeText = "US Car Sales 2017";

        // enable navigation
        treechart.navigationBar = new am4charts.NavigationBar();

        // level 0 series template
        var level0SeriesTemplate = treechart.seriesTemplates.create("0");
        level0SeriesTemplate.strokeWidth = 2;

        var bullet4 = level0SeriesTemplate.bullets.push(new am4charts.LabelBullet());
        bullet4.locationX = 0.5;
        bullet4.locationY = 0.5;
        bullet4.label.text = "{name}";
        bullet4.label.fill = am4core.color("#ffffff");
        bullet4.tooltipText = "{name}- Wines:{p_wine_cnt} Average price: {avg_price}\n Average Points: {avg_points}";


        // by default only current level series bullets are visible, but as we need brand bullets to be visible all the time, we modify it's hidden state
        // level0SeriesTemplate.bulletsContainer.hiddenState.properties.opacity = 1;
        // level0SeriesTemplate.bulletsContainer.hiddenState.properties.visible = true;

        // create hover state
        var columnTemplate = level0SeriesTemplate.columns.template;
        var hoverState = columnTemplate.states.create("hover");
        columnTemplate.column.cornerRadius(10, 10, 10, 10);
        columnTemplate.tooltipText = "{name}- Wines:{p_wine_cnt} Average price: {avg_price}\n Average Points: {avg_points}";


        // darken
        hoverState.adapter.add("fill", function (fill, target) {
            if (fill instanceof am4core.Color) {
                return am4core.color(am4core.colors.brighten(fill.rgb, -0.2));
            }
            return fill;
        })

        // level1 series template
        var level1SeriesTemplate = treechart.seriesTemplates.create("1");
        level1SeriesTemplate.columns.template.fillOpacity = 0;
        level1SeriesTemplate.columns.template.tooltipText = "{name}- Wines:{value} Average price: " +
            "{v_avg_price}\n Average Points: {v_avg_points} Best wine level: {max_wine_level}" +
            "\n Best Wine:{v_best_wine}";

        var bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
        bullet1.locationX = 0.5;
        bullet1.locationY = 0.5;
        bullet1.label.text = "{name}";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.tooltipText = "{name}- Wines:{value} Average price: {v_avg_price}\n Average Points: {v_avg_points}" +
            "\n Best Wine:{v_best_wine}";


        // level2 series template
        var level2SeriesTemplate = treechart.seriesTemplates.create("2");
        level2SeriesTemplate.columns.template.fillOpacity = 0;
        level2SeriesTemplate.columns.template.column.cornerRadius(10, 10, 10, 10);


        var bullet2 = level2SeriesTemplate.bullets.push(new am4charts.LabelBullet());
        bullet2.locationX = 0.5;
        bullet2.locationY = 0.5;
        bullet2.label.text = "{name}";
        bullet2.label.fill = am4core.color("#ffffff");

        let treechartdata = processData(data);
        treechart.data = treechartdata;

        var wines_array = [];
        var province_array = [];
        var price_array = [];
        var points_array = [];
        for (var i = 0; i < treechartdata.length; i++) {
            wines_array[i] = treechartdata[i].p_wine_cnt;
            province_array[i] = treechartdata[i].name;
            price_array[i] = treechartdata[i].avg_price;
            points_array[i] = treechartdata[i].avg_points;
        }

        treemap_wines = Math.max(...wines_array);
        let k = wines_array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        treemap_province = province_array[k];
        treemap_points = points_array[k];
        treemap_price = price_array[k];
        treemap_country = country;

        var div = document.getElementById('drilldownheader');
        if (treechartdata.length === 0) {
            div.style.height = '50px';
            div.textContent = country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " has no province distribution";

        } else {
            div.style.height = '50px';
            div.textContent = country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " distribution across provinces";

        }

        treechart.exporting.menu = new am4core.ExportMenu();
        treechart.exporting.filePrefix = "Sommelier_TreeChart";

    }); // end am4core.ready()
}

function prepare_treemap(country) {

    // fetch('http://127.0.0.1:5000/province_data?country=' + country)
    //     .then(res => res.json())
    //     .then((out) => {
    //         generateProvinceChartData2(out, country);
    //     })

    fetch('http://127.0.0.1:5000/provincedrill_data?country=' + country)
        .then(res => res.json())
        .then((out) => {
            drilldowntreemap(out, country);
        })
}

function saveFile() {
    wine_level_chart.exporting.extraSprites.push({
        "marginTop": 200,
        "position": "bottom",
        "sprite": treechart
    });
    wine_level_chart.exporting.export("pdf");
}