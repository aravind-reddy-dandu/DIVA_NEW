am4core.useTheme(am4themes_animated);

function generateVarietyWineChartData(data, variety, color) {

    var chart = am4core.create("simpleColumndiv", am4charts.XYChart);

    chart.colors.saturation = 0.4;

    var r = color.match(/\(([^)]+)\)/)[1].split(',')[0].trim();
    var g = color.match(/\(([^)]+)\)/)[1].split(',')[1].trim();
    var b = color.match(/\(([^)]+)\)/)[1].split(',')[2].trim();

    var hexcolor = fullColorHex(r, g, b);
    chart.data = data;


    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "title";
    categoryAxis.renderer.minGridDistance = 20;

    categoryAxis.renderer.labels.template.disabled = true;
    categoryAxis.title.text = "Popular " + variety + " wines";

    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.maxLabelPosition = 0.98;
    valueAxis.title.text = "Wine Level";
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "title";
    series.dataFields.valueX = "level";
    series.tooltipText = "Wine Level:{valueX.value} Price:{price}\n Points:{points}";
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 3000;
    series.sequencedInterpolationDelay = 10;
    series.columns.template.strokeOpacity = 0;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panY";

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