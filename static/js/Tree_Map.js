am4core.useTheme(am4themes_animated);

function generateProvinceChartData2(data,country) {
// create chart
    var chart = am4core.create("chartdiv", am4charts.TreeMap);

   var div= document.getElementById('cardheader');

    var label = chart.chartContainer.createChild(am4core.Label);
//label.isMeasured = false; //uncomment to make the label not adjust the rest of the chart elements to accommodate its placement

    if(data.length==0){
        div.style.height= '50px';
        div.textContent= country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " has no province distribution";

    }else {
        div.style.height= '50px';
        div.textContent= country.charAt(0).toUpperCase() + country.substring(1).toLowerCase() + " distribution across provinces";

    }
    chart.data = data;

       // chart.colors.step = 2;

// define data fields
    chart.dataFields.value = "value";
    chart.dataFields.name = "name";
    chart.dataFields.children = "children";
    chart.dataFields.color = "color";

    chart.zoomable = false;

// level 0 series template
    var level0SeriesTemplate = chart.seriesTemplates.create("0");
    var level0ColumnTemplate = level0SeriesTemplate.columns.template;

    level0ColumnTemplate.column.cornerRadius(10, 10, 10, 10);
    level0ColumnTemplate.fillOpacity = 0;
    level0ColumnTemplate.strokeWidth = 4;
    level0ColumnTemplate.strokeOpacity = 0;

// level 1 series template
    var level1SeriesTemplate = chart.seriesTemplates.create("1");
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

    chart.maxLevels = 2;

}

function prepare_treemap(country) {

    fetch('http://127.0.0.1:5000/province_data?country=' + country)
        .then(res => res.json())
        .then((out) => {
            generateProvinceChartData2(out, country);
        })
}