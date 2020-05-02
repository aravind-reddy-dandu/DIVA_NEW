var networkSeries;
var chart;

function processforcetreedata(data) {
    var treeData = [];


    for (var taster in data) {
        var tasterData = {
            name: taster,
            children: []
        };
        var i = 0;
        for (var variety in data[taster].children) {
            tasterData.children.push({
                name: data[taster].children[variety].variety,
                count: data[taster].children[variety].wine_cnt,
                children: []
            });

            for (var title in data[taster].children[variety].children) {
                tasterData.children[i].children.push({
                    name: data[taster].children[variety].children[title].title,
                    value: data[taster].children[variety].children[title].points,
                    pointsrank: data[taster].children[variety].children[title].pointsrank
                });
            }
            i = i + 1;
        }

        // add to small brands if total number less than
        treeData.push(tasterData);

    }
    return treeData;
}

function prepareforcetreemap(data) {
    // data = processforcetreedata(data);
    am4core.ready(function () {
        am4core.useTheme(am4themes_animated);

        chart = am4core.create("dirtreebody", am4plugins_forceDirected.ForceDirectedTree);
        chart.legend = new am4charts.Legend();


        networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());

        chart.dataSource.url = "http://127.0.0.1:5000/directedtree_data";

        networkSeries.dataFields.linkWith = "linkWith";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.id = "name";
        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.children = "children";

        networkSeries.nodes.template.tooltipText = "{name} {desc}";
        networkSeries.nodes.template.fillOpacity = 1;

        networkSeries.nodes.template.label.text = "{name}";
        networkSeries.fontSize = 8;
        networkSeries.maxLevels = 2;
        networkSeries.nodes.template.label.hideOversized = true;
        networkSeries.nodes.template.label.truncate = true;
        networkSeries.tooltip.label.maxWidth = 300;
        networkSeries.tooltip.label.wrap = true;

        networkSeries.minRadius = 8;
        networkSeries.maxRadius = 80;

        networkSeries.events.on("inited", function () {
            networkSeries.animate({
                property: "velocityDecay",
                to: 0.6
            }, 2000);
        });
        networkSeries.calculateVisualCenter = true;
        networkSeries.nodes.template.tooltipPosition = "fixed";

        networkSeries.nodes.template.adapter.add("tooltipText", function (text, target) {
            if (target.dataItem) {
                switch (target.dataItem.level) {
                    case 0:
                        return "{name}:{value}";
                    case 1:
                        return "{name}:{value}";
                    case 2:
                        return "Points:{value}\nFullname: {fullname}\n Description:{desc}";
                }
            }
            return text;
        });

        networkSeries.nodes.template.events.on("hit", function (ev) {
            ev.target.dataItem.children.values.forEach(function (child) {
                child.collapsed = true
            });
            if (ev.target.dataItem.level === 1) {
                if (!ev.target.dataItem.children.values[0].name.includes("Description:")) {
                    ev.target.dataItem.children.values.forEach(function (child) {
                        var childname = child.name;
                        getChildDescriptions(ev.target.dataItem.parent.name, ev.target.dataItem.name, child, childname);
                    });
                }
            }
        }, this);
    });

}

// fetch('http://127.0.0.1:5000/directedtree_data')
//     .then(res => res.json())
//     .then((out) => {
//         prepareforcetreemap(out);
//     })

function getChildDescriptions(reviewer, variety, child, childname) {
    fetch('http://127.0.0.1:5000/get_wine_description?taster_name=' + reviewer + '&variety=' + variety)
        .then(res => res.json())
        .then(function (data) {
            child.desc = data[childname]['desc'];
            child.fullname = data[childname]['fullname'];
        })
}

prepareforcetreemap('');