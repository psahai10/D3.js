var svgWidth = 960;
var svgHeight = 620;

var margin = { top:20, right:40, bottom:100, left:100 }

var chartWidth = svgWidth - margin.left - margin.right;

var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.


var svg = d3.select('#scatter').append('div').classed('chart', true).append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    

    
// Append an SVG group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial Params

var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
      // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8, d3.max(healthData, d => d[chosenXAxis]) * 1.2])
        .range([0, chartWidth]);
        return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
      // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8, d3.max(healthData, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);
        return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

function renderAbbrevText(abbrevText, newXScale, chosenXAxis, newYScale, chosenYAxis)  {
    abbrevText.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]));
    return abbrevText;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty Level:";
    } else if (chosenXAxis === "income") {
      var xLabel = "Average Income:";
    } else {
        var xLabel = "Average Age:";
    }
    if (chosenYAxis === "healthcare") {
        var yLabel = "No Healthcare:";
    } else if (chosenYAxis === "obesity") {
        var yLabel = "Obesity:";
    } else {
        var yLabel = "Smokers:";
    }
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(d => `${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d);
    })
      // on mouseout event
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
    return circlesGroup;
  }

// Retrieve data from the CSV file and execute everything below
d3.csv('data.csv').then(function(healthData) {
    console.log(healthData);
  // parse data
    healthData.forEach(function(d) {
        d.poverty = +d.poverty;
        d.income = +d.income;
        d.healthcare = +d.healthcareLow;
        d.obesity = +d.obesityHigh;
        d.smokes = +d.smokesHigh;
        d.age = +d.age;
    });
     // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis); 
     // yLinearScale function above csv import
    var yLinearScale = yScale(healthData, chosenYAxis);
    // Create initial axis function
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append('g')
        .classed("x-axis", true)
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append('g')
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll('.circle')
        .data(healthData)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 16)
        .attr('fill', 'blue')
        .attr('opacity', '0.6')
        // .attr('text', d => d.abbr);

       //append initial text
       var abbrevText = chartGroup.selectAll(".abbrevText")
       .data(healthData)
       .enter()
       .append("text")
       .classed(".abbrevText", true)
       .attr("x", d => xLinearScale(d[chosenXAxis]))
       .attr("y", d => yLinearScale(d[chosenYAxis]))
       .attr("dy", ".35em")
       .attr("font-size", "11px")
       .attr('text-anchor', 'middle')
       .text(d => d.abbr);

    // yAxis labels
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(chartHeight/2)})`);
    var healthcareLabel = labelsYGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 25)
        .attr('dy', '1em')
        .attr('value', 'healthcare')
        .classed('active', true)
        .classed('aText', true)
        .text('Without Healthcare (%)');

    var obesityLabel = labelsYGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 50)
        .attr('dy', '1em')
        .attr('value', 'obesity')
        .classed('inactive', true)
        .classed('aText', true)
        .text('Obese (%)');

    var smokeLabel = labelsYGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 75)
        .attr('dy', '1em')
        .attr('value', 'smokes')
        .classed('inactive', true)
        .classed('aText', true)
        .text('Smoker (%)');

    // xAxis labels
    var labelsXGroup = chartGroup.append('g')
    .attr('transform', `translate(${chartWidth/2}, ${chartHeight + 20})`)

    var povertyLabel =labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .classed('active', true)
        .text('Poverty(%)');

    var ageLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .classed('inactive', true)
        .text('Age(%)');

    var incomeLabel =labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .classed('inactive', true)
        .text('Income(%)');
    //Might need to modify
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    // x axis labels event listener

    labelsXGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                // console.log(chosenXAxis);
                xLinearScale = xScale(healthData, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                abbrevText = renderAbbrevText(abbrevText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                } else  {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
            }
        });

    labelsYGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;
                // console.log(chosenYAxis)
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                abbrevText = renderAbbrevText(abbrevText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
        }
      }
    });
});
