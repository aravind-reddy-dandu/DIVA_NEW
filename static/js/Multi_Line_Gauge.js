var gaugeChart;
var hand1;
var hand2;
var hand3;

function createAxis(min, max, start, end, color) {
    var axis = gaugeChart.xAxes.push(new am4charts.ValueAxis());
    axis.min = min;
    axis.max = max;
    axis.strictMinMax = true;
    axis.renderer.useChartAngles = false;
    axis.renderer.startAngle = start;
    axis.renderer.endAngle = end;
    axis.renderer.minGridDistance = 100;

    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.line.strokeWidth = 10;
    axis.renderer.line.stroke = am4core.color(color);

    axis.renderer.ticks.template.disabled = false;
    axis.renderer.ticks.template.stroke = am4core.color(color);
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.ticks.template.length = 10;

    return axis;
}

function createHand(axis) {
    var hand = gaugeChart.hands.push(new am4charts.ClockHand());
    hand.fill = axis.renderer.line.stroke;
    hand.stroke = axis.renderer.line.stroke;
    hand.axis = axis;
    hand.pin.disabled = true;
    hand.startWidth = 10;
    hand.endWidth = 0;
    hand.radius = am4core.percent(90);
    hand.innerRadius = am4core.percent(70);
    hand.value = 0;
    if (axis.min == 5) {
        hand.tooltipText = "Price- {value}";
    } else if (axis.min == 0) {
        hand.tooltipText = "Wine count- {value}";
    } else if (axis.min == 80) {
        hand.tooltipText = "Points- {value}";
    }

    // hand.tooltipPosition = "fixed";
    return hand;
}

function makeGaugeChart(data) {


    am4core.ready(function () {

// Themes begin
        am4core.useTheme(am4themes_animated);
// Themes end

// create chart
        gaugeChart = am4core.create("multigaugediv", am4charts.GaugeChart);
        gaugeChart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        gaugeChart.startAngle = 0;
        gaugeChart.endAngle = 360;


        var axis1 = createAxis(5, 150, -85, 25, "#EF6F6C");//-90,0 -90,30
        var axis2 = createAxis(80, 100, 35, 145, "#426A5A");//0,90  30,150
        var axis3 = createAxis(0, 100, 155, 265, "#7FB685");//90,180 150,270
// var axis4 = createAxis(0, 100, 185, 265, "#DDAE7E");//180,270

        hand1 = createHand(axis1);
        hand2 = createHand(axis2);
        hand3 = createHand(axis3);
// var hand4 = createHand(axis4);

        var legend = new am4charts.Legend();
        legend.isMeasured = false;
        legend.y = am4core.percent(100);
        legend.verticalCenter = "bottom";
        legend.parent = gaugeChart.chartContainer;
        legend.data = [{
            "name": "Price",
            "fill": am4core.color("#EF6F6C")
        }, {
            "name": "Points",
            "fill": am4core.color("#426A5A")
        }, {
            "name": "Wine count",
            "fill": am4core.color("#7FB685")
        }];

        legend.position = "right";

        // setInterval(function () {
        //     hand1.showValue(Math.random() * hand1.axis.max, 1000, am4core.ease.cubicOut);
        //     hand2.showValue(Math.random() * hand2.axis.max, 1000, am4core.ease.cubicOut);
        //     hand3.showValue(Math.random() * hand3.axis.max, 1000, am4core.ease.cubicOut);
        //     // hand4.showValue(Math.random() * hand4.axis.max, 1000, am4core.ease.cubicOut);
        // }, 2000);

        hand1.showValue(data['avg_price']);
        hand2.showValue(data['avg_points']);
        hand3.showValue(data['wine_cnt']);

    }); // end am4core.ready()

}

function setValues(data) {
    gaugeChart = '';
    am4core.disposeAllCharts();
    disposeCharts('multigaugediv');
    var div = document.getElementById('cardheader');
    document.getElementById('multigaugediv').innerHTML = "";
    div.textContent = "Average Values of " + data['winery_name'] + " winery";
    if (Object.keys(data).length == 0) {
        data = {avg_price: 0, avg_points: 80, wine_cnt: 0};
    }
    if (data['avg_price'] > 150) {
        data['avg_price'] = 150;
    }
    if (data['wine_cnt'] > 100) {
        data['wine_cnt'] = 100;
    }
    // hand1.showValue(data['avg_price']);
    // hand2.showValue(data['avg_points']);
    // hand3.showValue(data['wine_cnt']);
    // hand1.value=data['avg_price'];
    // hand2.value=data['avg_points'];
    // hand3.value=data['wine_cnt'];
    // hand1.deepInvalidate();
    // gaugeChart.deepInvalidate();
    makeGaugeChart(data);
}

function disposeCharts(id) {
    let charts = am4core.registry.baseSprites;
    for (let i = 0; i < charts.length; i++) {
        // if (charts[i].svgContainer.htmlElement.id === id) {
        charts[i].dispose();
        // }
    }
}

// initdata = {avg_price: 5, avg_points: 80, wine_cnt: 0};
// makeGaugeChart(initdata);
