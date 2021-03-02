// Chart setup
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Creating SVG wrapper, append an SVG group that will hold our chart, and set margins
var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Import Data 
d3.csv("assets/data/data.csv").then(incomingData => {
    // console.log(incomingData);

    //Converting data to numbers
    incomingData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.income = +data.income
      data.obesity = +data.obesity
    });
  
  // Scale functions
  var xLinearScale = d3.scaleLinear()
  .domain([8, d3.max(incomingData, d => d.poverty)])
  .range([0, width])
  
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(incomingData, d => d.healthcare)])
  .range([height, 0])
  
  // Axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append Axes to the chart
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Scatter circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(incomingData)
    .enter()
    .append('circle')
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 15)
    .attr("opacity", .85)
    .classed("stateCircle", true);
  
  //Texts for circles
  chartGroup.append("g")
    .selectAll('text')
    .data(incomingData)
    .enter()
    .append('text')
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.healthcare) +5)
    .classed('stateText', true)

  //Initialize tool tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>Poverty: ${d.poverty}<br>Lacks Healthcare: ${d.healthcare}`);
    });

  //Tooltip in the chart
  chartGroup.call(toolTip);

  //Event listeners to display and hide the tooltip
  circlesGroup.on("click", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
    
  // Axes labels
  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .classed('active', true)
    .text("In Poverty(%)");

  chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 0 - (height/2))
  .attr("y", 0 - margin.left + 40)
  .attr("value", "healthcare")
  .attr("dy", "1em")
  .classed("active", true)
  .text("Lacks Helathcare(%)");

});

