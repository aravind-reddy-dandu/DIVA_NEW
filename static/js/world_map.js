const colorVariable = 'projects';
const geoIDVariable = 'id';
const format = d3.format(',');

// Set tooltips
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d){
    return "<strong>Country:</strong> <span style='color:red'>" + d.properties.name + "</span> <br> <strong>Projects: </strong> <span style='color:red'>" + format(d[colorVariable]) + "</span>";
  })
  
var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = 660 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

const color = d3.scaleQuantile()
  .range([
    'rgb(206, 221, 234)',
    'rgb(165, 188, 209)', 
    'rgb(128, 158, 186)', 
    'rgb(94, 128, 160)',
    'rgb(71, 114, 155)',
    'rgb(66,146,198)',
    'rgb(33,113,181)',
    'rgb(8,81,156)',
    'rgb(8,48,107)',
    'rgb(3,19,43)'
  ]);


const svg2 = d3.select('#world-map-svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map');

const projection = d3.geoRobinson()
  .scale(120)
  .rotate([352, 0, 0])
  .translate( [width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

svg2.call(tip);

queue()
  .defer(d3.json, 'https://raw.githubusercontent.com/jdamiani27/Data-Visualization-and-D3/master/lesson4/world_countries.json')
  .defer(d3.json, '/world_data')
  .await(ready);

function ready(error, geography, data) {
  data.forEach(d => {
      // console.log(data);
    d[colorVariable] = Number(d[colorVariable]);
  })

  const colorVariableValueByID = {};

  data.forEach(d => { colorVariableValueByID[d[geoIDVariable]] = d[colorVariable]; });
  geography.features.forEach(d => { d[colorVariable] = colorVariableValueByID[d.id] });

  // calculate jenks natural breaks
  const numberOfClasses = color.range().length - 1;
  const jenksNaturalBreaks = jenks(data.map(d => d[colorVariable]), numberOfClasses);
  // console.log('numberOfClasses', numberOfClasses);
  // console.log('jenksNaturalBreaks', jenksNaturalBreaks);

  // set the domain of the color scale based on our data
  color
    .domain(jenksNaturalBreaks);

  svg2.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(geography.features)
    .enter().append('path')
      .attr('d', path)
      .style('fill', d => {
        if (typeof colorVariableValueByID[d.id] !== 'undefined') {
          return color(colorVariableValueByID[d.id])
        } 
        return 'white'
      })
      .style('fill-opacity',0.8)
      .style('stroke', d => {
          if (d[colorVariable] !== 0) {
          return 'white';
        } 
        return 'lightgray';
      })
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.5)
      // tooltips
      .on('mouseover',function(d){
        tip.show(d);
        d3.select(this)
          .style('fill-opacity', 1)
          .style('stroke-opacity', 1)
          .style('stroke-width', 2)
      })
      .on('mouseout', function(d){
        tip.hide(d);
        d3.select(this)
          .style('fill-opacity', 0.8)
          .style('stroke-opacity', 0.5)
          .style('stroke-width', 1)
      });

  svg2.append('path')
    .datum(topojson.mesh(geography.features, (a, b) => a.id !== b.id))
    .attr('class', 'names')
    .attr('d', path);
}
