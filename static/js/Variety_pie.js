am4core.useTheme(am4themes_animated);

var pieSeries;
var pie_chart;
var picture_chart;
var simple_barchart;
var word_cloudchart;

function generateVarietiesChartData(data) {

    callVarietychart('Riesling',"rgb(199, 103, 220)");
    callVarietyWinechart('Riesling',"rgb(199, 103, 220)");
    callVarietywordcloudchart('Riesling',"rgb(199, 103, 220)");
    pie_chart = am4core.create("variety_piediv", am4charts.PieChart3D);
    let total = 0;
    for (var i = 0; i < data.length; i++) {
        total = total + data[i].count;
    }
    // chart.legend = new am4charts.Legend();

    pie_chart.data = data;

    pie_chart.innerRadius = am4core.percent(40);
    pieSeries = pie_chart.series.push(new am4charts.PieSeries3D());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "variety";
    pieSeries.labels.template.paddingTop = 0;
    pieSeries.labels.template.paddingBottom = 0;
    pieSeries.labels.template.fontSize = 12;
    pieSeries.hiddenState.properties.endAngle = -90;


    let grouper = pieSeries.plugins.push(new am4plugins_sliceGrouper.SliceGrouper());
    grouper.threshold = 2;
    grouper.groupName = "Other";
    grouper.clickBehavior = "zoom";

    let label = pieSeries.createChild(am4core.Label);
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.fontSize = 30;
    label.text = "Varieties:"+ data.length + "\nWines:{values.value.sum}";

    // pieSeries.slices.template.events.on("hit", function (ev) {
    //     let name = ev.target.dataItem.dataContext.variety;
    // });

    // pieSeries.slices.template.events.on("hit", function (ev) {
    //     let series = ev.target.dataItem.component;
    //     let name = ev.target.dataItem.dataContext.variety;
    //     if(name == 'Other'){
    //         this._super(ev);
    //     }
    //     series.slices.each(function (item) {
    //         if (item.isActive && item != ev.target) {
    //             item.isActive = false;
    //         }
    //     })
    // });


    pieSeries.slices.template.tooltipText = "{category}- Wines: {value.value} \n " +
        "{value.percent.formatNumber('#.0')}%";

    // pieSeries.labels.template.disabled = true;

    pie_chart.events.on("ready", function (event) {
        // populate our custom legend when chart renders
        pie_chart.customLegend = document.getElementById('legend');
        pieSeries.dataItems.each(function (row, i) {
            var color = pie_chart.colors.getIndex(i);

            var value = row.value;
            var localname = row.category;
            var percentTemp = (value / total) * 100;
            var percent = Math.round(percentTemp * 100) / 100;
            legend.innerHTML += '<div class="legend-item" id="legend-item-' + i +
                '" onclick="toggleSlice(' + i + ');" onmouseover="hoverSlice(' + i + ');" ' +
                'onmouseout="blurSlice(' + i + ');" style="color: ' + color + ';"><div class="legend-marker"' +
                ' style="background: ' + color + '"></div>' + row.category + '<div class="legend-value">'
                + value + ' | ' + percent + '%</div></div>';
        });
    });


}


function toggleSlice(item) {
    var count = document.getElementsByClassName('legend-item').length;
    var slice = pieSeries.dataItems.getIndex(item);
    var element = document.getElementById('legend-item-' + item);
    if (!element.disabled) {
        slice.show();
        for (let i = 0; i < count; i++) {
            document.getElementById('legend-item-' + i).style.opacity='1';
            document.getElementById('legend-item-' + i).style.background='';
            document.getElementById('legend-item-' + i).disabled= false;
        }
        element.style.opacity = '0.5'
        element.style.background = '#ddd'
        element.disabled = true;
    } else {
        slice.show();
        element.style.opacity = '1'
        element.style.background = ''
        element.disabled = false;
    }
    callVarietychart(slice.dataContext.variety,element.style.color);
    callVarietyWinechart(slice.dataContext.variety,element.style.color);
    callVarietywordcloudchart(slice.dataContext.variety,element.style.color);
}

function hoverSlice(item) {
    var slice = pieSeries.slices.getIndex(item);
    slice.isHover = true;
}

function myFunction() {
  // alert('Hello');
}

function blurSlice(item) {
    var slice = pieSeries.slices.getIndex(item);
    slice.isHover = false;
}


fetch('http://127.0.0.1:5000/varieties_data')
    .then(res => res.json())
    .then((out) => {
        generateVarietiesChartData(out);
    })


var slider;
var blurFilter;
var series;

var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

var fullColorHex = function (r, g, b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red + green + blue;
};

function generateVarietyChartData(data, variety, color) {

    var r = color.match(/\(([^)]+)\)/)[1].split(',')[0].trim();
    var g = color.match(/\(([^)]+)\)/)[1].split(',')[1].trim();
    var b = color.match(/\(([^)]+)\)/)[1].split(',')[2].trim();

    var hexcolor = fullColorHex(r, g, b);

    var iconPath = "M256.814,72.75c0-26.898-10.451-52.213-29.43-71.277C226.444,0.529,225.17,0,223.84,0H87.712c-1.329,0-2.604,0.529-3.543,1.473c-18.978,19.064-29.43,44.379-29.43,71.277c0,50.615,37.414,92.654,86.037,99.922v108.88h-21.25c-8.271,0-15,6.729-15,15c0,8.271,6.729,15,15,15h72.5c8.271,0,15-6.729,15-15c0-8.271-6.729-15-15-15h-21.25v-108.88C219.399,165.404,256.814,123.365,256.814,72.75z M106.709,120.879c-1.234,1.083-2.765,1.615-4.285,1.615c-1.807,0-3.604-0.748-4.888-2.212c-13.153-14.986-18.888-34.832-15.733-54.451c0.571-3.543,3.902-5.956,7.45-5.385c3.544,0.57,5.955,3.905,5.386,7.45c-2.538,15.779,2.079,31.747,12.667,43.811C109.674,114.404,109.406,118.511,106.709,120.879z M144.351,136.662c-0.514,3.194-3.274,5.468-6.409,5.468c-0.343,0-0.69-0.027-1.041-0.083c-6.937-1.117-13.6-3.299-19.804-6.488c-3.193-1.641-4.451-5.559-2.811-8.752c1.641-3.194,5.563-4.451,8.752-2.81c4.985,2.562,10.345,4.317,15.929,5.215C142.511,129.782,144.922,133.118,144.351,136.662z";

    picture_chart = am4core.create("picturediv", am4charts.SlicedChart);
    picture_chart.paddingTop = am4core.percent(10);
    var length = data.length;
    if (length > 10) {
        length = length - 10;
    }
    var shadesar = [];
    new Values('#' + hexcolor).tints(Math.round(100 / length)).forEach((c) => {
        shadesar.push(c.hex);
    });

    // const steps = 5;
    // const from = new ColorTranslator("#390511");
    // const to = new ColorTranslator(from.HEX).setL(from.L + steps);
    //
    // const shades = ColorTranslator.blendHEX(from.HEX, to.HEX, steps);

    // shades.forEach((c) => {
    //     shadesar.push(c);
    // });

    var chartData2 = [];

    for (var i = 0; i < data.length; i++) {
        var tempcolor = shadesar[i];
        if (shadesar[i] == null) {
            chartData2.push({
                country_name: data[i].country_name,
                count: data[i].count,
            });
        } else {
            chartData2.push({
                country_name: data[i].country_name,
                count: data[i].count,
                color: "#" + tempcolor
            });
        }
    }

    if (variety == 'Chardonnay' || variety == 'Cabernet Sauvignon' || variety == 'Red Blend') {
        picture_chart.data = data;
    } else {
        picture_chart.data = chartData2;
    }


    series = picture_chart.series.push(new am4charts.PictorialStackedSeries());
    series.dataFields.value = "count";
    series.dataFields.category = "country_name";
    series.startLocation = 0.3
    series.endLocation = 0.85

    let grouper = series.plugins.push(new am4plugins_sliceGrouper.SliceGrouper());
    grouper.threshold = 2;
    grouper.groupName = "Other";
    grouper.clickBehavior = "zoom";

    series.slicesContainer.background.fill = am4core.color("#676767")
    series.slicesContainer.background.fillOpacity = 0.2;

    series.maskSprite.path = iconPath;

    series.labelsContainer.width = am4core.percent(100);
    series.alignLabels = true;
    series.slices.template.propertyFields.fill = "color";
    series.slices.template.propertyFields.stroke = "color";

    var gradientModifier = new am4core.LinearGradientModifier();
    gradientModifier.lightnesses = [0.2, -0.7];
    series.slices.template.fillModifier = gradientModifier;
    series.slices.template.strokeModifier = gradientModifier;

// this makes the fills to start and end at certain location instead of taking whole picture
    series.endLocation = 0.553;
    series.startLocation = 0.1;
// this makes initial fill animation
    series.hiddenState.properties.startLocation = 0.553;
    series.ticks.template.locationX = 0.7;
    // series.labelsContainer.width = 120;

    // slider = chart.createChild(am4core.Slider);
    // slider.orientation = "vertical";
    // slider.height = 300;
    // slider.x = am4core.percent(10);
    // slider.y = am4core.percent(50);
    // slider.verticalCenter = "middle";
    // slider.isMeasured = false;
    // slider.start = 0;
    // slider.background.fill = am4core.color("#676767");
    // slider.background.fillOpacity = 0.2;

    var sliderContainer = picture_chart.createChild(am4core.Container);
    sliderContainer.marginTop = am4core.percent(5);
    sliderContainer.width = am4core.percent(80);
    sliderContainer.align = "center";
    // sliderContainer.paddingRight = 120;


    var label = sliderContainer.createChild(am4core.Label);
    label.text = "Drink it!";
    label.dy = -40;
    label.isMeasured = false;

    slider = sliderContainer.createChild(am4core.Slider);
    slider.start = 0;
    slider.background.fill = am4core.color("#676767");
    slider.background.fillOpacity = 0.2;

// doing it later for animation to finish
    setTimeout(initSlider, 1500);


    // var label = chart.createChild(am4core.Label);
    // label.text = "move me!";
    // label.x = am4core.percent(10);
    // label.dx = -20;
    // label.rotation = -90;
    // label.verticalCenter = "middle";
    // label.horizontalCenter = "middle";
    // label.y = am4core.percent(50);
    // label.isMeasured = false;

   // var title = chart.createChild(am4core.Label);
  /*  title.text = "Countries producing " + variety + " wine"
    title.fontSize = 20;
    title.fill = am4core.color("#390511");
    title.isMeasured = false;
    title.x = am4core.percent(100);
    title.horizontalCenter = "right";
    title.fontWeight = "600";*/
   var div= document.getElementById('pictureheader');
   div.textContent= "Countries producing " + variety + " variety";

    blurFilter = new am4core.BlurFilter();
    blurFilter.blur = 0;
    //title.filters.push(blurFilter);

}

function initSlider() {
    slider.events.on("rangechanged", function () {
        series.startLocation = 0.1 + (0.553 - 0.1) * slider.start;
        series.dataItems.getIndex(0).value = (1 - slider.start) * 200;
        slider.background.fill = new am4core.Color(am4core.colors.interpolate(am4core.color("#676767").rgb, am4core.color("#7b131c").rgb, slider.start));
        slider.background.fillOpacity = 0.2 + slider.start * 0.8;

        blurFilter.blur = slider.start * 5;
    })
}

function callVarietychart(variety, color) {
    fetch('http://127.0.0.1:5000/variety_data?variety=' + variety)
        .then(res => res.json())
        .then((out) => {
            generateVarietyChartData(out, variety, color);
        })
}

function generateVarietyWineChartData(data, variety, color) {

    simple_barchart = am4core.create("simpleColumndiv", am4charts.XYChart);

    simple_barchart.colors.saturation = 0.4;

    var r = color.match(/\(([^)]+)\)/)[1].split(',')[0].trim();
    var g = color.match(/\(([^)]+)\)/)[1].split(',')[1].trim();
    var b = color.match(/\(([^)]+)\)/)[1].split(',')[2].trim();

    var hexcolor = fullColorHex(r, g, b);
    simple_barchart.data = data;


    var categoryAxis = simple_barchart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "title";
    categoryAxis.renderer.minGridDistance = 20;

    categoryAxis.renderer.labels.template.disabled = true;
    categoryAxis.title.text = "Best " + variety + " wines";

    var div= document.getElementById('barcardheader');
   div.textContent= "Best " + variety + " wines";

    var valueAxis = simple_barchart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.maxLabelPosition = 0.98;
    valueAxis.title.text = "Wine Level";
    valueAxis.renderer.minGridDistance = 40;

    var series = simple_barchart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "title";
    series.dataFields.valueX = "level";
    series.tooltipText = "Wine Level:{valueX.value} Price:{price}\n Points:{points}";
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 3000;
    series.sequencedInterpolationDelay = 10;
    series.columns.template.strokeOpacity = 0;

    simple_barchart.cursor = new am4charts.XYCursor();
    simple_barchart.cursor.behavior = "panY";

    series.columns.template.adapter.add("fill", function (fill, target) {
        return am4core.color("#"+hexcolor);
    });
    // chart.colors.list = [
    //     am4core.color("#845EC2")
    // ];

// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
// 	series.columns.template.adapter.add("fill", function (fill, target) {
// 		return chart.colors.getIndex(target.dataItem.index);
// 	});

}

function callVarietyWinechart(variety, color) {
    fetch('http://127.0.0.1:5000/variety_wine_data?variety=' + variety)
        .then(res => res.json())
        .then((out) => {
            generateVarietyWineChartData(out, variety, color);
        })
}

function generateVarietywordcloudchartData(data, variety, color) {

    var r = color.match(/\(([^)]+)\)/)[1].split(',')[0].trim();
    var g = color.match(/\(([^)]+)\)/)[1].split(',')[1].trim();
    var b = color.match(/\(([^)]+)\)/)[1].split(',')[2].trim();

    var hexcolor = fullColorHex(r, g, b);
    am4core.useTheme(am4themes_animated);
    word_cloudchart = am4core.create("varietywordclouddiv", am4plugins_wordCloud.WordCloud);
    var series = word_cloudchart.series.push(new am4plugins_wordCloud.WordCloudSeries());

    series.accuracy = 4;
    series.step = 15;
    series.rotationThreshold = 0.7;
    series.maxCount = 200;
    series.minWordLength = 2;
    series.labels.template.margin(4, 4, 4, 4);
    series.labels.template.fill = am4core.color("#"+hexcolor);
    series.text = data[0].desc;
    var div= document.getElementById('wordcloudcardheader');
   div.textContent= "Word cloud for " + variety + " variety";

    // series.colors = new am4core.ColorSet();
    // series.colors.passOptions = {}; // makes it loop
//series.labelsContainer.rotation = -45;
    series.fontWeight = "300";

    series.maxFontSize = am4core.percent(30);

    word_cloudchart.exporting.menu = new am4core.ExportMenu();
    word_cloudchart.exporting.filePrefix = "Sommelier_data"
    word_cloudchart.exporting.extraSprites.push({
        "marginTop": 200,
        "position": "bottom",
        "sprite": pie_chart
    });
    word_cloudchart.exporting.extraSprites.push({
        "marginTop": 200,
        "position": "bottom",
        "sprite": picture_chart
    });
    word_cloudchart.exporting.extraSprites.push({
        "marginTop": 200,
        "position": "bottom",
        "sprite": simple_barchart
    });

    // setInterval(function () {
    //     series.dataItems.getIndex(Math.round(Math.random() * (series.dataItems.length - 1))).setValue("value", Math.round(Math.random() * 10));
    // }, 6000)

}

function callVarietywordcloudchart(variety, color) {
    fetch('http://127.0.0.1:5000/variety_wordcloud_data?variety=' + variety)
        .then(res => res.json())
        .then((out) => {
            generateVarietywordcloudchartData(out, variety, color);
        })
}

function saveFile() {
    word_cloudchart.exporting.export("pdf");
}