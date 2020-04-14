var formatAsInteger = d3.format(",");

function d3PieChart(dataset, datasetBarChart){
    var margin = {top: 5, right: 5, bottom: 5, left: 5};
    var width  = 420 - margin.left - margin.right ,
    height  = 420 - margin.top - margin.bottom,
    outerRadius  = Math.min(width, height) / 2.3,
    innerRadius  = outerRadius * .999,
        // for animation
    innerRadiusFinal =  outerRadius * .45,
    innerRadiusFinal3 = outerRadius *  .35,
    color  = d3.scaleOrdinal(d3.schemeCategory20);

    var vis = d3.select("#pieChart")
                .append("svg:svg")
                .attr("class", "pie-svg")
                .data([dataset])
                .attr("width", width)
                .attr("height", height)
                .append("svg:g")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var arc = d3.arc().outerRadius(outerRadius).innerRadius(0);

    // for animation
    var arcFinal =  d3.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
    var arcFinal3 =  d3.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);

    var pie = d3.pie().value(function(d) { return d.measure; });
    var arcs = vis.selectAll("g.slice")
            .data(pie)
            .enter()
            .append("svg:g")
            .attr("class", "slice")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", up);

    arcs.append("svg:path")
    .attr("fill", function(d, i) { return color(i); } )
    .attr("d", arc)
    .append("svg:title")
    .text(function(d) { return d.data.category + ": " + formatAsInteger(d.data.measure)+"%"; });

    d3.selectAll("g.slice").selectAll("path").transition()
        .duration(750)
        .delay(10)
        .attr("d", arcFinal );

    // Add a label to the larger arcs, translated to the arc centroid and rotated.
    arcs.filter(function(d) { return d.endAngle - d.startAngle  > .2; })
    .append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "translate(" +  arcFinal.centroid(d) + ")"; })
    .text(function(d) { return d.data.category; });

    // Pie chart title
    vis.append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text("Status by Project Categories")
        .attr("class","title");

    function mouseover() {
        d3.select(this).select("path").transition()
        .duration(750)
        .attr("d", arcFinal3);
    }

    function mouseout() {
            d3.select(this).select("path").transition()
            .duration(750)
            .attr("d", arcFinal);
        }

    function up(d, i) {
            updateBarChart(d.data.category, color(i), datasetBarChart);
        }
    }
