am4core.useTheme(am4themes_animated);

function generatewineleveldata(data, chart) {

    // var chart = am4core.create("bardiv", am4charts.XYChart);
    chart.data = data;

    //chart.colors.step = 2;
    chart.colors.saturation = 0.4;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "Country";
    // categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.adapter.add("dy", function (dy, target) {
        if (target.dataItem && target.dataItem.index & 2 == 2) {
            return dy + 25;
        }
        return dy;
    });
    // categoryAxis.dataFields.var
    valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.maxLabelPosition = 0.98;

    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "Country";
    series.dataFields.valueY = "Wine Level";
    series.tooltipText = "{valueY.value}";
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 1000;
    series.sequencedInterpolationDelay = 100;
    series.columns.template.strokeOpacity = 0;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panY";
    chart.exporting.menu = new am4core.ExportMenu();


// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });

}

function prepare_wineleveldata(continent, barchart) {

    fetch('http://127.0.0.1:5000/winelevel_data?continent=' + continent)
        .then(res => res.json())
        .then((out) => {
            generatewineleveldata(out, barchart);
        })
}

