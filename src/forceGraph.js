var data = null;
var dataRec = null;

var selectedTag = '';

var maxLinkValue = 1;

var shownNodes = null; //others are faded out

const forceGraph = createForceGraph('#forceGraph');

//Toggle stores whether the highlighting is on
var toggle = 0;
var linkedByIndex = {};
var selectedButton = 'cou'; //default: cou(nt)

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
}



function createForceGraph(baseSelector) {
  const dims = {
    margin: 40,
    width: 850,
    height: 750,
    radius: 70
    };

  // Define the div for the tooltip
  var div_link = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  var div_circle = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

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
        div_link.transition()    
          .duration(200)    
          .style("opacity", .9);    
        div_link.html(d.value)  
          .style("left", (d3.event.pageX) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");  
      })          
      .on("mouseout", function(d) {   
        div_link.transition()    
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
      .attr('class','circle')
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
        d.id === selectedTag ? 'selected' : 'circle'
      );

    if (toggle == 1) {
      nodes_update.style('opacity', 1);
    }

    function getRightAttribute(d) {
      if (selectedButton === 'com') return d.comment;
      else if (selectedButton === 'a')  return d.answer;
      else if (selectedButton === 'f')  return d.fav;
      else if (selectedButton === 's')  return d.score;
      else if (selectedButton === 'v')  return d.view;
      else  return d.count;
    }

    // Tooltip
    nodes_update.selectAll('circle')
      .on('mouseenter', function(d) {
        hoverBar(d.id);
      })
      .on('mouseleave', function(d) {
        if (d.id != selectedTag){
          hoverBar('');
        }
      })
      .on("mouseover", function(d) {    
        div_circle.transition()    
          .duration(200)    
          .style("opacity", .9);    
        div_circle.html(getRightAttribute(d))  
          .style("left", (d3.event.pageX) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");  
      })          
      .on("mouseout", function(d) {   
        div_circle.transition()    
          .duration(500)    
          .style("opacity", 0)
      });
      

    nodes.exit().remove();


    

    simulation
        .force("link")
        .links(data.links);


    // set collision radius for every circle depending on selected button/node value
    simulation.force('collide').radius(function(d) {
      if (selectedButton === 'v') {
        return Math.sqrt(getRightAttribute(d)/500);
      } else {
        return Math.sqrt(getRightAttribute(d)/5);
      }
    }).iterations(8);

    simulation.nodes(data.nodes).on("tick", ticked);
    simulation.restart();

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
    }

    function circleClicked(d) {

      selectedTag = d.id;
      selectBar(selectedTag);    // function located at barChart.js

      connectedNodes(this);

      manyBody.strength(-100);

      filterGraphByTag();
      updateCharts();

      
      manyBody.strength(-30);

      
    }

    function connectedNodes(me) {
      
      //Reduce the opacity of all but the neighbouring nodes
      d = d3.select(me).node().__data__;
      nodes_update.style("opacity", function (o) {
          return neighboring(d.id, o.id) | neighboring(o.id, d.id) ? 1 : 0.3
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
        selectedTag = '';
        toggle = 1;
        filterGraphByTag();
        updateCharts();
        toggle = 0;
        return;
  }
  selectedTag = name;
  filterGraphByTag();
  updateCharts();
}

function hoverNode(name) {
  d3.selectAll('circle')
        .attr('class',function(d) { 
            return d.id == name ? 'hover' : 'circle'
        });
}

function forceCountBtn() {
  selectedButton = 'cou';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.count/10));
}

function forceCommentBtn() {
  selectedButton = 'com';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.comment/10));
}

function forceAnswerBtn() {
  selectedButton = 'a';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.answer/10));
}

function forceFavoriteBtn() {
  selectedButton = 'f';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.fav/10));
}

function forceScoreBtn() {
  selectedButton = 's';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.score/10));
}

function forceViewBtn() {
  selectedButton = 'v';
  d3.selectAll("circle")
    .transition()
    .duration(1800)
    .attr('r', (d) => Math.sqrt(d.view/800));
}