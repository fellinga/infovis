function setup() {   

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 100, left: 40},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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

    // get the data
    d3.json("data/graph_data_50.json", function(error, data) {
    if (error) throw error;

    // Scale the range of the data in the domains
    x.domain(data.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(data.nodes, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data.nodes)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.id); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    });

}

setup();


// BUTTON FUNCTIONS

function commentBtn() {
    alert('format comment');
}
function answerBtn() {
    alert('format answer');
}
function favoriteBtn() {
    alert('format favorite');
}
function scoreBtn() {
    alert('format score');
}
function viewBtn() {
    alert('format view');
}