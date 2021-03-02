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


var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare'

// Updating x-scale when clicked
function xScale(incomingData, chosenXAxis) {
  // Create x-scale
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(incomingData, d => d[chosenXAxis]) * 0.9,
      d3.max(incomingData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

// Updating y-scale when clicked
function yScale(incomingData, chosenYAxis) {
  // Create y-scale
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(incomingData, d => d[chosenYAxis]) - 1,
      d3.max(incomingData, d => d[chosenYAxis]) + 1
    ])
    .range([height, 0]);

  return yLinearScale;

}

// Updating xAxis when axis label clicked
function changeXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Updating yAxis when axis label clicked
function changeYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Updating circles group with a transition to new circles
function changeXCircles(circlesGroup, newXScale,  chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr('cx', d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function changeYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr('cy', d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function changeXText(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function changeYText(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis])+5);

  return circlesGroup;
}
// Updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

  var xLabel;

  if (chosenXAxis === 'poverty') {
    xLabel = "Poverty:";
  }
  else {
    xLabel = "Median Household Income:";
  }
  var yLabel;

  if (chosenYAxis === 'healthcare') {
    yLabel = "Lacks Healthcare:";
  }
  else {
    yLabel = "Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([50, -75])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

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
  var xLinearScale = xScale(incomingData, chosenXAxis);
  var yLinearScale = yScale(incomingData, chosenYAxis);
  
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
  var circlesGroup = chartGroup.selectAll("g circle")
    .data(incomingData)
    .enter()
    .append("g");

  var circlesXY = circlesGroup.append('circle')
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("opacity", .95)
    .classed("stateCircle", true);
  
  //Texts for circles
  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) +5)
    .classed('stateText', true)
    
  // Axes labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  var povertyLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "poverty") 
  .classed("active", true)
  .text("In Poverty(%)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

  var ylabelsGroup = chartGroup.append("g");

  var healthcareLabel = ylabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 0 - (svgHeight/2))
  .attr("y", 0 - margin.left + 40)
  .attr("value", "healthcare")
  .attr("dy", "1em")
  .classed("active", true)
  .text("Lacks Helathcare(%)");

  var obeseLabel = ylabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 0 - (svgHeight/2))
  .attr("y", 0 - margin.left + 20)
  .attr("value", "obesity") // value to grab for event listener
  .attr("dy", "1em")
  .classed("inactive", true)
  .text("Obese(%)");

  
  // UpdateToolTip function above csv import
  circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // X axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(incomingData, chosenXAxis);

        // updates x axis with transition
        xAxis = changeXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesXY = changeXCircles(circlesXY, xLinearScale, chosenXAxis);

        // updates circles text with new x text
        circlesText = changeXText(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    }
  );

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replace chosenYAxis with value
      chosenYAxis = value;

      // updates y scale for new data
      yLinearScale = yScale(incomingData, chosenYAxis);

      // updates y axis with transition
      yAxis = changeYAxis(yLinearScale, yAxis);

      // updates circles with new y values
      circlesXY = changeYCircles(circlesXY, yLinearScale, chosenYAxis);

      // updates circles text with new y text
      circlesText = changeYText(circlesText, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  }
 );
    
  

});

