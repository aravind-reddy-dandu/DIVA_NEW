function bar(continent_name, colorval){
    var parent = document.getElementById("barchart");
    var child = document.querySelector("#barchart > g");
    if (child !== null){
    parent.removeChild(child);
    }
    var svg1 = d3.select("#barchart"),
        margin = {top: 20, right:20, bottom: 20, left: 80},
        width = svg1.attr("width") - margin.left - margin.right,
        height = svg1.attr("height") - margin.top - margin.bottom;

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);
    var g = svg1.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/continent_category_data", function(error, data) {
        if (error) throw error;
        console.log(data);
        data = data.filter(a=>a.continent==continent_name);
        console.log(data);

        data.sort(function(a, b) { return a.value - b.value; });

        x.domain([0, d3.max(data, function(d) { return d.value; })]);
        y.domain(data.map(function(d) { return d.area; })).padding(0.1);

        g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d); }).tickSizeInner([-height]));

        g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

        g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.area); })
        .attr("width", function(d) { return x(d.value); })
        .attr("fill", colorval)
        .on("mousemove", function(d){
            tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html((d.area) + "<br>" + (d.value));
        })
            .on("mouseout", function(d){ tooltip.style("display", "none");});
    })
}