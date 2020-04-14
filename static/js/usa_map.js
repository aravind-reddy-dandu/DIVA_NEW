var width = 700, height = 500, centered;

var tip2 = d3.tip()
.attr('class', 'd3-tip-us')
.offset([-5, 0])
.html(function(d) {
    var dataRow = countryById.get(d.properties.name);
    if (dataRow) {
        // console.log(dataRow);
        return dataRow.states + ": " + dataRow.projects;
    } else {
        // console.log("no dataRow", d);
        return d.properties.name + ": No data.";
    }
})


var svg5 = d3.select('#us-vis').append('svg')
    .attr('width', width)
    .attr('height', height);

svg5.call(tip2);

var projection2 = d3.geo.albersUsa()
    .scale(500) // mess with this if you want
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection2);

var colorScale = d3.scale.linear().range(["#D4EEFF", "#0099FF"]).interpolate(d3.interpolateLab);

var countryById = d3.map();

// we use queue because we have 2 data files to load.
queue()
    .defer(d3.json, "/usa_json")
    .defer(d3.json, "/usa_data") // process
    .await(loaded);

function typeAndSet(d) {
    d.projects = +d.projects;
    d.successful = +d.successful;
    d.fail = +d.fail;
    // d.category = +d.category;
    // console.log(d.successful);
    countryById.set(d.states, d);
    return d;
}

function getColor(d) {
    var dataRow = countryById.get(d.properties.name);
    if (dataRow) {
        // console.log(dataRow);
        return colorScale(dataRow.projects);
    } else {
        // console.log("no dataRow", d);
        return "#ccc";
    }
}


function loaded(error, usa, projects) {

    console.log(usa);
    // console.log(projects);

    colorScale.domain(d3.extent(projects, function(d) {return d.projects;}));

    var states = topojson.feature(usa, usa.objects.units).features;
    // console.log(states);
    svg5.selectAll('path.states')
        .data(states)
        .enter()
        .append('path')
        .attr('class', 'states')
        .attr('d', path)
        .on('mouseover', tip2.show)
        .on('mouseout', tip2.hide)
        .on('click', clicked)
        .attr('fill', function(d,i) {
            // console.log(i);
            // console.log(d.properties.name);
            return getColor(d);
        })
        .append("title");

    var linear = colorScale;

    svg5.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(20,20)");

    var legendLinear = d3.legend.color()
    .shapeWidth(30)
    .orient('horizontal')
    .scale(linear);

    svg5.select(".legendLinear")
    .call(legendLinear);
}

function clicked(d){
    // var temp = document.querySelector("#info > svg5");
    var temp = document.querySelector(".us-one > p");
    if (temp !== null){
        document.querySelector(".us-one").removeChild(temp);
        document.querySelector(".us-two").removeChild(document.querySelector(".us-two > p"));
        document.querySelector(".us-three").removeChild(document.querySelector(".us-three > p"));
        document.querySelector(".us-four").removeChild(document.querySelector(".us-four > p"));
    }
    var dataRow = countryById.get(d.properties.name);
    // console.log(dataRow);

    d3.select(".us-one").append("p").text(dataRow.projects);
    d3.select(".us-two").append("p").text(dataRow.successful);
    d3.select(".us-three").append("p").text(dataRow.fail);
    d3.select(".us-four").append("p").text(dataRow.category);
}