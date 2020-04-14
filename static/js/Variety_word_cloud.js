function generateVarietywordcloudchartData(data, variety, color) {

    var r = color.match(/\(([^)]+)\)/)[1].split(',')[0].trim();
    var g = color.match(/\(([^)]+)\)/)[1].split(',')[1].trim();
    var b = color.match(/\(([^)]+)\)/)[1].split(',')[2].trim();

    var hexcolor = fullColorHex(r, g, b);
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create("varietywordclouddiv", am4plugins_wordCloud.WordCloud);
    var series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());

    series.accuracy = 4;
    series.step = 15;
    series.rotationThreshold = 0.7;
    series.maxCount = 200;
    series.minWordLength = 2;
    series.labels.template.margin(4, 4, 4, 4);
    // series.labels.template.fill = am4core.color("#"+hexcolor);
    series.text = data[0].desc;

    series.colors = new am4core.ColorSet();
    series.colors.passOptions = {}; // makes it loop
//series.labelsContainer.rotation = -45;
    series.fontWeight = "600";

    series.maxFontSize = am4core.percent(30);

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