﻿var data = null;
var dataRec = null;

var selectedTag = '';

var maxLinkValue = 1;

var shownNodes = null; //others are faded out

const forceGraph = createForceGraph('#forceGraph');
const barChart = createBarChart('#barChart');

var selectedButton = 'count'; //default

//Toggle stores whether the highlighting is on
var toggle = 0;
var linkedByIndex = {};

var svg_bar = d3.select();

function getMaxLinkValue() {
  max = 1;
  for (var i=0; i<dataRec.links.length; i++) {
    if (dataRec.links[i].value > max) {
      max = dataRec.links[i].value;
    }
  }
  return max;
}

d3.json("data/graph_data_50.json", function(error, graph) {
  if (error) throw error;
  
  data = graph;
  dataRec = JSON.parse(JSON.stringify(data));
  shownNodes = JSON.parse(JSON.stringify(data.nodes));

  maxLinkValue = getMaxLinkValue();

  
  

  //Create an array logging what is connected to what
  
  dataRec.nodes.forEach(function (d) {
    linkedByIndex[d.id + "," + d.id] = 1;
  });
  for (var i=0;i<dataRec.links.length; i++) {
    if (dataRec.links[i].value > 50) {
      linkedByIndex[dataRec.links[i].source + "," + dataRec.links[i].target] = 1;
    }
  }
  // dataRec.links.forEach(function (d) {
  //     if (d.value > 50) {
  //       linkedByIndex[d.source + "," + d.target] = 1;
  //     }
  // });


  filterGraphByTag();
  updateCharts();

});

function updateCharts() {
  forceGraph();
  barChart();
}


function createForceGraph(baseSelector) {
  const dims = {
    margin: 40,
    width: 850,
    height: 750,
    radius: 70
    };

  // Define the div for the tooltip
  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  const svg = d3.select(baseSelector).append('svg')
    .attr('width', dims.width + dims.margin*2)
    .attr('height', dims.height + dims.margin*2);
    

    //create a root shifted element
  const root = svg.append('g').attr('transform', `translate(${dims.margin},${dims.margin})`);
  root.append('g').attr('class', 'links');
  root.append('g').attr("class", "nodes");
  

  manyBody = d3.forceManyBody();
  manyBody.strength(-30);
  //manyBody.distanceMax(200);

  collide = d3.forceCollide();
  collide.radius(70);
  collide.strength(0.05);

  var simulation = d3.forceSimulation()
   .force("link", d3.forceLink().id(function(d) { return d.id; }).iterations(8))
   .force("charge", manyBody)
   .force('collide', collide)
   .force("center", d3.forceCenter(dims.width / 2, dims.height / 2));


  function update() {
    svg.on('dbclick', setBack);

    // LINKS

    const links = root.select("g.links")
      .selectAll("line")
      .data(data.links);
      
    const links_enter = links.enter().append("line")
        .attr("class", "link")
        .attr('opacity', 0.5)
        .attr("stroke-width", function(d) { return Math.sqrt(d.value)/2; });

    const links_update = links.merge(links_enter);

    // Tooltip
    links_update
      .on("mouseover", function(d) {    
        div.transition()    
          .duration(200)    
          .style("opacity", .9);    
        div .html(d.value)  
          .style("left", (d3.event.pageX) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");  
      })          
      .on("mouseout", function(d) {   
        div.transition()    
          .duration(500)    
          .style("opacity", 0)
      });

    links.exit().remove();

    // NODES
    const nodes = root.select("g.nodes")
      .selectAll("g")
      .data(data.nodes);

    const nodes_enter = nodes.enter().append('g')
      .attr('class', 'node')
      .on('click', circleClicked)      
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // NODE CIRCLES
    nodes_enter.append('circle')
      .attr('r',(d) => Math.sqrt(d.count/10));
      //.on('click', connectedNodes);

    // NODE TEXT
    nodes_enter.append('text')
      .attr('class','node-text')
      .attr('dx', 10)
      .attr('dy', '.35em')
      .text((d) => d.id);

    const nodes_update = nodes.merge(nodes_enter);

    nodes_update.selectAll('circle')
      .attr('class', (d) => 
        d.id === selectedTag ? 'selected' : ''
      );

    if (toggle == 1) {
      nodes_update.style('opacity', 1);
    }

    nodes.exit().remove();


    

    simulation
        .force("link")
        .links(data.links);

    simulation.nodes(data.nodes).on("tick", ticked);

    function ticked() {
      links_update
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      nodes_update.selectAll('circle')
        .attr("cx", function(d) { return d.x = Math.max(dims.radius, Math.min(dims.width - dims.radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(dims.radius, Math.min(dims.height - dims.radius, d.y)); });
      nodes_update.selectAll('text')
        .attr("x", function(d) { return d.x = Math.max(dims.radius, Math.min(dims.width - dims.radius, d.x)); })
        .attr("y", function(d) { return d.y = Math.max(dims.radius, Math.min(dims.height - dims.radius, d.y)); });

      // nodes_update
      //     .attr("cx", function(d) { return d.x; })
      //     .attr("cy", function(d) { return d.y; });
    }

    function circleClicked(d) {

      selectedTag = d.id;
      selectBar(selectedTag);    // function located at barChart.js

      connectedNodes(this);
      //Reduce the opacity of all but the neighbouring nodes
      // d = d3.select(this).node().__data__;
      // console.log(d);
      // nodes_update.style("opacity", function (o) {
      //     return neighboring(d.id, o.id) | neighboring(o.id, d.id) ? 1 : 0.3;
      // }); 

      manyBody.strength(-100);

      filterGraphByTag();
      updateCharts();

      
      manyBody.strength(-30);

      
    }

    function connectedNodes(me) {
      
      //Reduce the opacity of all but the neighbouring nodes
      d = d3.select(me).node().__data__;
      nodes_update.style("opacity", function (o) {
          return neighboring(d.id, o.id) | neighboring(o.id, d.id) ? 1 : 0.1
      }); 
    }

    function setBack() {

      //Put them back to opacity=1
      nodes_update.style("opacity", 1);
      links_update.style("opacity", 1);
      
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  return update;
}

function createBarChart(baseSelector) {
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
  svg_bar = d3.select("#barChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  function update() {

    function getRightAttribute(d) {
      if (selectedButton === 'comments') return d.comment;
      else if (selectedButton === 'answers')  return d.answer;
      else if (selectedButton === 'favorites')  return d.fav;
      else if (selectedButton === 'scores')  return d.score;
      else if (selectedButton === 'views')  return d.view;
      else  return d.count;
    }

    // Scale the range of the data in the domains
    x.domain(dataRec.nodes.map(function(d) { return d.id; }));
    y.domain([0, d3.max(dataRec.nodes, function(d) { 
      return getRightAttribute(d);
      })]);

    // append the rectangles for the bar chart
    svg_bar.selectAll(".bar")
        .data(dataRec.nodes)
        .enter().append("rect")
        .attr("class", "bar")
        .on("click", function(d) { selectNode(d.id); selectBar(d.id)} )
        .attr("x", function(d) { return x(d.id); })
        .attr("width", x.bandwidth())
        .transition()
        .duration(1800)
        .attr("y", function(d) { return y(getRightAttribute(d)); })
        .attr("height", function(d) { return height - y(getRightAttribute(d)); });

    // add the x Axis
    svg_bar.append("g")
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
    svg_bar.append("g")
        .transition()
        .duration(1800)
        .attr("class", "y axis")
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

  return update;
}

function filterGraphByTag() {
  data.links.splice(0, data.links.length); //delete data.links
  shownNodes.splice(0, shownNodes.length); //delete shownNodes
  shownNodes.push(selectedTag); //insert selected element
  console.log(selectedTag);
  for (var i=0; i<dataRec.links.length; i++) {
    if (dataRec.links[i].source === selectedTag && dataRec.links[i].value > 50)
    {
      shownNodes.push(dataRec.links[i].target);
      data.links.push(dataRec.links[i]);
    }
  }
}


//This function looks up whether a pair are neighbours  
function neighboring(a, b) {
    return linkedByIndex[a + "," + b];
}


function selectNode(name) {
  if (name === "" || name === null) {
        console.log("unselect all nodes");
        return;
  }
  console.log("PLEASE SELECT ME!!! " + name);
}

function forceCountBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.count/10));
}

function forceCommentBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.comment/10));
}

function forceAnswerBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.answer/10));
}

function forceFavoriteBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.fav/10));
}

function forceScoreBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.score/10));
}

function forceViewBtn() {
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.view/300));
}

function deselect() {
  toggle = 1;
  updateCharts();
  toggle = 0;
}

 // BUTTON UPDATE FUNCTIONS START HERE
  function barCountBtn() {
      selectedButton = 'count';
      changeYAxis(svg);
      updateCharts();   
  }
  function barCommentBtn() {
      selectedButton = 'comments';
      changeYAxis(svg_bar);
      updateCharts();   
  }
  function barAnswerBtn() {
      selectedButton = 'answers';
      changeYAxis(svg_bar);
      updateCharts();   
  }
  function barFavoriteBtn() {
      selectedButton = 'favorites';
      changeYAxis(svg_bar);
      updateCharts();    
  }
  function barScoreBtn() {
      selectedButton = 'scores';
      changeYAxis(svg_bar);
      updateCharts();   
  }
  function barViewBtn() {
      selectedButton = 'views';
      changeYAxis(svg_bar);
      updateCharts();   
  }

  function changeYAxis(svg) {
    svg.select(".y.axis") // change the y axis
        .transition()
        .duration(1800)
    .call(d3.axisLeft(y));   
  }