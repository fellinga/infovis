var jsondata;

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 100, left: 55},
    width = 950 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
var y = d3.scaleLinear()
        .range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#barChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
        "translate(" + margin.left + "," + margin.top + ")");

init();

function init() {
    d3.json("data/graph_data_50.json", function(dataFromServer) {
        jsondata = dataFromServer;
        // default action
        draw();
    });
}

function draw() {           
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(jsondata.nodes)
        .enter().append("rect")
        .attr("class", "bar")
        .on("click", function(d) { selectNode(d.id); selectBar(d.id)} )
        .attr("x", function(d) { return x(d.id); })
        .attr("width", x.bandwidth())
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

    // add the x Axis
    svg.append("g")
        .transition()
        .duration(900)
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
            .transition()
            .duration(900)
            .selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");

    // add the y Axis
    svg.append("g")
        .transition()
        .duration(1800)
        .attr("class", "y axis")
        .call(d3.axisLeft(y));
}
// DEFAULT CHART FINISHED HERE

// BUTTON UPDATE FUNCTIONS START HERE
function barCountBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); }
    );

    changeYAxis(svg);   
}
function barCommentBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.comment; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.comment); })
        .attr("height", function(d) { return height - y(d.comment); }
    );

    changeYAxis(svg);  
}
function barAnswerBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.answer; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.answer); })
        .attr("height", function(d) { return height - y(d.answer); }
    );

    changeYAxis(svg);   
}
function barFavoriteBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.fav; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.fav); })
        .attr("height", function(d) { return height - y(d.fav); }
    );

    changeYAxis(svg);   
}
function barScoreBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.score; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.score); })
        .attr("height", function(d) { return height - y(d.score); }
    );

    changeYAxis(svg);  
}
function barViewBtn() {
    // Scale the range of the data in the domains
    x.domain(jsondata.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata.nodes, function(d) { return d.view; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.view); })
        .attr("height", function(d) { return height - y(d.view); }
    );

    changeYAxis(svg);
}

function changeYAxis(svg) {
    svg.select(".y.axis") // change the y axis
        .transition()
        .duration(1800)
    .call(d3.axisLeft(y));   
}

function selectBar(name) {
    d3.selectAll(".bar")
        .filter(function(d) { return d.id != name; })
        .style("fill", "greenyellow");

    if (name === "" || name === null) {
        return;
    }

    d3.selectAll(".bar")
        .filter(function(d) { return d.id == name; })
        .style("fill", "orange");
}