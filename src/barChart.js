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
    .attr("transform", 
        "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/superuser_tagdata_top50.json", function(dataFromServer) {
    jsondata = dataFromServer.nodes;
    jsondata.sort(function(a, b) { return b.count - a.count; });
    // default action -> count
    draw();
});

function draw() {           
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(jsondata)
        .enter().append("rect")
        .attr("class", "bar")
        .on("click", function(d) { selectedTag = d.id; selectNode(d.id); selectBar(d.id)} )
        .on('mouseenter', function (d) { hoverNode(d.id)})
        .on('mouseleave', function (d) { if (d.id != selectedTag) hoverNode('')})
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
    jsondata.sort(function(a, b) { return b.count - a.count; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); }
    );

    changeYAxis();  
    changeXAxis(); 
}
function barCommentBtn() {
    jsondata.sort(function(a, b) { return b.comment - a.comment; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.comment; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.comment); })
        .attr("height", function(d) { return height - y(d.comment); }
    );

    changeYAxis();  
    changeXAxis();
}
function barAnswerBtn() {
    jsondata.sort(function(a, b) { return b.answer - a.answer; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.answer; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.answer); })
        .attr("height", function(d) { return height - y(d.answer); }
    );

    changeYAxis();  
    changeXAxis(); 
}
function barFavoriteBtn() {
    jsondata.sort(function(a, b) { return b.fav - a.fav; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.fav; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.fav); })
        .attr("height", function(d) { return height - y(d.fav); }
    );

    changeYAxis();
    changeXAxis();   
}
function barScoreBtn() {
    jsondata.sort(function(a, b) { return b.score - a.score; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.score; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.score); })
        .attr("height", function(d) { return height - y(d.score); }
    );

    changeYAxis(); 
    changeXAxis(); 
}
function barViewBtn() {
    jsondata.sort(function(a, b) { return b.view - a.view; });
    // Scale the range of the data in the domains
    x.domain(jsondata.map(function(d) { return d.id; }));
    y.domain([0, d3.max(jsondata, function(d) { return d.view; })]);

    // append the rectangles for the bar chart
    svg.selectAll("rect")
        .attr("x", function(d) { return x(d.id); })
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(d.view); })
        .attr("height", function(d) { return height - y(d.view); }
    );

    changeYAxis();
    changeXAxis();
}

function changeYAxis() {
    svg.select(".y.axis")
        .transition()
        .duration(1800)
    .call(d3.axisLeft(y));   
}

function changeXAxis() {
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

function selectBar(name) {
    d3.selectAll("rect")
        .attr('class',function(d) { 
            return d.id == name ? 'selected' : 'bar'
        });
}

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