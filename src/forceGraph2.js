var data = null;
var dataRec = null;

var selectedTag = '';

var maxLinkValue = 1;

var shownNodes = null; //others are faded out

const forceGraph = createForceGraph('#forceGraph');

//Toggle stores whether the highlighting is on
var toggle = 0;
var linkedByIndex = {};

function getMaxLinkValue() {
  max = 1;
  for (var i=0; i<dataRec.links.length; i++) {
    if (dataRec.links[i].value > max) {
      max = dataRec.links[i].value;
    }
  }
  return max;
}

d3.json("graph_data_50.json", function(error, graph) {
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
}


function createForceGraph(baseSelector) {
  // Define the div for the tooltip
  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  const dims = {
    margin: 40,
    width: 1024,
    height: 700,
    radius: 70
    };

  const svg = d3.select(baseSelector).append('svg')
    .attr('width', dims.width + dims.margin*2)
    .attr('height', dims.height + dims.margin*2);
    

    //create a root shifted element
  const root = svg.append('g').attr('transform', `translate(${dims.margin},${dims.margin})`);
  root.append('g').attr("class", "nodes");
  root.append('g').attr('class', 'links');

  manyBody = d3.forceManyBody();
  manyBody.strength(-30);
  //manyBody.distanceMax(200);

  collide = d3.forceCollide();
  collide.radius(40);
  collide.strength(0.05);

  var simulation = d3.forceSimulation()
   .force("link", d3.forceLink().id(function(d) { return d.id; }))
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
      .on('mouseenter', (d) => updateCharts())
      .on('mouseleave', (d) => updateCharts())      
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    
    // NODE CIRCLES
    nodes_enter.append('circle')
      .attr('r',(d) => Math.sqrt(d.count/10))
      .style('fill', 'gray')
      .on('click', connectedNodes);


    // NODE TEXT
    nodes_enter.append('text')
      .attr('dx', 10)
      .attr('dy', '.35em')
      .text((d) => d.id)
      .style('stroke', 'black')
      .style('fill', 'black');

    const nodes_update = nodes.merge(nodes_enter);
    // nodes_update.classed('selected', (d) => d === selectedTag);
    nodes_update.selectAll('circle')
      .style('fill', (d) => 
        d.id === selectedTag ? 'orange' : 'gray'
      )
      .on('mouseenter', function() {
        d3.select(this).style('fill', 'aliceblue').style('stroke','gray');
      })
      .on('mouseleave', function() {
        d3.select(this).style('fill', (d) => d.id === selectedTag ? 'orange' : 'gray').style('stroke',null);
      });

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

    function connectedNodes() {
      
      //Reduce the opacity of all but the neighbouring nodes
      d = d3.select(this).node().__data__;
      nodes_update.style("opacity", function (o) {
          return neighboring(d.id, o.id) | neighboring(o.id, d.id) ? 1 : 0.1;
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

  function circleClicked(d) {

    selectedTag = d.id;
    
    simulation.alphaTarget(0.3).restart();

    manyBody.strength(-100);
    simulation.force('charge', manyBody);
    // simulation.force('collide', null);
    simulation.alphaTarget(0);

    filterGraphByTag();
    updateCharts();

    // simulation.alphaTarget(0.3).restart();
    // manyBody.strength(-30);
    // simulation.force('charge', manyBody);
    // simulation.alphaTarget(0);
  }

  
}


  return update;
}

function filterGraphByTag() {
  data.links.splice(0, data.links.length); //delete data.links
  shownNodes.splice(0, shownNodes.length); //delete shownNodes
  shownNodes.push(selectedTag); //insert selected element

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






