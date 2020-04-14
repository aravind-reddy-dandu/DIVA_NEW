fetch('http://127.0.0.1:5000/getPlotData')
    .then(res => res.json())
    .then((out) => {
        generateChartData2(out);

    })
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var svg = d3.select('.scatter-container')
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function generateChartData2(data) {

  var x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d,i) { return data[i].INDEXCOL; })])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d,i) { return data[i].POINTS; })])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // svg.append('g')
  //   .selectAll("dot")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //     .attr("cx", function (d,i) { return x(data[i].INDEXCOL); } )
  //     .attr("cy", function (d,i) { return y(data[i].POINTS); } )
  //     .attr("r", 5)
  //     .style("fill", "#69b3a2")
  svg.append('g')
      .selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function (d,i) { return x(data[i].INDEXCOL); })
      .attr("width", 2)
      .attr("y", function (d,i) { return y(data[i].POINTS); })
      .attr("height", function(d,i) { return height - y(data[i].POINTS); });

}