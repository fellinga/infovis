var jsondata;

// set the dimensions and margins of the graph
var margin = {top: 40, right: 40, bottom: 110, left: 60},
    width = 680,
    height = 590;

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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json(pathToData, function(dataFromServer) {
    jsondata = dataFromServer.nodes;
    function draw() {
        jsondata.sort(function(a, b) { return b.count - a.count; });
        // Scale the range of the data in the domains
        x.domain(jsondata.map(function(d) { return d.id; }));
        y.domain([0, d3.max(jsondata, function(d) { return d.count; })]);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(jsondata)
            .enter().append("rect")
            .attr("class", "bar")
            .on("click", function(d) { selectedTag = d.id; selectNode(d); selectBar(d)} )
            .on('mouseenter', function (d) { hoverNode(d.id)})
            .on('mouseleave', function (d) { if (d.id != selectedTag) hoverNode('')})
            .attr("x", function(d) { return x(d.id); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.count); })
            .transition()
            .duration(1800)
            .attr("height", function(d) { return height - y(d.count); });

        // add the x Axis
        svg.append("g")
            .transition()
            .duration(1800)
            .attr("class", "x axis")
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
            .transition()
            .duration(1800)
            .attr("class", "y axis")
            .call(d3.axisLeft(y));

        // add the y Axis grid lines
        svg.append('g')
            .transition()
            .duration(1800)
            .attr('class', 'grid')
            .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));
    }
    draw();
});
// DEFAULT CHART FINISHED HERE

// HIGHLIGHTING FUNCTION WHEN A BAR IS SELECTED
function selectBar(object) {
    d3.selectAll("rect")
        .attr('class',function(d) { 
            return d.id == object.id ? 'selected' : 'bar'
        });

    if (object == "") {
        d3.selectAll("rect")
            .transition()
            .duration(1000)
            .style("opacity", 1 );
    } else {
        d3.selectAll("rect")
            .transition()
            .duration(1000)
            .style("opacity", function (o) {
            return neighboring(object.id, o.id) | neighboring(o.id, object.id) ? 1 : lightOpacity
        });
    }
}
// HIGHLIGHTING FUNCTION WHEN A BAR IS HOVERED
function hoverBar(name) {
    d3.selectAll('.bar')
        .attr('class',function(d) {
            return d.id == name ? 'hover' : 'bar'
        });
    d3.selectAll('.hover')
        .attr('class',function(d) {
            return d.id == name ? 'hover' : 'bar'
        });
}

// BUTTON UPDATE FUNCTION
function updateBarView() {
    jsondata.sort(function(a, b) { return getRightAttribute(b) - getRightAttribute(a); });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return getRightAttribute(d) ; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .transition()
        .duration(900)
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(900)
        .attr("y", function(d) { return y(getRightAttribute(d)); })
        .attr("height", function(d) { return height - y(getRightAttribute(d)); }
    );

    updateYAxis();  
    updateXAxis();
}

function updateYAxis() {
    svg.select(".y.axis")
        .transition()
        .duration(1800)
    .call(d3.axisLeft(y));   
}

function updateXAxis() {
    svg.select(".x.axis")
        .transition()
        .duration(900)
        .call(d3.axisBottom(x))
            .transition()
            .duration(900)
            .selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");
}