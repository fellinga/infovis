// DATA LOCATION
var pathToData = "data/superuser_tagdata_top50.json";
// DEFAULT LIGHT OPACITY
var lightOpacity = 0.3;
// DEFAULT VIEW: COUNT
var selectedButton = 'count';
markButton(selectedButton);

// BUTTON HANDLER
function updateViews(element) {
    markButton(element.id);
    updateBarView();        // function located at barChart.js
    updateForceView();      // function located at forceGraph.js
}
function deselect() {
    selectBar("");          // function located at barChart.js
    selectNode("");         // function located at forceGraph.js
}

// HIGHLIGHT THE ACTIVE BUTTON
function markButton(buttonID) {
    d3.selectAll("button")
        .attr('disabled', null);

    d3.select("#" + buttonID)
        .attr('disabled', true);

    selectedButton = buttonID;
}

// RETURN THE RIGHT ATTRTIBUTE DEPENDING ON WHICH BUTTON IS ACTIVE
function getRightAttribute(d) {
    if (selectedButton === 'comment') return d.comment/d.count;
    else if (selectedButton === 'answer')  return d.answer/d.count;
    else if (selectedButton === 'favorite')  return d.fav/d.count;
    else if (selectedButton === 'score')  return d.score/d.count;
    else if (selectedButton === 'view')  return d.view/d.count;
    else  return d.count;
}

//LOOKS UP WHETHER A PAIR A NEIGHBOURS
function neighboring(a, b) {
    return linkedByIndex[a + "," + b];
}

// CHART INFORMATION BUTTON
function info() {
    alert("top 50 used tags on superuser.com (year 2016)\n\n" +

          "Count: How often a tag was used. \n" +
          "Comments: In average how many comments a tag got. \n" +
          "Answers: In average how many answers a tag got. \n" +
          "Favorites: In average how many favorites a tag got. \n" +
          "Score: The average score a tag got. \n" +
          "Views: In average how many views a tag got. \n" +

          "\nand how often they appear with each other.");
}